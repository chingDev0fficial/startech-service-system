<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\ServicePrice;

class ServicePriceController extends Controller
{
    public function update(Request $request)
    {
        $validated = $request->validate([
            'within' => 'required|numeric|min:0',
            'outside' => 'required|numeric|min:0',
        ]);

        $prices = ServicePrice::first() ?? new ServicePrice();
        $prices->within = $validated['within'];
        $prices->outside = $validated['outside'];
        $prices->save();

        return back()->with('success', 'Service prices updated successfully.');
    }
}