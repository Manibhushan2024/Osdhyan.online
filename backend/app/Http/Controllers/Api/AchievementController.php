<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Achievement;
use Illuminate\Http\Request;

class AchievementController extends Controller
{
    protected function present(Achievement $achievement): array
    {
        return [
            'id' => $achievement->id,
            'name' => $achievement->name ?: ($achievement->title ?: ($achievement->code ?: 'Achievement')),
            'description' => $achievement->description,
            'earned' => true,
            'earned_at' => $achievement->earned_at ?: $achievement->awarded_at,
        ];
    }

    public function index(Request $request)
    {
        $items = $request->user()
            ->achievements()
            ->latest('id')
            ->get()
            ->map(fn (Achievement $achievement) => $this->present($achievement));

        return response()->json($items->values());
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'nullable|string|max:255',
            'title' => 'nullable|string|max:255',
            'description' => 'nullable|string|max:1000',
            'code' => 'nullable|string|max:100',
        ]);

        $achievement = Achievement::create([
            'user_id' => $request->user()->id,
            'name' => $validated['name'] ?? null,
            'title' => $validated['title'] ?? ($validated['name'] ?? 'Achievement'),
            'description' => $validated['description'] ?? null,
            'code' => $validated['code'] ?? null,
            'earned' => true,
            'earned_at' => now(),
            'awarded_at' => now(),
        ]);

        return response()->json($this->present($achievement));
    }
}
