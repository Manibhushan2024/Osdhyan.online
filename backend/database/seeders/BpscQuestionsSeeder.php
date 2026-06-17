<?php

namespace Database\Seeders;

use App\Models\Question;
use App\Models\Test;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class BpscQuestionsSeeder extends Seeder
{
    public function run(): void
    {
        $questions = [
            [
                'question_en' => 'Which river is known as the "Sorrow of Bihar"?',
                'difficulty'  => 'easy',
                'options' => [
                    ['label' => 'A', 'option_en' => 'Ganga',   'is_correct' => false],
                    ['label' => 'B', 'option_en' => 'Kosi',    'is_correct' => true],
                    ['label' => 'C', 'option_en' => 'Gandak',  'is_correct' => false],
                    ['label' => 'D', 'option_en' => 'Son',     'is_correct' => false],
                ],
            ],
            [
                'question_en' => 'Who was the first Chief Minister of Bihar after independence?',
                'difficulty'  => 'medium',
                'options' => [
                    ['label' => 'A', 'option_en' => 'Binodanand Jha',      'is_correct' => false],
                    ['label' => 'B', 'option_en' => 'Deep Narayan Singh',   'is_correct' => false],
                    ['label' => 'C', 'option_en' => 'Sri Krishna Sinha',    'is_correct' => true],
                    ['label' => 'D', 'option_en' => 'Kedar Pandey',         'is_correct' => false],
                ],
            ],
            [
                'question_en' => 'Nalanda University was established by which Gupta ruler?',
                'difficulty'  => 'medium',
                'options' => [
                    ['label' => 'A', 'option_en' => 'Chandragupta I',   'is_correct' => false],
                    ['label' => 'B', 'option_en' => 'Kumaragupta I',    'is_correct' => true],
                    ['label' => 'C', 'option_en' => 'Samudragupta',     'is_correct' => false],
                    ['label' => 'D', 'option_en' => 'Skandagupta',      'is_correct' => false],
                ],
            ],
            [
                'question_en' => 'The Champaran Satyagraha by Mahatma Gandhi took place in which year?',
                'difficulty'  => 'easy',
                'options' => [
                    ['label' => 'A', 'option_en' => '1915', 'is_correct' => false],
                    ['label' => 'B', 'option_en' => '1917', 'is_correct' => true],
                    ['label' => 'C', 'option_en' => '1919', 'is_correct' => false],
                    ['label' => 'D', 'option_en' => '1921', 'is_correct' => false],
                ],
            ],
            [
                'question_en' => 'Article 21A of the Indian Constitution relates to which right?',
                'difficulty'  => 'easy',
                'options' => [
                    ['label' => 'A', 'option_en' => 'Right to Life',            'is_correct' => false],
                    ['label' => 'B', 'option_en' => 'Right to Education',        'is_correct' => true],
                    ['label' => 'C', 'option_en' => 'Right to Information',      'is_correct' => false],
                    ['label' => 'D', 'option_en' => 'Right to Employment',       'is_correct' => false],
                ],
            ],
            [
                'question_en' => 'The Panchsheel Agreement was signed between India and which country?',
                'difficulty'  => 'medium',
                'options' => [
                    ['label' => 'A', 'option_en' => 'Pakistan',  'is_correct' => false],
                    ['label' => 'B', 'option_en' => 'China',     'is_correct' => true],
                    ['label' => 'C', 'option_en' => 'Nepal',     'is_correct' => false],
                    ['label' => 'D', 'option_en' => 'Sri Lanka', 'is_correct' => false],
                ],
            ],
            [
                'question_en' => 'Which is the longest river in Bihar?',
                'difficulty'  => 'easy',
                'options' => [
                    ['label' => 'A', 'option_en' => 'Son',    'is_correct' => false],
                    ['label' => 'B', 'option_en' => 'Gandak', 'is_correct' => false],
                    ['label' => 'C', 'option_en' => 'Ganga',  'is_correct' => true],
                    ['label' => 'D', 'option_en' => 'Kosi',   'is_correct' => false],
                ],
            ],
            [
                'question_en' => 'The Vikramshila University was located in present-day which district of Bihar?',
                'difficulty'  => 'hard',
                'options' => [
                    ['label' => 'A', 'option_en' => 'Patna',    'is_correct' => false],
                    ['label' => 'B', 'option_en' => 'Nalanda',  'is_correct' => false],
                    ['label' => 'C', 'option_en' => 'Bhagalpur','is_correct' => true],
                    ['label' => 'D', 'option_en' => 'Gaya',     'is_correct' => false],
                ],
            ],
            [
                'question_en' => 'Which article of the Indian Constitution abolishes untouchability?',
                'difficulty'  => 'easy',
                'options' => [
                    ['label' => 'A', 'option_en' => 'Article 14', 'is_correct' => false],
                    ['label' => 'B', 'option_en' => 'Article 16', 'is_correct' => false],
                    ['label' => 'C', 'option_en' => 'Article 17', 'is_correct' => true],
                    ['label' => 'D', 'option_en' => 'Article 21', 'is_correct' => false],
                ],
            ],
            [
                'question_en' => 'The Battle of Buxar (1764) was fought between the British East India Company and which combination of forces?',
                'difficulty'  => 'hard',
                'options' => [
                    ['label' => 'A', 'option_en' => 'Nawab of Bengal alone',                              'is_correct' => false],
                    ['label' => 'B', 'option_en' => 'Nawab of Awadh, Nawab of Bengal and Mughal Emperor', 'is_correct' => true],
                    ['label' => 'C', 'option_en' => 'Maratha Confederacy',                                'is_correct' => false],
                    ['label' => 'D', 'option_en' => 'Nawab of Awadh alone',                               'is_correct' => false],
                ],
            ],
        ];

        DB::transaction(function () use ($questions) {
            $questionIds = [];

            foreach ($questions as $qData) {
                // Skip if already exists
                if (Question::where('question_en', $qData['question_en'])->exists()) {
                    $q = Question::where('question_en', $qData['question_en'])->first();
                } else {
                    $q = Question::create([
                        'question_en' => $qData['question_en'],
                        'difficulty'  => $qData['difficulty'],
                    ]);
                    foreach ($qData['options'] as $opt) {
                        $q->options()->create($opt);
                    }
                }
                $questionIds[] = $q->id;
            }

            // Attach to test 1 if not already attached
            $test = Test::find(1);
            if ($test) {
                foreach ($questionIds as $idx => $qId) {
                    if (!$test->questions()->where('questions.id', $qId)->exists()) {
                        $test->questions()->attach($qId, [
                            'sort_order'     => $idx,
                            'marks'          => 1.00,
                            'negative_marks' => 0.25,
                        ]);
                    }
                }
                // Update test questions count
                $test->update(['total_marks' => count($questionIds)]);
            }
        });

        $this->command->info('BPSC questions seeded and attached to test 1.');
    }
}
