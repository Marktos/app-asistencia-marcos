import { AfterViewInit, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import {
  IonContent,
  IonCard,
  IonCardContent,
  IonIcon,
  IonButton,
  IonModal,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonCardHeader,
  IonCardTitle,
  IonCardSubtitle,
  IonBadge
} from '@ionic/angular/standalone';

@Component({
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    IonContent,
    IonCard,
    IonCardContent,
    IonIcon,
    IonButton,
    IonModal,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonButtons,
    IonCardHeader,
    IonCardTitle,
    IonCardSubtitle,
    IonBadge
  ],
  selector: 'app-asistencia-panel',
  templateUrl: './asistencia-panel.component.html',
  styleUrls: ['./asistencia-panel.component.scss'],
})
export class AsistenciaPanelComponent implements OnInit, AfterViewInit {
  turnoSeleccionado: any = null;
  presentingElement: any = null;
  modalOpen: boolean = false;
  currentDate: Date = new Date();

  // Simulamos los turnos
  turnos = [
    {
      titulo: 'Turno Mañana',
      fecha: new Date(),
      horario: '8:00 - 12:00',
      usuario: 'Juan Pérez',
      tipo: 'morning'
    },
    {
      titulo: 'Turno Tarde',
      fecha: new Date(),
      horario: '14:00 - 18:00',
      usuario: 'Juan Pérez',
      tipo: 'afternoon'
    },
    {
      titulo: 'Turno Noche',
      fecha: new Date(),
      horario: '20:00 - 00:00',
      usuario: 'Juan Pérez',
      tipo: 'night'
    }
  ];

  constructor() {}

  ngOnInit() {
    // Actualizar fecha cada minuto
    setInterval(() => {
      this.currentDate = new Date();
    }, 60000);
  }

  ngAfterViewInit(): void {
    this.presentingElement = document.querySelector('ion-app');
  }

  abrirModal(turno: any) {
    this.turnoSeleccionado = turno;
    this.modalOpen = true;
  }

  onWillDismiss() {
    this.modalOpen = false;
    this.turnoSeleccionado = null;
  }

  cancel() {
    this.modalOpen = false;
  }

  comenzarTurno() {
    console.log('Comenzando turno:', this.turnoSeleccionado);

    // Aquí irá la lógica de:
    // 1. Validar ubicación
    // 2. Tomar foto
    // 3. Registrar asistencia

    this.modalOpen = false;

    // TODO: Implementar navegación a página de registro
    // this.router.navigate(['/registro-asistencia']);
  }
}
