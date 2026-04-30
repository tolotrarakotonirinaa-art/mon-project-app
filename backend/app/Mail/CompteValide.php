<?php
namespace App\Mail;

use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class CompteValide extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(public User $user) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Votre compte DevEnviron 4D a ete valide !',
        );
    }

    public function content(): Content
    {
        return new Content(
            htmlString: $this->buildHtml(),
        );
    }

    private function buildHtml(): string
    {
        $name = htmlspecialchars($this->user->name);
        $role = strtoupper(htmlspecialchars($this->user->role));
        $url  = 'http://localhost:5173/login';

        return <<<HTML
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { margin:0; padding:0; background:#020408; font-family:'Segoe UI',Arial,sans-serif; }
    .container { max-width:520px; margin:40px auto; background:#0a1628; border:1px solid rgba(0,200,255,0.2); border-radius:16px; overflow:hidden; }
    .header { background:linear-gradient(135deg,#00c8ff,#7c3aed); padding:32px; text-align:center; }
    .header h1 { margin:0; color:#020408; font-size:22px; font-weight:900; letter-spacing:0.1em; }
    .body { padding:32px; }
    .body h2 { color:#e8f4ff; font-size:18px; margin-bottom:8px; }
    .body p { color:#8899aa; font-size:14px; line-height:1.7; margin-bottom:16px; }
    .badge { display:inline-block; padding:6px 16px; border-radius:20px; font-size:12px; font-weight:700; letter-spacing:0.1em; background:rgba(0,200,255,0.1); color:#00c8ff; border:1px solid rgba(0,200,255,0.3); margin-bottom:24px; }
    .btn { display:block; width:fit-content; margin:24px auto 0; padding:14px 32px; background:linear-gradient(135deg,#00c8ff,#7c3aed); color:#020408; text-decoration:none; border-radius:10px; font-weight:900; font-size:14px; letter-spacing:0.05em; }
    .footer { padding:20px 32px; border-top:1px solid rgba(255,255,255,0.06); text-align:center; }
    .footer p { color:#445566; font-size:11px; margin:0; }
    .check { width:64px; height:64px; background:rgba(0,255,136,0.15); border:2px solid rgba(0,255,136,0.4); border-radius:50%; display:flex; align-items:center; justify-content:center; margin:0 auto 20px; font-size:28px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>DEV ENVIRON 4D</h1>
    </div>
    <div class="body">
      <div class="check">✅</div>
      <h2>Bonjour {$name} !</h2>
      <p>Votre compte a été <strong style="color:#00ff88">validé avec succès</strong> par l'administrateur de la plateforme DevEnviron 4D.</p>
      <div class="badge">ROLE : {$role}</div>
      <p>Vous pouvez maintenant vous connecter et accéder à toutes les fonctionnalités correspondant à votre rôle.</p>
      <a href="{$url}" class="btn">SE CONNECTER MAINTENANT</a>
    </div>
    <div class="footer">
      <p>DevEnviron 4D &mdash; Plateforme de développement collaborative</p>
      <p style="margin-top:6px">Si vous n'avez pas créé de compte, ignorez cet email.</p>
    </div>
  </div>
</body>
</html>
HTML;
    }
}