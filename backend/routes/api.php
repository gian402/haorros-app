<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\FinanceController;
use App\Http\Controllers\GoalController;
use App\Http\Controllers\ImageController;
use App\Http\Controllers\TransactionController;
use Illuminate\Support\Facades\Route;

Route::middleware('throttle:6,1')->group(function () {
    Route::post('auth/register', [AuthController::class, 'register']);
    Route::post('auth/login', [AuthController::class, 'login']);
    Route::post('auth/forgot-password', [AuthController::class, 'forgotPassword']);
});
Route::middleware(['auth:sanctum', 'throttle:120,1'])->group(function () {
    Route::get('auth/me', [AuthController::class, 'me']);
    Route::post('auth/logout', [AuthController::class, 'logout']);
    Route::patch('auth/profile', [AuthController::class, 'update']);
    Route::post('auth/password', [AuthController::class, 'changePassword'])->middleware('throttle:6,1');
    Route::post('auth/avatar', [ImageController::class, 'avatar']);
    Route::apiResource('goals', GoalController::class);
    Route::post('goals/{goal}/image', [ImageController::class, 'goal']);
    Route::post('goals/{goal}/members', [GoalController::class, 'addMember']);
    Route::delete('members/{member}', [GoalController::class, 'removeMember']);
    Route::get('goals/{goal}/transactions', [TransactionController::class, 'index']);
    Route::post('goals/{goal}/transactions', [TransactionController::class, 'store']);
    Route::get('expenses', [FinanceController::class, 'expenses']);
    Route::post('expenses', [FinanceController::class, 'addExpense']);
    Route::delete('expenses/{expense}', [FinanceController::class, 'deleteExpense']);
    Route::get('loans', [FinanceController::class, 'loans']);
    Route::post('loans', [FinanceController::class, 'addLoan']);
    Route::patch('loans/{loan}/paid', [FinanceController::class, 'payLoan']);
    Route::delete('loans/{loan}', [FinanceController::class, 'deleteLoan']);
});
