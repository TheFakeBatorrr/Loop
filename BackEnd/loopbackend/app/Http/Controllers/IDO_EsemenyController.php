<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\IDO_Esemeny;
use Illuminate\Http\Request;

class IDO_EsemenyController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $ido_es = IDO_Esemeny::all();
        return response()->json($ido_es, 200, options:JSON_UNESCAPED_UNICODE);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $request->validate([
            "ido_esemeny_id" => "required|exists:esemeny:id",
            "foszervezo" => "required|string|max:255",
            "foszervezo_id" => "required|exists:diak:id",
            "bevetel" => "required|string",
            "kiadas" => "required|string|",     
        ],
        [
            "required" => ":attribute megadása kötelező!",
            "string" => ":attribute mező szöveges lehet csak!",
            "integer"=> ":attribute mező szám típusu-nak kell lennie!",
            "max" => ":attribute :max hoszzú lehet!",
            "min" => ":attribute :min hosszunak kell lennie!",
            "exists" => ":attribute nem létezik!",
            "date" => ":attribute csak dátum lehet!",
        ]); 

        $data = IDO_Esemeny::create($request->all());

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
        $ido_esemeny = IDO_Esemeny::find($id);

        $ido_esemeny->delete();

        return response()->json([
            "uzenet" => "Sikeres törlés!",
        ],201, options:JSON_UNESCAPED_UNICODE);
    }
}
