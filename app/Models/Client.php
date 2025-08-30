<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Notifications\Notifiable;
use App\Http\Models\Appointment;

class Client extends Model
{
    use HasFactory, Notifiable;

    protected $table = 'client';

    protected $fillable = [
        'name',
        'email',
        'phone_number',
        'address',
    ];

    protected function casts(): array
    {
        return [
            'created_at' => 'datetime',
            'updated_at' => 'datetime',
        ];
    }

    /**
     * Get the appointment associated with the client.
     */
    public function appointment()
    {
        return $this->hasOne(Appointment::class);
    }
}
