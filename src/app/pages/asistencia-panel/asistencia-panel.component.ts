import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { IonContent, IonCard, IonCardContent, IonAvatar, IonIcon,IonButton, IonModal, IonHeader, IonToolbar, IonTitle, IonInput, IonItem, IonButtons, ModalController, IonCardHeader, IonCardTitle, IonCardSubtitle } from '@ionic/angular/standalone';
import { TurnoCardComponent } from 'src/app/shared/components/turno-card/turno-card.component';

@Component({
  standalone: true,
  imports: [IonCardSubtitle, IonCardTitle, IonCardHeader, IonButtons, IonItem, IonInput, IonTitle, IonToolbar, IonHeader, IonModal, IonContent, IonCard, IonCardContent, IonAvatar, IonIcon, TurnoCardComponent, IonButton, ],
  selector: 'app-asistencia-panel',
  templateUrl: './asistencia-panel.component.html',
  styleUrls: ['./asistencia-panel.component.scss'],
})
export class AsistenciaPanelComponent implements AfterViewInit {
  turnoSeleccionado: any = null;
  presentingElement: any = null;

  // Simulamos los turnos por ahora
  turnos = [
    {
      titulo: 'Turno Mañana',
      fecha: new Date(),
      horario: '8:00 a 12:00',
      usuario: 'Juan Pérez'
    }
  ];

  constructor(private modalController: ModalController) {}

  ngAfterViewInit(): void {
    this.presentingElement = document.querySelector('ion-app');
  }

  abrirModal(turno: any) {
    this.turnoSeleccionado = turno;
  }

  onWillDismiss(event: any) {
    this.turnoSeleccionado = null;
  }

  cancel() {
    const modal = document.querySelector('ion-modal');
    modal?.dismiss();
  }

  confirm() {
    // Confirmación lógica
    console.log('Turno confirmado');
    const modal = document.querySelector('ion-modal');
    modal?.dismiss();
  }

  comenzarTurno() {
    // Acá iría la lógica: validar coordenadas, sacar foto, etc.
    console.log('Comenzando turno para:', this.turnoSeleccionado);
  }
}
