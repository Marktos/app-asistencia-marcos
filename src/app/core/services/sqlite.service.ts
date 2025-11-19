import { Injectable } from '@angular/core';
import { Capacitor } from '@capacitor/core';
import { CapacitorSQLite, SQLiteConnection, SQLiteDBConnection } from '@capacitor-community/sqlite';

@Injectable({
  providedIn: 'root'
})
export class SqliteService {
  private sqlite: SQLiteConnection = new SQLiteConnection(CapacitorSQLite);
  private db!: SQLiteDBConnection;
  private isInitialized: boolean = false;
  private readonly DB_NAME = 'asistencia.db';

  constructor() {}

  async initializeDatabase(): Promise<void> {
    if (this.isInitialized) {
      console.log('✅ Base de datos ya inicializada');
      return;
    }

    try {
      console.log('🔧 Inicializando base de datos SQLite...');

      // Crear conexión a la base de datos
      this.db = await this.sqlite.createConnection(
        this.DB_NAME,
        false,
        'no-encryption',
        1,
        false
      );

      // Abrir la base de datos
      await this.db.open();

      // Crear tablas
      await this.createTables();

      this.isInitialized = true;
      console.log('✅ Base de datos inicializada correctamente');

    } catch (error) {
      console.error('❌ Error al inicializar base de datos:', error);
      throw error;
    }
  }

  private async createTables(): Promise<void> {
    const sqlStatements = `
      -- Tabla de usuarios
      CREATE TABLE IF NOT EXISTS usuarios (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        nombre TEXT NOT NULL,
        apellido TEXT NOT NULL,
        dni TEXT UNIQUE NOT NULL,
        rol TEXT DEFAULT 'empleado',
        hora_entrada TEXT DEFAULT '08:00',
        hora_salida TEXT DEFAULT '17:00',
        activo INTEGER DEFAULT 1,
        fecha_registro TEXT DEFAULT CURRENT_TIMESTAMP
      );

      -- Tabla de asistencias
      CREATE TABLE IF NOT EXISTS asistencias (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        fecha TEXT NOT NULL,
        tipo TEXT NOT NULL,
        hora TEXT NOT NULL,
        timestamp INTEGER NOT NULL,
        latitud REAL NOT NULL,
        longitud REAL NOT NULL,
        precision REAL,
        foto TEXT NOT NULL,
        turno TEXT,
        area_nombre TEXT,
        validada_por_poligono INTEGER DEFAULT 0,
        FOREIGN KEY (user_id) REFERENCES usuarios(id)
      );

      -- Índices para mejorar el rendimiento
      CREATE INDEX IF NOT EXISTS idx_usuarios_email ON usuarios(email);
      CREATE INDEX IF NOT EXISTS idx_usuarios_dni ON usuarios(dni);
      CREATE INDEX IF NOT EXISTS idx_asistencias_user_fecha ON asistencias(user_id, fecha);
      CREATE INDEX IF NOT EXISTS idx_asistencias_timestamp ON asistencias(timestamp);
    `;

    await this.db.execute(sqlStatements);
    console.log('📊 Tablas creadas correctamente');
  }

  // ==================== USUARIOS ====================

  async createUser(user: any): Promise<number | null> {
    try {
      const sql = `
        INSERT INTO usuarios (email, password, nombre, apellido, dni, rol, hora_entrada, hora_salida)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `;

      const result = await this.db.run(sql, [
        user.email,
        user.password,
        user.nombre,
        user.apellido,
        user.dni,
        user.rol || 'empleado',
        user.hora_entrada || '08:00',
        user.hora_salida || '17:00'
      ]);

      console.log('✅ Usuario creado con ID:', result.changes?.lastId);
      return result.changes?.lastId || null;

    } catch (error) {
      console.error('❌ Error al crear usuario:', error);
      return null;
    }
  }

  async getUserByEmail(email: string): Promise<any | null> {
    try {
      const sql = 'SELECT * FROM usuarios WHERE email = ? LIMIT 1';
      const result = await this.db.query(sql, [email]);

      if (result.values && result.values.length > 0) {
        return result.values[0];
      }

      return null;
    } catch (error) {
      console.error('❌ Error al obtener usuario:', error);
      return null;
    }
  }

