<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class Loan extends Model
{
    use HasUuids;

    protected $fillable = ['user_id', 'description', 'amount', 'paid'];
    protected $casts = ['amount' => 'float', 'paid' => 'boolean'];
}
