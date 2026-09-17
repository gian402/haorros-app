<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('personal_access_tokens', function (Blueprint $table) {
            $table->id();
            $table->uuidMorphs('tokenable');
            $table->text('name');
            $table->string('token', 64)->unique();
            $table->text('abilities')->nullable();
            $table->timestamp('last_used_at')->nullable();
            $table->timestamp('expires_at')->nullable()->index();
            $table->timestamps();
        });
        Schema::create('goals', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('owner_id')->constrained('users')->cascadeOnDelete();
            $table->string('title', 150);
            $table->decimal('target_amount', 12, 2);
            $table->decimal('current_amount', 12, 2)->default(0);
            $table->text('image_url')->nullable();
            $table->string('category', 100)->nullable();
            $table->date('deadline')->nullable();
            $table->timestamps();
        });
        Schema::create('goal_members', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('goal_id')->constrained()->cascadeOnDelete();
            $table->foreignUuid('user_id')->constrained()->cascadeOnDelete();
            $table->unique(['goal_id', 'user_id']);
        });
        Schema::create('transactions', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('goal_id')->constrained()->cascadeOnDelete();
            $table->foreignUuid('user_id')->constrained()->cascadeOnDelete();
            $table->decimal('amount', 12, 2);
            $table->uuid('request_id')->unique();
            $table->timestamps();
        });
        foreach (['expenses', 'loans'] as $name) {
            Schema::create($name, function (Blueprint $table) use ($name) {
                $table->uuid('id')->primary();
                $table->foreignUuid('user_id')->constrained()->cascadeOnDelete();
                $table->string('description', 500);
                $table->decimal('amount', 12, 2);
                if ($name === 'expenses') $table->string('category', 100)->nullable();
                else $table->boolean('paid')->default(false);
                $table->timestamps();
            });
        }
    }

    public function down(): void
    {
        foreach (['loans', 'expenses', 'transactions', 'goal_members', 'goals', 'personal_access_tokens'] as $table) {
            Schema::dropIfExists($table);
        }
    }
};
