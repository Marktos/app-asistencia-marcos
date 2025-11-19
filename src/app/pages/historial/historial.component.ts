import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButtons,
  IonBackButton,
  IonButton,
  IonIcon,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonBadge,
  IonList,
  IonItem,
  IonLabel
} from '@ionic/angular/standalone';
import { DatabaseService } from 'src/app/core/services/database.service';
import { AuthService } from 'src/app/core/auth/auth.service';
import { Asistencia } from 'src/app/core/models/asistencia.model';

@Component({
  selector: 'app-historial',
  standalone: true,
  imports: [
    CommonModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonButtons,
    IonBackButton,
    IonButton,
    IonIcon,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardContent,
    IonBadge,
    IonList,
    IonItem,
    IonLabel
  ],
  templateUrl:'./historial.component.html',
  styleUrls: ['./historial.component.scss'],
})
export class HistorialComponent implements OnInit {
  asistencias: Asistencia[] = [];

  constructor(
    private db: DatabaseService,
    private auth: AuthService,
    private router: Router
  ) {}

  async ngOnInit() {
    await this.loadHistorial();
  }

  async loadHistorial() {
    const userId = this.auth.getCurrentUserId();
    if (userId) {
      this.asistencias = await this.db.getAsistenciasByUser(userId);
      console.log('Historial cargado:', this.asistencias);
    }
  }
}
