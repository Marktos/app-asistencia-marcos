import { Injectable } from '@angular/core';
import { Preferences } from '@capacitor/preferences';
import { User } from '../models/user.model';
import { Asistencia, UbicacionValida } from '../models/asistencia.model';

@Injectable({
  providedIn: 'root'
})
export class DatabaseService {

  // Keys para el storage
  private readonly USERS_KEY = 'users';
  private readonly ASISTENCIAS_KEY = 'asistencias';
  private readonly UBICACIONES_KEY = 'ubicaciones_validas';
  private readonly CURRENT_USER_KEY = 'current_user';

  constructor() {
    this.initializeDatabase();
  }

  /**
   * Inicializar base de datos con datos de prueba
   */
  private async initializeDatabase() {
    // Verificar si ya existe data
    const users = await this.getUsers();

    if (!users || users.length === 0) {
      console.log('Inicializando base de datos...');

      // Crear usuario de prueba
      const defaultUser: User = {
        id: this.generateId(),
        email: 'juan@test.com',
        password: '123456',
        nombre: 'Juan',
        apellido: 'Pérez',
        dni: '12345678',
        rol: 'empleado',
        fechaRegistro: new Date().toISOString(),
        activo: true
      };

      await this.saveUser(defaultUser);

      // Crear ubicaciones válidas
      const ubicacionesValidas: UbicacionValida[] = [
        {
          id: this.generateId(),
          nombre: 'Oficina Principal',
          latitud: -39.0333,
          longitud: -67.5833,
          radio: 100
        }
      ];

      await this.saveUbicacionesValidas(ubicacionesValidas);

      console.log('✅ Base de datos inicializada');
      console.log('👤 Usuario de prueba: juan@test.com / 123456');
    }
  }

  // ==================== USUARIOS ====================

  async getUsers(): Promise<User[]> {
    try {
      const { value } = await Preferences.get({ key: this.USERS_KEY });
      return value ? JSON.parse(value) : [];
    } catch (error) {
      console.error('Error al obtener usuarios:', error);
      return [];
    }
  }

  async getUserById(id: string): Promise<User | null> {
    const users = await this.getUsers();
    return users.find(u => u.id === id) || null;
  }

  async getUserByEmail(email: string): Promise<User | null> {
    const users = await this.getUsers();
    return users.find(u => u.email.toLowerCase() === email.toLowerCase()) || null;
  }

  async saveUser(user: User): Promise<boolean> {
    try {
      const users = await this.getUsers();

      const existingUser = users.find(u => u.email === user.email);
      if (existingUser) {
        console.error('El email ya está registrado');
        return false;
      }

      users.push(user);
      await Preferences.set({
        key: this.USERS_KEY,
        value: JSON.stringify(users)
      });

      return true;
    } catch (error) {
      console.error('Error al guardar usuario:', error);
      return false;
    }
  }

  async updateUser(userId: string, updates: Partial<User>): Promise<boolean> {
    try {
      const users = await this.getUsers();
      const index = users.findIndex(u => u.id === userId);

      if (index === -1) return false;

      users[index] = { ...users[index], ...updates };

      await Preferences.set({
        key: this.USERS_KEY,
        value: JSON.stringify(users)
      });

      return true;
    } catch (error) {
      console.error('Error al actualizar usuario:', error);
      return false;
    }
  }

  // ==================== SESIÓN ====================

  async setCurrentUser(user: User): Promise<void> {
    await Preferences.set({
      key: this.CURRENT_USER_KEY,
      value: JSON.stringify(user)
    });
  }

  async getCurrentUser(): Promise<User | null> {
    try {
      const { value } = await Preferences.get({ key: this.CURRENT_USER_KEY });
      return value ? JSON.parse(value) : null;
    } catch (error) {
      console.error('Error al obtener usuario actual:', error);
      return null;
    }
  }

  async clearCurrentUser(): Promise<void> {
    await Preferences.remove({ key: this.CURRENT_USER_KEY });
  }

  // ==================== ASISTENCIAS ====================

  async getAsistencias(): Promise<Asistencia[]> {
    try {
      const { value } = await Preferences.get({ key: this.ASISTENCIAS_KEY });
      return value ? JSON.parse(value) : [];
    } catch (error) {
      console.error('Error al obtener asistencias:', error);
      return [];
    }
  }

  async getAsistenciasByUser(userId: string): Promise<Asistencia[]> {
    const asistencias = await this.getAsistencias();
    return asistencias.filter(a => a.userId === userId)
      .sort((a, b) => b.timestamp - a.timestamp);
  }

  async getAsistenciasHoy(userId: string): Promise<Asistencia[]> {
    const today = new Date().toISOString().split('T')[0];
    const asistencias = await this.getAsistenciasByUser(userId);
    return asistencias.filter(a => a.fecha === today);
  }

  async yaRegistroEntrada(userId: string): Promise<boolean> {
    const asistenciasHoy = await this.getAsistenciasHoy(userId);
    return asistenciasHoy.some(a => a.tipo === 'entrada');
  }

  async yaRegistroSalida(userId: string): Promise<boolean> {
    const asistenciasHoy = await this.getAsistenciasHoy(userId);
    return asistenciasHoy.some(a => a.tipo === 'salida');
  }

  async saveAsistencia(asistencia: Asistencia): Promise<boolean> {
    try {
      const asistencias = await this.getAsistencias();
      asistencias.push(asistencia);

      await Preferences.set({
        key: this.ASISTENCIAS_KEY,
        value: JSON.stringify(asistencias)
      });

      console.log('✅ Asistencia guardada exitosamente');
      return true;
    } catch (error) {
      console.error('Error al guardar asistencia:', error);
      return false;
    }
  }

  async getAsistenciasMesActual(userId: string): Promise<Asistencia[]> {
    const asistencias = await this.getAsistenciasByUser(userId);
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();

    return asistencias.filter(a => {
      const fecha = new Date(a.fecha);
      return fecha.getMonth() === currentMonth && fecha.getFullYear() === currentYear;
    });
  }

  // ==================== UBICACIONES VÁLIDAS ====================

  async getUbicacionesValidas(): Promise<UbicacionValida[]> {
    try {
      const { value } = await Preferences.get({ key: this.UBICACIONES_KEY });
      return value ? JSON.parse(value) : [];
    } catch (error) {
      console.error('Error al obtener ubicaciones:', error);
      return [];
    }
  }

  async saveUbicacionesValidas(ubicaciones: UbicacionValida[]): Promise<void> {
    await Preferences.set({
      key: this.UBICACIONES_KEY,
      value: JSON.stringify(ubicaciones)
    });
  }

  // ==================== UTILIDADES ====================

  generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  async clearAllData(): Promise<void> {
    await Preferences.clear();
    console.log('🗑️ Base de datos limpiada');
  }

  async exportData(): Promise<any> {
    const users = await this.getUsers();
    const asistencias = await this.getAsistencias();
    const ubicaciones = await this.getUbicacionesValidas();

    return {
      users,
      asistencias,
      ubicaciones,
      exportDate: new Date().toISOString()
    };
  }
}
