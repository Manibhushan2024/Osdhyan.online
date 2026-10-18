<?php

use Illuminate\Support\Facades\Route;

// API host root. There is no welcome view (it 500'd); the web UI is the Next.js portal.
Route::get('/', function () {
    return response()->json(['name' => config('app.name'), 'status' => 'ok', 'api' => url('/api')]);
});
