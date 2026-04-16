<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Staff;
use Illuminate\Http\Request;

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
            "staff_users_id" => "required|exists:users,id",
            "staff_events_id" => "required||exists:evnts,id",
            "role" => "required|string|max:255",     
            "accepted" => "required|boolean"

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

        $data = Staff::create($request->all());

        return response()->json([
            "uzenet"=> "Sikeres Staff jelentkezés!",
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
            "accepted" => "required|string|boolean",
            "role" => "required|string|max:20",
        ],
        [
            "required" => ":attribute megadása kötelező!",
            "string"   => ":attribute mező szöveges lehet csak!",
            "boolean" => ":attribute mező nem valós érték!"
        ]);

        $staff = Staff::find($id);

        if (!$staff) {
            return response()->json([
                "uzenet" => "A jelentkezés nem található!"
            ], 404, options: JSON_UNESCAPED_UNICODE);
        }

        $staff->accepted = $request->accepted;
        $staff->role = $request->role;
        $staff->save();

        return response()->json([
            "uzenet" => "Jelentkezés/szerepkör megváltoztatva!"
        ], 200, options: JSON_UNESCAPED_UNICODE);
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
}
