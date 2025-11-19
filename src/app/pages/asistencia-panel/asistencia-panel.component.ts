import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import {
  IonContent, IonCard, IonCardContent, IonIcon, IonButton,
  IonHeader, IonToolbar, IonTitle, IonButtons, IonBadge,
  AlertController
} from '@ionic/angular/standalone';
import { AuthService } from 'src/app/core/auth/auth.service';
import { SqliteService } from 'src/app/core/services/sqlite.service';

@Component({
  standalone: true,
  imports: [
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
    await this.loadUserData();
    await this.loadAsistenciasHoy();
    await this.loadEstadisticas();

    // Actualizar fecha cada minuto
    setInterval(() => {
      this.currentDate = new Date();
    }, 60000);
  }

  async ionViewWillEnter() {
    // Recargar datos cada vez que se entra a la vista
    await this.loadAsistenciasHoy();
    await this.loadEstadisticas();
  }

  // Cargar datos del usuario
  async loadUserData() {
    this.currentUser = this.authService.currentUser;
    console.log('👤 Usuario actual:', this.currentUser);
  }

  // Cargar asistencias del día
  async loadAsistenciasHoy() {
    const userId = this.authService.getCurrentUserId();
    if (!userId) return;

    // Obtener asistencias de hoy desde SQLite
    const asistencias = await this.sqlite.getAsistenciasHoy(userId);

    // Verificar registros
    this.yaRegistroEntrada = asistencias.some(a => a.tipo === 'entrada');
    this.yaRegistroSalida = asistencias.some(a => a.tipo === 'salida');

    // Obtener horas
    const entrada = asistencias.find(a => a.tipo === 'entrada');
    const salida = asistencias.find(a => a.tipo === 'salida');

    this.horaEntrada = entrada ? entrada.hora.substring(0, 5) : '--:--';
    this.horaSalida = salida ? salida.hora.substring(0, 5) : '--:--';

    console.log('📊 Asistencias hoy:', {
      entrada: this.yaRegistroEntrada,
      salida: this.yaRegistroSalida
    });
  }

  // Cargar estadísticas del mes
  async loadEstadisticas() {
    const userId = this.authService.getCurrentUserId();
    if (!userId) return;

    const asistencias = await this.sqlite.getAsistenciasByUser(userId);

    // Filtrar asistencias del mes actual
    const mesActual = new Date().getMonth();
    const anioActual = new Date().getFullYear();

    const asistenciasMes = asistencias.filter((a: any) => {
      const fecha = new Date(a.fecha);
      return fecha.getMonth() === mesActual && fecha.getFullYear() === anioActual;
    });

    // Contar solo las entradas
    this.totalAsistenciasMes = asistenciasMes.filter((a: any) => a.tipo === 'entrada').length;

    console.log('📈 Asistencias del mes:', this.totalAsistenciasMes);
  }

  // Registrar entrada
  async registrarEntrada() {
    if (this.yaRegistroEntrada) {
      await this.mostrarAlerta(
        'Ya registraste entrada',
        'Ya has registrado tu entrada el día de hoy'
      );
      return;
    }

    this.router.navigate(['/registro-asistencia'], {
      queryParams: { tipo: 'entrada' }
    });
  }

  // Registrar salida
  async registrarSalida() {
    if (!this.yaRegistroEntrada) {
      await this.mostrarAlerta(
        'Primero registra entrada',
        'Debes registrar tu entrada antes de registrar la salida'
      );
      return;
    }

    if (this.yaRegistroSalida) {
      await this.mostrarAlerta(
        'Ya registraste salida',
        'Ya has registrado tu salida el día de hoy'
      );
      return;
    }

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

  // Mostrar alerta
  private async mostrarAlerta(header: string, message: string) {
    const alert = await this.alertController.create({
      header,
      message,
      buttons: ['OK']
    });
    await alert.present();
  }
}
