import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import {
  IonContent, IonCard, IonCardContent, IonIcon, IonButton,
  IonHeader, IonToolbar, IonTitle, IonButtons, IonBadge,
  AlertController, IonModal } from '@ionic/angular/standalone';
import { AuthService } from 'src/app/core/auth/auth.service';
import { SqliteService } from 'src/app/core/services/sqlite.service';

@Component({
  standalone: true,
  imports: [IonModal,
    CommonModule, RouterLink, IonContent, IonCard, IonCardContent,
    IonIcon, IonButton, IonHeader, IonToolbar, IonTitle,
    IonButtons, IonBadge
  ],
  selector: 'app-asistencia-panel',
  templateUrl: './asistencia-panel.component.html',
  styleUrls: ['./asistencia-panel.component.scss'],
})
export class AsistenciaPanelComponent implements OnInit {
  currentDate: Date = new Date();
  currentUser: any = null;

  // Control de registros
  yaRegistroEntrada: boolean = false;
  yaRegistroSalida: boolean = false;
  horaEntrada: string = '--:--';
  horaSalida: string = '--:--';

  // Estadísticas
  totalAsistenciasMes: number = 0;

  constructor(
    private authService: AuthService,
    private sqlite: SqliteService,
    private router: Router,
    private alertController: AlertController
  ) {}

  async ngOnInit() {
    // Cargar datos del usuario
    await this.loadUserData();

    // Cargar datos de asistencia del día
    await this.loadAsistenciasHoy();

    // Cargar estadísticas
    await this.loadEstadisticas();

    // Actualizar fecha cada minuto
    setInterval(() => {
      this.currentDate = new Date();
    }, 60000);
  }

  // Cargar datos del usuario actual
  async loadUserData() {
    this.currentUser = this.authService.currentUser;
    console.log('👤 Usuario actual:', this.currentUser);
  }

  // Cargar asistencias del día de hoy
  async loadAsistenciasHoy() {
    const userId = this.authService.getCurrentUserId();
    if (!userId) return;

    // Obtener asistencias de hoy
    const asistencias = await this.sqlite.getAsistenciasHoy(userId);

    // Verificar si ya registró entrada y salida
    this.yaRegistroEntrada = asistencias.some(a => a.tipo === 'entrada');
    this.yaRegistroSalida = asistencias.some(a => a.tipo === 'salida');

    // Obtener horas de entrada y salida
    const entrada = asistencias.find(a => a.tipo === 'entrada');
    const salida = asistencias.find(a => a.tipo === 'salida');

    this.horaEntrada = entrada ? entrada.hora.substring(0, 5) : '--:--';
    this.horaSalida = salida ? salida.hora.substring(0, 5) : '--:--';
  }

  // Cargar estadísticas del mes
  async loadEstadisticas() {
    const userId = this.authService.getCurrentUserId();
    if (!userId) return;

    const asistencias = await this.sqlite.getAsistenciasByUser(userId);

    // Filtrar asistencias del mes actual
    const mesActual = new Date().getMonth();
    const anioActual = new Date().getFullYear();

    const asistenciasMes = asistencias.filter(a => {
      const fecha = new Date(a.fecha);
      return fecha.getMonth() === mesActual && fecha.getFullYear() === anioActual;
    });

    // Contar solo las entradas (para no duplicar)
    this.totalAsistenciasMes = asistenciasMes.filter(a => a.tipo === 'entrada').length;
  }

  // Registrar entrada
  async registrarEntrada() {
    // Verificar si ya registró entrada
    if (this.yaRegistroEntrada) {
      await this.mostrarAlerta(
        'Ya registraste entrada',
        'Ya has registrado tu entrada el día de hoy'
      );
      return;
    }

    // Navegar a registro de asistencia
    this.router.navigate(['/registro-asistencia'], {
      queryParams: { tipo: 'entrada' }
    });
  }

  // Registrar salida
  async registrarSalida() {
    // Verificar si no ha registrado entrada
    if (!this.yaRegistroEntrada) {
      await this.mostrarAlerta(
        'Primero registra entrada',
        'Debes registrar tu entrada antes de registrar la salida'
      );
      return;
    }

    // Verificar si ya registró salida
    if (this.yaRegistroSalida) {
      await this.mostrarAlerta(
        'Ya registraste salida',
        'Ya has registrado tu salida el día de hoy'
      );
      return;
    }

    // Navegar a registro de asistencia
    this.router.navigate(['/registro-asistencia'], {
      queryParams: { tipo: 'salida' }
    });
  }

  // Cerrar sesión
  async logout() {
    const alert = await this.alertController.create({
      header: 'Cerrar Sesión',
      message: '¿Estás seguro que deseas cerrar sesión?',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Salir',
          role: 'confirm',
          handler: async () => {
            await this.authService.logout();
            this.router.navigate(['/']);
          }
        }
      ]
    });

    await alert.present();
  }

  // Método auxiliar para mostrar alertas
  private async mostrarAlerta(header: string, message: string) {
    const alert = await this.alertController.create({
      header,
      message,
      buttons: ['OK']
    });
    await alert.present();
  }
}
