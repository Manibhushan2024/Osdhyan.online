<?php

namespace App\Filament\Resources\TestSeriesResource\Pages;

use App\Filament\Resources\TestSeriesResource;
use Filament\Actions\CreateAction;
use Filament\Resources\Pages\ListRecords;

class ListTestSeries extends ListRecords
{
    protected static string $resource = TestSeriesResource::class;

    protected function getHeaderActions(): array
    {
        return [CreateAction::make()];
    }
}
