import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RadioService } from '../../services/radio.service';

@Component({
  selector: 'app-radio',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './radio.html',
  styleUrls: ['./radio.scss'],
})
export class RadioComponent {
  public radio = inject(RadioService);
  public query = signal('');

  public filteredStations = computed(() => {
    const q = this.query().toLowerCase();
    return this.radio
      .stations()
      .filter((s) => s.name.toLowerCase().includes(q) || s.genre.toLowerCase().includes(q));
  });

  search(e: Event) {
    this.query.set((e.target as HTMLInputElement).value);
  }

  onVol(e: Event) {
    const val = (e.target as HTMLInputElement).value;
    this.radio.updateVolume(parseFloat(val));
  }
}
