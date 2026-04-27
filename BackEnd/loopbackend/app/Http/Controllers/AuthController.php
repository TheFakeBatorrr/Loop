<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;
use Illuminate\Testing\Fluent\Concerns\Has;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Password;
use Illuminate\Auth\Events\PasswordReset;

class AuthController extends Controller
{
    public function register(Request $request)
    {
        $request->validate([
            "username" => "required|string",
            "email" => "required|email|string|unique:users",
            "password" => "required|string|min:8|confirmed",
            "device_name" => "required|string"
        ]);

        $user = User::create([
            "username" => $request->username,
            "email" => $request->email,
            "password" => $request->password
        ]);

        $user->sendEmailVerificationNotification();

        $token = $user->createToken($request->device_name)->plainTextToken;

        return response()->json([
            "message" => "Regisztráció sikeres! Ellenőrizd az emailed!",
            "token" => $token,
            "user" => $user
        ], 201);
    }

    public function login(Request $request)
    {
        $request->validate([
            "email" => "required|string|email",
            // "name" => "required|string",
            "password" => "required",
            "device_name" => "required"
        ]);

        $user = User::where("email", $request->email)->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            return response()->json(["message" => "Gatya tesó, próbáld máshogy!"], 401 , options:JSON_UNESCAPED_UNICODE);
        }

        $token = $user->createToken($request->device_name)->plainTextToken;

        return response()->json([
            "token" => $token,
            "users" => $user
        ], 200);
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            "message" => "Sikeres kijelentkezés!"
        ], 200 , options:JSON_UNESCAPED_UNICODE);
    }


    public function forgotPassword(Request $request)
    {
        $request->validate(['email' => 'required|email']);

        $status = Password::sendResetLink($request->only('email'));

        return $status === Password::ResetLinkSent
            ? response()->json(['message' => 'Reset link elküldve!'], 200)
            : response()->json(['message' => 'Hiba történt!'], 400);
    }

    public function resetPassword(Request $request)
    {
        $request->validate([
            'token' => 'required',
            'email' => 'required|email',
            'password' => 'required|min:8|confirmed',
        ]);

        $status = Password::reset(
            $request->only('email', 'password', 'password_confirmation', 'token'),
            function (User $user, string $password) {
                $user->forceFill(['password' => $password])->save();
                event(new PasswordReset($user));
            }
        );

        return $status === Password::PasswordReset
            ? response()->json(['message' => 'Jelszó sikeresen megváltoztatva!'], 200)
            : response()->json(['message' => 'Érvénytelen token!'], 400);
    }
}
