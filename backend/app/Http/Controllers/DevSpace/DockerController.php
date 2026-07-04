<?php

namespace App\Http\Controllers\DevSpace;

use App\Http\Controllers\BaseController;
use App\Services\DockerService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DockerController extends BaseController
{
    public function __construct(private DockerService $docker)
    {
    }

    /** GET /devspace/docker/containers */
    public function index(Request $request): JsonResponse
    {
        if (!$this->isDev($request)) return $this->forbidden();
        if (!$this->docker->isAvailable()) {
            return $this->error("Docker tsy hita na tsy azo antso amin'ity server ity.", 503);
        }
        return $this->success($this->docker->listContainers());
    }

    /** GET /devspace/docker/stats */
    public function stats(Request $request): JsonResponse
    {
        if (!$this->isDev($request)) return $this->forbidden();
        if (!$this->docker->isAvailable()) {
            return $this->error("Docker tsy hita na tsy azo antso amin'ity server ity.", 503);
        }
        return $this->success($this->docker->stats());
    }

    /** POST /devspace/docker/containers/{id}/start */
    public function start(Request $request, string $id): JsonResponse
    {
        if (!$this->isAdmin($request)) return $this->forbidden();
        if (!$id = $this->validateId($id)) return $this->error('ID/anaran-container tsy mety.', 422);

        $result = $this->docker->start($id);
        return $result['ok']
            ? $this->success(null, 'Container natomboka.')
            : $this->error('Tsy nahomby ny fanombohana: ' . trim($result['err'] ?: $result['out']), 500);
    }

    /** POST /devspace/docker/containers/{id}/stop */
    public function stop(Request $request, string $id): JsonResponse
    {
        if (!$this->isAdmin($request)) return $this->forbidden();
        if (!$id = $this->validateId($id)) return $this->error('ID/anaran-container tsy mety.', 422);

        $result = $this->docker->stop($id);
        return $result['ok']
            ? $this->success(null, 'Container najanona.')
            : $this->error('Tsy nahomby ny fampijanonana: ' . trim($result['err'] ?: $result['out']), 500);
    }

    /** POST /devspace/docker/containers/{id}/restart */
    public function restart(Request $request, string $id): JsonResponse
    {
        if (!$this->isAdmin($request)) return $this->forbidden();
        if (!$id = $this->validateId($id)) return $this->error('ID/anaran-container tsy mety.', 422);

        $result = $this->docker->restart($id);
        return $result['ok']
            ? $this->success(null, 'Container naverina natomboka.')
            : $this->error('Tsy nahomby ny fanovàna: ' . trim($result['err'] ?: $result['out']), 500);
    }

    /** GET /devspace/docker/containers/{id}/logs?tail=100 */
    public function logs(Request $request, string $id): JsonResponse
    {
        if (!$this->isDev($request)) return $this->forbidden();
        if (!$id = $this->validateId($id)) return $this->error('ID/anaran-container tsy mety.', 422);

        $tail   = (int) $request->query('tail', 100);
        $result = $this->docker->logs($id, $tail);

        return $result['ok']
            ? $this->success(['logs' => $result['out']])
            : $this->error('Tsy nahomby ny fakana logs: ' . trim($result['err'] ?: $result['out']), 500);
    }

    /**
     * Mamadika container id/name azo antoka ihany (alphanumeric, point, tsipika,
     * underscore) — manakana injection na dia efa misy escapeshellarg() ao
     * amin'ny DockerService aza (fanaraha-maro roa lalana / defense in depth).
     */
    private function validateId(string $id): ?string
    {
        $id = trim($id);
        return preg_match('/^[a-zA-Z0-9._-]{1,128}$/', $id) ? $id : null;
    }
}