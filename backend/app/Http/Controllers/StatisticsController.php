<?php
namespace App\Http\Controllers;

use App\Models\Project;
use App\Models\Task;
use App\Models\User;
use App\Models\Repository;
use App\Models\Environment;
use Illuminate\Http\JsonResponse;

class StatisticsController extends BaseController
{
    public function index(): JsonResponse
    {
        return $this->success([
            'overview' => [
                'total_projects'  => Project::count(),
                'total_tasks'     => Task::count(),
                'total_users'     => User::count(),
                'total_repos'     => Repository::count(),
                'total_envs'      => Environment::count(),
                'avg_progress'    => round(Project::avg('progress'), 1),
                'completion_rate' => Task::count() > 0
                    ? round(Task::where('status','done')->count() / Task::count() * 100, 1)
                    : 0,
            ],
            'tasks_by_status' => [
                'todo'       => Task::where('status','todo')->count(),
                'inprogress' => Task::where('status','inprogress')->count(),
                'done'       => Task::where('status','done')->count(),
            ],
            'tasks_by_priority' => [
                'high'   => Task::where('priority','high')->count(),
                'medium' => Task::where('priority','medium')->count(),
                'low'    => Task::where('priority','low')->count(),
            ],
            'projects_by_status' => [
                'active'    => Project::where('status','active')->count(),
                'pending'   => Project::where('status','pending')->count(),
                'completed' => Project::where('status','completed')->count(),
            ],
            'users_by_role' => [
                'admin'  => User::where('role','admin')->count(),
                'dev'    => User::where('role','dev')->count(),
                'client' => User::where('role','client')->count(),
            ],
            'projects_progress' => Project::select('name','progress','color','status')->get(),
        ]);
    }
}
