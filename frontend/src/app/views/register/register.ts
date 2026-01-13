import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-register',
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './register.html',
  styleUrl: './register.css',
})
export class Register {
  private authService = inject(AuthService);
  private router = inject(Router);

  // Datos del formulario
  regData = {
    username: '',
    password: '',
    confirmPassword: '',
  };

  // Estados de la interfaz
  isLoading = signal(false);
  errorMessage = signal<string | null>(null);

  onRegister(event: Event) {
    event.preventDefault();
    this.errorMessage.set(null);

    // 1. Validaciones básicas de cliente
    if (!this.regData.username || !this.regData.password) {
      this.errorMessage.set('Por favor, rellena todos los campos.');
      return;
    }

    if (this.regData.password !== this.regData.confirmPassword) {
      this.errorMessage.set('Las contraseñas no coinciden.');
      return;
    }

    this.isLoading.set(true);

    // 2. Llamada al servicio (Backend Spring Boot)
    this.authService
      .register({
        username: this.regData.username,
        password: this.regData.password,
      })
      .subscribe({
        next: (response) => {
          console.log('Registro exitoso, token recibido');
          this.isLoading.set(false);
          // El AuthService ya maneja la redirección al dashboard al guardar el token
        },
        error: (err) => {
          this.isLoading.set(false);
          if (err.status === 409 || err.status === 400) {
            this.errorMessage.set('El nombre de usuario ya está en uso.');
          } else {
            this.errorMessage.set('Error en el servidor. Inténtalo más tarde.');
          }
        },
      });
  }
}
