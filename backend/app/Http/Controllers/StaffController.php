<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;

class StaffController extends Controller
{
    public function index(): JsonResponse
    {
        return response()->json([
            'staff' => User::query()
                ->where('role', 'Staff')
                ->orderBy('first_name')
                ->orderBy('last_name')
                ->get(['id', 'first_name', 'last_name', 'email', 'role']),
        ]);
    }

    public function show(User $staff): JsonResponse
    {
        $this->ensureStaff($staff);

        return response()->json(['staff' => $this->staffData($staff)]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'first_name' => ['required', 'string', 'max:100'],
            'last_name' => ['required', 'string', 'max:100'],
            'email' => ['required', 'email', 'max:255', 'unique:users,email'],
            'password' => ['required', 'string', 'min:8'],
            'profile_image' => ['nullable', 'image', 'max:10240'],
        ]);

        $staff = new User([
            'first_name' => $validated['first_name'],
            'last_name' => $validated['last_name'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
            'role' => 'Staff',
        ]);
        if ($request->hasFile('profile_image')) {
            $staff->profile_image = $this->storePhoto($request);
        }
        $staff->save();

        return response()->json(['staff' => $this->staffData($staff)], 201);
    }

    public function update(Request $request, User $staff): JsonResponse
    {
        $this->ensureStaff($staff);
        $validated = $request->validate([
            'first_name' => ['required', 'string', 'max:100'],
            'last_name' => ['required', 'string', 'max:100'],
            'email' => ['required', 'email', 'max:255', Rule::unique('users', 'email')->ignore($staff->id)],
            'password' => ['nullable', 'string', 'min:8'],
            'profile_image' => ['nullable', 'image', 'max:10240'],
        ]);

        $newPhotoPath = $request->hasFile('profile_image') ? $this->storePhoto($request) : null;
        $oldPhotoPath = $staff->profile_image;

        $staff->first_name = $validated['first_name'];
        $staff->last_name = $validated['last_name'];
        $staff->email = $validated['email'];
        if (filled($validated['password'] ?? null)) {
            $staff->password = Hash::make($validated['password']);
        }
        if ($newPhotoPath !== null) {
            $staff->profile_image = $newPhotoPath;
        }
        $staff->save();

        if ($newPhotoPath !== null && $oldPhotoPath) {
            Storage::disk('public')->delete($oldPhotoPath);
        }

        return response()->json(['staff' => $this->staffData($staff)]);
    }

    public function destroy(User $staff): JsonResponse
    {
        $this->ensureStaff($staff);
        if ($staff->bookings()->exists()) {
            return response()->json([
                'message' => 'Staff members with booking history cannot be deleted.',
            ], 422);
        }

        $photoPath = $staff->profile_image;
        $staff->delete();
        if ($photoPath) {
            Storage::disk('public')->delete($photoPath);
        }

        return response()->json(['message' => 'Staff member deleted.']);
    }

    private function ensureStaff(User $staff): void
    {
        abort_unless($staff->role === 'Staff', 404);
    }

    private function storePhoto(Request $request): string
    {
        $path = $request->file('profile_image')->storePublicly('staff', 'public');
        abort_if($path === false, 500, 'Unable to save staff photo.');

        return $path;
    }

    /**
     * @return array<string, mixed>
     */
    private function staffData(User $staff): array
    {
        return [
            'id' => $staff->id,
            'first_name' => $staff->first_name,
            'last_name' => $staff->last_name,
            'email' => $staff->email,
            'role' => $staff->role,
            'profile_image' => $staff->profile_image
                ? Storage::disk('public')->url($staff->profile_image)
                : null,
        ];
    }
}
