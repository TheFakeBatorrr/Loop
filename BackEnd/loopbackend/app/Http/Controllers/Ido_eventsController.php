<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Ido_events;
use Illuminate\Http\Request;

class Ido_eventsController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $ido_event = Ido_events::all();
        return response()->json($ido_event, 200, options:JSON_UNESCAPED_UNICODE);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $request->validate([
            "ido_events_id" => "required|exists:events,id",
            "main_organizer_id" => "required|exists:users,id",
            "revenue" => "required|string",
            "expanses" => "required|string|",     
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

        $data = Ido_events::create($request->all());

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
        $request->validate([
            "revenue" => "required|string",
            "expanses" => "required|string",     
        ],
        [
            "required" => ":attribute megadása kötelező!",
            "string"   => ":attribute mező szöveges lehet csak!",
        ]);

        $ido_events = Ido_events::find($id);

        if (!$ido_events) {
            return response()->json([
                "uzenet" => "Az IDÖ esemény nem található!"
            ], 404, options: JSON_UNESCAPED_UNICODE);
        }

        $ido_events->revenue = $request->revenue;
        $ido_events->expanses = $request->expanses;
        $ido_events->save();

        return response()->json([
            "uzenet" => "Be/Ki-adások megváltoztatva!"
        ], 200, options: JSON_UNESCAPED_UNICODE);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $Ido_events = Ido_events::find($id);

        $Ido_events->delete();

        return response()->json([
            "uzenet" => "Sikeres törlés!",
        ],201, options:JSON_UNESCAPED_UNICODE);
    }
}
