<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('site_media', function (Blueprint $table): void {
            $table->id();
            $table->string('media_key')->unique();
            $table->string('label');
            $table->string('default_url');
            $table->string('alt_text')->default('');
            $table->string('file_path')->nullable();
            $table->enum('media_type', ['image', 'video'])->default('image');
            $table->timestamps();
        });

        $now = now();
        $media = [
            ['home.carousel.1', 'Homepage carousel image 1', '/images/photo1.jpg', 'Studio portfolio image 1'],
            ['home.carousel.2', 'Homepage carousel image 2', '/images/photo2.jpg', 'Studio portfolio image 2'],
            ['home.carousel.3', 'Homepage carousel image 3', '/images/photo3.jpg', 'Studio portfolio image 3'],
            ['home.showcase.1', 'Homepage showcase image 1', '/images/eg1.jpg', ''],
            ['home.showcase.2', 'Homepage showcase image 2', '/images/eg2.jpg', ''],
            ['home.showcase.3', 'Homepage showcase image 3', '/images/eg3.jpg', ''],
            ['home.showcase.4', 'Homepage showcase image 4', '/images/eg4.jpg', ''],
            ['home.showcase.5', 'Homepage showcase image 5', '/images/eg5.jpg', ''],
            ['home.showcase.6', 'Homepage showcase image 6', '/images/eg6.jpg', ''],
            ['home.quality.premium', 'Premium quality icon', '/src/assets/premium.png', 'Premium quality'],
            ['home.quality.professional', 'Professional experience icon', '/src/assets/professional.png', 'Professional experience'],
            ['home.quality.comfort', 'Comfortable studio icon', '/src/assets/comfort.png', 'Comfortable studio'],
            ['home.quality.beauty', 'Beautiful results icon', '/src/assets/beauty.png', 'Beautiful results'],
            ['home.about', 'About us image', '/images/what.jpg', 'About Us'],
            ['home.milestones', 'Milestones image', '/images/who.jpg', 'Big Space Studio milestones'],
            ['portfolio.1', 'Portfolio image 1', '/images/eg1.jpg', 'Portfolio photography'],
            ['portfolio.2', 'Portfolio image 2', '/images/eg2.jpg', 'Portfolio photography'],
            ['portfolio.3', 'Portfolio image 3', '/images/eg3.jpg', 'Portfolio photography'],
            ['portfolio.4', 'Portfolio image 4', '/images/eg4.jpg', 'Portfolio photography'],
            ['portfolio.5', 'Portfolio image 5', '/images/eg5.jpg', 'Portfolio photography'],
            ['portfolio.6', 'Portfolio image 6', '/images/eg6.jpg', 'Portfolio photography'],
            ['faq.image', 'FAQ studio image', '/images/photo3.jpg', 'Big Space Studio'],
            ['contact.background', 'Contact page background', '/images/where.jpg', ''],
            ['brand.logo', 'Studio logo', '/src/assets/logo.jpg', 'Big Space Studio'],
            ['social.facebook', 'Facebook icon', '/src/assets/facebook.png', 'Facebook'],
            ['social.messenger', 'Messenger icon', '/src/assets/messenger.png', 'Messenger'],
            ['social.instagram', 'Instagram icon', '/src/assets/instagram.png', 'Instagram'],
            ['social.tiktok', 'TikTok icon', '/src/assets/tiktok.png', 'TikTok'],
            ['contact.icon.building', 'Contact address icon', '/src/assets/icons/building.svg', 'Building'],
            ['contact.icon.hours', 'Contact hours icon', '/src/assets/icons/hourglass.svg', 'Clock'],
            ['footer.icon.phone', 'Footer phone icon', '/src/assets/icons/phone.svg', ''],
            ['footer.icon.email', 'Footer email icon', '/src/assets/icons/email.svg', ''],
        ];

        DB::table('site_media')->insert(array_map(
            fn (array $row): array => [
                'media_key' => $row[0],
                'label' => $row[1],
                'default_url' => $row[2],
                'alt_text' => $row[3],
                'created_at' => $now,
                'updated_at' => $now,
            ],
            $media,
        ));
    }

    public function down(): void
    {
        Schema::dropIfExists('site_media');
    }
};
