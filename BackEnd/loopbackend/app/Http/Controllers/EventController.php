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

    public function archivum(Request $request)
    {
        $role = $request->user()->role;

        $query = Event::query()
            ->leftJoin('ido_events', 'events.id', '=', 'ido_events.ido_event_id')
            ->leftJoin('reviews', 'events.id', '=', 'reviews.reviews_event_id')
            ->leftJoin('students', 'ido_events.main_organizer_id', '=', 'students.users_id')
            ->where('events.status', 'ended');

        if ($role === 'Admin') {
            $query->where('events.type', '!=', 'ido_only')
                ->selectRaw('
                    events.id,
                    events.name,
                    events.type,
                    events.topic,
                    events.date,
                    events.location,
                    events.max_capacity,
                    events.target_audience,
                    students.name as main_organizer_name,
                    students.class_number as main_organizer_class_number,
                    students.class_letter as main_organizer_class_letter,
                    AVG(reviews.review) as avg_rating,
                    COUNT(reviews.id) as review_count
                ')
                ->groupBy(
                    'events.id', 'events.name', 'events.type', 'events.topic',
                    'events.date', 'events.location', 'events.max_capacity',
                    'events.target_audience',
                    'students.name', 'students.class_number', 'students.class_letter'
                );

        } elseif ($role === 'President') {
            $query->where('events.type', '!=', 'external')
                ->selectRaw('
                    events.id,
                    events.name,
                    events.type,
                    events.topic,
                    events.date,
                    events.location,
                    events.max_capacity,
                    events.target_audience,
                    events.visibility,
                    ido_events.id as ido_event_id,
                    ido_events.revenue,
                    ido_events.expanses,
                    ido_events.main_organizer_id,
                    students.name as main_organizer_name,
                    students.class_number as main_organizer_class_number,
                    students.class_letter as main_organizer_class_letter,
                    AVG(reviews.review) as avg_rating,
                    COUNT(reviews.id) as review_count
                ')
                ->groupBy(
                    'events.id', 'events.name', 'events.type', 'events.topic',
                    'events.date', 'events.location', 'events.max_capacity',
                    'events.target_audience', 'events.visibility',
                    'ido_events.id', 'ido_events.revenue',
                    'ido_events.expanses', 'ido_events.main_organizer_id',
                    'students.name', 'students.class_number', 'students.class_letter'
                );

        } else {
            // Idos
            $query->where('events.type', '!=', 'external')
                ->selectRaw('
                    events.id,
                    events.name,
                    events.type,
                    events.topic,
                    events.date,
                    events.location,
                    events.target_audience,
                    students.name as main_organizer_name,
                    AVG(reviews.review) as avg_rating
                ')
                ->groupBy(
                    'events.id', 'events.name', 'events.type', 'events.topic',
                    'events.date', 'events.location', 'events.target_audience',
                    'students.name'
                );
        }

        return response()->json($query->get(), 200, options: JSON_UNESCAPED_UNICODE);
    }

    public function userArchivum(Request $request)
    {
        $role = $request->user()->role;

        $query = Event::query()
            ->leftJoin('reviews', 'events.id', '=', 'reviews.reviews_events_id')
            ->where('events.status', 'ended')
            ->selectRaw('
                events.id,
                events.name,
                events.topic,
                events.date,
                events.location,
                events.target_audience,
                AVG(reviews.review) as avg_rating
            ')
            ->where('event.topic' === $request->topic)
            ->groupBy(
                'events.id', 'events.name', 'events.topic',
                'events.date', 'events.location', 'events.target_audience',
            );

        // Student nem látja az ido_only eventeket
        if ($role === 'Student') {
            $query->where('events.visibility', '=', 'public');
        }

        return response()->json($query->get(), 200, options: JSON_UNESCAPED_UNICODE);
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
            "topic" => "required|string|in:Sport,Kultúra,Tanulmány,Továbbtanulás,Iskolai élet,Szórakozás,Csapatépítés,Egyéb",
            "target_audience" => "required|string|max:20",
            "date" => "required|date",
            "location" => "required|string|max:255",
            "max_capacity" => "required|integer",
            "visibility" => "required|string",
            "created_by" => "required|exists:users,id"
        ],
        [
            "required" => ":attribute megadása kötelező!",
            "in" => ":attribute csak előre megadott érték lehet",
            "string" => ":attribute mező szöveges lehet csak!",
            "integer"=> ":attribute mező szám típusú kell legyen!",
            "max" => ":attribute :max hosszú lehet!",
            "min" => ":attribute :min hosszúnak kell lennie!",
            "date" => ":attribute csak dátum lehet!",
            "exists" => ":attribute nem létezik!",
        ]); 

        $event = Event::create($request->all());

        if (in_array($event->type, ['ido_only', 'ido_school', 'school_ido'])) {
            \App\Models\Ido_events::create([
                'ido_event_id' => $event->id,
            ]);
        }

        return response()->json([
            "uzenet" => "Sikeres esemény létrehozás!",
        ], 201, options: JSON_UNESCAPED_UNICODE);
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
