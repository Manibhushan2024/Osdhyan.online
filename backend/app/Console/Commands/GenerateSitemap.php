<?php

namespace App\Console\Commands;

use App\Models\Exam;
use App\Models\Subject;
use App\Models\Test;
use App\Models\TestSeries;
use Illuminate\Console\Command;
use Illuminate\Support\Carbon;

class GenerateSitemap extends Command
{
    protected $signature   = 'sitemap:generate';
    protected $description = 'Generate sitemap.xml and write it to the public directory';

    public function handle(): int
    {
        $frontendUrl = rtrim(config('app.frontend_url', 'https://osdhyan.com'), '/');
        $now         = Carbon::now()->toAtomString();

        $urls = collect();

        // ── Static pages ──────────────────────────────────────────────────────
        $staticPages = [
            ['loc' => $frontendUrl . '/',                            'priority' => '1.0', 'freq' => 'daily'],
            ['loc' => $frontendUrl . '/auth/login',                  'priority' => '0.5', 'freq' => 'monthly'],
            ['loc' => $frontendUrl . '/auth/signup',                 'priority' => '0.7', 'freq' => 'monthly'],
            ['loc' => $frontendUrl . '/dashboard/test-series',       'priority' => '0.9', 'freq' => 'daily'],
            ['loc' => $frontendUrl . '/dashboard/tests',             'priority' => '0.9', 'freq' => 'daily'],
            ['loc' => $frontendUrl . '/dashboard/syllabus',          'priority' => '0.8', 'freq' => 'weekly'],
            ['loc' => $frontendUrl . '/dashboard/courses',           'priority' => '0.8', 'freq' => 'weekly'],
            ['loc' => $frontendUrl . '/dashboard/courses/ncert',     'priority' => '0.8', 'freq' => 'weekly'],
            ['loc' => $frontendUrl . '/dashboard/materials',         'priority' => '0.7', 'freq' => 'weekly'],
            ['loc' => $frontendUrl . '/dashboard/pyqs',              'priority' => '0.8', 'freq' => 'weekly'],
            ['loc' => $frontendUrl . '/dashboard/blogs',             'priority' => '0.7', 'freq' => 'daily'],
            ['loc' => $frontendUrl . '/dashboard/focus',             'priority' => '0.6', 'freq' => 'monthly'],
        ];

        foreach ($staticPages as $page) {
            $urls->push($page + ['lastmod' => $now]);
        }

        // ── Exams ─────────────────────────────────────────────────────────────
        try {
            Exam::select(['slug', 'updated_at'])->get()->each(function ($exam) use (&$urls, $frontendUrl) {
                $urls->push([
                    'loc'      => $frontendUrl . '/dashboard/syllabus/' . $exam->slug,
                    'lastmod'  => $exam->updated_at?->toAtomString() ?? now()->toAtomString(),
                    'priority' => '0.7',
                    'freq'     => 'weekly',
                ]);
            });
        } catch (\Throwable $e) {
            $this->warn('Skipping exam URLs: ' . $e->getMessage());
        }

        // ── Published Test Series ─────────────────────────────────────────────
        try {
            TestSeries::select(['id', 'updated_at'])->where('is_published', true)->get()
                ->each(function ($series) use (&$urls, $frontendUrl) {
                    $urls->push([
                        'loc'      => $frontendUrl . '/dashboard/test-series/' . $series->id,
                        'lastmod'  => $series->updated_at?->toAtomString() ?? now()->toAtomString(),
                        'priority' => '0.8',
                        'freq'     => 'weekly',
                    ]);
                });
        } catch (\Throwable $e) {
            $this->warn('Skipping test-series URLs: ' . $e->getMessage());
        }

        // ── Published Free Tests ──────────────────────────────────────────────
        try {
            Test::select(['id', 'updated_at'])->where('status', 'published')->get()
                ->each(function ($test) use (&$urls, $frontendUrl) {
                    $urls->push([
                        'loc'      => $frontendUrl . '/dashboard/tests/' . $test->id,
                        'lastmod'  => $test->updated_at?->toAtomString() ?? now()->toAtomString(),
                        'priority' => '0.7',
                        'freq'     => 'monthly',
                    ]);
                });
        } catch (\Throwable $e) {
            $this->warn('Skipping test URLs: ' . $e->getMessage());
        }

        // ── Build XML ─────────────────────────────────────────────────────────
        $xml = '<?xml version="1.0" encoding="UTF-8"?>' . PHP_EOL;
        $xml .= '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">' . PHP_EOL;

        foreach ($urls as $url) {
            $xml .= '  <url>' . PHP_EOL;
            $xml .= '    <loc>' . htmlspecialchars($url['loc']) . '</loc>' . PHP_EOL;
            $xml .= '    <lastmod>' . $url['lastmod'] . '</lastmod>' . PHP_EOL;
            $xml .= '    <changefreq>' . $url['freq'] . '</changefreq>' . PHP_EOL;
            $xml .= '    <priority>' . $url['priority'] . '</priority>' . PHP_EOL;
            $xml .= '  </url>' . PHP_EOL;
        }

        $xml .= '</urlset>' . PHP_EOL;

        $outputPath = public_path('sitemap.xml');
        file_put_contents($outputPath, $xml);

        $this->info("Sitemap written with {$urls->count()} URLs → {$outputPath}");

        return Command::SUCCESS;
    }
}
