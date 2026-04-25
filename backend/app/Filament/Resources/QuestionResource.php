<?php

namespace App\Filament\Resources;

use App\Filament\Resources\QuestionResource\Pages;
use App\Models\Chapter;
use App\Models\Question;
use App\Models\Subject;
use App\Models\Topic;
use Filament\Forms\Components\Repeater;
use Filament\Forms\Components\Section;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\Textarea;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Toggle;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables\Actions\DeleteAction;
use Filament\Tables\Actions\EditAction;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Filters\SelectFilter;
use Filament\Tables\Table;

class QuestionResource extends Resource
{
    protected static ?string $model = Question::class;
    protected static ?string $navigationIcon = 'heroicon-o-question-mark-circle';
    protected static ?string $navigationGroup = 'Content';
    protected static ?int $navigationSort = 3;

    public static function form(Form $form): Form
    {
        return $form->schema([
            Section::make('Classification')->schema([
                Select::make('subject_id')
                    ->label('Subject')
                    ->options(Subject::pluck('name_en', 'id'))
                    ->searchable()
                    ->required(),
                Select::make('chapter_id')
                    ->label('Chapter')
                    ->options(Chapter::pluck('name_en', 'id'))
                    ->searchable(),
                Select::make('topic_id')
                    ->label('Topic')
                    ->options(Topic::pluck('name_en', 'id'))
                    ->searchable(),
                Select::make('difficulty')
                    ->options(['easy' => 'Easy', 'medium' => 'Medium', 'hard' => 'Hard'])
                    ->required()
                    ->default('medium'),
            ])->columns(4),

            Section::make('Question Text')->schema([
                Textarea::make('question_en')
                    ->label('Question (EN)')
                    ->required()
                    ->rows(3)
                    ->columnSpanFull(),
                Textarea::make('question_hi')
                    ->label('Question (HI)')
                    ->rows(3)
                    ->columnSpanFull(),
            ]),

            Section::make('Options (A / B / C / D)')->schema([
                Repeater::make('options')
                    ->relationship()
                    ->schema([
                        TextInput::make('label')
                            ->required()
                            ->maxLength(1)
                            ->placeholder('A')
                            ->columnSpan(1),
                        TextInput::make('option_en')
                            ->label('Option (EN)')
                            ->required()
                            ->columnSpan(4),
                        TextInput::make('option_hi')
                            ->label('Option (HI)')
                            ->columnSpan(4),
                        Toggle::make('is_correct')
                            ->label('Correct')
                            ->inline(false)
                            ->columnSpan(1),
                    ])
                    ->columns(10)
                    ->defaultItems(4)
                    ->minItems(2)
                    ->maxItems(6)
                    ->reorderable(false)
                    ->addActionLabel('Add Option'),
            ]),

            Section::make('Explanation')->schema([
                Textarea::make('explanation_en')
                    ->label('Explanation (EN)')
                    ->rows(3)
                    ->columnSpanFull(),
                Textarea::make('explanation_hi')
                    ->label('Explanation (HI)')
                    ->rows(3)
                    ->columnSpanFull(),
            ]),
        ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                TextColumn::make('id')->sortable()->width(60),
                TextColumn::make('subject.name_en')->label('Subject')->sortable(),
                TextColumn::make('chapter.name_en')->label('Chapter')->sortable(),
                TextColumn::make('question_en')
                    ->label('Question')
                    ->limit(60)
                    ->searchable(),
                TextColumn::make('difficulty')->badge()
                    ->color(fn($state) => match($state) {
                        'easy'   => 'success',
                        'medium' => 'warning',
                        'hard'   => 'danger',
                        default  => 'gray',
                    }),
                TextColumn::make('options_count')
                    ->label('Options')
                    ->counts('options')
                    ->alignCenter(),
                TextColumn::make('created_at')->label('Created')->dateTime()->sortable(),
            ])
            ->filters([
                SelectFilter::make('subject_id')->label('Subject')->options(Subject::pluck('name_en', 'id')),
                SelectFilter::make('difficulty')->options(['easy' => 'Easy', 'medium' => 'Medium', 'hard' => 'Hard']),
            ])
            ->actions([EditAction::make(), DeleteAction::make()])
            ->defaultSort('created_at', 'desc');
    }

    public static function getPages(): array
    {
        return [
            'index'  => Pages\ListQuestions::route('/'),
            'create' => Pages\CreateQuestion::route('/create'),
            'edit'   => Pages\EditQuestion::route('/{record}/edit'),
        ];
    }
}
