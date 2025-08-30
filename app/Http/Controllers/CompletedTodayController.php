<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;

class CompletedTodayController extends Controller
{
    public function create()
    {
        return Inertia::render('completed-today');
    }
}
