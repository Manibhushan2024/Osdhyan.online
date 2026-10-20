<?php

namespace Tests\Feature;

use App\Models\Chapter;
use App\Models\StudyMaterial;
use App\Models\Subject;
use App\Models\Topic;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Laravel\Sanctum\Sanctum;
use Tests\Concerns\BuildsExamData;
use Tests\TestCase;

class CourseContentTest extends TestCase
{
    use RefreshDatabase;
    use BuildsExamData;

    protected function setUp(): void
    {
        parent::setUp();
        Storage::fake('public');
    }

    /** A published subject with one chapter and one topic. */
    private function course(bool $published = true, string $category = 'GS'): array
    {
        $subject = $this->subject($this->exam(), 'Polity ' . uniqid());
        $subject->update(['is_published' => $published, 'category' => $category]);
        $chapter = Chapter::create(['subject_id' => $subject->id, 'name_en' => 'Constitution', 'slug' => 'constitution-' . uniqid()]);
        $topic = Topic::create(['chapter_id' => $chapter->id, 'name_en' => 'Preamble', 'slug' => 'preamble-' . uniqid()]);

        return [$subject->fresh(), $chapter->fresh(), $topic->fresh()];
    }

    private function actingAsAdmin(string $role = 'root'): void
    {
        Sanctum::actingAs($this->admin($role));
    }

    private function upload(Topic $topic, array $payload)
    {
        return $this->post('/api/admin/materials/upload', ['topic_id' => $topic->id] + $payload, ['Accept' => 'application/json']);
    }

    // ─── Hierarchy ──────────────────────────────────────────────────────────

    public function test_admin_hierarchy_is_a_list_of_chapters_with_topics_and_materials(): void
    {
        [$subject, $chapter, $topic] = $this->course(published: false);
        StudyMaterial::create(['topic_id' => $topic->id, 'chapter_id' => $chapter->id, 'subject_id' => $subject->id,
            'title' => 'Draft notes', 'type' => 'pdf', 'file_path' => 'study-materials/a.pdf', 'is_published' => false]);
        $this->actingAsAdmin('editor');

        $this->getJson("/api/admin/subjects/{$subject->id}/hierarchy")
            ->assertOk()
            ->assertJsonPath('subject.id', $subject->id)
            ->assertJsonPath('subject.is_published', false)
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.id', $chapter->id)
            ->assertJsonPath('data.0.is_published', true)
            ->assertJsonPath('data.0.topics.0.id', $topic->id)
            ->assertJsonPath('data.0.topics.0.is_published', true)
            ->assertJsonPath('data.0.topics.0.materials.0.title', 'Draft notes')
            ->assertJsonPath('data.0.topics.0.materials.0.is_published', false);
    }

    public function test_student_hierarchy_has_the_same_shape_but_only_published_content(): void
    {
        [$subject, $chapter, $topic] = $this->course();
        $hiddenTopic = Topic::create(['chapter_id' => $chapter->id, 'name_en' => 'Hidden', 'slug' => 'hidden-' . uniqid(), 'is_published' => false]);
        Chapter::create(['subject_id' => $subject->id, 'name_en' => 'Hidden chapter', 'slug' => 'hc-' . uniqid(), 'is_published' => false]);
        StudyMaterial::create(['topic_id' => $topic->id, 'title' => 'Live', 'type' => 'pdf', 'file_path' => 'x.pdf', 'is_published' => true]);
        StudyMaterial::create(['topic_id' => $topic->id, 'title' => 'Draft', 'type' => 'pdf', 'file_path' => 'y.pdf', 'is_published' => false]);
        $this->actingAsStudent();

        $this->getJson("/api/courses/subjects/{$subject->id}/hierarchy")
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonCount(1, 'data.0.topics')
            ->assertJsonPath('data.0.topics.0.id', $topic->id)
            ->assertJsonCount(1, 'data.0.topics.0.materials')
            ->assertJsonPath('data.0.topics.0.materials.0.title', 'Live');

        $this->assertNotSame($hiddenTopic->id, $topic->id);
    }

    public function test_student_cannot_open_an_unpublished_subject(): void
    {
        [$subject] = $this->course(published: false);
        $this->actingAsStudent();

        $this->getJson("/api/courses/subjects/{$subject->id}/hierarchy")->assertNotFound();
    }

