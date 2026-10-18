<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class TuitionRequest extends Model
{
    public const TYPE_REQUIREMENT = 'requirement';
    public const TYPE_DIRECT = 'direct';

    public const STATUS_OPEN = 'open';
    public const STATUS_MATCHED = 'matched';
    public const STATUS_CLOSED = 'closed';

    protected $fillable = [
        'student_id', 'type', 'subject', 'exam', 'mode', 'city', 'area', 'budget_per_hour',
        'preferred_timing', 'description', 'status', 'selected_teacher_id', 'conversation_id',
    ];

    protected $casts = [
        'budget_per_hour' => 'integer',
    ];

    public function student(): BelongsTo
    {
        return $this->belongsTo(User::class, 'student_id');
    }

    public function selectedTeacher(): BelongsTo
    {
        return $this->belongsTo(User::class, 'selected_teacher_id');
    }

    public function proposals(): HasMany
    {
        return $this->hasMany(TuitionProposal::class);
    }

    public function conversation(): BelongsTo
    {
        return $this->belongsTo(Conversation::class);
    }

    public function isOpen(): bool
    {
        return $this->status === self::STATUS_OPEN;
    }

    public function scopeOpenRequirements(Builder $query): Builder
    {
        return $query->where('status', self::STATUS_OPEN)->where('type', self::TYPE_REQUIREMENT);
    }

    /**
     * Open requirements a given teacher can serve: same city (for home tuition)
     * or online, and at least one overlapping subject or exam. Own requests
     * are excluded.
     */
    public function scopeMatchingTeacher(Builder $query, TeacherProfile $profile): Builder
    {
        $query->openRequirements()->where('student_id', '!=', $profile->user_id);

        // Location / mode compatibility.
        $query->where(function (Builder $q) use ($profile) {
            $any = false;
            if ($profile->teachesOnline()) {
                $q->orWhereIn('mode', [TeacherProfile::MODE_ONLINE, TeacherProfile::MODE_BOTH]);
                $any = true;
            }
            if ($profile->teachesAtHome() && $profile->city) {
                $q->orWhere(function (Builder $qq) use ($profile) {
                    $qq->whereIn('mode', [TeacherProfile::MODE_HOME, TeacherProfile::MODE_BOTH])
                        ->whereRaw('LOWER(city) = ?', [mb_strtolower(trim($profile->city))]);
                });
                $any = true;
            }
            if (!$any) {
                $q->whereRaw('1 = 0');
            }
        });

        // Subject / exam overlap.
        $query->where(function (Builder $q) use ($profile) {
            $any = false;
            foreach ((array) $profile->subjects as $subject) {
                $q->orWhereRaw('LOWER(subject) = ?', [mb_strtolower($subject)]);
                $any = true;
            }
            foreach ((array) $profile->exams as $exam) {
                $q->orWhereRaw('LOWER(exam) = ?', [mb_strtolower($exam)]);
                $any = true;
            }
            if (!$any) {
                $q->whereRaw('1 = 0');
            }
        });

        return $query;
    }

    /** True when the teacher's profile matches this request (mirror of the scope, in PHP). */
    public function matchesTeacher(TeacherProfile $profile): bool
    {
        if ($this->student_id === $profile->user_id) {
            return false;
        }

        $modeOk = ($profile->teachesOnline() && in_array($this->mode, [TeacherProfile::MODE_ONLINE, TeacherProfile::MODE_BOTH], true))
            || ($profile->teachesAtHome() && $profile->city && $this->city
                && in_array($this->mode, [TeacherProfile::MODE_HOME, TeacherProfile::MODE_BOTH], true)
                && mb_strtolower(trim($this->city)) === mb_strtolower(trim($profile->city)));

        return $modeOk && ($profile->hasSubject($this->subject) || $profile->hasExam($this->exam));
    }

    /** Lead shape shown to teachers: no student contact details, only a first name. */
    public function toLeadArray(): array
    {
        $student = $this->relationLoaded('student') ? $this->student : null;

        return [
            'id'               => $this->id,
            'subject'          => $this->subject,
            'exam'             => $this->exam,
            'mode'             => $this->mode,
            'city'             => $this->city,
            'area'             => $this->area,
            'budget_per_hour'  => $this->budget_per_hour,
            'preferred_timing' => $this->preferred_timing,
            'description'      => $this->description,
            'status'           => $this->status,
            'student_name'     => $student ? explode(' ', trim($student->name))[0] : null,
            'created_at'       => $this->created_at?->toISOString(),
        ];
    }
}
