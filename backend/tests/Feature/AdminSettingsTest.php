<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Laravel\Sanctum\Sanctum;
use Tests\Concerns\BuildsExamData;
use Tests\TestCase;

class AdminSettingsTest extends TestCase
{
    use RefreshDatabase;
    use BuildsExamData;

    public function test_root_lists_admins_as_data_array(): void
    {
        $this->actingAsStudent($this->admin());
        $this->admin('editor');

        $this->getJson('/api/admin/users')->assertOk()->assertJsonCount(2, 'data');
    }

    public function test_root_can_reset_an_editors_password_and_email_must_stay_unique(): void
    {
        $this->actingAsStudent($this->admin());
        $editor = $this->admin('editor');
        $other = $this->student();

        $this->patchJson("/api/admin/users/{$editor->id}", ['email' => $other->email])->assertUnprocessable();

        $this->patchJson("/api/admin/users/{$editor->id}", ['name' => 'Renamed', 'password' => 'NewSecret@456'])
            ->assertOk()
            ->assertJsonPath('data.name', 'Renamed')
            ->assertJsonMissingPath('data.password');

        $this->assertTrue(Hash::check('NewSecret@456', $editor->fresh()->password));
    }

    public function test_root_admin_cannot_be_edited_or_removed(): void
    {
        $root = $this->admin();
        Sanctum::actingAs($this->admin());

        $this->patchJson("/api/admin/users/{$root->id}", ['name' => 'x'])->assertForbidden();
        $this->deleteJson("/api/admin/users/{$root->id}")->assertForbidden();
    }

    public function test_any_admin_can_change_their_own_password(): void
    {
        $editor = $this->admin('editor');
        Sanctum::actingAs($editor);

        $this->putJson('/api/profile/password', [
            'current_password' => 'wrong-password', 'password' => 'Fresh@12345', 'password_confirmation' => 'Fresh@12345',
        ])->assertUnprocessable();

        $this->putJson('/api/profile/password', [
            'current_password' => 'Secret@123', 'password' => 'Fresh@12345', 'password_confirmation' => 'Fresh@12345',
        ])->assertOk();

        $this->assertTrue(Hash::check('Fresh@12345', User::find($editor->id)->password));
    }
}
