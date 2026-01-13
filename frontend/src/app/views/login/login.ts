import { Component, inject } from '@angular/core';
import { AuthService } from '../../services/auth';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-login',
  imports: [FormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  authService = inject(AuthService);

  loginData = { username: '', password: '' };

  onLogin(event: Event) {
    event.preventDefault();
    this.authService.login(this.loginData).subscribe({
      next: () => {
        // Redirección manejada por el servicio
      },
      error: (err) => {
        // Podrías usar un Toast de DaisyUI aquí
        console.error('Error de login', err);
      },
    });
  }
}
