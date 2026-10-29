<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ConceptNote;
use App\Models\Question;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Str;

/**
 * "Revise this concept": the notes section that explains a question, so a
 * student who got it wrong can revise right inside the solutions page.
 */
class ConceptController extends Controller
{
    /** GET /questions/{question}/concept */
    public function forQuestion(Question $question): JsonResponse
    {
        $payload = Cache::remember("concept_q_{$question->id}_v1", 3600, fn () => $this->resolve($question));

        return response()->json($payload, 200, [], JSON_UNESCAPED_UNICODE);
    }

    /** GET /concepts/{key} — every section of one chapter's notes. */
    public function chapter(string $key): JsonResponse
    {
        $rows = ConceptNote::where('concept_key', $key)->orderBy('position')->get();
        if ($rows->isEmpty()) {
            return response()->json(['message' => 'No notes for this chapter.'], 404);
        }

        return response()->json([
            'concept_key'   => $key,
            'chapter_title' => $rows->first()->chapter_title,
            'pack'          => $rows->first()->pack,
            'material_id'   => $rows->first()->material_id,
            'sections'      => $rows->map(fn ($r) => ['position' => $r->position, 'title' => $r->title, 'html' => $r->html])->values(),
        ], 200, [], JSON_UNESCAPED_UNICODE);
    }

    private function resolve(Question $question): array
    {
        $key = $question->concept_key;
        if (!$key) {
            return ['found' => false, 'reason' => 'no_concept_key'];
        }

        // Direct hit: the notes chapter with this key; else via concept_map.json.
        $chapterKeys = ConceptNote::where('concept_key', $key)->exists() ? [$key] : $this->mappedChapterKeys($key);
        if (!$chapterKeys) {
            return ['found' => false, 'reason' => 'no_notes_yet', 'concept_key' => $key];
        }

        $rows = ConceptNote::whereIn('concept_key', $chapterKeys)->orderBy('concept_key')->orderBy('position')->get();
        if ($rows->isEmpty()) {
            return ['found' => false, 'reason' => 'no_notes_yet', 'concept_key' => $key];
        }

        // Best section: token overlap between the question (sub-topic + stem)
        // and the section (title weighted, then body).
        $needle = $this->tokens(($question->subtopic ?? '') . ' ' . ($question->subtopic ?? '') . ' ' . Str::limit((string) $question->question_en, 300, ''));
        $best = null;
        $bestScore = -1.0;
        foreach ($rows as $r) {
            if ($r->position === 0 && count($rows) > 1) {
                continue; // "In 30 seconds" is the fallback, not a match target
            }
            $title = $this->tokens($r->title);
            $body = $this->tokens(Str::limit($r->markdown, 1200, ''));
            $score = 3 * count(array_intersect_key($needle, $title)) + count(array_intersect_key($needle, $body));
            if ($score > $bestScore) {
                $bestScore = $score;
                $best = $r;
            }
        }
        if ($bestScore <= 0) {
            // Nothing specific matched: show the chapter overview.
            $best = $rows->firstWhere('position', 0) ?? $rows->first();
        }

        $chapters = $rows->groupBy('concept_key')->map(fn ($g, $k) => [
            'concept_key'   => $k,
            'chapter_title' => $g->first()->chapter_title,
            'material_id'   => $g->first()->material_id,
            'sections'      => $g->map(fn ($r) => ['position' => $r->position, 'title' => $r->title])->values(),
        ])->values();

        return [
            'found'         => true,
            'concept_key'   => $key,
            'subtopic'      => $question->subtopic,
            'pack'          => $best->pack,
            'chapter_key'   => $best->concept_key,
            'chapter_title' => $best->chapter_title,
            'material_id'   => $best->material_id,
            'section'       => ['position' => $best->position, 'title' => $best->title, 'html' => $best->html, 'markdown' => $best->markdown],
            'chapters'      => $chapters,
        ];
    }

    /** concept_map.json: question key → chapter keys of a pack (all, or a listed subset). */
    private function mappedChapterKeys(string $key): array
    {
        $map = Cache::remember('concept_map_v1', 3600, function () {
            $path = base_path('database/data/dsssb/concept_map.json');

            return is_file($path) ? (json_decode(file_get_contents($path), true) ?: []) : [];
        });
        $entry = $map[$key] ?? null;
        if (!$entry || empty($entry['pack'])) {
            return [];
        }
        if (!empty($entry['keys'])) {
            return $entry['keys'];
        }

        return ConceptNote::where('pack', $entry['pack'])->distinct()->pluck('concept_key')->all();
    }

    /** @return array<string,true> */
    private function tokens(string $text): array
    {
        $stop = ['the', 'and', 'for', 'with', 'which', 'what', 'that', 'this', 'from', 'are', 'is', 'of', 'in', 'to', 'a', 'an', 'on', 'by', 'as', 'at', 'or', 'be', 'it', 'its', 'not', 'following', 'correct', 'true', 'false', 'given', 'statement', 'option', 'between', 'into', 'than', 'then', 'each', 'one', 'two', 'all', 'any', 'can', 'has', 'have', 'was', 'were', 'will', 'does', 'how', 'many', 'much', 'when', 'where', 'who', 'these', 'those', 'their', 'there', 'about', 'above', 'below', 'under', 'per'];
        $out = [];
        foreach (preg_split('/[^\p{L}\p{N}+#]+/u', mb_strtolower($text)) ?: [] as $t) {
            if (mb_strlen($t) >= 3 && !in_array($t, $stop, true)) {
                $out[$t] = true;
            }
        }

        return $out;
    }
}
