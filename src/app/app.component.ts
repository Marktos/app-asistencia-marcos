import { Component, OnInit } from '@angular/core';
import { IonApp, IonRouterOutlet, Platform } from '@ionic/angular/standalone';
import { AuthService } from './core/auth/auth.service';
import { SqliteService } from './core/services/sqlite.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  imports: [IonApp, IonRouterOutlet],
})
export class AppComponent implements OnInit {
  constructor(
    private platform: Platform,
    private authService: AuthService,
    private sqlite: SqliteService
  ) {}

  async ngOnInit() {
    await this.platform.ready();
    await this.initializeApp();
  }

  private async initializeApp() {
    try {
      console.log('Inicializando aplicación...');

      // Inicializar SQLite
      await this.sqlite.initializeDatabase();

      // Inicializar Auth (carga sesión)
      await this.authService.initializeAuth();

      console.log('Aplicación inicializada correctamente');

    } catch (error) {
      console.error('Error al inicializar aplicación:', error);
    }
  }
}
