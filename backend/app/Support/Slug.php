<?php

namespace App\Support;

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class Slug
{
    /** A slug from $text that is not yet used in $table.slug. */
    public static function unique(string $table, string $text, string $fallbackPrefix = 'item'): string
    {
        $base = Str::slug($text) ?: $fallbackPrefix;
        $base = Str::limit($base, 200, '');
        $slug = $base;
        $n = 2;
        while (DB::table($table)->where('slug', $slug)->exists()) {
            $slug = $base . '-' . $n++;
            if ($n > 50) {
                $slug = $base . '-' . Str::lower(Str::random(6));
                break;
            }
        }

        return $slug;
    }
}
