<?php

namespace App\Http\Controllers;
use Inertia\Inertia;

use Illuminate\Http\Request;

class HistoryController extends Controller
{
     public function create()
    {
        return Inertia::render('manage-history');
    }
}
