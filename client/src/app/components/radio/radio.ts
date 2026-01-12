import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { LucideAngularModule, PauseIcon, PlayIcon, SkipBackIcon, SkipForwardIcon, Volume2Icon } from 'lucide-angular';
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
  public readonly skipBackIcon = SkipBackIcon;
  public readonly skipNextIcon = SkipForwardIcon;
  public readonly volumeIcon = Volume2Icon;

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

  nextStation() {
    const current = this.radio.currentStation();
    const stations = this.radio.stations();
    const index = stations.findIndex(s => s.id === current?.id);
    const next = stations[(index + 1) % stations.length];
    this.radio.playStation(next);
  }

  prevStation() {
    const current = this.radio.currentStation();
    const stations = this.radio.stations();
    const index = stations.findIndex(s => s.id === current?.id);
    const prev = stations[(index - 1 + stations.length) % stations.length];
    this.radio.playStation(prev);
  }
}
