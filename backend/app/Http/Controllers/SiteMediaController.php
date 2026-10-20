<?php

namespace App\Http\Controllers;

use App\Models\SiteMedia;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Storage;
use Throwable;

class SiteMediaController extends Controller
{
    public function index(): JsonResponse
    {
        return response()->json([
            'media' => SiteMedia::query()
                ->orderBy('label')
                ->get()
                ->map(fn (SiteMedia $media): array => $this->mediaData($media)),
        ]);
    }

    public function update(Request $request, SiteMedia $media): JsonResponse
    {
        $validated = $request->validate([
            'file' => ['required', 'file', 'mimetypes:image/jpeg,image/png,image/webp,image/gif,image/avif,video/mp4,video/webm,video/quicktime', 'max:102400'],
        ]);

        $newPath = $this->storeMediaUpload($validated['file'], $media);
        abort_if($newPath === false, 500, 'Unable to save site media.');
        $oldPath = $media->file_path;
        $media->file_path = $newPath;
        $media->media_type = str_starts_with($validated['file']->getMimeType(), 'video/') ? 'video' : 'image';
        $media->save();

        if ($oldPath && $oldPath !== $newPath) {
            $this->deleteMediaFile($oldPath);
        }

        return response()->json(['media' => $this->mediaData($media)]);
    }

    public function restore(SiteMedia $media): JsonResponse
    {
        $oldPath = $media->file_path;
        $media->file_path = null;
        $media->media_type = 'image';
        $media->save();

        if ($oldPath) {
            $this->deleteMediaFile($oldPath);
        }

        return response()->json(['media' => $this->mediaData($media)]);
    }

    public function storeHomeImage(Request $request, string $collection): JsonResponse
    {
        abort_unless(in_array($collection, ['carousel', 'showcase'], true), 404);

        $validated = $request->validate([
            'file' => ['required', 'file', 'mimetypes:image/jpeg,image/png,image/webp,image/gif,image/avif', 'max:102400'],
        ]);

        $prefix = "home.{$collection}.";
        $databaseMaxIndex = SiteMedia::query()
            ->where('media_key', 'like', "{$prefix}%")
            ->pluck('media_key')
            ->map(fn (string $key): int => ctype_digit(substr($key, strlen($prefix))) ? (int) substr($key, strlen($prefix)) : 0)
            ->max();
        $galleryDirectory = $this->homeGalleryDirectory();
        File::ensureDirectoryExists($galleryDirectory);
        $filenamePrefix = $collection === 'carousel' ? 'photo' : 'eg';
        $fileMaxIndex = collect(File::files($galleryDirectory))
            ->map(function (\SplFileInfo $file) use ($filenamePrefix): int {
                return preg_match('/\A'.preg_quote($filenamePrefix, '/').'(\d+)(?:-customized)?\./', $file->getFilename(), $matches) === 1
                    ? (int) $matches[1]
                    : 0;
            })
            ->max();
        $nextIndex = max($databaseMaxIndex, $fileMaxIndex) + 1;
        $filePath = $this->storeMediaUpload($validated['file'], "{$prefix}{$nextIndex}");
        abort_if($filePath === false, 500, 'Unable to save homepage image.');

        try {
            $media = DB::transaction(fn (): SiteMedia => SiteMedia::query()->create([
                'media_key' => "{$prefix}{$nextIndex}",
                'label' => "Homepage {$collection} image {$nextIndex}",
                'default_url' => '',
                'alt_text' => '',
                'file_path' => $filePath,
                'media_type' => 'image',
            ]));
        } catch (Throwable $exception) {
            $this->deleteMediaFile($filePath);
            throw $exception;
        }

        return response()->json(['media' => $this->mediaData($media)], 201);
    }

    public function destroyHomeImage(SiteMedia $media): JsonResponse
    {
        abort_unless(
            str_starts_with($media->media_key, 'home.carousel.')
                || str_starts_with($media->media_key, 'home.showcase.'),
            404,
        );

        $filePath = $media->file_path;
        $media->delete();

        if ($filePath) {
            $this->deleteMediaFile($filePath);
        }

        return response()->json(['message' => 'Homepage image removed.']);
    }

    /**
     * @return array<string, mixed>
     */
    private function mediaData(SiteMedia $media): array
    {
        return [
            'id' => $media->id,
            'media_key' => $media->media_key,
            'label' => $media->label,
            'url' => $media->file_path
                ? (str_starts_with($media->file_path, 'images/')
                    ? '/images/'.basename($media->file_path)
                    : Storage::disk('public')->url($media->file_path))
                : $media->default_url,
            'default_url' => $media->default_url,
            'alt_text' => $media->alt_text,
            'media_type' => $media->media_type,
            'is_customized' => $media->file_path !== null,
        ];
    }

    private function storeMediaUpload(UploadedFile $file, SiteMedia|string $media): string|false
    {
        $mediaKey = $media instanceof SiteMedia ? $media->media_key : $media;
        if (preg_match('/\Ahome\.(carousel|showcase)\.(\d+)\z/', $mediaKey, $matches) !== 1) {
            return $file->storePublicly('site-media', 'public');
        }

        $collection = $matches[1];
        $index = $matches[2];
        $extension = match ($file->getMimeType()) {
            'image/jpeg' => 'jpg',
            'image/png' => 'png',
            'image/webp' => 'webp',
            'image/gif' => 'gif',
            'image/avif' => 'avif',
            default => abort(422, 'Homepage gallery uploads must be images.'),
        };
        $filename = ($collection === 'carousel' ? 'photo' : 'eg').$index.'.'.$extension;

        if ($media instanceof SiteMedia) {
            $filename = ($collection === 'carousel' ? 'photo' : 'eg').$index.'-customized.'.$extension;
        }

        $galleryDirectory = $this->homeGalleryDirectory();
        File::ensureDirectoryExists($galleryDirectory);
        $file->move($galleryDirectory, $filename);

        return 'images/'.$filename;
    }

    private function deleteMediaFile(string $filePath): void
    {
        if (str_starts_with($filePath, 'images/')) {
            File::delete($this->homeGalleryDirectory().DIRECTORY_SEPARATOR.basename($filePath));

            return;
        }

        Storage::disk('public')->delete($filePath);
    }

    private function homeGalleryDirectory(): string
    {
        return config('filesystems.home_gallery_path', base_path('../public/images'));
    }
}
