<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AdminController;
// use App\Http\Controllers\DiakController;
use App\Http\Controllers\ErtekelesController;
use App\Http\Controllers\EsemenyController;
use App\Http\Controllers\IDO_EsemenyController;
use App\Http\Controllers\StaffController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\UserController;

// Route::get('/user', function (Request $request) {
//     return $request->user();
// })->middleware('auth:sanctum');


//LOGIN ÉS REGISTER (AUTH)
Route::post('/login', [AuthController::class, 'login']);
Route::post('/register', [AuthController::class, 'register']);

// ADMIN
Route::get('/admin', [AdminController::class, 'index']);
Route::post('/admin', [AdminController::class, 'store']);
Route::delete('/admin/{id}', [AdminController::class, 'destroy']);
Route::put('/admin/{id}', [AdminController::class, 'update']);


//DIÁK
Route::get('/user', [UserController::class, 'index']);
Route::post('/user', [UserController::class, 'store']);
Route::delete('/user/{id}', [UserController::class, 'destroy']);
Route::put('/user/{id}', [UserController::class, 'update']);



Route::middleware('auth:sanctum')->group(function() {

    //LOGOUT
    Route::post('/logout', [AuthController::class, 'logout']);

    //ÉRTÉKELÉSEK
    Route::get('/ertekeles', [ErtekelesController::class, 'index']);
    Route::post('/ertekeles', [ErtekelesController::class, 'store']);
    Route::delete('/ertekeles/{id}', [ErtekelesController::class, 'destroy']);
    Route::put('/ertekeles/{id}', [ErtekelesController::class, 'update']);


    //ESEMÉNYEK
    Route::get('/esemeny', [EsemenyController::class, 'index']);
    Route::post('/esemeny', [EsemenyController::class, 'store']);
    Route::delete('/esemeny/{id}', [EsemenyController::class, 'destroy']);
    Route::put('/esemeny/{id}', [EsemenyController::class, 'update']);


    //IDŐ-s_ESEMÉNYEK
    Route::get('/IDO_esemeny', [IDO_EsemenyController::class, 'index']);
    Route::post('/IDO_esemeny', [IDO_EsemenyController::class, 'store']);
    Route::delete('/IDO_esemeny/{id}', [IDO_EsemenyController::class, 'destroy']);
    Route::put('/IDO_esemeny/{id}', [IDO_EsemenyController::class, 'update']);


        
    //STAFF
    Route::get('/staff', [StaffController::class, 'index']);
    Route::post('/staff', [StaffController::class, 'store']);
    Route::delete('/staff/{id}', [StaffController::class, 'destroy']);
    Route::put('/staff/{id}', [StaffController::class, 'update']);


});

   










