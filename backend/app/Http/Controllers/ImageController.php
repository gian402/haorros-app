<?php

namespace App\Http\Controllers;

use App\Models\Goal;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class ImageController extends Controller
{
    private function upload(Request $request): string
    {
        $request->validate(['file' => 'required|image|mimes:jpg,jpeg,png,webp|max:5120']);
        $path = $request->file('file')->store('images', 'public');
        return route('media.show', ['file' => basename($path)]);
    }

    public function avatar(Request $request)
    {
        $url = $this->upload($request);
        $request->user()->update(['avatar_url' => $url]);
        return $request->user()->fresh();
    }

    public function goal(Request $request, Goal $goal)
    {
        abort_unless($goal->owner_id === $request->user()->id, 403);
        $url = $this->upload($request);
        $goal->update(['image_url' => $url]);
        return ['image_url' => $url];
    }

    public function show(string $file)
    {
        abort_unless(preg_match('/^[a-zA-Z0-9]+\.(jpg|jpeg|png|webp)$/', $file), 404);
        abort_unless(Storage::disk('public')->exists('images/'.$file), 404);
        return response()->file(Storage::disk('public')->path('images/'.$file), [
            'X-Content-Type-Options' => 'nosniff',
            'Cache-Control' => 'public, max-age=86400',
        ]);
    }
}
