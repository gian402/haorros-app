<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class Goal extends Model
{
    use HasUuids;

    protected $fillable = ['owner_id', 'title', 'target_amount', 'category', 'deadline', 'image_url'];
    protected $casts = ['target_amount' => 'float', 'current_amount' => 'float'];

    public function members() { return $this->hasMany(GoalMember::class); }
    public function transactions() { return $this->hasMany(Transaction::class); }

    public function canAccess(User $user): bool
    {
        return $this->owner_id === $user->id || $this->members()->where('user_id', $user->id)->exists();
    }
}
