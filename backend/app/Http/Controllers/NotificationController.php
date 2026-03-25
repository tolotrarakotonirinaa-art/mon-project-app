<?php
namespace App\Http\Controllers;

use App\Models\Notification;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class NotificationController extends BaseController
{
    public function index(Request $request): JsonResponse
    {
        $user = $this->authUser($request);
        $notifs = Notification::where('user_id', $user['id'])->orderBy('created_at','desc')->get();
        return $this->success([
            'items'  => $notifs,
            'unread' => $notifs->where('read', false)->count(),
            'total'  => $notifs->count(),
        ]);
    }

    public function markRead(int $id): JsonResponse
    {
        $n = Notification::find($id);
        if (!$n) return $this->notFound();
        $n->update(['read' => true]);
        return $this->success($n);
    }

    public function markAllRead(Request $request): JsonResponse
    {
        $user = $this->authUser($request);
        Notification::where('user_id', $user['id'])->update(['read' => true]);
        return $this->success(null, 'Toutes les notifications lues');
    }

    public function destroy(int $id): JsonResponse
    {
        Notification::find($id)?->delete();
        return $this->success(null, 'Notification supprimée');
    }
}
