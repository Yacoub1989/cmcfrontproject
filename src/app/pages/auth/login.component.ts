import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService, Session } from '../../services/auth.service';

@Component({
  standalone: true,
  selector: 'app-login',
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent {
  username = '';
  password = '';

  loading = signal(false);
  err = signal('');

  constructor(private auth: AuthService, private router: Router) {}

  onLogin() {
    this.err.set('');

    const u = this.username.trim();
    const p = this.password;

    if (!u || !p) {
      this.err.set('Username et mot de passe obligatoires.');
      return;
    }

    this.loading.set(true);

    this.auth.login(u, p).subscribe({
      next: (session: Session) => {
        this.auth.setSession(session);

        const role = session.role;

        if (role === 'ROLE_DOCTEUR') this.router.navigate(['/patients']);
        else if (role === 'ROLE_LABO') this.router.navigate(['/lab']);
        else if (role === 'ROLE_RADIO') this.router.navigate(['/explorations/agent']);
        else if (role === 'ROLE_ADMIN') this.router.navigate(['/patients']);
        else if (role === 'ROLE_PHARMACIE') this.router.navigate(['/pharmacie']);
        else this.router.navigate(['/dashboard']);

        this.loading.set(false);
      },
      error: (e) => {
        console.error(e);
        this.loading.set(false);

        // message propre
        const msg =
          e?.status === 401 ? 'Identifiants incorrects.' :
          e?.status === 0 ? 'Backend inaccessible (CORS / serveur arrêté).' :
          'Erreur de connexion. Réessaie.';
        this.err.set(msg);
      }
    });
  }
}
