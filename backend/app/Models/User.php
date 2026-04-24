<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Filament\Models\Contracts\FilamentUser;
use Filament\Panel;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable implements FilamentUser
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasApiTokens, HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'username',
        'email',
        'phone',
        'password',
        'google_id',
        'avatar',
        'state',
        'exam_preference',
        'target_year',
        'is_admin',
        'admin_role',
        'address',
        'total_tests_attempted',
        'avg_accuracy',
        'total_study_time_prod_sec',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'is_admin' => 'boolean',
        ];
    }

    public function canAccessPanel(Panel $panel): bool
    {
        return $panel->getId() === 'admin'
            ? $this->isAdminUser()
            : true;
    }

    public function isAdminUser(): bool
    {
        return $this->is_admin && in_array($this->admin_role, ['root', 'editor'], true);
    }

    public function isRootAdmin(): bool
    {
        return $this->isAdminUser() && $this->admin_role === 'root';
    }

    public function testAttempts()
    {
        return $this->hasMany(TestAttempt::class);
    }

    public function studyGoals()
    {
        return $this->hasMany(StudyGoal::class);
    }

    public function studySessions()
    {
        return $this->hasMany(StudySession::class);
    }

    public function notes()
    {
        return $this->hasMany(Note::class);
    }

    public function achievements()
    {
        return $this->hasMany(Achievement::class);
    }

    public function enrolledTestSeries()
    {
        return $this->belongsToMany(TestSeries::class, 'user_test_series');
    }
}
