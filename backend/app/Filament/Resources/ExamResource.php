<?php

namespace App\Filament\Resources;

use App\Filament\Resources\ExamResource\Pages;
use App\Models\Exam;
use Filament\Forms\Components\Section;
use Filament\Forms\Components\Textarea;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables\Actions\DeleteAction;
use Filament\Tables\Actions\EditAction;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Table;

class ExamResource extends Resource
{
    protected static ?string $model = Exam::class;
    protected static ?string $navigationIcon = 'heroicon-o-academic-cap';
    protected static ?string $navigationGroup = 'Catalog';
    protected static ?int $navigationSort = 1;

    public static function form(Form $form): Form
    {
        return $form->schema([
            Section::make('English')->schema([
                TextInput::make('name_en')->label('Name (EN)')->required()->maxLength(255),
                TextInput::make('slug')->required()->unique(ignoreRecord: true)->maxLength(100),
                Textarea::make('description_en')->label('Description (EN)')->rows(3),
            ])->columns(2),
            Section::make('Hindi')->schema([
                TextInput::make('name_hi')->label('Name (HI)')->maxLength(255),
                Textarea::make('description_hi')->label('Description (HI)')->rows(3),
            ])->columns(2),
        ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                TextColumn::make('id')->sortable()->width(60),
                TextColumn::make('name_en')->label('Name')->searchable()->sortable(),
                TextColumn::make('slug')->searchable(),
                TextColumn::make('created_at')->label('Created')->dateTime()->sortable(),
            ])
            ->actions([EditAction::make(), DeleteAction::make()])
            ->defaultSort('created_at', 'desc');
    }

    public static function getPages(): array
    {
        return [
            'index'  => Pages\ListExams::route('/'),
            'create' => Pages\CreateExam::route('/create'),
            'edit'   => Pages\EditExam::route('/{record}/edit'),
        ];
    }
}
