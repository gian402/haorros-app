<?php

namespace App\Http\Controllers;

use App\Models\Goal;
use App\Models\Transaction;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class TransactionController extends Controller
{
    public function index(Request $request, Goal $goal)
    {
        abort_unless($goal->canAccess($request->user()), 403);
        return $goal->transactions()->with('user')->latest()->get();
    }

    private function cents(mixed $value): int
    {
        return (int) round((float) $value * 100);
    }

    public function store(Request $request, Goal $goal)
    {
        $data = $request->validate([
            'amount' => 'required|numeric|decimal:0,2|min:0.01|max:9999999999.99',
            'request_id' => 'required|uuid',
        ]);
        $tx = DB::transaction(function () use ($request, $goal, $data) {
            $locked = Goal::whereKey($goal->id)->lockForUpdate()->firstOrFail();
            abort_unless($locked->canAccess($request->user()), 403);
            $previous = Transaction::where('request_id', $data['request_id'])->first();
            if ($previous) {
                abort_unless($previous->goal_id === $goal->id && $previous->user_id === $request->user()->id &&
                    $this->cents($previous->amount) === $this->cents($data['amount']), 409);
                return $previous;
            }
            $total = $this->cents($locked->current_amount) + $this->cents($data['amount']);
            if ($total > $this->cents($locked->target_amount)) {
                throw ValidationException::withMessages(['amount' => 'El aporte supera el monto que falta para completar la meta.']);
            }
            $tx = $locked->transactions()->create([...$data, 'user_id' => $request->user()->id]);
            $locked->current_amount = number_format($total / 100, 2, '.', '');
            $locked->save();
            return $tx;
        }, 3);
        return response()->json($tx->load('user'), 201);
    }
}
