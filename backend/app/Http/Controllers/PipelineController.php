<?php
namespace App\Http\Controllers;

use App\Models\PipelineStatus;
use App\Models\PipelineLog;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PipelineController extends BaseController
{
    public function status(): JsonResponse
    {
        $s = PipelineStatus::first();
        $logs = PipelineLog::orderBy('created_at','desc')->take(50)->get()->reverse()->values();
        return $this->success(['status' => $s, 'logs' => $logs]);
    }

    public function logs(): JsonResponse
    {
        return $this->success(PipelineLog::orderBy('created_at','asc')->get());
    }

    public function run(Request $request): JsonResponse
    {
        if (!$this->isDev($request)) return $this->forbidden();
        $s = PipelineStatus::firstOrCreate(['id'=>1]);
        $s->update(['checkout'=>'active','tests'=>'pending','build'=>'pending','deploy'=>'pending']);
        $user = $this->authUser($request);
        PipelineLog::create([
            'time'         => now()->format('H:i:s'),
            'text'         => 'Pipeline démarré par '.$user['name'],
            'level'        => 'info',
            'triggered_by' => $user['id'],
        ]);
        return $this->success($s, 'Pipeline démarré');
    }

    public function stop(Request $request): JsonResponse
    {
        if (!$this->isDev($request)) return $this->forbidden();
        $s = PipelineStatus::firstOrCreate(['id'=>1]);
        $s->update(['checkout'=>'pending','tests'=>'pending','build'=>'pending','deploy'=>'pending']);
        $user = $this->authUser($request);
        PipelineLog::create([
            'time'         => now()->format('H:i:s'),
            'text'         => 'Pipeline arrêté par '.$user['name'],
            'level'        => 'warning',
            'triggered_by' => $user['id'],
        ]);
        return $this->success(null, 'Pipeline arrêté');
    }

    public function updateStage(Request $request): JsonResponse
    {
        if (!$this->isDev($request)) return $this->forbidden();
        $request->validate([
            'stage'  => 'required|in:checkout,tests,build,deploy',
            'status' => 'required|in:pending,active,completed,failed',
        ]);
        $s = PipelineStatus::firstOrCreate(['id'=>1]);
        $s->update([$request->stage => $request->status]);
        PipelineLog::create([
            'time'  => now()->format('H:i:s'),
            'text'  => "[{$request->stage}] → {$request->status}",
            'level' => $request->status === 'failed' ? 'error' : ($request->status === 'completed' ? 'success' : 'info'),
        ]);
        return $this->success($s);
    }

    public function clearLogs(Request $request): JsonResponse
    {
        if (!$this->isDev($request)) return $this->forbidden();
        PipelineLog::truncate();
        return $this->success(null, 'Logs effacés');
    }
}
