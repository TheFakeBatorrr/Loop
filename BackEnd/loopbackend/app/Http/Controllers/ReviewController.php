<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Review;
use Illuminate\Http\Request;

class ReviewController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $Review = Review::all();
        return response()->json($Review, 200, options:JSON_UNESCAPED_UNICODE);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $request->validate([
            "reviews_events_id" => "required|exists:events,id",
            "reviews_users_id" => "required|exists:users,id",
            "review" => "required|integer|max:10|min:1",
            "content" => "required|string|max:255",
            "date" => "required|date",
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

        $data = Review::create($request->all());

        return response()->json([
            "uzenet"=> "Sikeres értékelés!",
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
        $request -> validate([
            "Review" => "required|integer|max:10|min:1",
            "szoveges" => "required|string|max:255",
        ]);

        $ertekel = Review::find($id);
        $ertekel->Review = $request->Review;
        $ertekel->szoveges = $request->szoveges;

        $ertekel->save();

        return response() -> json([
            "uzenet" => "Értékelés megváltoztatva!"
        ], 200, options: JSON_UNESCAPED_UNICODE);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $Review = Review::find($id);

        $Review->delete();

        return response()->json([
            "uzenet" => "Sikeres törlés!",
        ],201, options:JSON_UNESCAPED_UNICODE);
    }
}
