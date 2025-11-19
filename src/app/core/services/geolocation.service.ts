import { Injectable } from '@angular/core';
import { Geolocation, Position } from '@capacitor/geolocation';
import { booleanPointInPolygon, point } from '@turf/turf';
import { areasPermitidas, AreaPermitida } from '../config/areas-permitidas';

export interface ResultadoValidacion {
  valida: boolean;
  distancia: number;
  ubicacionPermitida?: AreaPermitida;
  radioPermitido: number;
  dentroDePoligono: boolean;
  areaNombre?: string;
}

@Injectable({
  providedIn: 'root'
})
export class GeolocationService {

  constructor() {}

  /**
   * Obtiene la posición actual del usuario
   */
  async getCurrentPosition(): Promise<Position> {
    try {
      const hasPermission = await this.checkPermissions();
      if (!hasPermission) {
        throw new Error('No se otorgaron permisos de ubicación');
      }

      const position = await Geolocation.getCurrentPosition({
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0
      });

      console.log('📍 Posición obtenida:', {
        lat: position.coords.latitude,
        lng: position.coords.longitude,
        accuracy: position.coords.accuracy
      });

      return position;

    } catch (error: any) {
      console.error('❌ Error al obtener ubicación:', error);

      if (error.message?.includes('denied')) {
        throw new Error('Permisos de ubicación denegados');
      } else if (error.message?.includes('timeout')) {
        throw new Error('Tiempo de espera agotado. Verifica tu GPS.');
      } else if (error.message?.includes('unavailable')) {
        throw new Error('Ubicación no disponible. Activa el GPS.');
      }

      throw new Error('No se pudo obtener la ubicación');
    }
  }

  /**
   * Verifica y solicita permisos de ubicación
   */
  async checkPermissions(): Promise<boolean> {
    try {
      const permissions = await Geolocation.checkPermissions();
      console.log('🔐 Permisos de ubicación:', permissions);

      if (permissions.location === 'granted') return true;

      const requested = await Geolocation.requestPermissions();
      return requested.location === 'granted';

    } catch (error) {
      console.error('❌ Error verificando permisos:', error);
      return false;
    }
  }

  /**
   * Valida si la ubicación está dentro de un ÁREA PERMITIDA (polígono)
   */
  async validarUbicacion(position: Position): Promise<ResultadoValidacion> {
    const lat = position.coords.latitude;
    const lng = position.coords.longitude;

    console.log('🔍 Validando ubicación:', { lat, lng });

    // Punto actual del usuario
    const puntoUsuario = point([lng, lat]);

    // Recorrer todas las áreas permitidas
    for (const area of areasPermitidas) {
      const dentro = booleanPointInPolygon(puntoUsuario, area.polygon);

      if (dentro) {
        const distancia = this.calcularDistancia(
          lat, lng,
          area.centro.lat, area.centro.lng
        );

        console.log(`✅ Usuario dentro de: ${area.nombre}`);
        console.log(`📏 Distancia al centro: ${distancia.toFixed(2)}m`);

        return {
          valida: true,
          distancia,
          ubicacionPermitida: area,
          radioPermitido: 100,
          dentroDePoligono: true,
          areaNombre: area.nombre
        };
      }
    }

    // No coincide con ninguna área → ubicación inválida
    console.warn('❌ Usuario fuera de todas las áreas permitidas');

    return {
      valida: false,
      distancia: 0,
      radioPermitido: 100,
      dentroDePoligono: false
    };
  }

  /**
   * Calcula distancia entre dos coordenadas con Haversine
   */
  private calcularDistancia(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371e3;
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lon2 - lon1) * Math.PI / 180;

    const a =
      Math.sin(Δφ / 2) ** 2 +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) ** 2;

    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  }

  /**
   * Observa cambios de posición en tiempo real
   */
  async watchPosition(callback: (position: Position) => void): Promise<string> {
    return await Geolocation.watchPosition(
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
  }

  /**
   * Detener observación de posición
   */
  async clearWatch(id: string): Promise<void> {
    await Geolocation.clearWatch({ id });
  }

  /**
   * Retorna todas las áreas permitidas
   */
  getAreasPermitidas(): AreaPermitida[] {
    return areasPermitidas;
  }
}
