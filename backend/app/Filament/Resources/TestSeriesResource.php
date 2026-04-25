<?php

namespace App\Filament\Resources;

use App\Filament\Resources\TestSeriesResource\Pages;
use App\Models\Exam;
use App\Models\TestSeries;
use Filament\Forms\Components\Section;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\Textarea;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Toggle;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables\Actions\DeleteAction;
use Filament\Tables\Actions\EditAction;
use Filament\Tables\Columns\IconColumn;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Filters\SelectFilter;
use Filament\Tables\Filters\TernaryFilter;
use Filament\Tables\Table;

class TestSeriesResource extends Resource
{
    protected static ?string $model = TestSeries::class;
    protected static ?string $navigationIcon = 'heroicon-o-rectangle-stack';
    protected static ?string $navigationGroup = 'Content';
    protected static ?int $navigationSort = 1;
    protected static ?string $navigationLabel = 'Test Series';

    public static function form(Form $form): Form
    {
        return $form->schema([
            Section::make('General')->schema([
                Select::make('exam_id')
                    ->label('Exam')
                    ->options(Exam::pluck('name_en', 'id'))
                    ->required()
                    ->searchable(),
                Select::make('category')
                    ->options(['free' => 'Free', 'premium' => 'Premium'])
                    ->required()
                    ->default('free'),
                Toggle::make('is_published')->label('Published')->default(false)->inline(false),
            ])->columns(3),
            Section::make('English')->schema([
                TextInput::make('name_en')->label('Name (EN)')->required()->maxLength(255),
                Textarea::make('description_en')->label('Description (EN)')->rows(3),
            ]),
            Section::make('Hindi')->schema([
                TextInput::make('name_hi')->label('Name (HI)')->maxLength(255),
                Textarea::make('description_hi')->label('Description (HI)')->rows(3),
            ]),
        ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                TextColumn::make('id')->sortable()->width(60),
                TextColumn::make('exam.name_en')->label('Exam')->sortable(),
                TextColumn::make('name_en')->label('Series Name')->searchable()->sortable(),
                TextColumn::make('category')->badge()
                    ->color(fn($state) => $state === 'premium' ? 'warning' : 'success'),
                IconColumn::make('is_published')->label('Published')->boolean(),
                TextColumn::make('created_at')->label('Created')->dateTime()->sortable(),
            ])
            ->filters([
                SelectFilter::make('exam_id')->label('Exam')->options(Exam::pluck('name_en', 'id')),
                SelectFilter::make('category')->options(['free' => 'Free', 'premium' => 'Premium']),
                TernaryFilter::make('is_published')->label('Published'),
            ])
            ->actions([EditAction::make(), DeleteAction::make()])
            ->defaultSort('created_at', 'desc');
    }

    public static function getPages(): array
    {
        return [
            'index'  => Pages\ListTestSeries::route('/'),
            'create' => Pages\CreateTestSeries::route('/create'),
            'edit'   => Pages\EditTestSeries::route('/{record}/edit'),
        ];
    }
}
