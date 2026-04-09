<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AdminController;
// use App\Http\Controllers\DiakController;
use App\Http\Controllers\ReviewController;
use App\Http\Controllers\EventController;
use App\Http\Controllers\Ido_eventsController;
use App\Http\Controllers\Ido_applysController;
use App\Http\Controllers\StudentController;
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
    Route::get('/ertekeles', [ReviewController::class, 'index']);
    Route::post('/ertekeles', [ReviewController::class, 'store']);
    Route::delete('/ertekeles/{id}', [ReviewController::class, 'destroy']);
    Route::put('/ertekeles/{id}', [ReviewController::class, 'update']);


    //ESEMÉNYEK
    Route::get('/esemeny', [EventController::class, 'index']);
    Route::post('/esemeny', [EventController::class, 'store']);
    Route::delete('/esemeny/{id}', [EventController::class, 'destroy']);
    Route::put('/esemeny/{id}', [EventController::class, 'update']);


    //IDŐ-s_ESEMÉNYEK
    Route::get('/IDO_esemeny', [Ido_eventsController::class, 'index']);
    Route::post('/IDO_esemeny', [Ido_eventsController::class, 'store']);
    Route::delete('/IDO_esemeny/{id}', [Ido_eventsController::class, 'destroy']);
    Route::put('/IDO_esemeny/{id}', [Ido_eventsController::class, 'update']);

    //IDŐ-s_JELENTKEZÉS
    Route::get('/application', [Ido_applysController::class, 'index']);
    Route::post('/application', [Ido_applysController::class, 'store']);
    Route::delete('/application/{id}', [Ido_applysController::class, 'destroy']);
    Route::put('/application/{id}', [Ido_applysController::class, 'update']);

    //diák külön???
    Route::get('/student', [StudentController::class, 'index']);
    Route::post('/student', [StudentController::class, 'store']);
    Route::delete('/student/{id}', [StudentController::class, 'destroy']);
    Route::put('/student/{id}', [StudentController::class, 'update']);
        
    //STAFF
    Route::get('/staff', [StaffController::class, 'index']);
    Route::post('/staff', [StaffController::class, 'store']);
    Route::delete('/staff/{id}', [StaffController::class, 'destroy']);
    Route::put('/staff/{id}', [StaffController::class, 'update']);


});

   










