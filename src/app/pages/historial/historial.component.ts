import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import {
  IonHeader, IonToolbar, IonTitle, IonContent, IonButtons, IonBackButton,
  IonButton, IonIcon, IonCard, IonCardContent,
  IonBadge, ModalController
} from '@ionic/angular/standalone';
import { SqliteService } from 'src/app/core/services/sqlite.service';
import { AuthService } from 'src/app/core/auth/auth.service';

@Component({
  selector: 'app-historial',
  standalone: true,
  imports: [
    CommonModule, RouterLink, IonHeader, IonToolbar, IonTitle, IonContent,
    IonButtons, IonBackButton, IonButton, IonIcon, IonCard,
   IonCardContent, IonBadge
  ],
  templateUrl: './historial.component.html',
  styleUrls: ['./historial.component.scss'],
})
export class HistorialComponent implements OnInit {
  asistencias: any[] = [];

  constructor(
    private sqlite: SqliteService,
    private auth: AuthService,
    private router: Router,
    private modalCtrl: ModalController
  ) {}

  async ngOnInit() {
    await this.loadHistorial();
  }

  async ionViewWillEnter() {
    await this.loadHistorial();
  }

  async loadHistorial() {
    const userId = this.auth.getCurrentUserId();
    if (!userId) {
      console.error('❌ No hay usuario autenticado');
      return;
    }

    // Obtener asistencias desde SQLite
    const asistenciasRaw = await this.sqlite.getAsistenciasByUser(userId);

    // Mapear los datos de SQLite al formato esperado
    this.asistencias = asistenciasRaw.map((a: any) => ({
      id: a.id,
      userId: a.user_id,
      fecha: a.fecha,
      tipo: a.tipo,
      hora: a.hora,
      timestamp: a.timestamp,
      ubicacion: {
        latitud: a.latitud,
        longitud: a.longitud,
        precision: a.precision
      },
      foto: a.foto,
      turno: a.turno,
      areaNombre: a.area_nombre,
      validadaPorPoligono: a.validada_por_poligono === 1
    }));

    console.log('📋 Historial cargado:', this.asistencias.length, 'registros');
  }

  getTurnoLabel(turno: string | null): string {
    if (!turno) return 'No especificado';

    const labels: Record<string, string> = {
      'mañana': 'Turno Mañana',
      'tarde': 'Turno Tarde',
      'noche': 'Turno Noche'
    };

    return labels[turno] || turno;
  }

  async verFoto(fotoUrl: string) {
    // Crear modal para ver la foto en grande
    const modal = await this.modalCtrl.create({
      component: FotoModalComponent,
      componentProps: {
        fotoUrl: fotoUrl
      }
    });

    await modal.present();
  }
}

// Componente Modal para ver fotos
@Component({
  selector: 'app-foto-modal',
  standalone: true,
  imports: [IonHeader, IonToolbar, IonTitle, IonContent, IonButtons, IonButton, IonIcon],
  template: `
    <ion-header>
      <ion-toolbar>
        <ion-title>Foto de Registro</ion-title>
        <ion-buttons slot="end">
          <ion-button (click)="cerrar()">
            <ion-icon name="close" slot="icon-only"></ion-icon>
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      <div style="display: flex; justify-content: center; align-items: center; height: 100%;">
        <img [src]="fotoUrl" style="max-width: 100%; max-height: 100%; object-fit: contain;">
      </div>
    </ion-content>
  `
})
export class FotoModalComponent {
  fotoUrl: string = '';

  constructor(private modalCtrl: ModalController) {}

  cerrar() {
    this.modalCtrl.dismiss();
  }
}
