<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;

class BillingsController extends Controller
{
    public function create()
    {
        return Inertia::render('manage-billings');
    }
}
