<?php

namespace App\Services;

use RuntimeException;
use SimpleXMLElement;
use ZipArchive;

/**
 * Minimal, dependency-free reader for .csv / .txt / .xlsx uploads.
 *
 * Returns the first sheet as a list of associative rows keyed by the
 * normalised header (lower-case, spaces/dashes → underscores). Empty rows
 * are skipped; each row carries its 1-based spreadsheet line in `__row`.
 *
 * Kept native (ZipArchive + SimpleXML) so the Docker image needs no extra
 * Composer packages. Old binary .xls files are not supported — admins
 * should "Save As" .xlsx or "CSV UTF-8".
 */
class SpreadsheetReader
{
    public const MAX_ROWS = 5000;

    /** @return array<int, array<string, string>> */
    public static function read(string $path, string $originalName): array
    {
        $ext = strtolower(pathinfo($originalName, PATHINFO_EXTENSION));

        $matrix = match ($ext) {
            'csv', 'txt' => self::readCsv($path),
            'xlsx'       => self::readXlsx($path),
            'xls'        => throw new RuntimeException('Old .xls files are not supported. Open the file in Excel and "Save As" .xlsx or "CSV UTF-8".'),
            default      => throw new RuntimeException("Unsupported file type .{$ext}. Upload .csv or .xlsx."),
        };

        return self::toAssoc($matrix);
    }

    public static function normaliseHeader(string $h): string
    {
        $h = strtolower(trim(preg_replace('/^\xEF\xBB\xBF/', '', $h)));
        $h = preg_replace('/[^a-z0-9]+/', '_', $h);

        return trim($h, '_');
    }

    /** @param array<int, array<int, string>> $matrix */
    private static function toAssoc(array $matrix): array
    {
        // First non-empty row is the header
        while ($matrix && self::isBlank(reset($matrix))) {
            array_shift($matrix);
        }
        if (!$matrix) {
            throw new RuntimeException('The file is empty.');
        }

        $headerRowNo = array_key_first($matrix);
        $headers = array_map(fn ($h) => self::normaliseHeader((string) $h), $matrix[$headerRowNo]);
        unset($matrix[$headerRowNo]);

        $rows = [];
        foreach ($matrix as $lineNo => $cells) {
            if (self::isBlank($cells)) {
                continue;
            }
            $row = ['__row' => (string) $lineNo];
            foreach ($headers as $i => $key) {
                if ($key === '') {
                    continue;
                }
                $row[$key] = trim((string) ($cells[$i] ?? ''));
            }
            $rows[] = $row;

            if (count($rows) > self::MAX_ROWS) {
                throw new RuntimeException('Too many rows — split the file into batches of ' . self::MAX_ROWS . ' questions or fewer.');
            }
        }

        return $rows;
    }

    private static function isBlank(array $cells): bool
    {
        foreach ($cells as $c) {
            if (trim((string) $c) !== '') {
                return false;
            }
        }

        return true;
    }

    /** @return array<int, array<int, string>> keyed by 1-based line number */
    private static function readCsv(string $path): array
    {
        $raw = file_get_contents($path);
        if ($raw === false) {
            throw new RuntimeException('Could not read the uploaded file.');
        }

        $raw = preg_replace('/^\xEF\xBB\xBF/', '', $raw);

        // Excel's plain "CSV" export is Windows-1252, not UTF-8.
        if (!mb_check_encoding($raw, 'UTF-8')) {
            $raw = mb_convert_encoding($raw, 'UTF-8', 'Windows-1252');
        }

        // Sniff the delimiter from the header line (Excel in some locales uses ';').
        $firstLine = strtok($raw, "\r\n") ?: '';
        $delimiter = ',';
        foreach (["\t", ';'] as $candidate) {
            if (substr_count($firstLine, $candidate) > substr_count($firstLine, $delimiter)) {
                $delimiter = $candidate;
            }
        }

        $fh = fopen('php://temp', 'r+');
        fwrite($fh, $raw);
        rewind($fh);

        $matrix = [];
        $line = 0;
        while (($cells = fgetcsv($fh, 0, $delimiter, '"', '')) !== false) {
            $line++;
            $matrix[$line] = array_map(fn ($c) => (string) $c, $cells);
        }
        fclose($fh);

        return $matrix;
    }

