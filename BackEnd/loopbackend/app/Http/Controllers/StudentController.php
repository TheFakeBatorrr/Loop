<?php

namespace App\Http\Controllers;

use App\Models\Student;
use Illuminate\Http\Request;


class StudentController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $student = Student::all();
        return response()->json($student, 200, options:JSON_UNESCAPED_UNICODE);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
         $request->validate([
            "users_id" => "required|exists:users,id",
            "name" => "required|string|max:120",
            "class_number" => "required|integer|max:13",
            "class_letter" => "required|string|max:5"
        ],
        [
            "required" => ":attribute megadása kötelező!",
            "string" => ":attribute mező szöveges lehet csak!",
            "max" => ":attribute :max hoszzú lehet!",
        ]); 

        $data = Student::create($request->all());

        return response()->json([
            "uzenet"=> "Sikeres Staff jelentkezés!",
        ],200, options:JSON_UNESCAPED_UNICODE);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $student = Student::where('users_id', $id)->first();
        
        if (!$student) {
            return response()->json(["uzenet" => "Nem található"], 404);
        }
        
        return response()->json($student, 200);
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
}
