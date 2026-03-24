<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Admin;
use Illuminate\Http\Request;

class AdminController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
       $admin = Admin::all();
       return response()->json($admin, 200, options:JSON_UNESCAPED_UNICODE);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $request->validate([
            "username" => "required|string|max:255",
            "password" => "required|min:8"
        ],
        [
            "required" => ":attribute megadása kötelező!",
            "string" => ":attribute mező szöveges lehet csak!",
            "max" => ":attribute :max hoszzú lehet!",
            "min" => ":attribute :min hosszunak kell lennie!",
            
        ]); 

        $data = Admin::create($request->all());

        return response()->json([
            "uzenet"=> "Sikeres admin csatlakozás!",
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
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $admin = Admin::find($id);

        $admin->delete();

        return response()->json([
            "uzenet" => "Sikeres törlés!",
        ],201, options:JSON_UNESCAPED_UNICODE);
    }
}
