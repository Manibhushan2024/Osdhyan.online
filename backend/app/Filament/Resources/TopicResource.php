<?php

namespace App\Filament\Resources;

use App\Filament\Resources\TopicResource\Pages;
use App\Models\Chapter;
use App\Models\Topic;
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

class TopicResource extends Resource
{
    protected static ?string $model = Topic::class;
    protected static ?string $navigationIcon = 'heroicon-o-tag';
    protected static ?string $navigationGroup = 'Catalog';
    protected static ?int $navigationSort = 4;

    public static function form(Form $form): Form
    {
        return $form->schema([
            Select::make('chapter_id')
                ->label('Chapter')
                ->options(Chapter::with('subject.exam')->get()->mapWithKeys(
                    fn($c) => [$c->id => "{$c->subject->exam->name_en} › {$c->subject->name_en} › {$c->name_en}"]
                ))
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
                TextColumn::make('chapter.subject.name_en')->label('Subject')->sortable(),
                TextColumn::make('chapter.name_en')->label('Chapter')->sortable(),
                TextColumn::make('name_en')->label('Topic')->searchable()->sortable(),
                TextColumn::make('slug')->searchable(),
            ])
            ->filters([
                SelectFilter::make('chapter_id')->label('Chapter')->options(Chapter::pluck('name_en', 'id')),
            ])
            ->actions([EditAction::make(), DeleteAction::make()])
            ->defaultSort('chapter_id');
    }

    public static function getPages(): array
    {
        return [
            'index'  => Pages\ListTopics::route('/'),
            'create' => Pages\CreateTopic::route('/create'),
            'edit'   => Pages\EditTopic::route('/{record}/edit'),
        ];
    }
}
