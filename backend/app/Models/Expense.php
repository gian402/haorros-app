<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class Expense extends Model
{
    use HasUuids;

    protected $fillable = ['user_id', 'description', 'amount', 'category'];
    protected $casts = ['amount' => 'float'];
}
