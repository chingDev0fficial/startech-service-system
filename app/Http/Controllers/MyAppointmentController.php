<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;

class MyAppointmentController extends Controller
{
       public function create()
    {
        return Inertia::render('my-appointments');
    }
}
