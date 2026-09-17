<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\ImageController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::get('/', fn () => response()->json(['service' => 'Haorros API']));
Route::get('/media/{file}', [ImageController::class, 'show'])->name('media.show');
Route::get('/reset-password/{token}', fn (Request $request, string $token) =>
    response()->view('reset-password', ['token' => $token, 'email' => $request->query('email', '')])
        ->header('Referrer-Policy', 'no-referrer')->header('Cache-Control', 'no-store')
)->name('password.reset');
Route::post('/reset-password', [AuthController::class, 'resetPassword'])->middleware('throttle:6,1')->name('password.update');
Route::get('/password-updated', fn () => view('password-done'))->name('password.done');
