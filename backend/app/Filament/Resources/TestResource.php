<?php

namespace App\Filament\Resources;

use App\Filament\Resources\TestResource\Pages;
use App\Models\Chapter;
use App\Models\Exam;
use App\Models\Subject;
use App\Models\Test;
use App\Models\Topic;
use Filament\Forms\Components\Section;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\Textarea;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables\Actions\DeleteAction;
use Filament\Tables\Actions\EditAction;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Filters\SelectFilter;
use Filament\Tables\Table;

class TestResource extends Resource
{
    protected static ?string $model = Test::class;
    protected static ?string $navigationIcon = 'heroicon-o-clipboard-document-list';
    protected static ?string $navigationGroup = 'Content';
    protected static ?int $navigationSort = 2;

    public static function form(Form $form): Form
    {
        return $form->schema([
            Section::make('Classification')->schema([
                Select::make('exam_id')
                    ->label('Exam')
                    ->options(Exam::pluck('name_en', 'id'))
                    ->searchable()
                    ->required(),
                Select::make('subject_id')
                    ->label('Subject')
                    ->options(Subject::pluck('name_en', 'id'))
                    ->searchable(),
                Select::make('chapter_id')
                    ->label('Chapter')
                    ->options(Chapter::pluck('name_en', 'id'))
                    ->searchable(),
                Select::make('topic_id')
                    ->label('Topic')
                    ->options(Topic::pluck('name_en', 'id'))
                    ->searchable(),
            ])->columns(2),

            Section::make('Settings')->schema([
                Select::make('mode')
                    ->options(['practice' => 'Practice', 'test' => 'Test'])
                    ->required()->default('test'),
                Select::make('status')
                    ->options(['draft' => 'Draft', 'published' => 'Published'])
                    ->required()->default('draft'),
                Select::make('category')
                    ->options(['free' => 'Free', 'premium' => 'Premium'])
                    ->required()->default('free'),
                TextInput::make('duration_sec')
                    ->label('Duration (seconds)')
                    ->numeric()->required()->default(3600),
                TextInput::make('question_mark')
                    ->label('Marks per Question')
                    ->numeric()->required()->default(1),
                TextInput::make('negative_marking')
                    ->label('Negative Marks')
                    ->numeric()->required()->default(0),
                TextInput::make('total_marks')
                    ->label('Total Marks')
                    ->numeric()->required()->default(100),
            ])->columns(4),

            Section::make('English')->schema([
                TextInput::make('name_en')->label('Name (EN)')->required()->maxLength(255),
                Textarea::make('description_en')->label('Description (EN)')->rows(2),
            ]),
            Section::make('Hindi')->schema([
                TextInput::make('name_hi')->label('Name (HI)')->maxLength(255),
                Textarea::make('description_hi')->label('Description (HI)')->rows(2),
            ]),
        ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                TextColumn::make('id')->sortable()->width(60),
                TextColumn::make('exam.name_en')->label('Exam')->sortable(),
                TextColumn::make('name_en')->label('Test Name')->searchable()->sortable(),
                TextColumn::make('mode')->badge()
                    ->color(fn($state) => $state === 'test' ? 'danger' : 'info'),
                TextColumn::make('status')->badge()
                    ->color(fn($state) => $state === 'published' ? 'success' : 'gray'),
                TextColumn::make('category')->badge()
                    ->color(fn($state) => $state === 'premium' ? 'warning' : 'success'),
                TextColumn::make('duration_sec')->label('Duration (s)')->numeric()->sortable(),
                TextColumn::make('total_marks')->label('Marks')->numeric()->sortable(),
                TextColumn::make('created_at')->label('Created')->dateTime()->sortable(),
            ])
            ->filters([
                SelectFilter::make('exam_id')->label('Exam')->options(Exam::pluck('name_en', 'id')),
                SelectFilter::make('status')->options(['draft' => 'Draft', 'published' => 'Published']),
                SelectFilter::make('category')->options(['free' => 'Free', 'premium' => 'Premium']),
            ])
            ->actions([EditAction::make(), DeleteAction::make()])
            ->defaultSort('created_at', 'desc');
    }

    public static function getPages(): array
    {
        return [
            'index'  => Pages\ListTests::route('/'),
            'create' => Pages\CreateTest::route('/create'),
            'edit'   => Pages\EditTest::route('/{record}/edit'),
        ];
    }
}
