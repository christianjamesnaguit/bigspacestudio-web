<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class DashboardSettingsTest extends TestCase
{
    use RefreshDatabase;

    public function test_dashboard_user_can_load_and_save_profile_and_preferences(): void
    {
        $user = User::factory()->create([
            'role' => 'Staff',
            'first_name' => 'Taylor',
            'last_name' => 'Staff',
            'email' => 'taylor@example.com',
        ]);
        $this->actingAs($user);

        $this->getJson('/api/dashboard/settings')
            ->assertOk()
            ->assertJsonPath('user.first_name', 'Taylor')
            ->assertJsonPath('preferences.default_booking_duration', 2)
            ->assertJsonPath('preferences.notify_new_bookings', true);

        $this->putJson('/api/dashboard/settings', [
            'first_name' => 'Taylor',
            'last_name' => 'Morgan',
            'email' => 'taylor.morgan@example.com',
            'role' => 'Admin',
            'preferences' => [
                'default_booking_duration' => 3,
                'default_booking_status' => 'confirmed',
                'auto_confirm_requests' => true,
                'notify_new_bookings' => false,
                'notify_booking_reminders' => true,
                'notify_weekly_summary' => true,
            ],
        ])->assertOk()
            ->assertJsonPath('user.last_name', 'Morgan')
            ->assertJsonPath('user.email', 'taylor.morgan@example.com')
            ->assertJsonPath('user.role', 'Staff')
            ->assertJsonPath('preferences.default_booking_duration', 3)
            ->assertJsonPath('preferences.notify_new_bookings', false)
            ->assertJsonPath('preferences.notify_weekly_summary', true);

        $this->assertDatabaseHas('users', [
            'id' => $user->id,
            'last_name' => 'Morgan',
            'email' => 'taylor.morgan@example.com',
            'role' => 'Staff',
        ]);

        $this->getJson('/api/dashboard/settings')
            ->assertJsonPath('preferences.default_booking_status', 'confirmed')
            ->assertJsonPath('preferences.auto_confirm_requests', true);
    }

    public function test_settings_reject_invalid_or_duplicate_profile_values(): void
    {
        $user = User::factory()->create(['role' => 'Admin']);
        User::factory()->create(['email' => 'taken@example.com']);
        $this->actingAs($user);

        $this->putJson('/api/dashboard/settings', [
            'first_name' => 'Admin',
            'last_name' => 'User',
            'email' => 'taken@example.com',
            'preferences' => [
                'default_booking_duration' => 9,
                'default_booking_status' => 'pending',
                'auto_confirm_requests' => false,
                'notify_new_bookings' => true,
                'notify_booking_reminders' => true,
                'notify_weekly_summary' => false,
            ],
        ])->assertUnprocessable()
            ->assertJsonValidationErrors(['email', 'preferences.default_booking_duration']);
    }

    public function test_customers_cannot_access_dashboard_settings(): void
    {
        $this->actingAs(User::factory()->create(['role' => 'Customer']))
            ->getJson('/api/dashboard/settings')
            ->assertForbidden();
    }
}
