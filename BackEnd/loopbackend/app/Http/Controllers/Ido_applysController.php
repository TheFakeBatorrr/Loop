<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

use App\Models\Ido_applys;

class Ido_applysController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $ido_apply = Ido_applys::all();
        return response()->json($ido_apply, 200, options:JSON_UNESCAPED_UNICODE);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $request->validate([
            "ido_applys_users_id" => "required|exists:users,id",
            "motivation" => "required|string|max:255",
            "experince" => "required|string|max:255",  
            "accepted" => "required|boolean"
        ],
        [
            "required" => ":attribute megadása kötelező!",
            "string" => ":attribute mező szöveges lehet csak!",
            "integer"=> ":attribute mező szám típusu-nak kell lennie!",
            "max" => ":attribute :max hoszzú lehet!",
            "min" => ":attribute :min hosszunak kell lennie!",
            "exists" => ":attribute nem létezik!",
            "boolean" => ":attribute érvényes értéknek kell lennie!"
        ]); 

        $data = Ido_applys::create($request->all());

        return response()->json([
            "uzenet"=> "Sikeres IDÖ-s esemény létrehozás!",
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
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        //
    }
}
