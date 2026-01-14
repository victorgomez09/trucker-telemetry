import { inject } from "@angular/core";
import { CanActivateFn, Router } from "@angular/router";
import { CompanyService } from "../services/company";
import { map } from "rxjs";

export const companyMemberGuard: CanActivateFn = (route, state) => {
  const companyService = inject(CompanyService);
  const router = inject(Router);
  const id = route.paramMap.get('id');

  if (!id) return false;

  return companyService.userBelongsTo(+id).pipe(
    map(isMember => {
      if (isMember) {
        return true;
      } else {
        // Si no pertenece, lo mandamos a una página de "No Autorizado" o al Dashboard
        return router.createUrlTree(['/dashboard'], { queryParams: { error: 'no-member' }});
      }
    })
  );
};