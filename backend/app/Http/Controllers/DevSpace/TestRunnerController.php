<?php

namespace App\Http\Controllers\DevSpace;

use App\Http\Controllers\BaseController;
use App\Services\TestRunnerService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class TestRunnerController extends BaseController
{
    public function __construct(private TestRunnerService $runner)
    {
    }

    /** GET /devspace/tests — lisitry ny classes test hita ao amin'ny tests/Unit sy tests/Feature */
    public function index(Request $request): JsonResponse
    {
        if (!$this->isDev($request)) return $this->forbidden();
        return $this->success($this->runner->listSuites());
    }

    /** POST /devspace/tests/run { class?: "Tests\Feature\AuthTest" } — mandefa tena ny vendor/bin/phpunit */
    public function run(Request $request): JsonResponse
    {
        if (!$this->isDev($request)) return $this->forbidden();

        $request->validate(['class' => 'nullable|string|max:150']);

        $result = $this->runner->run($request->input('class'));

        if (!$result['ok']) {
            return $this->error($result['error'] ?? 'Tsy nahomby ny fandefasana ny tests.', 500, ['raw' => $result['raw']]);
        }

        return $this->success($result);
    }
}