import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';

@Component({
  selector: 'app-turno-card',
  standalone: true,
  imports: [CommonModule, IonicModule],
  templateUrl: './turno-card.component.html',
  styleUrls: ['./turno-card.component.scss']
})
export class TurnoCardComponent {
  @Input() turno: any;
}