    /** @return array<int, array<int, string>> keyed by 1-based row number */
    private static function readXlsx(string $path): array
    {
        $zip = new ZipArchive();
        if ($zip->open($path) !== true) {
            throw new RuntimeException('Could not open the .xlsx file — is it a valid Excel workbook?');
        }

        try {
            $shared = [];
            if (($xml = $zip->getFromName('xl/sharedStrings.xml')) !== false) {
                $sst = self::xml($xml);
                foreach ($sst->si as $si) {
                    $shared[] = self::stringItemText($si);
                }
            }

            $sheetPath = self::firstSheetPath($zip);
            $sheetXml = $zip->getFromName($sheetPath);
            if ($sheetXml === false) {
                throw new RuntimeException('The workbook has no readable worksheet.');
            }

            $sheet = self::xml($sheetXml);
            $matrix = [];
            foreach ($sheet->sheetData->row as $row) {
                $rowNo = (int) $row['r'];
                $cells = [];
                $nextCol = 0;
                foreach ($row->c as $c) {
                    $col = isset($c['r']) ? self::columnIndex((string) $c['r']) : $nextCol;
                    $nextCol = $col + 1;

                    $type = (string) $c['t'];
                    $value = match ($type) {
                        's'         => $shared[(int) $c->v] ?? '',
                        'inlineStr' => self::stringItemText($c->is),
                        'b'         => ((string) $c->v) === '1' ? 'TRUE' : 'FALSE',
                        default     => self::numberToString((string) $c->v),
                    };
                    $cells[$col] = $value;
                }
                if ($cells) {
                    $max = max(array_keys($cells));
                    $matrix[$rowNo ?: count($matrix) + 1] = array_replace(array_fill(0, $max + 1, ''), $cells);
                }
            }

            return $matrix;
        } finally {
            $zip->close();
        }
    }

    private static function firstSheetPath(ZipArchive $zip): string
    {
        $workbook = $zip->getFromName('xl/workbook.xml');
        $rels = $zip->getFromName('xl/_rels/workbook.xml.rels');
        if ($workbook !== false && $rels !== false) {
            $wb = self::xml($workbook);
            $firstSheet = $wb->sheets->sheet[0] ?? null;
            if ($firstSheet) {
                $rid = (string) $firstSheet->attributes('http://schemas.openxmlformats.org/officeDocument/2006/relationships')['id'];
                foreach (self::xml($rels)->Relationship as $rel) {
                    if ((string) $rel['Id'] === $rid) {
                        $target = ltrim((string) $rel['Target'], '/');
                        return str_starts_with($target, 'xl/') ? $target : 'xl/' . $target;
                    }
                }
            }
        }

        return 'xl/worksheets/sheet1.xml';
    }

    private static function xml(string $xml): SimpleXMLElement
    {
        $el = simplexml_load_string($xml, SimpleXMLElement::class, LIBXML_NONET | LIBXML_COMPACT);
        if ($el === false) {
            throw new RuntimeException('The .xlsx file is corrupted.');
        }

        return $el;
    }

    /** Shared/inline strings may be plain <t> or rich-text runs <r><t>. */
    private static function stringItemText(?SimpleXMLElement $si): string
    {
        if (!$si) {
            return '';
        }
        if (isset($si->t)) {
            return (string) $si->t;
        }
        $text = '';
        foreach ($si->r as $run) {
            $text .= (string) $run->t;
        }

        return $text;
    }

    private static function columnIndex(string $ref): int
    {
        $letters = preg_replace('/[^A-Z]/', '', strtoupper($ref));
        $n = 0;
        foreach (str_split($letters) as $ch) {
            $n = $n * 26 + (ord($ch) - 64);
        }

        return $n - 1;
    }

    /** Excel stores 1 as "1" but 0.25 as "0.25000000000000001" — tidy that. */
    private static function numberToString(string $v): string
    {
        if ($v !== '' && is_numeric($v) && str_contains($v, '.')) {
            return rtrim(rtrim(sprintf('%.10F', (float) $v), '0'), '.');
        }

        return $v;
    }
}
