<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Notifications\Notifiable;
use App\Http\Models\Appointment;
use Illuminate\Foundation\Auth\User as Authenticatable;

class Client extends Authenticatable
{
    use HasFactory, Notifiable;

    protected $table = 'client';

    protected $fillable = [
        'name',
        'email',
        'phone_number',
        'address',
        'password',
        'client_status'
    ];

    protected $hidden = [
        'password',
//         'remember_token',
    ];

    protected function casts(): array
    {
        return [
//             'email_verified_at' => 'datetime',
            'password' => 'hashed',
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
