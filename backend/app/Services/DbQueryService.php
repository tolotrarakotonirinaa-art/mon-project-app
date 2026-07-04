<?php

namespace App\Services;

use Illuminate\Support\Facades\DB;

/**
 * DbQueryService
 * ───────────────
 * Mamela ny dev/admin hanao baiko SQL READ-ONLY mivantana amin'ny
 * base de données amin'ny alalan'ny outil DevSpace.
 *
 * ⚠ VIRY SÉCURITÉ TENA IZY (aza adino) :
 * Ny validation ato anatin'ity class ity (assertReadOnly) dia "best effort"
 * eo amin'ny lafiny application ihany, FA TSY fefiloha azo antoka tanteraka.
 * Ohatra: "SELECT pg_terminate_backend(123)" dia miandany amin'ny mot-clé
 * SELECT nefa mety hanana "effet de bord". Ny fomba TENA azo antoka dia:
 *
 *   1. Mamorona rôle PostgreSQL READ ONLY tena izy:
 *        CREATE ROLE devspace_ro LOGIN PASSWORD '...';
 *        GRANT CONNECT ON DATABASE devenviron TO devspace_ro;
 *        GRANT USAGE ON SCHEMA public TO devspace_ro;
 *        GRANT SELECT ON ALL TABLES IN SCHEMA public TO devspace_ro;
 *        ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT ON TABLES TO devspace_ro;
 *
 *   2. Ampio connexion vaovao ao amin'ny config/database.php (anaty
 *      'connections' =>), miaraka amin'io rôle io:
 *        'devspace_readonly' => [
 *            'driver'   => 'pgsql',
 *            'host'     => env('DB_HOST', '127.0.0.1'),
 *            'port'     => env('DB_PORT', '5432'),
 *            'database' => env('DB_DATABASE', 'devenviron'),
 *            'username' => env('DB_READONLY_USERNAME', 'devspace_ro'),
 *            'password' => env('DB_READONLY_PASSWORD', ''),
 *            'charset'  => 'utf8',
 *            'sslmode'  => 'prefer',
 *        ],
 *
 *   3. Raha tsy misy io connexion io voafaritra, dia ny connexion lalandava
 *      ('pgsql') no ampiasaina — mety hanao UPDATE/DELETE raha tsy voarara
 *      tsara ny regex eto ambany, ka tsara dia tsara ny manao ny dingana 1-2.
 */
class DbQueryService
{
    private const FORBIDDEN_KEYWORDS = [
        'insert', 'update', 'delete', 'drop', 'alter', 'truncate',
        'grant', 'revoke', 'create', 'copy', 'vacuum', 'reindex',
    ];

    private const MAX_ROWS   = 200;
    private const TIMEOUT_MS = 5000;

    private function connectionName(): string
    {
        return config('database.connections.devspace_readonly')
            ? 'devspace_readonly'
            : config('database.default');
    }

    /** Lisitry ny tableau rehetra amin'ny schema "public" + isan'ny lignes. */
    public function listTables(): array
    {
        $conn = DB::connection($this->connectionName());
        $rows = $conn->select(
            "select table_name from information_schema.tables where table_schema = 'public' order by table_name"
        );

        $tables = [];
        foreach ($rows as $r) {
            $name = $r->table_name;
            try {
                $count = $conn->select('select count(*) as c from "' . str_replace('"', '', $name) . '"')[0]->c ?? null;
            } catch (\Throwable $e) {
                $count = null;
            }
            $tables[] = ['name' => $name, 'rows' => $count];
        }
        return $tables;
    }

    /** Mamerina ny colonnes amin'ny tableau iray, null raha tsy hita. */
    public function describeTable(string $table): ?array
    {
        $exists = collect($this->listTables())->pluck('name')->contains($table);
        if (!$exists) return null;

        return DB::connection($this->connectionName())->select(
            "select column_name, data_type, is_nullable, column_default
             from information_schema.columns
             where table_schema = 'public' and table_name = ?
             order by ordinal_position",
            [$table]
        );
    }

    /**
     * Manatanteraka baiko SELECT/EXPLAIN tokana, mametra LIMIT sy timeout.
     *
     * @return array{columns:array,rows:array,count:int,duration_ms:float}
     * @throws \InvalidArgumentException raha tsy mahafeno ny fepetra read-only
     */
    public function runQuery(string $sql): array
    {
        $sql = trim($sql);
        $this->assertReadOnly($sql);

        $sql = rtrim($sql, "; \t\n\r");
        if (!preg_match('/\blimit\s+\d+/i', $sql)) {
            $sql .= ' LIMIT ' . self::MAX_ROWS;
        }

        $conn = DB::connection($this->connectionName());
        try {
            $conn->statement('SET statement_timeout = ' . self::TIMEOUT_MS);
        } catch (\Throwable $e) {
            // tsy fatal raha tsy Postgres na tsy misy droit hanova io paramètre io
        }

        $start = microtime(true);
        $rows  = $conn->select($sql);
        $ms    = round((microtime(true) - $start) * 1000, 1);

        $data    = array_map(fn ($r) => (array) $r, $rows);
        $columns = $data ? array_keys($data[0]) : [];

        return [
            'columns'     => $columns,
            'rows'        => $data,
            'count'       => count($data),
            'duration_ms' => $ms,
        ];
    }

    private function assertReadOnly(string $sql): void
    {
        if ($sql === '') {
            throw new \InvalidArgumentException('Tsy misy baiko SQL nampidirina.');
        }
        if (substr_count(rtrim($sql, '; '), ';') > 0) {
            throw new \InvalidArgumentException('Baiko tokana ihany no azo alefa indray mandeha (esory ny ";" anatiny).');
        }
        if (!preg_match('/^\s*(select|explain)\b/i', $sql)) {
            throw new \InvalidArgumentException('"SELECT" na "EXPLAIN" ihany no azo alefa amin\'ity outil ity.');
        }
        $lower = strtolower($sql);
        foreach (self::FORBIDDEN_KEYWORDS as $kw) {
            if (preg_match('/\b' . $kw . '\b/', $lower)) {
                throw new \InvalidArgumentException("Baiko \"{$kw}\" voarara amin'ity outil ity.");
            }
        }
    }
}