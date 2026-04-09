<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Esemeny;
use Illuminate\Http\Request;

class EsemenyController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $esemeny = Esemeny::all();
        return response()->json($esemeny, 200, options:JSON_UNESCAPED_UNICODE);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $request->validate([
            "tipus" => "required|string|max:120",
            "tema" => "required|string|max:120",
            "cel_evfolyam" => "required|string|max:20",
            "datum" => "required|string|date",
            "terem" => "required|string|max:255",     
            "max_letszam" => "required|integer",
        ],
        [
            "required" => ":attribute megadása kötelező!",
            "string" => ":attribute mező szöveges lehet csak!",
            "integer"=> ":attribute mező szám típusu-nak kell lennie!",
            "max" => ":attribute :max hoszzú lehet!",
            "min" => ":attribute :min hosszunak kell lennie!",
            "date" => ":attribute csak dátum lehet!",
        ]); 

        Esemeny::create($request->all());

        return response()->json([
            "uzenet"=> "Sikeres esemény létrehozás!",
        ],201, options:JSON_UNESCAPED_UNICODE);
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
        $esemeny = Esemeny::find($id);

        $esemeny->delete();

        return response()->json([
            "uzenet" => "Sikeres törlés!",
        ],201, options:JSON_UNESCAPED_UNICODE);
    }
}