    public function test_admin_changes_show_up_immediately_for_students(): void
    {
        [$subject, $chapter] = $this->course();
        $this->actingAsStudent();
        $this->getJson("/api/courses/subjects/{$subject->id}/hierarchy")->assertJsonCount(1, 'data.0.topics');

        Topic::create(['chapter_id' => $chapter->id, 'name_en' => 'Fundamental Rights', 'slug' => 'fr-' . uniqid()]);

        $this->getJson("/api/courses/subjects/{$subject->id}/hierarchy")->assertJsonCount(2, 'data.0.topics');
    }

    public function test_subject_lists_filter_by_category_and_ncert_class(): void
    {
        $this->course(category: 'GS');
        [$ca] = $this->course(category: 'CURRENT AFFAIRS');
        [$ncert] = $this->course(category: 'NCERT');
        $ncert->update(['class_level' => '10th']);
        $this->course(published: false, category: 'GS');
        $this->actingAsStudent();

        $this->getJson('/api/courses/subjects?category=gs')->assertOk()->assertJsonCount(1, 'data');
        $this->getJson('/api/courses/subjects?category=current-affairs')
            ->assertJsonCount(1, 'data')->assertJsonPath('data.0.id', $ca->id);
        $this->getJson('/api/courses/ncert/classes/10th/subjects')
            ->assertOk()->assertJsonCount(1, 'data')->assertJsonPath('data.0.id', $ncert->id);
        $this->getJson('/api/courses/ncert/classes/9/subjects')->assertJsonCount(0, 'data');
    }

    // ─── Upload ─────────────────────────────────────────────────────────────

    public function test_admin_uploads_a_pdf_and_it_is_published_by_default(): void
    {
        [$subject, $chapter, $topic] = $this->course();
        $this->actingAsAdmin('editor');

        $res = $this->upload($topic, ['file' => UploadedFile::fake()->create('Preamble notes.pdf', 200, 'application/pdf')])
            ->assertCreated()
            ->assertJsonPath('data.type', 'pdf')
            ->assertJsonPath('data.title', 'Preamble notes')
            ->assertJsonPath('data.is_published', true)
            ->assertJsonPath('data.subject_id', $subject->id)
            ->assertJsonPath('data.chapter_id', $chapter->id);

        Storage::disk('public')->assertExists($res->json('data.file_path'));
        $this->assertStringEndsWith('.pdf', $res->json('data.file_path'));
    }

    public function test_admin_uploads_video_audio_and_image_and_type_is_inferred(): void
    {
        [, , $topic] = $this->course();
        $this->actingAsAdmin();

        $this->upload($topic, ['file' => UploadedFile::fake()->create('lecture.mp4', 1024, 'video/mp4'), 'type' => 'text'])
            ->assertCreated()->assertJsonPath('data.type', 'video')->assertJsonPath('data.mime_type', 'video/mp4');
        $this->upload($topic, ['file' => UploadedFile::fake()->create('brief.m4a', 300, 'audio/mp4')])
            ->assertCreated()->assertJsonPath('data.type', 'audio');
        $this->upload($topic, ['file' => UploadedFile::fake()->create('mindmap.png', 50, 'image/png'), 'title' => 'Mind map'])
            ->assertCreated()->assertJsonPath('data.type', 'image')->assertJsonPath('data.title', 'Mind map');
    }

    public function test_admin_adds_a_youtube_link(): void
    {
        [, , $topic] = $this->course();
        $this->actingAsAdmin();

        $this->upload($topic, ['video_url' => 'https://youtu.be/dQw4w9WgXcQ?t=42', 'title' => 'Full lecture'])
            ->assertCreated()
            ->assertJsonPath('data.type', 'youtube')
            ->assertJsonPath('data.file_path', null)
            ->assertJsonPath('data.external_url', 'https://youtu.be/dQw4w9WgXcQ?t=42')
            ->assertJsonPath('data.embed_url', 'https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ?rel=0&modestbranding=1');

        $this->upload($topic, ['video_url' => 'https://www.youtube.com/watch?v=dQw4w9WgXcQ&list=x'])
            ->assertCreated()->assertJsonPath('data.title', 'Video lecture');
    }

