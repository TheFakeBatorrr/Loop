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

    public function elnokEvents()
    {
        $events = Event::where('type', '!=', 'external')
            ->whereNotIn('status', ['published', 'ended'])
            ->get();

        return response()->json($events, 200, options: JSON_UNESCAPED_UNICODE);
    }

    public function archivum()
    {
        $events = Event::query()
            ->leftJoin('ido_events', 'events.id', '=', 'ido_events.ido_event_id')
            ->where('events.status', 'ended')
            ->where('events.type', '!=', 'external')
            ->select(
                'events.id',
                'events.name',
                'events.type',
                'events.topic',
                'events.date',
                'events.location',
                'events.max_capacity',
                'events.target_audience',
                'ido_events.id as ido_event_id',
                'ido_events.revenue',
                'ido_events.expanses',
                'ido_events.main_organizer_id',
            )
            ->get();

        return response()->json($events, 200, options: JSON_UNESCAPED_UNICODE);
    }

    public function nextStatus(string $id)
    {
        $event = Event::findOrFail($id);

        $transitions = [
            'external'   => [
                'draft'     => 'published',
                'published' => 'ended',
            ],
            'school_ido' => [
                'draft'            => 'staff_gathering',
                'staff_gathering'  => 'pending_review',
                'pending_review'   => 'published',
                'published'        => 'ended',
            ],
            'ido_only'   => [
                'draft'     => 'published',
                'published' => 'ended',
            ],
            'ido_school' => [
                'draft'            => 'staff_gathering',
                'staff_gathering'  => 'pending_review',
                'pending_review'   => 'published',
                'published'        => 'ended',
            ],
        ];

        $nextStatus = $transitions[$event->type][$event->status] ?? null;

        if (!$nextStatus) {
            return response()->json([
                'uzenet' => 'Nincs következő lépés vagy érvénytelen átmenet.'
            ], 422, options: JSON_UNESCAPED_UNICODE);
        }

        $event->status = $nextStatus;
        $event->save();

        return response()->json([
            'uzenet' => 'Státusz frissítve.',
            'status' => $event->status,
        ], 200, options: JSON_UNESCAPED_UNICODE);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $request->validate([
            "name" => "required|string|max:60",
            "type" => "required|string|max:120",
            "status" => "required|string",
            "topic" => "required|string|max:120",
            "target_audience" => "required|string|max:20",
            "date" => "required|date",
            "location" => "required|string|max:255",
            "max_capacity" => "required|integer",
            "visibility" => "required|string",
            "created_by" => "required|exists:users,id"

        ],
        [
            "required" => ":attribute megadása kötelező!",
            "string" => ":attribute mező szöveges lehet csak!",
            "integer"=> ":attribute mező szám típusu-nak kell lennie!",
            "max" => ":attribute :max hoszzú lehet!",
            "min" => ":attribute :min hosszunak kell lennie!",
            "date" => ":attribute csak dátum lehet!",
            "exists" => ":attribute nem létezik!",
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
