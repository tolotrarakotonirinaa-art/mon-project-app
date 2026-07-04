<?php

namespace App\Http\Controllers\DevSpace;

use App\Http\Controllers\BaseController;
use App\Services\DbQueryService;
use Illuminate\Database\QueryException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DbQueryController extends BaseController
{
    public function __construct(private DbQueryService $db)
    {
    }

    /** GET /devspace/db/tables */
    public function tables(Request $request): JsonResponse
    {
        if (!$this->isDev($request)) return $this->forbidden();
        try {
            return $this->success($this->db->listTables());
        } catch (\Throwable $e) {
            return $this->error('Tsy nahomby ny fakana ny lisitry ny tableau: ' . $e->getMessage(), 500);
        }
    }

    /** GET /devspace/db/tables/{table}/columns */
    public function describe(Request $request, string $table): JsonResponse
    {
        if (!$this->isDev($request)) return $this->forbidden();
        if (!preg_match('/^[a-zA-Z0-9_]{1,63}$/', $table)) {
            return $this->error('Anaran-tableau tsy mety.', 422);
        }

        $cols = $this->db->describeTable($table);
        if ($cols === null) return $this->notFound('Tableau tsy hita.');
        return $this->success($cols);
    }

    /** POST /devspace/db/query  { sql } */
    public function query(Request $request): JsonResponse
    {
        // Mila ADMIN — baiko SQL libre, na dia read-only aza, dia tsy ho an'ny dev rehetra.
        if (!$this->isAdmin($request)) return $this->forbidden();

        $request->validate(['sql' => 'required|string|max:5000']);

        try {
            return $this->success($this->db->runQuery($request->input('sql')));
        } catch (\InvalidArgumentException $e) {
            return $this->error($e->getMessage(), 422);
        } catch (QueryException $e) {
            return $this->error('Erreur SQL: ' . $e->getMessage(), 400);
        } catch (\Throwable $e) {
            return $this->error('Erreur tsy fantatra: ' . $e->getMessage(), 500);
        }
    }
}