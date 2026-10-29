<?php

namespace App\Console\Commands;

use App\Models\ConceptNote;
use App\Models\StudyMaterial;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

/**
 * Load every pack's chapter notes (database/data/dsssb/<pack>/notes/<chapter_key>.md)
 * into concept_notes, one row per "## " section, with HTML rendered once.
 *
 *   php artisan osdhyan:import-concept-notes            # all packs
 *   php artisan osdhyan:import-concept-notes --pack=os  # one pack
 *
 * Idempotent: a chapter's sections are replaced on every run.
 */
class ImportConceptNotes extends Command
{
    protected $signature = 'osdhyan:import-concept-notes {--pack=} {--data=database/data/dsssb}';
    protected $description = 'Import chapter notes as concept sections for "Revise this concept"';

    public function handle(): int
    {
        $root = base_path($this->option('data'));
        $packs = $this->option('pack') ? [$this->option('pack')] : array_map('basename', array_filter(glob($root . '/*'), 'is_dir'));
        $chapters = 0;
        $sections = 0;

        foreach ($packs as $pack) {
            $cfgPath = "{$root}/{$pack}/pack.json";
            if (!is_file($cfgPath)) {
                continue;
            }
            $cfg = json_decode(file_get_contents($cfgPath), true);
            foreach ($cfg['chapters'] ?? [] as $ch) {
                [$key, $title] = $ch;
                $md = "{$root}/{$pack}/notes/{$key}.md";
                if (!is_file($md)) {
                    $this->warn("no notes for {$pack}/{$key}");
                    continue;
                }
                $rows = $this->split(file_get_contents($md));
                $materialId = StudyMaterial::where('title', 'like', $title . ' — revision notes%')->value('id');

                DB::transaction(function () use ($pack, $key, $title, $rows, $materialId) {
                    ConceptNote::where('concept_key', $key)->delete();
                    foreach ($rows as $i => [$heading, $body]) {
                        ConceptNote::create([
                            'pack'          => $pack,
                            'concept_key'   => $key,
                            'chapter_title' => $title,
                            'position'      => $i,
                            'title'         => Str::limit($heading, 190, ''),
                            'markdown'      => $body,
                            'html'          => (string) Str::markdown($body, ['html_input' => 'strip', 'allow_unsafe_links' => false]),
                            'material_id'   => $materialId,
                        ]);
                    }
                });
                $chapters++;
                $sections += count($rows);
                $this->line(sprintf('%-10s %-14s %2d sections%s', $pack, $key, count($rows), $materialId ? '' : '  (no PDF linked)'));
            }
        }

        $this->info("Done: {$chapters} chapters, {$sections} sections.");

        return self::SUCCESS;
    }

    /**
     * Split a notes file into [heading, markdown] pairs: the text before the
     * first "## " (minus the H1) becomes "In 30 seconds", then one per "## ".
     * @return array<int, array{0:string,1:string}>
     */
    private function split(string $md): array
    {
        $md = str_replace("\r\n", "\n", $md);
        $parts = preg_split('/^## +/m', $md);
        $out = [];

        $intro = trim(preg_replace('/^# .*$/m', '', array_shift($parts) ?? ''));
        $intro = trim(preg_replace('/^---\s*$/m', '', $intro));
        if ($intro !== '') {
            $out[] = ['In 30 seconds', $intro];
        }

        foreach ($parts as $chunk) {
            $chunk = trim($chunk);
            if ($chunk === '') {
                continue;
            }
            [$heading, $body] = array_pad(explode("\n", $chunk, 2), 2, '');
            $heading = trim(preg_replace('/^\d+\.\s*/', '', trim($heading)));
            $body = trim(preg_replace('/^---\s*$/m', '', $body));
            if ($body === '') {
                continue;
            }
            $out[] = [$heading, $body];
        }

        return $out;
    }
}
