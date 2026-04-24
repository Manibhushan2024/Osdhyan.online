<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Note;
use Illuminate\Http\Request;

class NoteController extends Controller
{
    protected function present(Note $note, Request $request): Note
    {
        $note->setRelation('user', $request->user());
        return $note;
    }

    public function index(Request $request)
    {
        $notes = $request->user()
            ->notes()
            ->latest('id')
            ->get()
            ->map(fn (Note $note) => $this->present($note, $request));

        return response()->json($notes->values());
    }

    public function show(Request $request, $note)
    {
        $model = $request->user()->notes()->findOrFail($note);

        return response()->json($this->present($model, $request));
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'content' => 'nullable|string',
            'noteable_type' => 'nullable|string|in:Subject,Chapter,Topic',
            'noteable_id' => 'nullable|integer',
        ]);

        $note = Note::create([
            'user_id' => $request->user()->id,
            'title' => $validated['title'],
            'content' => $validated['content'] ?? null,
            'subject_id' => ($validated['noteable_type'] ?? null) === 'Subject' ? $validated['noteable_id'] : null,
            'topic_id' => ($validated['noteable_type'] ?? null) === 'Topic' ? $validated['noteable_id'] : null,
        ]);

        $note->setAttribute('noteable_type', $validated['noteable_type'] ?? null);
        $note->setAttribute('noteable_id', $validated['noteable_id'] ?? null);

        return response()->json($this->present($note, $request));
    }

    public function update(Request $request, $note)
    {
        $model = $request->user()->notes()->findOrFail($note);

        $validated = $request->validate([
            'title' => 'sometimes|required|string|max:255',
            'content' => 'nullable|string',
            'noteable_type' => 'nullable|string|in:Subject,Chapter,Topic',
            'noteable_id' => 'nullable|integer',
        ]);

        if (array_key_exists('title', $validated)) {
            $model->title = $validated['title'];
        }

        if (array_key_exists('content', $validated)) {
            $model->content = $validated['content'];
        }

        if (($validated['noteable_type'] ?? null) === 'Subject') {
            $model->subject_id = $validated['noteable_id'] ?? null;
            $model->topic_id = null;
        } elseif (($validated['noteable_type'] ?? null) === 'Topic') {
            $model->topic_id = $validated['noteable_id'] ?? null;
        }

        $model->save();
        $model->setAttribute('noteable_type', $validated['noteable_type'] ?? null);
        $model->setAttribute('noteable_id', $validated['noteable_id'] ?? null);

        return response()->json($this->present($model->fresh(), $request));
    }

    public function destroy(Request $request, $id)
    {
        $note = $request->user()->notes()->findOrFail($id);
        $note->delete();

        return response()->json([
            'message' => 'Note deleted successfully.',
        ]);
    }
}
