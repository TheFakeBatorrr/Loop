<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\ReviewController;
use App\Http\Controllers\EventController;
use App\Http\Controllers\Ido_eventsController;
use App\Http\Controllers\Ido_applysController;
use App\Http\Controllers\StudentController;
use App\Http\Controllers\StaffController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\UserController;
use Illuminate\Http\Request;


// AUTH (nem védett)
Route::post('/login', [AuthController::class, 'login']);
Route::post('/register', [AuthController::class, 'register']);

// VÉDETT ÚTVONALAK
Route::middleware('auth:sanctum')->group(function () {

    // AUTH
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', function (Request $request) {
        return response()->json($request->user());
    });

    // USERS
    Route::prefix('user')->controller(UserController::class)->group(function () {
        Route::get('/', 'index');
        Route::post('/', 'store');
        Route::delete('/{id}', 'destroy');
        Route::put('/{id}', 'update');
        Route::get('/members','getMembers');
        Route::get('/getpresident', 'getPresident');
        Route::put('/newpresident/{id}','newPresident');

    });

    // ÉRTÉKELÉSEK
    Route::prefix('ertekeles')->controller(ReviewController::class)->group(function () {
        Route::get('/', 'index');
        Route::post('/', 'store');
        Route::delete('/{id}', 'destroy');
        Route::put('/{id}', 'update');
        Route::get('/myreviews' , 'getMyReviews');
    });

    // ESEMÉNYEK
    Route::prefix('esemeny')->controller(EventController::class)->group(function () {
        Route::get('/', 'index');
        Route::post('/', 'store');
        Route::delete('/{id}', 'destroy');
        Route::put('/{id}', 'update');
        Route::patch('/{id}/next-status', 'nextStatus');
        Route::get('/elnok', 'elnokEvents');
        Route::get('/archivum' , 'archivum');
        Route::get('/userarchivum', 'userArchivum');
    });

    // IDÖ ESEMÉNYEK
    Route::prefix('ido-events')->controller(Ido_eventsController::class)->group(function () {
        Route::get('/', 'index');
        Route::post('/', 'store');
        Route::delete('/{id}', 'destroy');
        Route::put('/{id}', 'update');
    });

    // IDÖ JELENTKEZÉSEK
    Route::prefix('application')->controller(Ido_applysController::class)->group(function () {
        Route::get('/', 'index');
        Route::get('/pending', 'pending');
        Route::get('/{id}', 'show');
        Route::post('/', 'store');
        Route::delete('/{id}', 'destroy');
        Route::patch('/{id}/accept', 'accept');
        Route::patch('/{id}/reject', 'reject');
    });

    // DIÁKOK
    Route::prefix('student')->controller(StudentController::class)->group(function () {
        Route::get('/', 'index');
        Route::get('/{id}', 'show');
        Route::post('/', 'store');
        Route::delete('/{id}', 'destroy');
        Route::put('/{id}', 'update');
    });

    // STAFF
    Route::prefix('staff')->controller(StaffController::class)->group(function () {
        Route::get('/', 'index');
        Route::post('/', 'store');
        Route::delete('/{id}', 'destroy');
        Route::put('/{id}', 'update');
        Route::get('/event/{event_id}', 'byEvent');
        Route::get('/user/{user_id}/event/{event_id}', 'byUserAndEvent');
    });

});