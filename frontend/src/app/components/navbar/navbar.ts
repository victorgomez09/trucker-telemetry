import { CommonModule } from '@angular/common';
import { Component, HostListener, inject, signal } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-navbar',
  imports: [CommonModule, RouterModule],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css',
})
export class Navbar {
  // Inyectamos el servicio de autenticación
  authService = inject(AuthService);

  // Señal para controlar el estilo del navbar al hacer scroll
  isScrolled = signal(false);

  // Escuchamos el evento scroll de la ventana
  @HostListener('window:scroll', [])
  onWindowScroll() {
    this.isScrolled.set(window.scrollY > 20);
  }

  logout() {
    this.authService.logout();
  }
}
