<?php

namespace Tests\Feature;

use App\Models\Booking;
use App\Models\Package;
use App\Models\Schedule;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class PublicBookingTest extends TestCase
{
    use RefreshDatabase;

    public function test_public_options_only_include_active_packages_and_available_future_slots(): void
    {
        $activePackage = Package::factory()->create(['package_status' => 'active']);
        Package::factory()->create(['package_status' => 'inactive']);
        $available = Schedule::factory()->create([
            'schedule_date' => today()->addDay()->toDateString(),
            'status' => 'available',
        ]);
        $booked = Schedule::factory()->create([
            'schedule_date' => today()->addDay()->toDateString(),
            'status' => 'booked',
        ]);
        $past = Schedule::factory()->create([
            'schedule_date' => today()->subDay()->toDateString(),
            'status' => 'available',
        ]);

        $this->getJson('/api/booking/packages')
            ->assertOk()
            ->assertJsonCount(1, 'packages')
            ->assertJsonPath('packages.0.package_id', $activePackage->package_id);

        $response = $this->getJson('/api/booking/availability')->assertOk();
        $response->assertJsonFragment(['schedule_id' => $available->schedule_id]);
        $response->assertJsonMissing(['schedule_id' => $booked->schedule_id]);
        $response->assertJsonMissing(['schedule_id' => $past->schedule_id]);
    }

    public function test_daily_booking_slots_are_generated_from_nine_am_to_seven_pm(): void
    {
        $this->getJson('/api/booking/availability')->assertOk();

        $tomorrow = today()->addDay()->toDateString();
        $slots = Schedule::query()
            ->whereDate('schedule_date', $tomorrow)
            ->orderBy('start_time')
            ->get();

        $this->assertCount(10, $slots);
        $this->assertSame('09:00:00', $slots->first()->start_time->format('H:i:s'));
        $this->assertSame('19:00:00', $slots->last()->end_time->format('H:i:s'));
        $this->assertSame(['available'], $slots->pluck('status')->unique()->all());

        $this->getJson('/api/booking/availability')->assertOk();
        $this->assertSame(10, Schedule::query()->whereDate('schedule_date', $tomorrow)->count());
    }

    public function test_public_booking_rejects_a_schedule_on_a_blocked_date(): void
    {
        $package = Package::factory()->create(['package_status' => 'active', 'duration_minutes' => 60]);
        $schedule = Schedule::factory()->create([
            'schedule_date' => today()->addDay()->toDateString(),
            'status' => 'available',
        ]);
        DB::table('blocked_schedule_dates')->insert([
            'schedule_date' => $schedule->schedule_date->toDateString(),
            'created_at' => now(),
            'updated_at' => now(),
        ]);
        $this->assertDatabaseHas('blocked_schedule_dates', [
            'schedule_date' => $schedule->schedule_date->toDateString(),
        ]);
        $this->getJson('/api/booking/availability')
            ->assertJsonMissing(['schedule_id' => $schedule->schedule_id]);
        $this->postJson('/api/booking', [
            'first_name' => 'Alex',
            'last_name' => 'Rivera',
            'email' => 'blocked@example.com',
            'package_id' => $package->package_id,
            'schedule_id' => $schedule->schedule_id,
        ])->assertUnprocessable()
            ->assertJsonValidationErrors('schedule_id');
    }

    public function test_guest_can_submit_pending_booking_and_slot_becomes_unavailable(): void
    {
        $package = Package::factory()->create([
            'price' => 3500,
            'package_status' => 'active',
            'duration_minutes' => 60,
        ]);
        $schedule = Schedule::factory()->create([
            'schedule_date' => today()->addDay()->toDateString(),
            'status' => 'available',
        ]);

        $response = $this->postJson('/api/booking', [
            'first_name' => 'Alex',
            'last_name' => 'Rivera',
            'email' => 'alex@example.com',
            'package_id' => $package->package_id,
            'schedule_id' => $schedule->schedule_id,
            'requests' => 'Portrait session',
        ])->assertCreated()
            ->assertJsonPath('booking.booking_status', 'pending');

        $bookingId = $response->json('booking.booking_id');
        $customer = User::query()->where('email', 'alex@example.com')->firstOrFail();
        $this->assertSame('Customer', $customer->role);
        $this->assertFalse(Hash::check('password', $customer->password));
        $this->assertDatabaseHas('bookings', [
            'booking_id' => $bookingId,
            'customer_id' => $customer->id,
            'schedule_id' => $schedule->schedule_id,
            'total_price' => '3500.00',
            'booking_status' => 'pending',
        ]);
        $this->assertDatabaseHas('schedules', [
            'schedule_id' => $schedule->schedule_id,
            'status' => 'booked',
        ]);
        $this->getJson('/api/booking/availability')
            ->assertJsonMissing(['schedule_id' => $schedule->schedule_id]);
    }

    public function test_guest_cannot_book_unavailable_or_inactive_package_and_existing_customer_is_reused(): void
    {
        $package = Package::factory()->create(['package_status' => 'active', 'duration_minutes' => 60]);
        $inactivePackage = Package::factory()->create(['package_status' => 'inactive', 'duration_minutes' => 60]);
        $schedule = Schedule::factory()->create([
            'schedule_date' => today()->addDay()->toDateString(),
            'status' => 'available',
        ]);
        $customer = User::factory()->create([
            'role' => 'Customer',
            'email' => 'known@example.com',
            'first_name' => 'Existing',
        ]);

        $payload = [
            'first_name' => 'Updated',
            'last_name' => 'Name',
            'email' => 'known@example.com',
            'package_id' => $package->package_id,
            'schedule_id' => $schedule->schedule_id,
            'requests' => '',
        ];

        $this->postJson('/api/booking', [...$payload, 'package_id' => $inactivePackage->package_id])
            ->assertUnprocessable()
            ->assertJsonValidationErrors('package_id');

        $this->postJson('/api/booking', [...$payload, 'schedule_id' => $schedule->schedule_id + 999])
            ->assertUnprocessable()
            ->assertJsonValidationErrors('schedule_id');

        $this->postJson('/api/booking', $payload)->assertCreated();
        $this->assertSame(1, User::query()->where('email', 'known@example.com')->count());
        $this->assertSame('Existing', $customer->fresh()->first_name);
        $this->assertSame(1, Booking::query()->where('customer_id', $customer->id)->count());
    }

    public function test_staff_or_admin_email_cannot_be_used_as_a_guest_customer_email(): void
    {
        $package = Package::factory()->create(['package_status' => 'active', 'duration_minutes' => 60]);
        $schedule = Schedule::factory()->create([
            'schedule_date' => today()->addDay()->toDateString(),
            'status' => 'available',
        ]);
        User::factory()->create(['role' => 'Staff', 'email' => 'staff@example.com']);

        $this->postJson('/api/booking', [
            'first_name' => 'Staff',
            'last_name' => 'Member',
            'email' => 'staff@example.com',
            'package_id' => $package->package_id,
            'schedule_id' => $schedule->schedule_id,
        ])->assertUnprocessable()
            ->assertJsonValidationErrors('email');
    }

    public function test_hourly_packages_scale_with_schedule_duration_and_fixed_packages_require_enough_time(): void
    {
        $hourlyPackage = Package::factory()->create([
            'price' => 1500,
            'duration_minutes' => 60,
            'pricing_type' => 'hourly',
            'package_status' => 'active',
        ]);
        $twoHourSchedule = Schedule::factory()->create([
            'schedule_date' => today()->addDay()->toDateString(),
            'start_time' => '09:00',
            'end_time' => '11:00',
            'status' => 'available',
        ]);

        $this->postJson('/api/booking', [
            'first_name' => 'Jamie',
            'last_name' => 'Lee',
            'email' => 'jamie@example.com',
            'package_id' => $hourlyPackage->package_id,
            'schedule_id' => $twoHourSchedule->schedule_id,
        ])->assertCreated();

        $this->assertDatabaseHas('bookings', [
            'schedule_id' => $twoHourSchedule->schedule_id,
            'total_price' => '3000.00',
        ]);

        $fixedPackage = Package::factory()->create([
            'duration_minutes' => 120,
            'pricing_type' => 'fixed',
            'package_status' => 'active',
        ]);
        $oneHourSchedule = Schedule::factory()->create([
            'schedule_date' => today()->addDays(2)->toDateString(),
            'start_time' => '09:00',
            'end_time' => '10:00',
            'status' => 'available',
        ]);

        $this->postJson('/api/booking', [
            'first_name' => 'Jamie',
            'last_name' => 'Lee',
            'email' => 'jamie@example.com',
            'package_id' => $fixedPackage->package_id,
            'schedule_id' => $oneHourSchedule->schedule_id,
        ])->assertUnprocessable()
            ->assertJsonValidationErrors('schedule_id');

        $this->assertDatabaseHas('schedules', [
            'schedule_id' => $oneHourSchedule->schedule_id,
            'status' => 'available',
        ]);
    }
}
