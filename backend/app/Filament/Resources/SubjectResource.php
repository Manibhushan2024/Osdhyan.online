<?php

namespace App\Filament\Resources;

use App\Filament\Resources\SubjectResource\Pages;
use App\Models\Exam;
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

class SubjectResource extends Resource
{
    protected static ?string $model = Subject::class;
    protected static ?string $navigationIcon = 'heroicon-o-book-open';
    protected static ?string $navigationGroup = 'Catalog';
    protected static ?int $navigationSort = 2;

    public static function form(Form $form): Form
    {
        return $form->schema([
            Select::make('exam_id')
                ->label('Exam')
                ->options(Exam::pluck('name_en', 'id'))
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
                TextColumn::make('exam.name_en')->label('Exam')->sortable(),
                TextColumn::make('name_en')->label('Subject')->searchable()->sortable(),
                TextColumn::make('slug')->searchable(),
                TextColumn::make('created_at')->label('Created')->dateTime()->sortable(),
            ])
            ->filters([
                SelectFilter::make('exam_id')->label('Exam')->options(Exam::pluck('name_en', 'id')),
            ])
            ->actions([EditAction::make(), DeleteAction::make()])
            ->defaultSort('exam_id');
    }

    public static function getPages(): array
    {
        return [
            'index'  => Pages\ListSubjects::route('/'),
            'create' => Pages\CreateSubject::route('/create'),
            'edit'   => Pages\EditSubject::route('/{record}/edit'),
        ];
    }
}
