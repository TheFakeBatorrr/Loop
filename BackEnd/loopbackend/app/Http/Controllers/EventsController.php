<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Event;
use Illuminate\Http\Request;

class EventController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $Event = Event::all();
        return response()->json($Event, 200, options:JSON_UNESCAPED_UNICODE);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $request->validate([
            "type" => "required|string|max:120",
            "status" => "required|string",
            "topic" => "required|string|max:120",
            "target_audience" => "required|string|max:20",
            "date" => "required|string|date",
            "location" => "required|string|max:255",     
            "max_capacity" => "required|integer",
            "visibility" => "required|string",
            "created_by" => "required|integer"

        ],
        [
            "required" => ":attribute megadása kötelező!",
            "string" => ":attribute mező szöveges lehet csak!",
            "integer"=> ":attribute mező szám típusu-nak kell lennie!",
            "max" => ":attribute :max hoszzú lehet!",
            "min" => ":attribute :min hosszunak kell lennie!",
            "date" => ":attribute csak dátum lehet!",
        ]); 

        Event::create($request->all());

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
        $Event = Event::find($id);

        $Event->delete();

        return response()->json([
            "uzenet" => "Sikeres törlés!",
        ],201, options:JSON_UNESCAPED_UNICODE);
    }
}
