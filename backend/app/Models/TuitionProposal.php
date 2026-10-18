<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class TuitionProposal extends Model
{
    public const STATUS_PENDING = 'pending';
    public const STATUS_ACCEPTED = 'accepted';
    public const STATUS_REJECTED = 'rejected';

    protected $fillable = ['tuition_request_id', 'teacher_id', 'message', 'fee_per_hour', 'status'];

    protected $casts = ['fee_per_hour' => 'integer'];

    public function request(): BelongsTo
    {
        return $this->belongsTo(TuitionRequest::class, 'tuition_request_id');
    }

    public function teacher(): BelongsTo
    {
        return $this->belongsTo(User::class, 'teacher_id');
    }

    /** Shape shown to the student: teacher name/avatar/profile summary, no contact info. */
    public function toStudentArray(?TeacherProfile $profile = null): array
    {
        $teacher = $this->relationLoaded('teacher') ? $this->teacher : null;

        return [
            'id'           => $this->id,
            'teacher_id'   => $this->teacher_id,
            'teacher_name' => $teacher?->name,
            'teacher_avatar' => $teacher?->avatar,
            'teacher_headline' => $profile?->headline,
            'teacher_experience_years' => $profile?->experience_years,
            'teacher_profile_id' => $profile?->id,
            'message'      => $this->message,
            'fee_per_hour' => $this->fee_per_hour,
            'status'       => $this->status,
            'created_at'   => $this->created_at?->toISOString(),
        ];
    }
}
