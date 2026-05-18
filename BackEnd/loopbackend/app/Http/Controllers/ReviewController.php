<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Review;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

use function Laravel\Prompts\select;

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

    public function getMyReviews(string $id)
    {
        $myReviwes = Review::query()
        ->join('events' , 'reviews.reviews_event_id' , '=' , 'events.id')
        ->where('reviews_user_id' , $id)
        ->select(
            'events.id',
            'events.name',
            'events.topic',
            'events.date',
            'reviews.review',
            'reviews.content',
        )->get();

        return response()->json($myReviwes , 200 , options:JSON_UNESCAPED_UNICODE);

    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $user_id = $request->user()->id;

        $request->validate([
            "reviews_event_id" => [
                "required",
                "exists:events,id",
                // Itt a mágia: csak akkor érvényes, ha a reviews táblában 
                // az adott reviews_event_id-hoz még nincs párosítva ez a user_id
                Rule::unique('reviews')->where(function ($query) use ($user_id) {
                    return $query->where('reviews_user_id', $user_id);
                }),
            ],
            "review" => "required|integer|max:5|min:1",
            "content" => "required|string|max:255",
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

        $data = Review::create([
            'reviews_event_id' => $request->reviews_event_id,
            'reviews_user_id' => $user_id,
            'review' => $request->review,
            'content' => $request->content,
            'date' => now()
        ]);

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
        $request->validate([
            "review" => "required|integer|max:10|min:1",
            "content" => "required|string|max:255",
        ],
        [
            "required" => ":attribute megadása kötelező!",
            "integer" => ":attribute mező szám típusú kell legyen!",
            "max" => ":attribute maximum :max lehet!",
            "min" => ":attribute minimum :min kell legyen!",
            "string" => ":attribute mező szöveges lehet csak!",
        ]);

        $ertekel = Review::find($id);

        if (!$ertekel) {
            return response()->json([
                "uzenet" => "Az értékelés nem található!"
            ], 404, options: JSON_UNESCAPED_UNICODE);
        }

        $ertekel->review = $request->review;
        $ertekel->content = $request->content;
        $ertekel->save();

        return response()->json([
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
