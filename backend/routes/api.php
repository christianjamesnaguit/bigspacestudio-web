<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\DashboardController;
use Illuminate\Support\Facades\Route;

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);
Route::post('/forgot-password', [AuthController::class, 'forgotPassword']);
Route::post('/reset-password', [AuthController::class, 'resetPassword']);

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/user', [AuthController::class, 'user']);
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/dashboard/overview', [DashboardController::class, 'overview']);
    Route::get('/dashboard/bookings', [DashboardController::class, 'bookings']);
    Route::get('/dashboard/schedules', [DashboardController::class, 'schedules']);
    Route::get('/dashboard/customers', [DashboardController::class, 'customers']);
});
