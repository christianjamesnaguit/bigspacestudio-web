<?php

namespace Tests\Feature;

use App\Models\Booking;
use App\Models\Package;
use App\Models\Schedule;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class DashboardCrudTest extends TestCase
{
    use RefreshDatabase;

    private function administrator(): User
    {
        return User::factory()->create(['role' => 'Admin']);
    }

    public function test_dashboard_mutations_are_restricted_to_administrators(): void
    {
        $this->actingAs(User::factory()->create(['role' => 'Customer']))
            ->getJson('/api/dashboard/bookings')
            ->assertForbidden();
    }

    public function test_admin_can_create_update_and_delete_customers(): void
    {
        $this->actingAs($this->administrator());

        $response = $this->postJson('/api/dashboard/customers', [
            'first_name' => 'Maya',
            'last_name' => 'Chen',
            'email' => 'maya@example.com',
            'password' => 'secure-pass-123',
        ])->assertCreated();

        $customerId = $response->json('customer.id');
        $this->assertDatabaseHas('users', ['id' => $customerId, 'role' => 'Customer']);
        $this->assertTrue(Hash::check('secure-pass-123', User::query()->findOrFail($customerId)->password));

        $this->putJson("/api/dashboard/customers/{$customerId}", [
            'first_name' => 'Maya',
            'last_name' => 'Rivera',
            'email' => 'maya@example.com',
        ])->assertOk()->assertJsonPath('customer.last_name', 'Rivera');

        $booking = Booking::factory()->create([
            'customer_id' => $customerId,
            'package_id' => Package::factory()->create()->package_id,
            'schedule_id' => Schedule::factory()->create()->schedule_id,
        ]);
        $this->deleteJson("/api/dashboard/customers/{$customerId}")->assertUnprocessable();
        $booking->delete();

        $this->deleteJson("/api/dashboard/customers/{$customerId}")->assertOk();
        $this->assertDatabaseMissing('users', ['id' => $customerId]);
    }

    public function test_admin_can_manage_schedules_and_cannot_delete_schedules_with_booking_history(): void
    {
        $this->actingAs($this->administrator());
        $response = $this->postJson('/api/dashboard/schedules', [
            'schedule_date' => '2026-11-02',
            'start_time' => '09:00',
            'end_time' => '10:00',
            'status' => 'available',
        ])->assertCreated();
        $scheduleId = $response->json('schedule.schedule_id');

        $this->postJson('/api/dashboard/schedules', [
            'schedule_date' => '2026-11-02',
            'start_time' => '09:30',
            'end_time' => '10:30',
            'status' => 'available',
        ])->assertUnprocessable();

        $this->putJson("/api/dashboard/schedules/{$scheduleId}", [
            'schedule_date' => '2026-11-02',
            'start_time' => '10:00',
            'end_time' => '11:00',
            'status' => 'available',
        ])->assertOk();

        $customer = User::factory()->create(['role' => 'Customer']);
        $package = Package::factory()->create();
        Booking::factory()->create([
            'customer_id' => $customer->id,
            'package_id' => $package->package_id,
            'schedule_id' => $scheduleId,
        ]);

        $this->deleteJson("/api/dashboard/schedules/{$scheduleId}")->assertUnprocessable();
    }

    public function test_schedule_dashboard_generates_daily_booking_slots(): void
    {
        $this->actingAs($this->administrator())
            ->getJson('/api/dashboard/schedules')
            ->assertOk();

        $tomorrowSlots = Schedule::query()
            ->whereDate('schedule_date', today()->addDay())
            ->orderBy('start_time')
            ->get();

        $this->assertCount(10, $tomorrowSlots);
        $this->assertSame('09:00:00', $tomorrowSlots->first()->start_time->format('H:i:s'));
        $this->assertSame('19:00:00', $tomorrowSlots->last()->end_time->format('H:i:s'));
    }

    public function test_admin_can_block_and_unblock_a_date_and_blocked_dates_hide_all_slots(): void
    {
        $this->actingAs($this->administrator());
        $date = '2026-11-05';
        $slot = Schedule::factory()->create([
            'schedule_date' => $date,
            'start_time' => '09:00',
            'end_time' => '10:00',
            'status' => 'available',
        ]);

        $this->postJson('/api/dashboard/schedules/block-date', ['schedule_date' => $date])
            ->assertOk()
            ->assertJsonPath('schedule_date', $date);
        $this->getJson('/api/dashboard/schedules/blocked-dates')
            ->assertOk()
            ->assertJsonFragment(['blocked_dates' => [$date]]);
        $this->assertDatabaseHas('blocked_schedule_dates', ['schedule_date' => $date]);
        $this->assertDatabaseMissing('schedules', [
            'schedule_date' => $date,
            'start_time' => '00:00:00',
            'end_time' => '23:59:00',
        ]);
        $this->getJson('/api/booking/availability')->assertJsonMissing(['schedule_id' => $slot->schedule_id]);

        $customer = User::factory()->create(['role' => 'Customer']);
        $package = Package::factory()->create(['duration_minutes' => 60]);
        $this->postJson('/api/dashboard/bookings', [
            'customer_id' => $customer->id,
            'package_id' => $package->package_id,
            'schedule_id' => $slot->schedule_id,
            'requests' => 'Admin booking regression test',
            'booking_status' => 'pending',
        ])->assertUnprocessable()
            ->assertJsonValidationErrors('schedule_id');

        $this->postJson('/api/dashboard/schedules', [
            'schedule_date' => $date,
            'start_time' => '11:00',
            'end_time' => '12:00',
            'status' => 'available',
        ])->assertUnprocessable()
            ->assertJsonValidationErrors('schedule_date');

        $this->postJson('/api/dashboard/schedules/unblock-date', ['schedule_date' => $date])
            ->assertOk();
        $this->getJson('/api/dashboard/schedules/blocked-dates')
            ->assertJsonPath('blocked_dates', []);
        $this->getJson('/api/booking/availability')->assertJsonFragment(['schedule_id' => $slot->schedule_id]);

        $this->deleteJson('/api/dashboard/schedules/'.$slot->schedule_id)->assertOk();
    }

    public function test_admin_cannot_block_a_date_with_an_active_booking(): void
    {
        $this->actingAs($this->administrator());
        $schedule = Schedule::factory()->create([
            'schedule_date' => '2026-11-06',
            'status' => 'booked',
        ]);
        $customer = User::factory()->create(['role' => 'Customer']);
        $package = Package::factory()->create(['duration_minutes' => 60]);
        Booking::factory()->create([
            'customer_id' => $customer->id,
            'package_id' => $package->package_id,
            'schedule_id' => $schedule->schedule_id,
            'booking_status' => 'pending',
        ]);

        $this->postJson('/api/dashboard/schedules/block-date', ['schedule_date' => '2026-11-06'])
            ->assertUnprocessable()
            ->assertJsonValidationErrors('schedule_date');
        $this->assertDatabaseMissing('schedules', [
            'schedule_date' => '2026-11-06',
            'start_time' => '00:00:00',
            'end_time' => '23:59:00',
        ]);
    }

    public function test_booking_create_update_and_delete_keep_schedule_availability_in_sync(): void
    {
        $this->actingAs($this->administrator());
        $customer = User::factory()->create(['role' => 'Customer']);
        $package = Package::factory()->create(['price' => 825, 'duration_minutes' => 60]);
        $schedule = Schedule::factory()->create([
            'schedule_date' => '2026-11-03',
            'start_time' => '09:00',
            'end_time' => '10:00',
            'status' => 'available',
        ]);

        $response = $this->postJson('/api/dashboard/bookings', [
            'customer_id' => $customer->id,
            'package_id' => $package->package_id,
            'schedule_id' => $schedule->schedule_id,
            'requests' => 'Studio setup',
            'booking_status' => 'pending',
        ])->assertCreated()->assertJsonPath('booking.total_price', '825.00');

        $bookingId = $response->json('booking.booking_id');
        $this->assertDatabaseHas('schedules', ['schedule_id' => $schedule->schedule_id, 'status' => 'booked']);
        $nextSchedule = Schedule::factory()->create([
            'schedule_date' => '2026-11-03',
            'start_time' => '10:00',
            'end_time' => '11:00',
            'status' => 'available',
        ]);
        $this->putJson("/api/dashboard/bookings/{$bookingId}", [
            'package_id' => $package->package_id,
            'schedule_id' => $nextSchedule->schedule_id,
        ])->assertOk();
        $this->assertDatabaseHas('bookings', [
            'booking_id' => $bookingId,
            'customer_id' => $customer->id,
            'requests' => 'Studio setup',
            'booking_status' => 'pending',
        ]);
        $this->assertDatabaseHas('schedules', ['schedule_id' => $schedule->schedule_id, 'status' => 'available']);
        $this->assertDatabaseHas('schedules', ['schedule_id' => $nextSchedule->schedule_id, 'status' => 'booked']);

        $this->postJson("/api/dashboard/bookings/{$bookingId}/decision", [
            'decision' => 'deny',
            'reason' => 'The requested setup is not available at that time.',
        ])->assertOk()->assertJsonPath('booking.booking_status', 'denied');
        $this->assertDatabaseHas('bookings', [
            'booking_id' => $bookingId,
            'decision_reason' => 'The requested setup is not available at that time.',
        ]);
        $this->assertDatabaseHas('schedules', ['schedule_id' => $nextSchedule->schedule_id, 'status' => 'available']);

        $this->deleteJson("/api/dashboard/bookings/{$bookingId}")->assertOk();
        $this->assertDatabaseMissing('bookings', ['booking_id' => $bookingId]);
    }

    public function test_admin_can_approve_a_pending_booking_and_cannot_decide_it_twice(): void
    {
        $this->actingAs($this->administrator());
        $booking = Booking::factory()->create([
            'booking_status' => 'pending',
        ]);

        $this->postJson("/api/dashboard/bookings/{$booking->booking_id}/decision", [
            'decision' => 'approve',
            'reason' => 'The requested session is confirmed.',
        ])->assertOk()->assertJsonPath('booking.booking_status', 'approved');
        $this->assertDatabaseHas('bookings', [
            'booking_id' => $booking->booking_id,
            'booking_status' => 'approved',
            'decision_reason' => 'The requested session is confirmed.',
        ]);

        $this->postJson("/api/dashboard/bookings/{$booking->booking_id}/decision", [
            'decision' => 'confirm',
            'reason' => 'Customer reconfirmed the session.',
        ])->assertOk()->assertJsonPath('booking.booking_status', 'confirmed');

        $this->postJson("/api/dashboard/bookings/{$booking->booking_id}/decision", [
            'decision' => 'confirm',
            'reason' => 'Duplicate confirmation.',
        ])->assertUnprocessable()
            ->assertJsonValidationErrors('decision');

        $this->postJson("/api/dashboard/bookings/{$booking->booking_id}/decision", [
            'decision' => 'deny',
            'reason' => 'This should not override the decision.',
        ])->assertUnprocessable()
            ->assertJsonValidationErrors('decision');

        $this->postJson("/api/dashboard/bookings/{$booking->booking_id}/decision", [
            'decision' => 'cancel',
            'reason' => 'Customer did not arrive.',
        ])->assertOk()->assertJsonPath('booking.booking_status', 'cancelled');
        $this->assertDatabaseHas('bookings', [
            'booking_id' => $booking->booking_id,
            'decision_reason' => 'Customer did not arrive.',
        ]);
    }

    public function test_booking_decision_requires_a_non_empty_reason(): void
    {
        $this->actingAs($this->administrator());
        $booking = Booking::factory()->create(['booking_status' => 'pending']);

        $this->postJson("/api/dashboard/bookings/{$booking->booking_id}/decision", [
            'decision' => 'deny',
            'reason' => '   ',
        ])->assertUnprocessable()
            ->assertJsonValidationErrors('reason');

        $this->assertDatabaseHas('bookings', [
            'booking_id' => $booking->booking_id,
            'booking_status' => 'pending',
            'decision_reason' => null,
        ]);
    }
}
