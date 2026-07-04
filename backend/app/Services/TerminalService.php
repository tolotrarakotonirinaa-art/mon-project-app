<?php

namespace App\Services;

/**
 * TerminalService
 * ────────────────
 * Manatanteraka baiko VOAFETRA TANTERAKA (whitelist) ihany — TSY exec libre.
 * Ny baiko alefan'ny user dia tsy maintsy mifanaraka EXACTEMENT amin'ny
 * regex iray ao anatin'ny ALLOWED_PATTERNS vao alefa amin'ny shell.
 *
 * Raha mila baiko vaovao: ampio pattern eto AMIN'NY FOMBA HENTITRA
 * (regex voafaritra tsara, tsy `.*` na wildcard malalaka), ary eritrereto
 * tsara ny "blast radius" alohan'ny manampy (ohatra: aza atao "git *"
 * fa "git status", "git log", sns. tsirairay).
 */
class TerminalService
{
    private const ALLOWED_PATTERNS = [
        '/^git status$/',
        '/^git log(\s+--oneline)?(\s+-n\s+\d{1,3})?$/',
        '/^git branch(\s+-a)?$/',
        '/^git diff$/',
        '/^git pull$/',
        '/^ls(\s+-l|\s+-la|\s+-a)?$/',
        '/^pwd$/',
        '/^whoami$/',
        '/^uptime$/',
        '/^df -h$/',
        '/^free -m$/',
        '/^docker ps(\s+-a)?$/',
        '/^npm install$/',
        '/^npm test$/',
        '/^npm run build$/',
        '/^npm run dev$/',
        '/^composer install$/',
        '/^php artisan migrate:status$/',
        '/^php artisan route:list$/',
        '/^php artisan --version$/',
    ];

    private const TIMEOUT_SECONDS = 15;
    private const MAX_OUTPUT_CHARS = 20000;

    public function allowedCommandsList(): array
    {
        return [
            'git status', 'git log', 'git branch', 'git diff', 'git pull',
            'ls', 'pwd', 'whoami', 'uptime', 'df -h', 'free -m', 'docker ps',
            'npm install', 'npm test', 'npm run build', 'npm run dev',
            'composer install', 'php artisan migrate:status', 'php artisan route:list',
        ];
    }

    public function isAllowed(string $command): bool
    {
        $command = trim($command);
        foreach (self::ALLOWED_PATTERNS as $pattern) {
            if (preg_match($pattern, $command)) return true;
        }
        return false;
    }

    /**
     * @return array{ok:bool,out:string,err:string,code:int}
     */
    public function run(string $command, ?string $cwd = null): array
    {
        $command = trim($command);

        if (!$this->isAllowed($command)) {
            return [
                'ok'   => false,
                'out'  => '',
                'err'  => "Baiko voarara: \"{$command}\". Ity outil ity dia mametra baiko voafaritra mialoha ihany (whitelist) — jereo ny lisitry ny baiko azo antso.",
                'code' => -1,
            ];
        }

        // "timeout" (coreutils) dia mamono ny baiko raha mihoatra ny fotoana voafaritra —
        // miaro amin'ny baiko miandry mandrakizay (npm install tsy mety, sns).
        $wrapped = 'timeout ' . self::TIMEOUT_SECONDS . ' ' . $command;

        $descriptors = [0 => ['pipe', 'r'], 1 => ['pipe', 'w'], 2 => ['pipe', 'w']];
        $process = @proc_open($wrapped, $descriptors, $pipes, $cwd ?: null);

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
            'out'  => mb_substr($out ?: '', 0, self::MAX_OUTPUT_CHARS),
            'err'  => mb_substr($err ?: '', 0, self::MAX_OUTPUT_CHARS),
            'code' => $code,
        ];
    }
}