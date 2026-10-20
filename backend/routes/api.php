<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\DashboardSettingsController;
use App\Http\Controllers\FaqController;
use App\Http\Controllers\PublicBookingController;
use App\Http\Controllers\SiteMediaController;
use App\Http\Controllers\StaffController;
use Illuminate\Support\Facades\Route;

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);
Route::post('/forgot-password', [AuthController::class, 'forgotPassword']);
Route::post('/reset-password', [AuthController::class, 'resetPassword']);
Route::get('/site-media', [SiteMediaController::class, 'index']);
Route::get('/faqs', [FaqController::class, 'index']);
Route::get('/booking/packages', [PublicBookingController::class, 'packages']);
Route::get('/booking/availability', [PublicBookingController::class, 'availability']);
Route::post('/booking', [PublicBookingController::class, 'store'])->middleware('throttle:10,1');

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/user', [AuthController::class, 'user']);
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::middleware('dashboard')->prefix('dashboard')->group(function () {
        Route::get('/settings', [DashboardSettingsController::class, 'show']);
        Route::put('/settings', [DashboardSettingsController::class, 'update']);
        Route::get('/overview', [DashboardController::class, 'overview']);
        Route::get('/bookings', [DashboardController::class, 'bookings']);
        Route::post('/bookings', [DashboardController::class, 'storeBooking']);
        Route::put('/bookings/{booking}', [DashboardController::class, 'updateBooking']);
        Route::post('/bookings/{booking}/decision', [DashboardController::class, 'decideBooking']);
        Route::delete('/bookings/{booking}', [DashboardController::class, 'destroyBooking']);
        Route::get('/schedules', [DashboardController::class, 'schedules']);
        Route::get('/schedules/blocked-dates', [DashboardController::class, 'blockedScheduleDates']);
        Route::post('/schedules/block-date', [DashboardController::class, 'blockScheduleDate']);
        Route::post('/schedules/unblock-date', [DashboardController::class, 'unblockScheduleDate']);
        Route::post('/schedules', [DashboardController::class, 'storeSchedule']);
        Route::put('/schedules/{schedule}', [DashboardController::class, 'updateSchedule']);
        Route::delete('/schedules/{schedule}', [DashboardController::class, 'destroySchedule']);
        Route::get('/customers', [DashboardController::class, 'customers']);
        Route::post('/customers', [DashboardController::class, 'storeCustomer']);
        Route::put('/customers/{customer}', [DashboardController::class, 'updateCustomer']);
        Route::delete('/customers/{customer}', [DashboardController::class, 'destroyCustomer']);
        Route::get('/packages', [DashboardController::class, 'packages']);
        Route::middleware('admin')->group(function () {
            Route::post('/faqs', [FaqController::class, 'store']);
            Route::put('/faqs/{faq}', [FaqController::class, 'update']);
            Route::delete('/faqs/{faq}', [FaqController::class, 'destroy']);
            Route::get('/staff', [StaffController::class, 'index']);
            Route::post('/staff', [StaffController::class, 'store']);
            Route::get('/staff/{staff}', [StaffController::class, 'show']);
            Route::put('/staff/{staff}', [StaffController::class, 'update']);
            Route::post('/staff/{staff}', [StaffController::class, 'update']);
            Route::delete('/staff/{staff}', [StaffController::class, 'destroy']);
            Route::put('/media/{media}', [SiteMediaController::class, 'update']);
            Route::post('/media/{media}', [SiteMediaController::class, 'update']);
            Route::post('/media/home/{collection}', [SiteMediaController::class, 'storeHomeImage']);
            Route::delete('/media/home/{media}', [SiteMediaController::class, 'destroyHomeImage']);
            Route::delete('/media/{media}', [SiteMediaController::class, 'restore']);
        });
    });
});
