<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

use App\Models\Ido_applys;
use App\Models\Student;
use App\Models\User;

class Ido_applysController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $ido_apply = Ido_applys::all();
        return response()->json($ido_apply, 200, options:JSON_UNESCAPED_UNICODE);
    }

    public function pending()
    {
        $data = Ido_applys::query()
            ->join('students', 'ido_applys.ido_applys_users_id', '=', 'students.users_id')
            ->where('ido_applys.accepted', 'Pending')
            ->select(
                'ido_applys.id',
                'ido_applys_users_id',
                'ido_applys.motivation',
                'ido_applys.experince',
                'ido_applys.accepted',

                'students.name',
                'students.class_number',
                'students.class_letter',
            )
            ->get();

        return response()->json($data, 200, options:JSON_UNESCAPED_UNICODE);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $request->validate([
            "ido_applys_users_id" => "required|exists:users,id",
            "motivation" => "required|string|max:255",
            "experince" => "required|string|max:255",  
        ],
        [
            "required" => ":attribute megadása kötelező!",
            "string" => ":attribute mező szöveges lehet csak!",
            "integer"=> ":attribute mező szám típusu-nak kell lennie!",
            "max" => ":attribute :max hoszzú lehet!",
            "min" => ":attribute :min hosszunak kell lennie!",
            "exists" => ":attribute nem létezik!",
            "boolean" => ":attribute érvényes értéknek kell lennie!"
        ]); 

        $data = Ido_applys::create([
            'ido_applys_users_id' => $request->ido_applys_users_id,
            'motivation' => $request->motivation,
            'experince' => $request->experince,
        ]);

        return response()->json([
            "uzenet"=> "Sikeres IDÖ-s esemény létrehozás!",
        ],200, options:JSON_UNESCAPED_UNICODE);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $application = Ido_applys::where('ido_applys_users_id', $id)->first();
    
        if (!$application) {
            return response()->json(null, 404);
        }
        
        return response()->json($application, 200, options:JSON_UNESCAPED_UNICODE);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {

    }

    // Ido_applysController.php

    public function accept($id)
    {
        $apply = Ido_applys::where('id', $id)
            ->where('accepted', 'Pending')
            ->firstOrFail();

        $apply->accepted = 'Accepted';
        $apply->save();

        $user = User::find($apply->ido_applys_users_id);
        if ($user) {
            $user->role = 'Idos';
            $user->save();
        }

        return response()->json(['message' => 'Jelentkezés elfogadva.'], 200, options: JSON_UNESCAPED_UNICODE);
    }

    public function reject($id)
    {
        $apply = Ido_applys::where('id', $id)
            ->where('accepted', 'Pending')
            ->firstOrFail();

        $apply->accepted = 'Rejected';
        $apply->save();

        return response()->json(['message' => 'Jelentkezés elutasítva.'], 200, options: JSON_UNESCAPED_UNICODE);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        //
    }
}
