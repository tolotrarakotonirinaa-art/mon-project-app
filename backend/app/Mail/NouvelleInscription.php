<?php
namespace App\Mail;

use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class NouvelleInscription extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(public User $newUser, public User $admin) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: '[DevEnviron 4D] Nouvelle inscription en attente de validation',
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
        $newName  = htmlspecialchars($this->newUser->name);
        $newEmail = htmlspecialchars($this->newUser->email);
        $newRole  = strtoupper(htmlspecialchars($this->newUser->role));
        $adminName = htmlspecialchars($this->admin->name);
        $date     = now()->format('d/m/Y à H:i');
        $url      = 'http://localhost:5173/admin/validation';

        return <<<HTML
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { margin:0; padding:0; background:#020408; font-family:'Segoe UI',Arial,sans-serif; }
    .container { max-width:520px; margin:40px auto; background:#0a1628; border:1px solid rgba(255,206,0,0.2); border-radius:16px; overflow:hidden; }
    .header { background:linear-gradient(135deg,#ff2d78,#7c3aed); padding:32px; text-align:center; }
    .header h1 { margin:0; color:#fff; font-size:22px; font-weight:900; letter-spacing:0.1em; }
    .header p { margin:8px 0 0; color:rgba(255,255,255,0.8); font-size:13px; }
    .body { padding:32px; }
    .body h2 { color:#e8f4ff; font-size:18px; margin-bottom:8px; }
    .body p { color:#8899aa; font-size:14px; line-height:1.7; margin-bottom:16px; }
    .info-box { background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.08); border-radius:10px; padding:16px 20px; margin-bottom:20px; }
    .info-row { display:flex; justify-content:space-between; padding:6px 0; border-bottom:1px solid rgba(255,255,255,0.05); }
    .info-row:last-child { border-bottom:none; }
    .info-label { color:#556677; font-size:12px; font-weight:700; text-transform:uppercase; letter-spacing:0.1em; }
    .info-value { color:#e8f4ff; font-size:13px; font-weight:600; }
    .badge { display:inline-block; padding:4px 12px; border-radius:20px; font-size:11px; font-weight:700; letter-spacing:0.1em; background:rgba(0,200,255,0.1); color:#00c8ff; border:1px solid rgba(0,200,255,0.3); }
    .btn { display:block; width:fit-content; margin:24px auto 0; padding:14px 32px; background:linear-gradient(135deg,#ff2d78,#7c3aed); color:#fff; text-decoration:none; border-radius:10px; font-weight:900; font-size:14px; letter-spacing:0.05em; }
    .footer { padding:20px 32px; border-top:1px solid rgba(255,255,255,0.06); text-align:center; }
    .footer p { color:#445566; font-size:11px; margin:0; }
    .bell { width:64px; height:64px; background:rgba(255,206,0,0.1); border:2px solid rgba(255,206,0,0.3); border-radius:50%; display:flex; align-items:center; justify-content:center; margin:0 auto 20px; font-size:28px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>DEV ENVIRON 4D</h1>
      <p>Nouvelle inscription en attente</p>
    </div>
    <div class="body">
      <div class="bell">🔔</div>
      <h2>Bonjour {$adminName} !</h2>
      <p>Un nouvel utilisateur vient de s'inscrire sur la plateforme et attend votre validation :</p>

      <div class="info-box">
        <div class="info-row">
          <span class="info-label">Nom</span>
          <span class="info-value">{$newName}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Email</span>
          <span class="info-value">{$newEmail}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Role demande</span>
          <span class="info-value"><span class="badge">{$newRole}</span></span>
        </div>
        <div class="info-row">
          <span class="info-label">Date inscription</span>
          <span class="info-value">{$date}</span>
        </div>
      </div>

      <p>Cliquez sur le bouton ci-dessous pour acceder a la page de validation et approuver ou rejeter cette demande.</p>

      <a href="{$url}" class="btn">VALIDER OU REJETER</a>
    </div>
    <div class="footer">
      <p>DevEnviron 4D &mdash; Cet email est destine a l'administrateur uniquement.</p>
    </div>
  </div>
</body>
</html>
HTML;
    }
}