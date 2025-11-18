export interface Asistencia {
  id: string;
  userId: string;
  fecha: string; // YYYY-MM-DD
  tipo: 'entrada' | 'salida';
  hora: string; // HH:mm:ss
  timestamp: number;
  ubicacion: Ubicacion;
  foto: string;
  turno?: string; // 'mañana' | 'tarde' | 'noche'
}

export interface Ubicacion {
  latitud: number;
  longitud: number;
  precisión?: number;
}

export interface UbicacionValida {
  id: string;
  nombre: string;
  latitud: number;
  longitud: number;
  radio: number;
}

export interface RegistroAsistenciaRequest {
  tipo: 'entrada' | 'salida';
  ubicacion: Ubicacion;
  foto: string;
  turno?: string;
}
