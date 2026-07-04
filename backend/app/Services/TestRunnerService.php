<?php

namespace App\Services;

/**
 * TestRunnerService
 * ───────────────────
 * Mandefa TENA IZY ny test suite PHPUnit an'ny backend (vendor/bin/phpunit),
 * mamaky ny valiny amin'ny alalan'ny rapport JUnit XML (--log-junit),
 * ary mamerina valiny voarindra araka ny class test (= "fichier" amin'ny UI).
 *
 * Tsy misy Math.random() na valiny "mifanindran-dalana" — ny "pass/fail"
 * dia ilay tena valiny navoakan'i PHPUnit.
 */
class TestRunnerService
{
    private const TIMEOUT_SECONDS = 90;

    /** Mamerina ny lisitry ny classes test hita ao amin'ny tests/Unit sy tests/Feature. */
    public function listSuites(): array
    {
        $suites = [];

        foreach (['Unit', 'Feature'] as $group) {
            $dir = base_path("tests/$group");
            if (!is_dir($dir)) continue;

            foreach (glob("$dir/*Test.php") as $path) {
                $content = file_get_contents($path);
                if ($content === false) continue;
                if (!preg_match('/namespace\s+([^;]+);/', $content, $ns)) continue;
                if (!preg_match('/class\s+(\w+)/', $content, $cls)) continue;
                preg_match_all('/function\s+(test_\w+)\s*\(/', $content, $methods);

                $suites[] = [
                    'file'      => $cls[1] . '.php',
                    'class'     => trim($ns[1]) . '\\' . $cls[1],
                    'group'     => $group,
                    'testCount' => count($methods[1]),
                ];
            }
        }

        return $suites;
    }

    /**
     * Mandefa vendor/bin/phpunit tena izy, mamaky ny valiny JUnit XML,
     * ary mamerina valiny voarindra araka ny class/file.
     *
     * @param string|null $class FQCN, ohatra "Tests\Feature\AuthTest" — raha null, mandefa ny test rehetra.
     * @return array{ok:bool, suites:array, raw:string, error:?string}
     */
    public function run(?string $class = null): array
    {
        if ($class !== null && !preg_match('/^[A-Za-z0-9_\\\\]+$/', $class)) {
            return ['ok' => false, 'suites' => [], 'raw' => '', 'error' => 'Nom de classe de test invalide.'];
        }

        $junitPath = sys_get_temp_dir() . '/phpunit-junit-' . bin2hex(random_bytes(6)) . '.xml';

        $cmd = 'timeout ' . self::TIMEOUT_SECONDS . ' '
             . escapeshellarg(PHP_BINARY) . ' '
             . escapeshellarg(base_path('vendor/bin/phpunit'))
             . ' --colors=never --log-junit=' . escapeshellarg($junitPath);

        if ($class) {
            $cmd .= ' --filter=' . escapeshellarg('^' . preg_quote($class, '/') . '::');
        }

        $descriptors = [0 => ['pipe', 'r'], 1 => ['pipe', 'w'], 2 => ['pipe', 'w']];
        $process = @proc_open($cmd, $descriptors, $pipes, base_path());

        if (!is_resource($process)) {
            return ['ok' => false, 'suites' => [], 'raw' => '', 'error' => 'Tsy nahomby ny fandefasana ny baiko phpunit (proc_open).'];
        }

        fclose($pipes[0]);
        $out = stream_get_contents($pipes[1]);
        $err = stream_get_contents($pipes[2]);
        fclose($pipes[1]);
        fclose($pipes[2]);
        proc_close($process);

        $raw = trim(($out ?: '') . "\n" . ($err ?: ''));

        if (!file_exists($junitPath)) {
            return [
                'ok'     => false,
                'suites' => [],
                'raw'    => mb_substr($raw, 0, 20000),
                'error'  => "Tsy nahomby ny fandefasana ny tests (tsy hita ny rapport JUnit — mety ho diso syntax ao amin'ny fichier test, na filter tsy nahitana class).",
            ];
        }

        $suites = $this->parseJunit($junitPath);
        @unlink($junitPath);

        return ['ok' => true, 'suites' => $suites, 'raw' => mb_substr($raw, 0, 20000), 'error' => null];
    }

    /** @return array<int, array{file:string,class:string,tests:int,passed:int,failed:int,duration:string,status:string,cases:array}> */
    private function parseJunit(string $path): array
    {
        $xml = @simplexml_load_file($path);
        if ($xml === false) return [];

        $result = [];

        // Ny testsuite "ravina" (izay tena misy testcase ao anatiny) ihany no
        // raisina — manalavitra ny testsuite "emboîté" (root, Unit, Feature)
        // izay wrapper fotsiny.
        foreach ($xml->xpath('//testsuite[testcase]') as $suite) {
            $classAttr = (string) $suite['name'];
            if ($classAttr === '' || isset($result[$classAttr])) continue;

            $tests = [];
            $passed = 0;
            $failed = 0;

            foreach ($suite->testcase as $tc) {
                $status  = 'pass';
                $message = null;

                if (isset($tc->failure)) {
                    $status = 'fail';
                    $failed++;
                    $message = trim((string) $tc->failure);
                } elseif (isset($tc->error)) {
                    $status = 'fail';
                    $failed++;
                    $message = trim((string) $tc->error);
                } else {
                    $passed++;
                }

                $tests[] = [
                    'name'    => (string) $tc['name'],
                    'status'  => $status,
                    'time'    => round((float) $tc['time'] * 1000),
                    'message' => $message ? mb_substr($message, 0, 400) : null,
                ];
            }

            $result[$classAttr] = [
                'file'     => class_basename($classAttr) . '.php',
                'class'    => $classAttr,
                'tests'    => count($tests),
                'passed'   => $passed,
                'failed'   => $failed,
                'duration' => round(((float) $suite['time']) * 1000) . 'ms',
                'status'   => $failed > 0 ? 'fail' : 'pass',
                'cases'    => $tests,
            ];
        }

        return array_values($result);
    }
}