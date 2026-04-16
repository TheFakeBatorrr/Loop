<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;

class UserController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $diak = User::all();
        return response()->json($diak, 200, options:JSON_UNESCAPED_UNICODE);
    }

    public function staff()
    {
        
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $request->validate([
            "email" => "required|string|email",
            "username" => "required|string|max:255",
            "password" => "required|min:8",
            "role" =>  "string|max:20"
        ], 
        [
            "required" => ":attribute megadása kötelező!",
            "string" => ":attribute mező szöveges lehet csak!",
            "max" => ":attribute :max hoszzú lehet!",
            "min" => ":attribute :min hosszunak kell lennie!",
            "email" => ":attribute mező email típusu-nak kell lenni!",
            "boolean" => ":attribute boolean típusu",        
        ]); 

        $data = User::create($request->all());

        return response()->json([
            "uzenet"=> "Sikeres diák feltöltés!",
        ],200, options:JSON_UNESCAPED_UNICODE);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {

    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $diak = User::find($id);

        if (!$diak) {
            return response()->json([
                "uzenet" => "A felhasználó nem található!"
            ], 404, options: JSON_UNESCAPED_UNICODE);
        }

        $diak->delete();

        return response()->json([
            "uzenet" => "Sikeres törlés!",
        ], 200, options: JSON_UNESCAPED_UNICODE); 
    }
}
