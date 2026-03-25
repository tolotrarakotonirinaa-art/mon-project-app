<?php
namespace App\Http\Controllers;

use App\Models\Project;
use App\Models\Task;
use App\Models\User;
use App\Models\Activity;
use App\Models\PipelineStatus;
use App\Models\Notification;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DashboardController extends BaseController
{
    public function index(Request $request): JsonResponse
    {
        $user = $this->authUser($request);

        return $this->success([
            'user' => [
                'name'   => $user['name'],
                'role'   => $user['role'],
                'avatar' => $user['avatar'] ?? '',
            ],
            'stats' => [
                'active_projects'  => Project::where('status','active')->count(),
                'total_projects'   => Project::count(),
                'tasks_inprogress' => Task::where('status','inprogress')->count(),
                'tasks_done'       => Task::where('status','done')->count(),
                'tasks_todo'       => Task::where('status','todo')->count(),
                'team_members'     => User::count(),
                'unread_notifs'    => Notification::where('user_id',$user['id'])->where('read',false)->count(),
            ],
            'task_summary' => [
                'total'      => Task::count(),
                'todo'       => Task::where('status','todo')->count(),
                'inprogress' => Task::where('status','inprogress')->count(),
                'done'       => Task::where('status','done')->count(),
            ],
            'recent_projects'   => Project::latest()->take(4)->get(),
            'recent_activities' => Activity::latest()->take(8)->get(),
            'pipeline_status'   => PipelineStatus::first(),
        ]);
    }
}
