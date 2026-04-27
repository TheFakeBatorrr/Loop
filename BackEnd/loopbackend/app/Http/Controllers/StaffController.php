<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Staff;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class StaffController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $staff = Staff::all();
        return response()->json($staff, 200, options:JSON_UNESCAPED_UNICODE);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $request->validate([
            "staff_user_id"  => "required|exists:users,id",
            "staff_event_id" => "required|exists:events,id",
            "role"           => "required|string|in:szervező,főszervező",
        ], [
            "required" => ":attribute megadása kötelező!",
            "exists"   => ":attribute nem létezik!",
            "in"       => ":attribute csak szervező vagy főszervező lehet!",
        ]);

        // Ha főszervezőnek jelentkezik, ellenőrizzük van-e már elfogadott főszervező
        if ($request->role === 'főszervező') {
            $existing = Staff::where('staff_event_id', $request->staff_event_id)
                ->where('role', 'főszervező')
                ->where('accepted', true)
                ->exists();

            if ($existing) {
                return response()->json([
                    'uzenet' => 'Már van elfogadott főszervező erre az eseményre!'
                ], 422, options: JSON_UNESCAPED_UNICODE);
            }
        }

        Staff::create([
            'staff_user_id'  => $request->staff_user_id,
            'staff_event_id' => $request->staff_event_id,
            'role'           => $request->role,
            'accepted'       => null,
        ]);

        return response()->json(['uzenet' => 'Sikeres staff jelentkezés!'], 200, options: JSON_UNESCAPED_UNICODE);
    }

    /**
     * Display the specified resource.
     */
    public function idoProfil(string $id)
    {
        $user = User::findOrFail($id);

        $data = DB::table('staff')
            ->join('events', 'staff.staff_event_id', '=', 'events.id')
            ->where('staff.staff_user_id', $id)
            ->where('staff.accepted', 1)
            ->select(
                'events.id',
                'events.name',
                'events.date',
                'staff.role as user_event_role'
            )
            ->get();

        return response()->json($data,200,[],JSON_UNESCAPED_UNICODE);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $request->validate([
            "accepted" => "required|boolean",
        ], [
            "required" => ":attribute megadása kötelező!",
            "boolean"  => ":attribute csak true/false lehet!",
        ]);

        $staff = Staff::findOrFail($id);
        $staff->accepted = $request->accepted;
        $staff->save();

        return response()->json(['uzenet' => 'Jelentkezés frissítve!'], 200, options: JSON_UNESCAPED_UNICODE);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $staff = Staff::find($id);

        $staff->delete();

        return response()->json([
            "uzenet" => "Sikeres törlés!",
        ],201, options:JSON_UNESCAPED_UNICODE);
    }

    // Egy esemény összes staff jelentkezője — elnöknek
    // GET /api/staff/event/{event_id}
    public function byEvent(string $event_id)
    {
        $staff = Staff::query()
            ->join('students', 'staff.staff_user_id', '=', 'students.users_id')
            ->where('staff.staff_event_id', $event_id)
            ->select(
                'staff.id',
                'staff.staff_user_id',
                'staff.staff_event_id',
                'staff.role',
                'staff.accepted',
                'students.name',
                'students.class_number',
                'students.class_letter',
            )
            ->get();

        return response()->json($staff, 200, options: JSON_UNESCAPED_UNICODE);
    }

    // Egy user saját jelentkezése egy adott eseményre — dupla jelentkezés ellenőrzéshez
    // GET /api/staff/user/{user_id}/event/{event_id}
    public function byUserAndEvent(string $user_id, string $event_id)
    {
        $staff = Staff::where('staff_user_id', $user_id)
            ->where('staff_event_id', $event_id)
            ->first();

        if (!$staff) {
            return response()->json(null, 404);
        }

        return response()->json($staff, 200, options: JSON_UNESCAPED_UNICODE);
    }
}
