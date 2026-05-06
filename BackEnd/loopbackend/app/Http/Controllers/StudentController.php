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
            "class_letter" => "required|string|max:6" 
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
            return response()->json(["uzenet" => "Nem található"], 404, options:JSON_UNESCAPED_UNICODE);
        }
        
        return response()->json($student, 200);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $request->validate([
            "class_number" => "required|integer|max:13",
            "class_letter" => "required|string|max:5"
        ],
        [
            "required" => ":attribute megadása kötelező!",
            "max" => ":attribute maximum :max lehet!",
            "string" => ":attribute mező szöveges lehet csak!",
            "INTEGER" => ":attribute mező szám lehet csak!"
        ]);

        $diak = Student::find($id);

        if (!$diak) {
            return response()->json([
                "uzenet" => "A felhasználó nem található!"
            ], 404, options: JSON_UNESCAPED_UNICODE);
        }

        $diak-> class_number = $request-> class_number;
        $diak-> class_letter = $request-> class_letter;
        $diak->save();

        return response()->json([
            "uzenet" => "Diák osztálya megváltoztatva!"
        ], 200, options: JSON_UNESCAPED_UNICODE);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        //
    }

    public function bump()
    {
        $students = Student::with('user')->get();

        foreach ($students as $student) {
            $letter = $student->class_letter;
            $number = $student->class_number;

            // Speciális első évesek — class_letter tartalmaz '/'
            // pl. E/nyk → E, T/ajtp → T, marad 9-es évfolyamon
            if (str_contains($letter, '/')) {
                $student->class_letter = explode('/', $letter)[0];
                $student->save();
                continue;
            }

            // 13.B és 13.C → Graduated
            if ($number === 13 && in_array($letter, ['B', 'C'])) {
                $student->class_number = null;
                $student->class_letter = null;
                $student->save();

                if ($student->user) {
                    $student->user->role = 'Graduated';
                    $student->user->save();
                }
                continue;
            }

            // 12-es mindenki más → Graduated
            if ($number === 12) {
                $student->class_number = null;
                $student->class_letter = null;
                $student->save();

                if ($student->user) {
                    $student->user->role = 'Graduated';
                    $student->user->save();
                }
                continue;
            }

            // Minden más → class_number + 1
            $student->class_number = $number + 1;
            $student->save();
        }

        return response()->json([
            'uzenet' => 'Évfolyam bump sikeresen lefutott!'
        ], 200, options: JSON_UNESCAPED_UNICODE);
    }
}
