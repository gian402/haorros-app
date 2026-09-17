<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class GoalMember extends Model
{
    use HasUuids;

    public $timestamps = false;
    protected $fillable = ['goal_id', 'user_id'];
    public function goal() { return $this->belongsTo(Goal::class); }
    public function user() { return $this->belongsTo(User::class)->select(['id', 'name', 'email', 'avatar_url']); }
}
