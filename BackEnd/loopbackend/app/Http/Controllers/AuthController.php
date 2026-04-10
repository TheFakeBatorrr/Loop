<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;
use Illuminate\Testing\Fluent\Concerns\Has;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Auth;

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

        $token = $user->createToken($request->device_name)->plainTextToken;

        return response()->json([
            "token" => $token,
            "diak" => $user
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
            return response()->json(["message" => "Gatya tesó, próbáld máshogy!"], 401);
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
        ], 200);
    }
}
