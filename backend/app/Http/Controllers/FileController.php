<?php

namespace App\Http\Controllers;

use App\Models\File;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class FileController extends BaseController
{
    private function userId(Request $request): int
    {
        $user = $request->attributes->get('auth_user');
        return $user['id'] ?? $user['sub'] ?? 0;
    }

    public function index(Request $request)
    {
        $uid = $this->userId($request);
        $files = File::where('user_id', $uid)
                     ->orderBy('created_at', 'desc')
                     ->get()
                     ->map(fn($f) => $this->format($f));
        return response()->json(['success' => true, 'data' => $files]);
    }

    public function store(Request $request)
    {
        $request->validate(['file' => 'required|file|max:51200']);
        $uid      = $this->userId($request);
        $uploaded = $request->file('file');
        $original = $uploaded->getClientOriginalName();
        $extension= $uploaded->getClientOriginalExtension();
        $name     = pathinfo($original, PATHINFO_FILENAME).'_'.time().'.'.$extension;
        $path     = $uploaded->storeAs('depot', $name, 'local');
        $file = File::create([
            'name'          => $name,
            'original_name' => $original,
            'path'          => $path,
            'type'          => $extension,
            'size'          => $uploaded->getSize(),
            'user_id'       => $uid,
        ]);
        return response()->json(['success' => true, 'data' => $this->format($file)], 201);
    }

    public function destroy(Request $request, $id)
    {
        $uid  = $this->userId($request);
        $file = File::where('id', $id)->where('user_id', $uid)->firstOrFail();
        Storage::disk('local')->delete($file->path);
        $file->delete();
        return response()->json(['success' => true, 'message' => 'Fichier supprime']);
    }

    public function download(Request $request, $id)
    {
        $uid  = $this->userId($request);
        $file = File::where('id', $id)->where('user_id', $uid)->firstOrFail();
        return Storage::disk('local')->download($file->path, $file->original_name);
    }

    private function format(File $f): array
    {
        return [
            'id'          => $f->id,
            'name'        => $f->original_name,
            'type'        => $f->type,
            'size'        => $f->size,
            'uploaded_at' => $f->created_at->toISOString(),
        ];
    }
}