import { AfterViewInit, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
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
  IonBadge,
  AlertController
} from '@ionic/angular/standalone';
import { AuthService } from 'src/app/core/auth/auth.service';
import { User } from 'src/app/core/models/user.model';

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
  currentUser: User | null = null;

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

  constructor(
    private authService: AuthService,
    private router: Router,
    private alertController: AlertController
  ) {}

  ngOnInit() {
    this.loadUserData();
    setInterval(() => {
      this.currentDate = new Date();
    }, 60000);
  }

  ngAfterViewInit(): void {
    this.presentingElement = document.querySelector('ion-app');
  }

  loadUserData() {
    this.currentUser = this.authService.currentUserValue;
    console.log('Usuario actual:', this.currentUser);
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

  async comenzarTurno() {
    console.log('Comenzando turno:', this.turnoSeleccionado);

    // Verificar si ya registró entrada hoy
    const userId = this.authService.getCurrentUserId();
    if (!userId) return;

    const yaRegistroEntrada = await this.db.yaRegistroEntrada(userId);
    const yaRegistroSalida = await this.db.yaRegistroSalida(userId);

    let tipo: 'entrada' | 'salida' = 'entrada';

    if (yaRegistroEntrada && !yaRegistroSalida) {
      tipo = 'salida';
    } else if (yaRegistroEntrada && yaRegistroSalida) {
      await this.alertController.create({
        header: 'Ya registraste hoy',
        message: 'Ya has completado tu entrada y salida del día de hoy.',
        buttons: ['OK']
      }).then(alert => alert.present());
      this.modalOpen = false;
      return;
    }

    this.modalOpen = false;

    // Navegar a registro de asistencia
    this.router.navigate(['/registro-asistencia'], {
      queryParams: {
        tipo: tipo,
        turno: this.turnoSeleccionado.titulo
      }
    });
  }

  openMenu() {
    console.log('Abrir menú');
    // TODO: Implementar menú lateral
  }

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
}
