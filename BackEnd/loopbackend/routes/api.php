<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AdminController;
use App\Http\Controllers\DiakController;
use App\Http\Controllers\ErtekelesController;
use App\Http\Controllers\EsemenyController;
use App\Http\Controllers\IDO_EsemenyController;
use App\Http\Controllers\StaffController;
use App\Http\Controllers\AuthController;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

// ADMIN
Route::get('/api/admin', [AdminController::class, 'index']);
Route::post('/api/admin', [AdminController::class, 'store']);
Route::delete('/api/admin/{$id}', [AdminController::class, 'destroy']);
Route::put('/api/admin/{$id}', [AdminController::class, 'update']);


//DIÁK
Route::get('/api/diak', [DiakController::class, 'index']);
Route::post('/api/diak', [DiakController::class, 'store']);
Route::delete('/api/diak/{$id}', [DiakController::class, 'destroy']);
Route::put('/api/diak/{$id}', [DiakController::class, 'update']);


//ÉRTÉKELÉSEK
Route::get('/api/ertekeles', [ErtekelesController::class, 'index']);
Route::post('/api/ertekeles', [ErtekelesController::class, 'store']);
Route::delete('/api/ertekeles/{$id}', [ErtekelesController::class, 'destroy']);
Route::put('/api/ertekeles/{$id}', [ErtekelesController::class, 'update']);


//ESEMÉNYEK
Route::get('/api/esemeny', [EsemenyController::class, 'index']);
Route::post('/api/esemeny', [EsemenyController::class, 'store']);
Route::delete('/api/esemeny/{$id}', [EsemenyController::class, 'destroy']);
Route::put('/api/esemeny/{$id}', [EsemenyController::class, 'update']);


//IDŐ-s_ESEMÉNYEK
Route::get('/api/IDO_esemeny', [IDO_EsemenyController::class, 'index']);
Route::post('/api/IDO_esemeny', [IDO_EsemenyController::class, 'store']);
Route::delete('/api/IDO_esemeny/{$id}', [IDO_EsemenyController::class, 'destroy']);
Route::put('/api/IDO_esemeny/{$id}', [IDO_EsemenyController::class, 'update']);


//STAFF
Route::get('/api/staff', [StaffController::class, 'index']);
Route::post('/api/staff', [StaffController::class, 'store']);
Route::delete('/api/staff/{$id}', [StaffController::class, 'destroy']);
Route::put('/api/staff/{$id}', [StaffController::class, 'update']);


//LOGIN ÉS REGISTER (AUTH)
Route::post('/login', [AuthController::class, 'login']);
Route::post('/register', [AuthController::class, 'register']);





