<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Notifications\Notifiable;

class ServicePrice extends Model
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */

    protected $table = 'home_service_pricing';
    
    protected $fillable = [
        'within',
        'outside',
    ];


    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected function casts(): array
    {
        return [
            'within' => 'decimal:2',
            'outside' => 'decimal:2',
        ];
    }
}
