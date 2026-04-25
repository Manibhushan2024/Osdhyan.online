<?php

namespace App\Filament\Resources;

use App\Filament\Resources\ChapterResource\Pages;
use App\Models\Chapter;
use App\Models\Subject;
use Filament\Forms\Components\Section;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables\Actions\DeleteAction;
use Filament\Tables\Actions\EditAction;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Filters\SelectFilter;
use Filament\Tables\Table;

class ChapterResource extends Resource
{
    protected static ?string $model = Chapter::class;
    protected static ?string $navigationIcon = 'heroicon-o-bookmark';
    protected static ?string $navigationGroup = 'Catalog';
    protected static ?int $navigationSort = 3;

    public static function form(Form $form): Form
    {
        return $form->schema([
            Select::make('subject_id')
                ->label('Subject')
                ->options(Subject::with('exam')->get()->mapWithKeys(fn($s) => [$s->id => "{$s->exam->name_en} — {$s->name_en}"]))
                ->required()
                ->searchable(),
            TextInput::make('slug')->required()->unique(ignoreRecord: true)->maxLength(100),
            Section::make('Names')->schema([
                TextInput::make('name_en')->label('Name (EN)')->required()->maxLength(255),
                TextInput::make('name_hi')->label('Name (HI)')->maxLength(255),
            ])->columns(2),
        ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                TextColumn::make('id')->sortable()->width(60),
                TextColumn::make('subject.exam.name_en')->label('Exam')->sortable(),
                TextColumn::make('subject.name_en')->label('Subject')->sortable(),
                TextColumn::make('name_en')->label('Chapter')->searchable()->sortable(),
                TextColumn::make('slug')->searchable(),
            ])
            ->filters([
                SelectFilter::make('subject_id')->label('Subject')->options(Subject::pluck('name_en', 'id')),
            ])
            ->actions([EditAction::make(), DeleteAction::make()])
            ->defaultSort('subject_id');
    }

    public static function getPages(): array
    {
        return [
            'index'  => Pages\ListChapters::route('/'),
            'create' => Pages\CreateChapter::route('/create'),
            'edit'   => Pages\EditChapter::route('/{record}/edit'),
        ];
    }
}
