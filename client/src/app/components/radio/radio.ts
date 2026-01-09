import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { LucideAngularModule, PauseIcon, PlayIcon } from 'lucide-angular';
import { RadioService } from '../../services/radio.service';

@Component({
  selector: 'app-radio',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './radio.html',
  styleUrls: ['./radio.scss'],
})
export class RadioComponent {
  public readonly radio = inject(RadioService);
  public readonly playIcon = PlayIcon;
  public readonly pauseIcon = PauseIcon;
  
  public searchTerm = signal('');
  public filteredStations = computed(() => {
    const term = this.searchTerm().toLowerCase();
    return this.radio
      .stations()
      .filter((s) => s.name.toLowerCase().includes(term) || s.genre.toLowerCase().includes(term));
  });

  filterStations(event: Event) {
    this.searchTerm.set((event.target as HTMLInputElement).value);
  }

  onVolumeChange(event: Event) {
    const val = (event.target as HTMLInputElement).value;
    this.radio.updateVolume(parseFloat(val));
  }
}
