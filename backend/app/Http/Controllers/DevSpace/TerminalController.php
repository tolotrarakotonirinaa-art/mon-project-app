<?php

namespace App\Http\Controllers\DevSpace;

use App\Http\Controllers\BaseController;
use App\Services\TerminalService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class TerminalController extends BaseController
{
    public function __construct(private TerminalService $terminal)
    {
    }

    /** GET /devspace/terminal/allowed */
    public function allowed(Request $request): JsonResponse
    {
        if (!$this->isAdmin($request)) return $this->forbidden();
        return $this->success($this->terminal->allowedCommandsList());
    }

    /** POST /devspace/terminal/exec  { command } */
    public function exec(Request $request): JsonResponse
    {
        // Mila ADMIN — exec command, na dia voafetra (whitelist) aza, dia tsy
        // ho an'ny dev rehetra.
        if (!$this->isAdmin($request)) return $this->forbidden();

        $request->validate(['command' => 'required|string|max:300']);

        $cwd    = env('DEVSPACE_TERMINAL_WORKDIR', base_path());
        $result = $this->terminal->run($request->input('command'), $cwd);

        return $this->success($result);
    }
}