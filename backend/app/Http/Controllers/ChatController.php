<?php
namespace App\Http\Controllers;

use App\Models\ChatMessage;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ChatController extends BaseController
{
    public function index(Request $request): JsonResponse
    {
        $q = ChatMessage::query();
        if ($request->filled('channel')) $q->where('channel', $request->channel);
        $messages = $q->orderBy('created_at','asc')->take(100)->get();
        return $this->success($messages);
    }

    public function store(Request $request): JsonResponse
    {
        $request->validate(['message' => 'required|string|min:1|max:2000']);
        $user = $this->authUser($request);
        $msg = ChatMessage::create([
            'sender'  => $user['name'],
            'avatar'  => $user['avatar'] ?? strtoupper(substr($user['name'],0,2)),
            'message' => $request->message,
            'channel' => $request->input('channel','general'),
            'time'    => now()->format('H:i'),
            'user_id' => $user['id'],
        ]);
        return $this->created($msg);
    }

    public function clear(Request $request): JsonResponse
    {
        if (!$this->isAdmin($request)) return $this->forbidden();
        ChatMessage::truncate();
        return $this->success(null, 'Chat vidé');
    }

    public function destroy(Request $request, int $id): JsonResponse
    {
        $msg = ChatMessage::find($id);
        if (!$msg) return $this->notFound();
        $user = $this->authUser($request);
        if (!$this->isAdmin($request) && $msg->user_id !== $user['id']) return $this->forbidden();
        $msg->delete();
        return $this->success(null, 'Message supprimé');
    }
}
