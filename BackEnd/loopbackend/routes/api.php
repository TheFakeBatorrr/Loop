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
use Illuminate\Container\Attributes\Auth;
use Illuminate\Foundation\Auth\EmailVerificationRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Password;
use Illuminate\Auth\Events\PasswordReset;
use Illuminate\Support\Str;

use Illuminate\Auth\Events\Verified;
use App\Models\User;

// AUTH (nem védett)
Route::post('/login', [AuthController::class, 'login']);
Route::post('/register', [AuthController::class, 'register']);

// Ez fogadja a linkre kattintást és visszaadja a tokent // PASSWORD RESET (nem védett)
Route::get('/reset-password', function (Request $request) {
    return response()->json([
        'token' => $request->token,
        'email' => $request->email,
        'message' => 'Használd ezt a tokent a POST /api/reset-password endpointon!'
    ], 200);
})->name('password.reset');

// PASSWORD RESET (nem védett)
Route::post('/forgot-password', [AuthController::class, 'forgotPassword']);
Route::post('/reset-password', [AuthController::class, 'resetPassword']);

// EMAIL VERIFY (nem védett, csak signed)
Route::get('/email/verify/{id}/{hash}', function($id, $hash) {
    $user = User::findOrFail($id);

    if (!hash_equals((string) $hash, sha1($user->getEmailForVerification()))) {
        return response()->json(['message' => 'Érvénytelen verifikációs link!'], 403);
    }

    if ($user->hasVerifiedEmail()) {
        return response()->json(['message' => 'Email már verifikálva!'], 200);
    }

    $user->markEmailAsVerified();
    event(new Verified($user));

    return response()->json(['message' => 'Email sikeresen verifikálva!'], 200);
})->middleware('signed')->name('verification.verify');

// EMAIL RESEND (auth de verified nélkül)
Route::middleware(['auth:sanctum', 'throttle:6,1'])->post('/email/resend', function (Request $request) {
    if ($request->user()->hasVerifiedEmail()) {
        return response()->json(['message' => 'Email már verifikálva!'], 200);
    }
    $request->user()->sendEmailVerificationNotification();
    return response()->json(['uzenet' => 'Email elküldve!'], 200);
});

// VÉDETT ÚTVONALAK (auth + verified)
Route::middleware(['auth:sanctum', 'verified'])->group(function () {

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
        Route::patch('/{id}/reject-status', 'rejectStatus');
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
        Route::post('/bump', 'bump');
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