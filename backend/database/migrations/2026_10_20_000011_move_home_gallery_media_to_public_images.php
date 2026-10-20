<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Storage;

return new class extends Migration
{
    public function up(): void
    {
        $galleryDirectory = config('filesystems.home_gallery_path', base_path('../public/images'));
        File::ensureDirectoryExists($galleryDirectory);

        DB::table('site_media')
            ->whereNotNull('file_path')
            ->where(function ($query): void {
                $query->where('media_key', 'like', 'home.carousel.%')
                    ->orWhere('media_key', 'like', 'home.showcase.%');
            })
            ->get(['id', 'media_key', 'file_path'])
            ->each(function (object $media) use ($galleryDirectory): void {
                $disk = Storage::disk('public');
                if (! $disk->exists($media->file_path)) {
                    return;
                }

                preg_match('/\Ahome\.(carousel|showcase)\.(\d+)\z/', $media->media_key, $matches);
                $collection = $matches[1];
                $index = (int) $matches[2];
                $filePrefix = $collection === 'carousel' ? 'photo' : 'eg';
                $extension = pathinfo($media->file_path, PATHINFO_EXTENSION);
                $isDefaultIndex = $collection === 'carousel' ? $index <= 3 : $index <= 6;
                $filename = $filePrefix.$index.($isDefaultIndex ? '-customized' : '').'.'.$extension;
                $target = $galleryDirectory.DIRECTORY_SEPARATOR.$filename;

                if (File::exists($target)) {
                    $filename = $filePrefix.$index.'-customized.'.$extension;
                    $target = $galleryDirectory.DIRECTORY_SEPARATOR.$filename;
                }

                if (File::exists($target)) {
                    throw new RuntimeException("Cannot move homepage media because {$target} already exists.");
                }

                File::copy($disk->path($media->file_path), $target);
                DB::table('site_media')->where('id', $media->id)->update(['file_path' => "images/{$filename}"]);
                $disk->delete($media->file_path);
            });
    }

    public function down(): void
    {
        $galleryDirectory = config('filesystems.home_gallery_path', base_path('../public/images'));

        DB::table('site_media')
            ->whereNotNull('file_path')
            ->where('file_path', 'like', 'images/%')
            ->get(['id', 'file_path'])
            ->each(function (object $media) use ($galleryDirectory): void {
                $filename = basename($media->file_path);
                $source = $galleryDirectory.DIRECTORY_SEPARATOR.$filename;
                if (! File::exists($source)) {
                    return;
                }

                $disk = Storage::disk('public');
                $targetPath = "site-media/{$filename}";
                if ($disk->exists($targetPath)) {
                    throw new RuntimeException("Cannot restore homepage media because {$targetPath} already exists.");
                }

                $disk->put($targetPath, File::get($source));
                DB::table('site_media')->where('id', $media->id)->update(['file_path' => $targetPath]);
                File::delete($source);
            });
    }
};
