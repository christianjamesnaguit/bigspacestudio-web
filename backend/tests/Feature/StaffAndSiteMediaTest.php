<?php

namespace Tests\Feature;

use App\Models\SiteMedia;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class StaffAndSiteMediaTest extends TestCase
{
    use RefreshDatabase;

    private function pngUpload(string $name): UploadedFile
    {
        $contents = base64_decode('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/p9sAAAAASUVORK5CYII=', true);

        return UploadedFile::fake()->createWithContent($name, $contents);
    }

    public function test_non_admin_cannot_manage_staff_or_site_media(): void
    {
        $media = SiteMedia::query()->firstOrFail();
        $customer = User::factory()->create(['role' => 'Customer']);

        $this->actingAs($customer)
            ->getJson('/api/dashboard/staff')
            ->assertForbidden();

        $this->actingAs($customer)
            ->postJson('/api/dashboard/staff', [
                'first_name' => 'Sam',
                'last_name' => 'Lee',
                'email' => 'sam@example.com',
                'password' => 'password-123',
            ])
            ->assertForbidden();

        $this->actingAs($customer)
            ->deleteJson("/api/dashboard/media/{$media->id}")
            ->assertForbidden();

        $this->actingAs($customer)
            ->postJson('/api/dashboard/media/home/carousel', ['file' => $this->pngUpload('unauthorized.png')])
            ->assertForbidden();

        $this->getJson('/api/site-media')
            ->assertOk()
            ->assertJsonStructure(['media' => [['media_key', 'url', 'media_type', 'is_customized']]]);
    }

    public function test_staff_can_access_dashboard_but_not_staff_or_media_management(): void
    {
        $media = SiteMedia::query()->firstOrFail();
        $this->actingAs(User::factory()->create(['role' => 'Staff']));

        $this->getJson('/api/dashboard/overview')->assertOk();
        $this->getJson('/api/dashboard/bookings')->assertOk();
        $this->getJson('/api/dashboard/staff')->assertForbidden();
        $this->deleteJson("/api/dashboard/media/{$media->id}")->assertForbidden();
    }

    public function test_admin_can_create_update_and_delete_staff_without_changing_role(): void
    {
        Storage::fake('public');
        $this->actingAs(User::factory()->create(['role' => 'Admin']));

        $created = $this->postJson('/api/dashboard/staff', [
            'first_name' => 'Sam',
            'last_name' => 'Lee',
            'email' => 'sam@example.com',
            'password' => 'password-123',
            'role' => 'Admin',
            'profile_image' => $this->pngUpload('staff.png'),
        ])->assertCreated()->assertJsonPath('staff.role', 'Staff');

        $id = $created->json('staff.id');
        $photoPath = User::query()->findOrFail($id)->profile_image;
        Storage::disk('public')->assertExists($photoPath);
        $this->getJson('/api/dashboard/staff')
            ->assertOk()
            ->assertJsonMissingPath('staff.0.profile_image');

        $this->putJson("/api/dashboard/staff/{$id}", [
            'first_name' => 'Samuel',
            'last_name' => 'Lee',
            'email' => 'samuel@example.com',
            'role' => 'Admin',
        ])->assertOk()
            ->assertJsonPath('staff.first_name', 'Samuel')
            ->assertJsonPath('staff.role', 'Staff');

        $this->deleteJson("/api/dashboard/staff/{$id}")->assertOk();
        $this->assertDatabaseMissing('users', ['id' => $id]);
        Storage::disk('public')->assertMissing($photoPath);
    }

    public function test_admin_can_replace_and_restore_site_media(): void
    {
        Storage::fake('public');
        $galleryPath = storage_path('framework/testing/home-gallery-restore');
        config(['filesystems.home_gallery_path' => $galleryPath]);
        File::deleteDirectory($galleryPath);
        $this->actingAs(User::factory()->create(['role' => 'Admin']));
        $media = SiteMedia::query()->firstOrFail();

        $this->postJson("/api/dashboard/media/{$media->id}", [
            'file' => $this->pngUpload('replacement.png'),
        ])->assertOk()
            ->assertJsonPath('media.is_customized', true)
            ->assertJsonPath('media.media_type', 'image')
            ->assertJsonPath('media.url', '/images/photo1-customized.png');

        $path = SiteMedia::query()->findOrFail($media->id)->file_path;
        $this->assertSame('images/photo1-customized.png', $path);
        $this->assertFileExists("{$galleryPath}/photo1-customized.png");

        $this->deleteJson("/api/dashboard/media/{$media->id}")
            ->assertOk()
            ->assertJsonPath('media.is_customized', false)
            ->assertJsonPath('media.url', $media->default_url);

        $this->assertFileDoesNotExist("{$galleryPath}/photo1-customized.png");
        File::deleteDirectory($galleryPath);
    }

    public function test_admin_can_add_replace_and_remove_home_gallery_images(): void
    {
        Storage::fake('public');
        $galleryPath = storage_path('framework/testing/home-gallery');
        config(['filesystems.home_gallery_path' => $galleryPath]);
        File::deleteDirectory($galleryPath);
        $this->actingAs(User::factory()->create(['role' => 'Admin']));

        foreach (['carousel', 'showcase'] as $collection) {
            $nextIndex = $collection === 'carousel' ? 4 : 7;
            $created = $this->postJson("/api/dashboard/media/home/{$collection}", [
                'file' => $this->pngUpload("{$collection}.png"),
            ])->assertCreated()
                ->assertJsonPath('media.media_key', "home.{$collection}.{$nextIndex}")
                ->assertJsonPath('media.is_customized', true)
                ->assertJsonPath('media.media_type', 'image');

            $mediaId = $created->json('media.id');
            $originalPath = SiteMedia::query()->findOrFail($mediaId)->file_path;
            $expectedFilename = ($collection === 'carousel' ? 'photo' : 'eg').$nextIndex.'.png';
            $this->assertSame("images/{$expectedFilename}", $originalPath);
            $this->assertFileExists("{$galleryPath}/{$expectedFilename}");
            $this->assertSame("/images/{$expectedFilename}", $created->json('media.url'));

            $this->postJson("/api/dashboard/media/{$mediaId}", [
                'file' => $this->pngUpload("replacement-{$collection}.png"),
            ])->assertOk()->assertJsonPath('media.is_customized', true);

            $replacementPath = SiteMedia::query()->findOrFail($mediaId)->file_path;
            $customizedFilename = ($collection === 'carousel' ? 'photo' : 'eg').$nextIndex.'-customized.png';
            $this->assertSame("images/{$customizedFilename}", $replacementPath);
            $this->assertFileExists("{$galleryPath}/{$customizedFilename}");
            $this->assertFileDoesNotExist("{$galleryPath}/{$expectedFilename}");

            $this->deleteJson("/api/dashboard/media/home/{$mediaId}")
                ->assertOk()
                ->assertJsonPath('message', 'Homepage image removed.');

            $this->assertDatabaseMissing('site_media', ['id' => $mediaId]);
            $this->assertFileDoesNotExist("{$galleryPath}/{$customizedFilename}");
        }

        File::deleteDirectory($galleryPath);
    }

    public function test_public_faqs_are_seeded_and_admin_can_manage_categories_questions_and_answers(): void
    {
        $this->getJson('/api/faqs')
            ->assertOk()
            ->assertJsonCount(18, 'faqs')
            ->assertJsonFragment([
                'category' => 'BOOKING',
                'summary' => 'How do I book a session?',
            ]);

        $customer = User::factory()->create(['role' => 'Customer']);
        $this->actingAs($customer)
            ->postJson('/api/dashboard/faqs', [
                'category' => 'CUSTOM',
                'summary' => 'Not allowed',
                'detail' => 'Not allowed.',
                'sort_order' => 0,
            ])
            ->assertForbidden();

        $this->actingAs(User::factory()->create(['role' => 'Admin']));
        $created = $this->postJson('/api/dashboard/faqs', [
            'category' => 'CUSTOM',
            'summary' => 'What is the new question?',
            'detail' => 'This is the new answer.',
            'sort_order' => 0,
        ])->assertCreated()
            ->assertJsonPath('faq.category', 'CUSTOM')
            ->assertJsonPath('faq.summary', 'What is the new question?');
        $faqId = $created->json('faq.id');

        $this->putJson("/api/dashboard/faqs/{$faqId}", [
            'category' => 'BOOKING',
            'summary' => 'Updated question?',
            'detail' => 'Updated answer.',
            'sort_order' => 4,
        ])->assertOk()
            ->assertJsonPath('faq.detail', 'Updated answer.');

        $this->getJson('/api/faqs')
            ->assertOk()
            ->assertJsonFragment([
                'id' => $faqId,
                'category' => 'BOOKING',
                'summary' => 'Updated question?',
                'detail' => 'Updated answer.',
            ]);

        $this->deleteJson("/api/dashboard/faqs/{$faqId}")->assertOk();
        $this->assertDatabaseMissing('faq_items', ['id' => $faqId]);
    }
}
