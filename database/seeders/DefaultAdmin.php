<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Database\Seeder;

class DefaultAdmin extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        if ( User::count() == 0 )
        {
            User::create([
                'name' => 'Admin',
                'email' => 'admin@startech.com',
                'password' => Hash::make('admin.startech.123'),
                'role' => 'super admin',
            ]);
        }
    }
}
