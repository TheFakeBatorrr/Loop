<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Diak;
use Illuminate\Http\Request;

class DiakController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $diak = Diak::all();
        return response()->json($diak, 200, options:JSON_UNESCAPED_UNICODE);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $request->validate([
            "nev" => "required|string|max:255",
            "email" => "required|string|",
            "username" => "required|string|max:255",
            "password" => "required|min:8",
            "osztaly" => "required|string|max:5",
            "kezdo_evfolyam" => "required|string|max:15",
            "idos" => "required|boolean|",

        ],
        [
            "required" => ":attribute megadása kötelező!",
            "string" => ":attribute mező szöveges lehet csak!",
            "max" => ":attribute :max hoszzú lehet!",
            "min" => ":attribute :min hosszunak kell lennie!",
            "email" => ":attribute mező email típusu-nak kell lenni!",
            "boolean" => ":attribute boolean típusu",        
        ]); 

        $data = Diak::create($request->all());

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
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $diak = Diak::find($id);

        $diak->delete();

        return response()->json([
            "uzenet" => "Sikeres törlés!",
        ],201, options:JSON_UNESCAPED_UNICODE);
    }
}