    public function test_upload_rejects_unsupported_files_and_bad_links(): void
    {
        [, , $topic] = $this->course();
        $this->actingAsAdmin();

        $this->upload($topic, ['file' => UploadedFile::fake()->create('shell.php', 1, 'application/x-php')])
            ->assertStatus(422)->assertJsonValidationErrors('file');
        $this->upload($topic, ['file' => UploadedFile::fake()->create('fake.pdf', 1, 'text/html')])
            ->assertStatus(422)->assertJsonValidationErrors('file');
        $this->upload($topic, ['file' => UploadedFile::fake()->create('notes.exe', 1, 'application/octet-stream')])
            ->assertStatus(422)->assertJsonValidationErrors('file');
        $this->upload($topic, ['video_url' => 'https://vimeo.com/12345'])
            ->assertStatus(422)->assertJsonValidationErrors('video_url');
        $this->upload($topic, [])
            ->assertStatus(422)->assertJsonValidationErrors(['file', 'video_url']);
        $this->post('/api/admin/materials/upload', ['file' => UploadedFile::fake()->create('a.pdf', 1, 'application/pdf')], ['Accept' => 'application/json'])
            ->assertStatus(422)->assertJsonValidationErrors('topic_id');
        $this->upload($topic, ['file' => UploadedFile::fake()->create('huge.mp4', 512001, 'video/mp4')])
            ->assertStatus(422)->assertJsonValidationErrors('file');

        $this->assertSame(0, StudyMaterial::count());
    }

    // ─── Publish toggles ────────────────────────────────────────────────────

    public function test_publish_toggles_for_subject_chapter_topic_and_material(): void
    {
        [$subject, $chapter, $topic] = $this->course(published: false);
        $material = StudyMaterial::create(['topic_id' => $topic->id, 'title' => 'N', 'type' => 'pdf', 'file_path' => 'n.pdf', 'is_published' => true]);
        $this->actingAsAdmin('editor');

        $this->putJson("/api/admin/subjects/{$subject->id}", ['is_published' => true])->assertOk()->assertJsonPath('is_published', true);
        $this->putJson("/api/admin/chapters/{$chapter->id}", ['is_published' => false])->assertOk()->assertJsonPath('data.is_published', false);
        $this->putJson("/api/admin/topics/{$topic->id}", ['is_published' => false])->assertOk()->assertJsonPath('data.is_published', false);
        $this->putJson("/api/admin/materials/{$material->id}", ['is_published' => false])->assertOk()->assertJsonPath('data.is_published', false);
        $this->putJson("/api/admin/topics/{$topic->id}", ['is_published' => 'maybe'])->assertStatus(422);

        $this->assertTrue($subject->fresh()->is_published);
        $this->assertFalse($chapter->fresh()->is_published);
        $this->assertFalse($topic->fresh()->is_published);
        $this->assertFalse($material->fresh()->is_published);
    }

    // ─── Student topic materials & study materials ─────────────────────────

    public function test_student_topic_materials_only_show_published(): void
    {
        [, , $topic] = $this->course();
        StudyMaterial::create(['topic_id' => $topic->id, 'title' => 'Live', 'type' => 'pdf', 'file_path' => 'l.pdf', 'is_published' => true]);
        StudyMaterial::create(['topic_id' => $topic->id, 'title' => 'Draft', 'type' => 'pdf', 'file_path' => 'd.pdf', 'is_published' => false]);
        StudyMaterial::create(['topic_id' => $topic->id, 'title' => 'Talk', 'type' => 'youtube', 'external_url' => 'https://youtu.be/dQw4w9WgXcQ', 'is_published' => true]);
        $this->actingAsStudent();

        $this->getJson("/api/courses/topics/{$topic->id}/materials")
            ->assertOk()
            ->assertJsonCount(2, 'data')
            ->assertJsonPath('data.0.title', 'Live')
            ->assertJsonPath('data.1.embed_url', 'https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ?rel=0&modestbranding=1');

        $topic->update(['is_published' => false]);
        $this->getJson("/api/courses/topics/{$topic->id}/materials")->assertNotFound();
    }

