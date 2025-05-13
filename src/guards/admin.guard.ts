import { Injectable } from '@angular/core';
import { CanActivate } from '@angular/router';
import { AuthService } from '../service/auth.service';
import { Router } from '@angular/router';

@Injectable({ providedIn: 'root' })
export class AdminGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(): boolean {
    if (this.authService.isAdmin()) {  // Assuming your AuthService has an `isAdmin()` method
      return true;
    }
    this.router.navigate(['/dashboard']);  // Redirect to dashboard if not admin
    return false;
  }
}
