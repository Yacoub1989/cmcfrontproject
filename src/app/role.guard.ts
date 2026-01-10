import { inject } from '@angular/core';
import { CanActivateFn, Router, UrlTree } from '@angular/router';
import { AuthService, Role } from './services/auth.service';

export function roleGuard(roles: Role[]): CanActivateFn {
  return (): boolean | UrlTree => {
    const auth = inject(AuthService);
    const router = inject(Router);

    const session = auth.getSession();
    if (!session?.token) return router.parseUrl('/login');

    if (!roles.includes(session.role)) return router.parseUrl('/forbidden');

    return true;
  };
}
