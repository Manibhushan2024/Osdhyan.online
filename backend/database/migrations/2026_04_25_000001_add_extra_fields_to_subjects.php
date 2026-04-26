<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('subjects', function (Blueprint $table) {
            $table->string('code', 30)->nullable()->after('slug');
            $table->string('category', 50)->nullable()->default('GS')->after('code');
            $table->string('class_level', 10)->nullable()->after('category');
            $table->unsignedSmallInteger('sort_order')->default(0)->after('class_level');
            $table->boolean('is_published')->default(false)->after('sort_order');
        });
    }

    public function down(): void
    {
        Schema::table('subjects', function (Blueprint $table) {
            $table->dropColumn(['code', 'category', 'class_level', 'sort_order', 'is_published']);
        });
    }
};
