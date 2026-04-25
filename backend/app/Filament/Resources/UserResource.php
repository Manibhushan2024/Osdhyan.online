<?php

namespace App\Filament\Resources;

use App\Filament\Resources\UserResource\Pages;
use App\Models\User;
use Filament\Forms\Components\Section;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Toggle;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables\Actions\EditAction;
use Filament\Tables\Columns\IconColumn;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Filters\TernaryFilter;
use Filament\Tables\Table;

class UserResource extends Resource
{
    protected static ?string $model = User::class;
    protected static ?string $navigationIcon = 'heroicon-o-users';
    protected static ?string $navigationGroup = 'Users';
    protected static ?int $navigationSort = 1;

    public static function form(Form $form): Form
    {
        return $form->schema([
            Section::make('Profile')->schema([
                TextInput::make('name')->required()->maxLength(255),
                TextInput::make('email')->email()->required()->unique(ignoreRecord: true),
                TextInput::make('phone')->tel()->maxLength(20),
                TextInput::make('username')->maxLength(100),
            ])->columns(2),
            Section::make('Admin Access')->schema([
                Toggle::make('is_admin')->label('Is Admin')->inline(false),
                Select::make('admin_role')
                    ->label('Admin Role')
                    ->options(['root' => 'Root Admin', 'editor' => 'Editor'])
                    ->nullable(),
            ])->columns(2),
        ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                TextColumn::make('id')->sortable()->width(60),
                TextColumn::make('name')->searchable()->sortable(),
                TextColumn::make('email')->searchable(),
                TextColumn::make('phone'),
                IconColumn::make('is_admin')->label('Admin')->boolean(),
                TextColumn::make('admin_role')->label('Role')->badge()
                    ->color(fn($state) => $state === 'root' ? 'danger' : 'warning'),
                TextColumn::make('created_at')->label('Joined')->dateTime()->sortable(),
            ])
            ->filters([
                TernaryFilter::make('is_admin')->label('Admin Users'),
            ])
            ->actions([EditAction::make()])
            ->defaultSort('created_at', 'desc');
    }

    public static function getPages(): array
    {
        return [
            'index' => Pages\ListUsers::route('/'),
            'edit'  => Pages\EditUser::route('/{record}/edit'),
        ];
    }
}
