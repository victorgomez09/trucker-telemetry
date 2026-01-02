import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { ConfigService } from '../services/config.service';

export const configGuard: CanActivateFn = async () => {
  const router = inject(Router);
  const cfg = inject(ConfigService);

  await cfg.load();

  if (!cfg.isConfigured()) {
    router.navigate(['/setup']);
    return false;
  }

  return true;
};