  async getUserById(id: number): Promise<any | null> {
    try {
      const sql = 'SELECT * FROM usuarios WHERE id = ? LIMIT 1';
      const result = await this.db.query(sql, [id]);

      if (result.values && result.values.length > 0) {
        return result.values[0];
      }

      return null;
    } catch (error) {
      console.error('❌ Error al obtener usuario:', error);
      return null;
    }
  }

  async updateUser(id: number, updates: any): Promise<boolean> {
    try {
      const fields = Object.keys(updates).map(key => `${key} = ?`).join(', ');
      const values = Object.values(updates);

      const sql = `UPDATE usuarios SET ${fields} WHERE id = ?`;
      await this.db.run(sql, [...values, id]);

      console.log('✅ Usuario actualizado');
      return true;
    } catch (error) {
      console.error('❌ Error al actualizar usuario:', error);
      return false;
    }
  }

  // ==================== ASISTENCIAS ====================

  async createAsistencia(asistencia: any): Promise<number | null> {
    try {
      const sql = `
        INSERT INTO asistencias (
          user_id, fecha, tipo, hora, timestamp,
          latitud, longitud, precision, foto, turno,
          area_nombre, validada_por_poligono
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;

      const result = await this.db.run(sql, [
        asistencia.userId,
        asistencia.fecha,
        asistencia.tipo,
        asistencia.hora,
        asistencia.timestamp,
        asistencia.ubicacion.latitud,
        asistencia.ubicacion.longitud,
        asistencia.ubicacion.precision || null,
        asistencia.foto,
        asistencia.turno || null,
        asistencia.areaNombre || null,
        asistencia.validadaPorPoligono ? 1 : 0
      ]);

      console.log('✅ Asistencia registrada con ID:', result.changes?.lastId);
      return result.changes?.lastId || null;

    } catch (error) {
      console.error('❌ Error al crear asistencia:', error);
      return null;
    }
  }

  async getAsistenciasByUser(userId: number): Promise<any[]> {
    try {
      const sql = `
        SELECT * FROM asistencias
        WHERE user_id = ?
        ORDER BY timestamp DESC
      `;

      const result = await this.db.query(sql, [userId]);
      return result.values || [];

    } catch (error) {
      console.error('❌ Error al obtener asistencias:', error);
      return [];
    }
  }

  async getAsistenciasHoy(userId: number): Promise<any[]> {
    try {
      const today = new Date().toISOString().split('T')[0];

      const sql = `
        SELECT * FROM asistencias
        WHERE user_id = ? AND fecha = ?
        ORDER BY timestamp ASC
      `;

      const result = await this.db.query(sql, [userId, today]);
      return result.values || [];

    } catch (error) {
      console.error('❌ Error al obtener asistencias de hoy:', error);
      return [];
    }
  }

  async yaRegistroEntrada(userId: number): Promise<boolean> {
    const asistencias = await this.getAsistenciasHoy(userId);
    return asistencias.some(a => a.tipo === 'entrada');
  }

  async yaRegistroSalida(userId: number): Promise<boolean> {
    const asistencias = await this.getAsistenciasHoy(userId);
    return asistencias.some(a => a.tipo === 'salida');
  }

  // ==================== UTILIDADES ====================

  async clearAllData(): Promise<void> {
    try {
      await this.db.execute('DELETE FROM asistencias');
      await this.db.execute('DELETE FROM usuarios');
      console.log('🗑️ Todos los datos han sido eliminados');
    } catch (error) {
      console.error('❌ Error al limpiar datos:', error);
    }
  }

  async closeConnection(): Promise<void> {
    try {
      await this.sqlite.closeConnection(this.DB_NAME, false);
      this.isInitialized = false;
      console.log('🔒 Conexión cerrada');
    } catch (error) {
      console.error('❌ Error al cerrar conexión:', error);
    }
  }
}
