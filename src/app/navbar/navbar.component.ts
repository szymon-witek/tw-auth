import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../service/auth.service';  // Adjust the path if necessary
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router'; // 👈 import it


@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule], // Add CommonModule to imports
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent implements OnInit {
  menuOpen = false;
  isAuthenticated = false;

  
  ngOnInit() {
    this.authService.isAuthenticated$.subscribe(status => {
      this.isAuthenticated = status;
    });
  }
  
  constructor(public authService: AuthService, private router: Router) {}

  toggleMenu() {
    this.menuOpen = !this.menuOpen;
    this.isAuthenticated = this.authService.isAuthenticated();
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
