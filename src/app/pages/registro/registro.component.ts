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
import { GeolocationService } from '../../core/services/geolocation.service';
import { DatabaseService } from '../../core/services/database.service';
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
  turno: string = '';

  foto: string | null = null;
  ubicacion: any = null;

  step: 'foto' | 'ubicacion' | 'confirmacion' = 'foto';
  loading: boolean = false;

  ubicacionValida: boolean = false;
  distancia: number = 0;

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
      this.turno = params['turno'] || '';
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
        console.log('Foto capturada');
      }

    } catch (error) {
      console.error('Error al tomar foto:', error);
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
      console.log('Ubicación obtenida:', this.ubicacion);

      // Validar ubicación
      const resultado = await this.geolocation.validarUbicacion(this.ubicacion);
      this.ubicacionValida = resultado.valida;
      this.distancia = resultado.distancia;

      if (this.ubicacionValida) {
        this.step = 'confirmacion';
        console.log('Ubicación válida');
      } else {
        await this.mostrarAlerta(
          'Ubicación inválida',
          `Estás a ${resultado.distancia.toFixed(0)}m de la oficina. Debes estar dentro del radio permitido (${resultado.radioPermitido}m).`
        );
      }

    } catch (error: any) {
      console.error('Error al obtener ubicación:', error);
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
          latitud: this.ubicacion.latitude,
          longitud: this.ubicacion.longitude,
          precisión: this.ubicacion.accuracy
        },
        foto: this.foto,
        turno: this.turno
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
      console.error('Error al guardar asistencia:', error);
      await this.mostrarAlerta('Error', 'No se pudo guardar la asistencia');
    } finally {
      await loading.dismiss();
    }
  }

  retroceder() {
    if (this.step === 'ubicacion') {
      this.step = 'foto';
      this.foto = null;
    } else if (this.step === 'confirmacion') {
      this.step = 'ubicacion';
      this.ubicacion = null;
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
}
