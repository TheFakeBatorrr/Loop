<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Ertekeles;
use Illuminate\Http\Request;

class ErtekelesController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $ertekeles = Ertekeles::all();
        return response()->json($ertekeles, 200, options:JSON_UNESCAPED_UNICODE);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $request->validate([
            "ertekeles_esemeny_id" => "required|exists:esemeny,id",
            "ertekeles_users_id" => "required|exists:users,id",
            "ertekeles" => "required|integer|max:10|min:1",
            "szoveges" => "required|string|max:255",
            "datum" => "required|date",
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

        $data = Ertekeles::create($request->all());

        return response()->json([
            "uzenet"=> "Sikeres értékelés!",
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
        $request -> validate([
            "ertekeles" => "required|integer|max:10|min:1",
            "szoveges" => "required|string|max:255",
        ]);

        $ertekel = Ertekeles::find($id);
        $ertekel->ertekeles = $request->ertekeles;
        $ertekel->szoveges = $request->szoveges;

        $ertekel->save();

        return response() -> json([
            "uzenet" => "Értékelés megváltoztatva!"
        ], 200, options: JSON_UNESCAPED_UNICODE);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $ertekeles = Ertekeles::find($id);

        $ertekeles->delete();

        return response()->json([
            "uzenet" => "Sikeres törlés!",
        ],201, options:JSON_UNESCAPED_UNICODE);
    }
}
