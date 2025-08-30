<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Notifications\Notifiable;
use App\Http\Models\Client;

class Appointment extends Model
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasUlids, HasFactory, Notifiable;

    protected $table = 'appointment';

    protected $attributes = [
        'status' => 'pending',
    ];

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'client_id',
        'item',
        'service_type',
        'service_location',
        'schedule_at',
        'status',
        'description',
        'mark_as',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'id' => 'string',
            'schedule_at' => 'datetime', // Cast schedule_at to datetime
            'updated_at' => 'datetime',
        ];
    }
    public function client()
    {
        return $this->belongsTo(Client::class, 'client_id');
    }
}
