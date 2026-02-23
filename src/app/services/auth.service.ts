// src/app/services/auth.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, map, catchError, throwError } from 'rxjs';

export type Role =
  | 'ROLE_ADMIN'
  | 'ROLE_DOCTEUR'
  | 'ROLE_LABO'
  | 'ROLE_RADIO'
  | 'ROLE_PHARMACIE'
  | string;

export interface Session {
  token: string;
  username: string;
  role: Role;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  // ✅ adapte ton backend

 // private API_BASE = 'http://localhost:7777/api';
  private API_BASE = 'http://Cmc7.eba-phvqmhxm.eu-north-1.elasticbeanstalk.com/api';


  private LS_KEY = 'cmc_session';

  constructor(private http: HttpClient) {}

  /**
   * POST /api/auth/login
   * Backend attendu (exemples supportés):
   * 1) { token, username, role }
   * 2) { accessToken, username, role }
   * 3) { token, user: { username, role } }
   */
  login(username: string, password: string): Observable<Session> {
    const body = { username, password };

    return this.http.post<any>(`${this.API_BASE}/auth/login`, body).pipe(
      map((res) => this.normalizeSession(res)),
      catchError((e) => this.handleHttpError(e))
    );
  }

  setSession(session: Session): void {
    localStorage.setItem(this.LS_KEY, JSON.stringify(session));
  }

  getSession(): Session | null {
    const raw = localStorage.getItem(this.LS_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as Session;
    } catch {
      return null;
    }
  }

  getToken(): string | null {
    return this.getSession()?.token ?? null;
  }

  getRole(): Role | null {
    return this.getSession()?.role ?? null;
  }

  getUsername(): string | null {
    return this.getSession()?.username ?? null;
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  logout(): void {
    localStorage.removeItem(this.LS_KEY);
  }

  // -------------------------
  // Helpers
  // -------------------------

  private normalizeSession(res: any): Session {
    // token
    const token =
      res?.token ??
      res?.accessToken ??
      res?.jwt ??
      res?.data?.token ??
      null;

    // username
    const username =
      res?.username ??
      res?.user?.username ??
      res?.data?.username ??
      null;

    // role
    const role =
      res?.role ??
      res?.user?.role ??
      res?.data?.role ??
      null;

    if (!token || !username || !role) {
      // pour aider à debug
      console.error('Login response not recognized:', res);
      throw new Error(
        "Réponse login invalide. Attendu: {token, username, role} (ou équivalent)."
      );
    }

    // si backend renvoie DOCTEUR au lieu de ROLE_DOCTEUR
    const normalizedRole = String(role).startsWith('ROLE_')
      ? String(role)
      : `ROLE_${String(role)}`;

    return {
      token: String(token),
      username: String(username),
      role: normalizedRole,
    };
  }

  private handleHttpError(e: any) {
    const err = e as HttpErrorResponse;

    // Erreur réseau / CORS / serveur down
    if (err.status === 0) {
      return throwError(() => new Error('Backend inaccessible (CORS / serveur arrêté).'));
    }

    if (err.status === 401) {
      return throwError(() => new Error('Identifiants incorrects.'));
    }

    const msg =
      (err.error && (err.error.message || err.error.error)) ||
      err.message ||
      'Erreur de connexion.';
    return throwError(() => new Error(msg));
  }

hasRole(...roles: Role[]): boolean {
  const r = this.getRole();
  return !!r && roles.includes(r);
}

token(): string | null {
  return this.getToken();
}

}
