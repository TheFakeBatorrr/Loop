<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Event;
use App\Models\User;
use Illuminate\Http\Request;

class EventController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index() //használjuk
    {
        $data = Event::all();

        return response()->json($data,200,options:JSON_UNESCAPED_UNICODE);
    }

    public function elnokEvents() //használjuk
    {
        $events = Event::where('type', '!=', 'external')
            ->whereNotIn('status', ['published', 'ended'])
            ->get();

        return response()->json($events, 200, options: JSON_UNESCAPED_UNICODE);
    }

    public function archivum(Request $request) //használjuk
    {
        $role = $request->user()->role;

        $query = Event::query()
            ->leftJoin('ido_events', 'events.id', '=', 'ido_events.ido_event_id')
            ->leftJoin('reviews', 'events.id', '=', 'reviews.reviews_event_id')
            ->leftJoin('students', 'ido_events.main_organiser_id', '=', 'students.users_id')
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
                    students.name as main_organiser_name,
                    students.class_number as main_organiser_class_number,
                    students.class_letter as main_organiser_class_letter,
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
                    ido_events.main_organiser_id,
                    students.name as main_organiser_name,
                    students.class_number as main_organiser_class_number,
                    students.class_letter as main_organiser_class_letter,
                    AVG(reviews.review) as avg_rating,
                    COUNT(reviews.id) as review_count
                ')
                ->groupBy(
                    'events.id', 'events.name', 'events.type', 'events.topic',
                    'events.date', 'events.location', 'events.max_capacity',
                    'events.target_audience', 'events.visibility',
                    'ido_events.id', 'ido_events.revenue',
                    'ido_events.expanses', 'ido_events.main_organiser_id',
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
                    students.name as main_organiser_name,
                    AVG(reviews.review) as avg_rating
                ')
                ->groupBy(
                    'events.id', 'events.name', 'events.type', 'events.topic',
                    'events.date', 'events.location', 'events.target_audience',
                    'students.name'
                );
        }

        return response()->json($query->orderBy('events.date' , 'desc')->get(), 200, options: JSON_UNESCAPED_UNICODE);
    }

    public function userArchivum(Request $request) //hasznájuk
    {
        $role = $request->user()->role;

        $query = Event::query()
            ->leftJoin('reviews', 'events.id', '=', 'reviews.reviews_event_id')
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
            ->when($request->topic, fn($q, $topic) => $q->where('events.topic', $topic))
            ->groupBy(
                'events.id', 'events.name', 'events.topic',
                'events.date', 'events.location', 'events.target_audience',
            );

        // Student nem látja az ido_only eventeket
        if ($role === 'Student') {
            $query->where('events.visibility', '=', 'public');
        }

        return response()->json($query->orderBy('events.date' , 'desc')->get(), 200, options: JSON_UNESCAPED_UNICODE);
    }

    public function published(Request $request) //használjuk
    {
        $user = $request->user()->id;

        $query = Event::where('status' , 'published');

        if($request->has('topic') && $request->topic !== 'Minden')
            {
                $query->where('topic' , $request->topic);
            }

        $event = $query->orderBy('date' , 'desc')->get();

        return response()->json($event,200,options:JSON_UNESCAPED_UNICODE);
    }

    public function nextStatus(string $id) //használjuk
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

    public function rejectStatus(string $id) //használjuk
    {
        $event = Event::findOrFail($id);

        if ($event->status !== 'pending_review') {
            return response()->json([
                'uzenet' => 'Csak jóváhagyásra váró esemény utasítható vissza!'
            ], 422, options: JSON_UNESCAPED_UNICODE);
        }

        $event->status = 'draft';
        $event->save();

        return response()->json([
            'uzenet' => 'Esemény visszaállítva tervezet állapotba.',
            'status' => $event->status,
        ], 200, options: JSON_UNESCAPED_UNICODE);
    }
    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request) //használjuk
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

            $idoEventData = [
                'ido_event_id' => $event->id,
            ];

            // csak ennél a 2 típusnál kell main organiser
            if (in_array($event->type, ['ido_only', 'school_ido'])) {
                $president = User::where('role', 'President')->first();

                if ($president) {
                    $idoEventData['main_organiser_id'] = $president->id;
                }
            }

            \App\Models\Ido_events::create($idoEventData);
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
        //
    }

    public function canRate(Request $request)
    {
        $user = $request->user();
        $student = $user->student;

        if (!$student) {
            return response()->json([], 200, [], JSON_UNESCAPED_UNICODE);
        }

        $classNumber = $student->class_number;
        $track = $this->getTrack($student->class_letter);

        $events = Event::query()
            // avg_rating számításhoz — összes review átlaga
            ->leftJoin('reviews', 'events.id', '=', 'reviews.reviews_event_id')
            ->where('events.status', 'ended')
            // target_audience egyezés
            ->where(function ($q) use ($classNumber, $track) {
                $q->where('events.target_audience', 'Minden diák')
                ->orWhere('events.target_audience', $classNumber . '. évfolyam')
                ->orWhere('events.target_audience', $track);
            })
            // ezt a usert még nem értékelte — külön subquery, nem érinti a join-t
            ->whereNotExists(function ($q) use ($user) {
                $q->selectRaw(1)
                ->from('reviews as r2')
                ->whereColumn('r2.reviews_event_id', 'events.id')
                ->where('r2.reviews_user_id', $user->id);
            })
            ->selectRaw('
                events.id,
                events.name,
                events.topic,
                events.date,
                events.location,
                events.target_audience,
                AVG(reviews.review) as avg_rating
            ')
            ->groupBy(
                'events.id',
                'events.name',
                'events.topic',
                'events.date',
                'events.location',
                'events.target_audience'
            )
            ->orderBy('events.date', 'desc')
            ->get();

        return response()->json($events, 200, [], JSON_UNESCAPED_UNICODE);
    }

    private function getTrack(string $letter): string
    {
        return match(strtoupper($letter)) {
            'A', 'D', 'F' => 'Reál',
            'B', 'I'      => 'Info tech',
            'C', 'G'      => 'Gazd tech',
            'E'           => 'Kéttannyelvű',
            'H'           => 'Humán',
            default       => 'unknown',
        };
    }

}
