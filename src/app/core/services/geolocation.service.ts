import { Injectable } from '@angular/core';
import { Geolocation, Position } from '@capacitor/geolocation';
import { DatabaseService } from './database.service';
import { UbicacionValida } from '../models/asistencia.model';

@Injectable({
  providedIn: 'root'
})
export class GeolocationService {

  constructor(private db: DatabaseService) {}

  /**
   * Obtenemos la posición actual
   */
  async getCurrentPosition(): Promise<Position> {
    try {
      // Verificamos los permisos
      const hasPermission = await this.checkPermissions();
      if (!hasPermission) {
        throw new Error('No se otorgaron permisos de ubicación');
      }

      // Obtener posición con alta precisión
      const position = await Geolocation.getCurrentPosition({
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      });

      console.log('Posición obtenida:', {
        lat: position.coords.latitude,
        lng: position.coords.longitude,
        accuracy: position.coords.accuracy
      });

      return position;

    } catch (error: any) {
      console.error('Error al obtener ubicación:', error);

      if (error.message.includes('User denied')) {
        throw new Error('Permisos de ubicación denegados');
      } else if (error.message.includes('timeout')) {
        throw new Error('Tiempo de espera agotado. Verifica tu GPS.');
      } else if (error.message.includes('unavailable')) {
        throw new Error('Ubicación no disponible. Activa el GPS.');
      }

      throw new Error('No se pudo obtener la ubicación');
    }
  }

  /**
   * Verificamos y solicitamos los permisos de ubicación
   */
  async checkPermissions(): Promise<boolean> {
    try {
      const permissions = await Geolocation.checkPermissions();
      console.log('Permisos de ubicación:', permissions);

      if (permissions.location === 'granted') {
        return true;
      }

      // Solicitamos los permisos si no están otorgados
      const requested = await Geolocation.requestPermissions();
      return requested.location === 'granted';

    } catch (error) {
      console.error('Error al verificar permisos:', error);
      return false;
    }
  }

  /**
   * Validamos si la ubicación está dentro del rango permitido
   */
  async validarUbicacion(position: Position): Promise<{
    valida: boolean;
    distancia: number;
    ubicacionPermitida?: UbicacionValida;
    radioPermitido: number;
  }> {
    const ubicacionesValidas = await this.db.getUbicacionesValidas();

    if (ubicacionesValidas.length === 0) {
      console.warn('No hay ubicaciones válidas configuradas');
      return {
        valida: false,
        distancia: 0,
        radioPermitido: 0
      };
    }

    // Verifico cada ubicación válida
    for (const ubicacionValida of ubicacionesValidas) {
      const distancia = this.calcularDistancia(
        position.coords.latitude,
        position.coords.longitude,
        ubicacionValida.latitud,
        ubicacionValida.longitud
      );

      console.log(`Distancia a ${ubicacionValida.nombre}: ${distancia.toFixed(2)}m`);

      // Si está dentro del radio permitido
      if (distancia <= ubicacionValida.radio) {
        console.log(`Ubicación válida en ${ubicacionValida.nombre}`);
        return {
          valida: true,
          distancia,
          ubicacionPermitida: ubicacionValida,
          radioPermitido: ubicacionValida.radio
        };
      }
    }

    // Si no está en ninguna ubicación válida
    const ubicacionMasCercana = ubicacionesValidas[0];
    const distanciaMasCercana = this.calcularDistancia(
      position.coords.latitude,
      position.coords.longitude,
      ubicacionMasCercana.latitud,
      ubicacionMasCercana.longitud
    );

    console.log(`Fuera de rango. Distancia: ${distanciaMasCercana.toFixed(2)}m`);

    return {
      valida: false,
      distancia: distanciaMasCercana,
      ubicacionPermitida: ubicacionMasCercana,
      radioPermitido: ubicacionMasCercana.radio
    };
  }

  /**
   * Calcular distancia entre dos coordenadas usando fórmula de Haversine
   * Retorna distancia en metros
   */
  private calcularDistancia(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number {
    const R = 6371e3; // Radio de la Tierra en metros
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lon2 - lon1) * Math.PI) / 180;

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    const distancia = R * c; // Distancia en metros

    return distancia;
  }

  /**
   * Observamos los cambios de posición en tiempo real
   */
  async watchPosition(callback: (position: Position) => void): Promise<string> {
    const id = await Geolocation.watchPosition(
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      },
      (position, err) => {
        if (err) {
          console.error('Error en watchPosition:', err);
          return;
        }
        if (position) {
          callback(position);
        }
      }
    );

    return id;
  }

  /**
   * Detenemos la observación de la posición
   */
  async clearWatch(id: string): Promise<void> {
    await Geolocation.clearWatch({ id });
  }
}
