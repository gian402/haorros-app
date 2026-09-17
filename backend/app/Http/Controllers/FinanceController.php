<?php

namespace App\Http\Controllers;

use App\Models\Expense;
use App\Models\Loan;
use Illuminate\Http\Request;

class FinanceController extends Controller
{
    public function expenses(Request $request) { return Expense::where('user_id', $request->user()->id)->latest()->get(); }
    public function loans(Request $request) { return Loan::where('user_id', $request->user()->id)->latest()->get(); }

    private function fields(Request $request): array
    {
        return $request->validate([
            'description' => 'required|string|max:500',
            'amount' => 'required|numeric|decimal:0,2|min:0.01|max:9999999999.99',
            'category' => 'nullable|string|max:100',
            'paid' => 'sometimes|boolean',
        ]);
    }

    public function addExpense(Request $request)
    {
        return response()->json(Expense::create([...$this->fields($request), 'user_id' => $request->user()->id]), 201);
    }

    public function addLoan(Request $request)
    {
        $loan = Loan::create([...$this->fields($request), 'user_id' => $request->user()->id]);
        return response()->json($loan->fresh(), 201);
    }

    public function deleteExpense(Request $request, Expense $expense)
    {
        abort_unless($expense->user_id === $request->user()->id, 403);
        $expense->delete();
        return response()->noContent();
    }

    public function payLoan(Request $request, Loan $loan)
    {
        abort_unless($loan->user_id === $request->user()->id, 403);
        $loan->update(['paid' => true]);
        return $loan;
    }

    public function deleteLoan(Request $request, Loan $loan)
    {
        abort_unless($loan->user_id === $request->user()->id, 403);
        $loan->delete();
        return response()->noContent();
    }
}
