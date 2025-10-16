<?php

use Illuminate\Support\Facades\Broadcast;

Broadcast::channel('App.Models.User.{id}', function ($user, $id) {
    return (int) $user->id === (int) $id;
});

Broadcast::channel('services', function ($user) {
    return true; // or your authorization logic
});

/* Broadcast::channel('App.Models.Client', function ( $client ) { 
/*     return */
/* }) */
