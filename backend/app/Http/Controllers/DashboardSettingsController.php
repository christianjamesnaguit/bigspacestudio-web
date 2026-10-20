<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class DashboardSettingsController extends Controller
{
    /**
     * @return array<string, int|string|bool>
     */
    private function defaultPreferences(): array
    {
        return [
            'default_booking_duration' => 2,
            'default_booking_status' => 'pending',
            'auto_confirm_requests' => false,
            'notify_new_bookings' => true,
            'notify_booking_reminders' => true,
            'notify_weekly_summary' => false,
        ];
    }

    public function show(Request $request): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();

        return response()->json([
            'user' => $user,
            'preferences' => array_merge($this->defaultPreferences(), $user->dashboard_preferences ?? []),
        ]);
    }

    public function update(Request $request): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();
        $validated = $request->validate([
            'first_name' => ['required', 'string', 'max:100'],
            'last_name' => ['required', 'string', 'max:100'],
            'email' => ['required', 'email', 'max:255', Rule::unique('users', 'email')->ignore($user->id)],
            'preferences.default_booking_duration' => ['required', 'integer', Rule::in([1, 2, 3, 4])],
            'preferences.default_booking_status' => ['required', Rule::in(['pending', 'confirmed'])],
            'preferences.auto_confirm_requests' => ['required', 'boolean'],
            'preferences.notify_new_bookings' => ['required', 'boolean'],
            'preferences.notify_booking_reminders' => ['required', 'boolean'],
            'preferences.notify_weekly_summary' => ['required', 'boolean'],
        ]);

        $user->first_name = $validated['first_name'];
        $user->last_name = $validated['last_name'];
        $user->email = $validated['email'];
        $user->dashboard_preferences = $validated['preferences'];
        $user->save();

        return response()->json([
            'message' => 'Settings saved.',
            'user' => $user->refresh(),
            'preferences' => $user->dashboard_preferences,
        ]);
    }
}
