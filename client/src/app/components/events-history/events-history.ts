import { CommonModule } from '@angular/common';
import { Component, input } from '@angular/core';

@Component({
  selector: 'app-events-history',
  imports: [CommonModule],
  templateUrl: './events-history.html',
  styleUrl: './events-history.scss',
})
export class EventsHistory {

  telemetry = input<any>()

  parseEventText(text: string) {
    switch (text) {
      case "speeding_camera":
      case "crash":
        return "Multa"
      default:
        return text;
    }
  }
}
