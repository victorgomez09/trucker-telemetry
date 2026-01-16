import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-register',
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './register.html',
  styleUrl: './register.css',
})
export class Register {
  private authService = inject(AuthService);
  private router = inject(Router);
  private fb = inject(FormBuilder);

  // Datos del formulario
  registerForm = this.fb.group({
    username: ['', Validators.required],
    password: ['', Validators.required],
  });

  // Estados de la interfaz
  isLoading = signal(false);
  errorMessage = signal<string | null>(null);

  onRegister() {
    this.errorMessage.set(null);
    this.isLoading.set(true);

    // 2. Llamada al servicio (Backend Spring Boot)
    this.authService
      .register({
        username: this.registerForm.value.username!,
        password: this.registerForm.value.password!,
      })
      .subscribe({
        next: () => {
          console.log('Registro exitoso, token recibido');
          this.isLoading.set(false);
        },
        error: (err: any) => {
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
