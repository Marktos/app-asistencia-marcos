import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
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
  IonSpinner,
  IonBadge,
  LoadingController,
  AlertController,
  ToastController
} from '@ionic/angular/standalone';
import { CameraService } from '../../core/services/camara.service';
import { GeolocationService, ResultadoValidacion } from '../../core/services/geolocation.service';
import { DatabaseService } from 'src/app/core/services/database.service';
import { AuthService } from '../../core/auth/auth.service';
import { Asistencia } from '../../core/models/asistencia.model';

@Component({
  selector: 'app-registro-asistencia',
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
    IonSpinner,
    IonBadge
  ],
  templateUrl: './registro-asistencia.component.html',
  styleUrls: ['./registro-asistencia.component.scss']
})
export class RegistroAsistenciaComponent implements OnInit {
  tipo: 'entrada' | 'salida' = 'entrada';
  turno: 'mañana' | 'tarde' | 'noche' = 'mañana';

  foto: string | null = null;
  ubicacion: any = null;
  resultadoValidacion: ResultadoValidacion | null = null;

  step: 'foto' | 'ubicacion' | 'confirmacion' = 'foto';
  loading: boolean = false;

  ubicacionValida: boolean = false;
  distancia: number = 0;

  // Referencia a Date para usar en template
  Date = Date;

  constructor(
    private camera: CameraService,
    private geolocation: GeolocationService,
    private db: DatabaseService,
    private auth: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private loadingCtrl: LoadingController,
    private alertCtrl: AlertController,
    private toastCtrl: ToastController
  ) {}

  async ngOnInit() {
    // Obtenemos los parámetros de la ruta
    this.route.queryParams.subscribe(params => {
      this.tipo = params['tipo'] || 'entrada';
      this.turno = params['turno'] || 'mañana';
      console.log('📋 Tipo:', this.tipo, '| Turno:', this.turno);
    });

    // Verificar si ya registró hoy
    await this.verificarRegistroDelDia();
  }

  async verificarRegistroDelDia() {
    const userId = this.auth.getCurrentUserId();
    if (!userId) return;

    if (this.tipo === 'entrada') {
      const yaRegistro = await this.db.yaRegistroEntrada(userId);
      if (yaRegistro) {
        await this.mostrarAlerta(
          'Ya registraste entrada',
          'Ya has registrado tu entrada el día de hoy'
        );
        this.router.navigate(['/panel-asistencia']);
      }
    } else {
      const yaRegistro = await this.db.yaRegistroSalida(userId);
      if (yaRegistro) {
        await this.mostrarAlerta(
          'Ya registraste salida',
          'Ya has registrado tu salida el día de hoy'
        );
        this.router.navigate(['/panel-asistencia']);
      }
    }
  }

  async tomarFoto() {
    try {
      this.loading = true;

      // Verificar permisos
      const hasPermission = await this.camera.checkCameraPermissions();
      if (!hasPermission) {
        await this.mostrarAlerta(
          'Permisos requeridos',
          'Necesitas otorgar permisos de cámara para continuar'
        );
        this.loading = false;
        return;
      }

      // Tomar foto
      const foto = await this.camera.takePicture();

      if (foto) {
        this.foto = foto;
        this.step = 'ubicacion';
        console.log('📸 Foto capturada');
      }

    } catch (error) {
      console.error('❌ Error al tomar foto:', error);
      await this.mostrarAlerta('Error', 'No se pudo tomar la foto');
    } finally {
      this.loading = false;
    }
  }