    public function test_study_materials_list_is_paginated_and_hides_drafts_and_hidden_topics(): void
    {
        [, , $topic] = $this->course();
        $live = StudyMaterial::create(['topic_id' => $topic->id, 'title' => 'Live', 'type' => 'video', 'file_path' => 'v.mp4', 'is_published' => true]);
        StudyMaterial::create(['topic_id' => $topic->id, 'title' => 'Draft', 'type' => 'pdf', 'file_path' => 'd.pdf', 'is_published' => false]);
        StudyMaterial::create(['title' => 'Loose', 'type' => 'pdf', 'file_path' => 'loose.pdf', 'is_published' => true]);
        $this->actingAsStudent();

        $this->getJson('/api/study-materials')
            ->assertOk()
            ->assertJsonCount(2, 'data')
            ->assertJsonPath('current_page', 1)
            ->assertJsonPath('last_page', 1)
            ->assertJsonPath('meta.total', 2);

        $this->getJson("/api/study-materials/{$live->id}")
            ->assertOk()->assertJsonPath('material.type', 'video')->assertJsonPath('progress.is_completed', false);

        $topic->update(['is_published' => false]);
        $this->getJson('/api/study-materials')->assertJsonCount(1, 'data');
        $this->getJson("/api/study-materials/{$live->id}")->assertNotFound();
    }

    // ─── Access ─────────────────────────────────────────────────────────────

    public function test_course_admin_endpoints_are_admin_only(): void
    {
        [$subject, $chapter, $topic] = $this->course();
        $material = StudyMaterial::create(['topic_id' => $topic->id, 'title' => 'N', 'type' => 'pdf', 'file_path' => 'n.pdf', 'is_published' => true]);

        $this->getJson("/api/admin/subjects/{$subject->id}/hierarchy")->assertUnauthorized();

        $this->actingAsStudent();
        $this->getJson("/api/admin/subjects/{$subject->id}/hierarchy")->assertForbidden();
        $this->upload($topic, ['file' => UploadedFile::fake()->create('a.pdf', 1, 'application/pdf')])->assertForbidden();
        $this->putJson("/api/admin/topics/{$topic->id}", ['is_published' => false])->assertForbidden();
        $this->putJson("/api/admin/chapters/{$chapter->id}", ['is_published' => false])->assertForbidden();
        $this->putJson("/api/admin/subjects/{$subject->id}", ['is_published' => false])->assertForbidden();
        $this->putJson("/api/admin/materials/{$material->id}", ['is_published' => false])->assertForbidden();
        $this->deleteJson("/api/admin/materials/{$material->id}")->assertForbidden();

        $this->assertTrue($topic->fresh()->is_published);
        $this->assertTrue($material->fresh()->is_published);
    }

    public function test_root_admin_deleting_a_topic_removes_its_files(): void
    {
        [, , $topic] = $this->course();
        $this->actingAsAdmin('root');
        $path = $this->upload($topic, ['file' => UploadedFile::fake()->create('n.pdf', 10, 'application/pdf')])->json('data.file_path');
        Storage::disk('public')->assertExists($path);

        $this->deleteJson("/api/admin/topics/{$topic->id}")->assertOk();

        Storage::disk('public')->assertMissing($path);
        $this->assertSame(0, StudyMaterial::count());
    }

    public function test_duplicate_chapter_or_topic_names_get_a_clear_message_and_same_names_elsewhere_still_work(): void
    {
        [$subject, $chapter] = $this->course();
        $this->actingAsAdmin();

        $this->postJson('/api/admin/chapters', ['subject_id' => $subject->id, 'name_en' => 'constitution'])
            ->assertUnprocessable()->assertJsonPath('message', 'This subject already has a chapter with that name.');
        $this->postJson('/api/admin/topics', ['chapter_id' => $chapter->id, 'name_en' => 'Preamble'])
            ->assertUnprocessable()->assertJsonPath('message', 'This chapter already has a topic with that name.');

        // Same names in another subject/chapter are fine, and the slug stays unique.
        [$other] = $this->course();
        $a = $this->postJson('/api/admin/chapters', ['subject_id' => $other->id, 'name_en' => 'Fundamental Rights'])->assertCreated()->json('data.slug');
        $b = $this->postJson('/api/admin/chapters', ['subject_id' => $subject->id, 'name_en' => 'Fundamental Rights'])->assertCreated()->json('data.slug');
        $this->assertNotSame($a, $b);
    }
}
