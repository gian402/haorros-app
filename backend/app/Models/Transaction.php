<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class Transaction extends Model
{
    use HasUuids;

    protected $fillable = ['goal_id', 'user_id', 'amount', 'request_id'];
    protected $casts = ['amount' => 'float'];
    protected $hidden = ['request_id'];
    public function user() { return $this->belongsTo(User::class)->select(['id', 'name', 'email', 'avatar_url']); }
}