  async obtenerUbicacion() {
    const loading = await this.loadingCtrl.create({
      message: 'Obteniendo ubicación...',
      spinner: 'crescent'
    });
    await loading.present();

    try {
      // Obtener ubicación actual
      this.ubicacion = await this.geolocation.getCurrentPosition();
      console.log('📍 Ubicación obtenida:', this.ubicacion);

      // Validar ubicación (usa polígonos de Turf.js)
      this.resultadoValidacion = await this.geolocation.validarUbicacion(this.ubicacion);
      this.ubicacionValida = this.resultadoValidacion.valida;
      this.distancia = this.resultadoValidacion.distancia;

      console.log('✅ Resultado validación:', this.resultadoValidacion);

      if (this.ubicacionValida) {
        this.step = 'confirmacion';

        const mensaje = this.resultadoValidacion.dentroDePoligono
          ? `Ubicación verificada en ${this.resultadoValidacion.areaNombre}`
          : `Ubicación válida (${this.resultadoValidacion.distancia.toFixed(0)}m del punto)`;

        await this.mostrarToast(mensaje, 'success');
      } else {
        const mensaje = this.resultadoValidacion.areaNombre
          ? `Estás a ${this.resultadoValidacion.distancia.toFixed(0)}m de ${this.resultadoValidacion.areaNombre}. Debes estar dentro del área permitida.`
          : `Estás fuera del área permitida. Distancia: ${this.resultadoValidacion.distancia.toFixed(0)}m`;

        await this.mostrarAlerta('Ubicación inválida', mensaje);
      }

    } catch (error: any) {
      console.error('❌ Error al obtener ubicación:', error);
      await this.mostrarAlerta(
        'Error de ubicación',
        error.message || 'No se pudo obtener tu ubicación'
      );
    } finally {
      await loading.dismiss();
    }
  }

  async confirmarRegistro() {
    if (!this.foto || !this.ubicacion || !this.ubicacionValida) {
      await this.mostrarAlerta('Error', 'Faltan datos para completar el registro');
      return;
    }

    const loading = await this.loadingCtrl.create({
      message: 'Guardando asistencia...',
      spinner: 'crescent'
    });
    await loading.present();

    try {
      const userId = this.auth.getCurrentUserId();
      if (!userId) throw new Error('Usuario no autenticado');

      const now = new Date();
      const asistencia: Asistencia = {
        id: this.db.generateId(),
        userId: userId,
        fecha: now.toISOString().split('T')[0], // YYYY-MM-DD
        tipo: this.tipo,
        hora: now.toTimeString().split(' ')[0], // HH:mm:ss
        timestamp: now.getTime(),
        ubicacion: {
          latitud: this.ubicacion.coords.latitude,
          longitud: this.ubicacion.coords.longitude,
          precisión: this.ubicacion.coords.accuracy
        },
        foto: this.foto,
        turno: this.turno,
        areaNombre: this.resultadoValidacion?.areaNombre,
        validadaPorPoligono: this.resultadoValidacion?.dentroDePoligono
      };

      const guardado = await this.db.saveAsistencia(asistencia);

      if (guardado) {
        await this.mostrarToast(
          `${this.tipo === 'entrada' ? 'Entrada' : 'Salida'} registrada exitosamente`,
          'success'
        );
        this.router.navigate(['/panel-asistencia']);
      } else {
        throw new Error('No se pudo guardar la asistencia');
      }

    } catch (error) {
      console.error('❌ Error al guardar asistencia:', error);
      await this.mostrarAlerta('Error', 'No se pudo guardar la asistencia');
    } finally {
      await loading.dismiss();
    }
  }

  retroceder() {
    if (this.step === 'ubicacion') {
      this.step = 'foto';
      this.ubicacion = null;
      this.resultadoValidacion = null;
    } else if (this.step === 'confirmacion') {
      this.step = 'ubicacion';
    }
  }

  cancelar() {
    this.router.navigate(['/panel-asistencia']);
  }

  private async mostrarAlerta(header: string, message: string) {
    const alert = await this.alertCtrl.create({
      header,
      message,
      buttons: ['OK']
    });
    await alert.present();
  }

  private async mostrarToast(message: string, color: string) {
    const toast = await this.toastCtrl.create({
      message,
      duration: 3000,
      color,
      position: 'top'
    });
    await toast.present();
  }

  getTurnoLabel(): string {
    const labels: Record<string, string> = {
      'mañana': 'Turno Mañana',
      'tarde': 'Turno Tarde',
      'noche': 'Turno Noche'
    };
    return labels[this.turno] || this.turno;
  }
}
