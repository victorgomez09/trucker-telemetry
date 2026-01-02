import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ConfigService } from '../../../services/config.service';

@Component({
  selector: 'app-setup.component',
  imports: [FormsModule],
  templateUrl: './setup.component.html',
  styleUrl: './setup.component.scss',
})
export class SetupComponent {
  ets2Path = '';
  atsPath = '';

  constructor(private cfg: ConfigService, private router: Router) {}

  async save() {
    await this.cfg.save({
      ets2_path: this.ets2Path || undefined,
      ats_path: this.atsPath || undefined,
    });
    this.router.navigate(['/']);
  }
}
