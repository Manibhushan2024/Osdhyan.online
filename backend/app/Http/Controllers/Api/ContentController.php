<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\MaterialProgress;
use App\Models\StudyMaterial;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ContentController extends Controller
{
    public function getBlogs(Request $request): JsonResponse
    {
        return response()->json(['data' => [], 'meta' => ['total' => 0]]);
    }

    public function getBlogBySlug(Request $request, string $slug): JsonResponse
    {
        return response()->json(['message' => 'Not found.'], 404);
    }

    public function getStudyMaterials(Request $request): JsonResponse
    {
        $query = StudyMaterial::with(['subject:id,name_en', 'chapter:id,name_en'])
            ->where('is_published', true);

        if ($request->filled('subject_id')) {
            $query->where('subject_id', $request->subject_id);
        }
        if ($request->filled('chapter_id')) {
            $query->where('chapter_id', $request->chapter_id);
        }
        if ($request->filled('type')) {
            $query->where('type', $request->type);
        }
        if ($request->filled('search')) {
            $query->where('title', 'like', '%' . $request->search . '%');
        }

        $materials = $query->orderByDesc('created_at')->paginate(20);

        $userId = $request->user()?->id;
        if ($userId) {
            $progressMap = MaterialProgress::where('user_id', $userId)
                ->whereIn('material_id', $materials->pluck('id'))
                ->get()
                ->keyBy('material_id');

            $materials->getCollection()->transform(function ($m) use ($progressMap) {
                $m->progress = $progressMap->get($m->id);
                return $m;
            });
        }

        return response()->json([
            'data' => $materials->items(),
            'meta' => [
                'total'        => $materials->total(),
                'current_page' => $materials->currentPage(),
                'last_page'    => $materials->lastPage(),
            ],
        ]);
    }

    public function getMaterialDetail(Request $request, int $id): JsonResponse
    {
        $material = StudyMaterial::with(['subject:id,name_en', 'chapter:id,name_en'])
            ->where('is_published', true)
            ->findOrFail($id);

        $material->increment('view_count');

        $progress = MaterialProgress::firstOrCreate(
            ['user_id' => $request->user()->id, 'material_id' => $id],
            ['time_spent_seconds' => 0, 'is_completed' => false]
        );

        return response()->json([
            'material' => $material,
            'progress' => $progress,
        ]);
    }

    public function updateProgress(Request $request, int $id): JsonResponse
    {
        $data = $request->validate([
            'time_spent'   => 'required|integer|min:0',
            'is_completed' => 'nullable|boolean',
        ]);

        StudyMaterial::where('is_published', true)->findOrFail($id);

        $progress = MaterialProgress::firstOrCreate(
            ['user_id' => $request->user()->id, 'material_id' => $id],
            ['time_spent_seconds' => 0, 'is_completed' => false]
        );

        $updates = ['time_spent_seconds' => $progress->time_spent_seconds + $data['time_spent']];

        if (!empty($data['is_completed']) && !$progress->is_completed) {
            $updates['is_completed'] = true;
            $updates['completed_at'] = now();
        }

        $progress->update($updates);

        return response()->json(['data' => $progress->fresh()]);
    }
}
