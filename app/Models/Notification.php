<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Notification extends Model
{
     /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasUlids, HasFactory, Notifiable;

    protected $table = 'notification';

    protected $attributes = [
        'status' => 'unseen',
    ];

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'type',
        'title',
        'message',
        'status',
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
            'created_at' => 'datetime',
        ];
    }
    public function client()
    {
        return $this->belongsTo(Client::class, 'client_id');
    }
}
