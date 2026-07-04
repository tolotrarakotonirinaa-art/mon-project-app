<?php

namespace App\Services;

/**
 * DockerService
 * ──────────────
 * Manatanteraka baiko "docker" voafetra (whitelist) amin'ny CLI mivantana
 * amin'ny server izay misy ny backend Laravel (na ny VM TEST/PROD).
 *
 * VIRY: io class ity dia mitaky fa:
 *   1. Misy "docker" CLI azo antso avy amin'ny user mandeha ny PHP-FPM/artisan serve.
 *   2. Io user io dia ao anaty groupe "docker" (na root), satria mila mikasika
 *      ny /var/run/docker.sock ny baiko docker.
 * Raha tsy mahomby ireo fepetra ireo, dia hiverina null/false fotsiny ny valiny
 * (tsy hanome erreur 500 fatal) — jereo isAvailable().
 *
 * Tsy misy baiko alefa avy amin'ny user mivantana ato anatin'ity Service ity —
 * ny "id"/"name" container ihany no paramatra azo ovaina, ary aleo voadio
 * tamin'ny Controller (regex) ALOHA ny fiantsoana, ary escapeshellarg() foana
 * eto am-pomena fanovàna farany.
 */
class DockerService
{
    /** Mamerina lisitry ny container rehetra (miasa + najanona). */
    public function listContainers(): array
    {
        $result = $this->run('docker ps -a --format "{{json .}}"');
        if (!$result['ok']) return [];

        $containers = [];
        foreach (explode("\n", trim($result['out'])) as $line) {
            if ($line === '') continue;
            $data = json_decode($line, true);
            if (!$data) continue;
            $containers[] = [
                'id'      => $data['ID']       ?? null,
                'name'    => $data['Names']    ?? null,
                'image'   => $data['Image']    ?? null,
                'status'  => $data['Status']   ?? null,
                'state'   => $data['State']    ?? null,
                'ports'   => $data['Ports']    ?? '',
                'created' => $data['CreatedAt']?? null,
            ];
        }
        return $containers;
    }

    /** Statistika CPU/Mémoire tena izy amin'ny container miasa (snapshot indray mandeha). */
    public function stats(): array
    {
        $result = $this->run('docker stats --no-stream --format "{{json .}}"');
        if (!$result['ok']) return [];

        $stats = [];
        foreach (explode("\n", trim($result['out'])) as $line) {
            if ($line === '') continue;
            $data = json_decode($line, true);
            if (!$data) continue;
            $stats[] = [
                'id'       => $data['ID']      ?? null,
                'name'     => $data['Name']    ?? null,
                'cpu'      => $data['CPUPerc'] ?? null,
                'memory'   => $data['MemUsage']?? null,
                'mem_perc' => $data['MemPerc'] ?? null,
                'net_io'   => $data['NetIO']   ?? null,
                'block_io' => $data['BlockIO'] ?? null,
            ];
        }
        return $stats;
    }

    /** @return array{ok:bool,out:string,err:string} */
    public function start(string $id): array
    {
        return $this->run('docker start ' . escapeshellarg($id));
    }

    /** @return array{ok:bool,out:string,err:string} */
    public function stop(string $id): array
    {
        return $this->run('docker stop ' . escapeshellarg($id));
    }

    /** @return array{ok:bool,out:string,err:string} */
    public function restart(string $id): array
    {
        return $this->run('docker restart ' . escapeshellarg($id));
    }

    /** @return array{ok:bool,out:string,err:string} */
    public function logs(string $id, int $tail = 100): array
    {
        $tail = max(1, min($tail, 1000)); // voafetra mba tsy hanasaka memory
        return $this->run('docker logs --tail ' . $tail . ' ' . escapeshellarg($id));
    }

    /** Mamerina true raha azo antso ny docker CLI amin'ity server ity. */
    public function isAvailable(): bool
    {
        return $this->run('docker version --format "{{.Server.Version}}"')['ok'];
    }

    /**
     * Manatanteraka baiko iray amin'ny fomba voafehy (proc_open), mametra
     * stdout sy stderr misaraka, ary mamerina ny code valiny.
     *
     * @return array{ok:bool,out:string,err:string,code:int}
     */
    private function run(string $command): array
    {
        $descriptors = [
            0 => ['pipe', 'r'],
            1 => ['pipe', 'w'],
            2 => ['pipe', 'w'],
        ];

        $process = @proc_open($command, $descriptors, $pipes);
        if (!is_resource($process)) {
            return ['ok' => false, 'out' => '', 'err' => 'Tsy nahomby ny fandefasana ny baiko (proc_open).', 'code' => -1];
        }

        fclose($pipes[0]);
        $out = stream_get_contents($pipes[1]);
        $err = stream_get_contents($pipes[2]);
        fclose($pipes[1]);
        fclose($pipes[2]);
        $code = proc_close($process);

        return [
            'ok'   => $code === 0,
            'out'  => $out ?: '',
            'err'  => $err ?: '',
            'code' => $code,
        ];
    }
}