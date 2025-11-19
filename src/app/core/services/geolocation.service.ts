import { Injectable } from '@angular/core';
import { Geolocation, Position } from '@capacitor/geolocation';
import { DatabaseService } from './database.service';
import { UbicacionValida } from '../models/asistencia.model';
import { booleanPointInPolygon, point } from '@turf/turf';
import { areasPermitidas, AreaPermitida } from '../config/areas-permitidas';

export interface ResultadoValidacion {
  valida: boolean;
  distancia: number;
  ubicacionPermitida?: UbicacionValida | AreaPermitida;
  radioPermitido: number;
  dentroDePoligono: boolean;
  areaNombre?: string;
}

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
      console.log('🔐 Permisos de ubicación:', permissions);

      if (permissions.location === 'granted') {
        return true;
      }

      const requested = await Geolocation.requestPermissions();
      return requested.location === 'granted';

    } catch (error) {
      console.error('❌ Error al verificar permisos:', error);
      return false;
    }
  }

  /**
   * Validamos si la ubicación está dentro del rango permitido
   * Ahora usa POLÍGONOS de Turf.js como validación principal
   */
  async validarUbicacion(position: Position): Promise<ResultadoValidacion> {
    const lat = position.coords.latitude;
    const lng = position.coords.longitude;

    console.log('🔍 Validando ubicación:', { lat, lng });

    // Crear punto del usuario
    const puntoUsuario = point([lng, lat]); // Turf usa [lng, lat]

    // 1. VALIDACIÓN CON POLÍGONOS (Turf.js)
    for (const area of areasPermitidas) {
      const estaDentro = booleanPointInPolygon(puntoUsuario, area.polygon);

      if (estaDentro) {
        const distanciaAlCentro = this.calcularDistancia(
          lat, lng,
          area.centro.lat, area.centro.lng
        );

        console.log(`✅ Usuario dentro del polígono: ${area.nombre}`);
        console.log(`📏 Distancia al centro: ${distanciaAlCentro.toFixed(2)}m`);

        return {
          valida: true,
          distancia: distanciaAlCentro,
          ubicacionPermitida: area,
          radioPermitido: 100, // Radio informativo
          dentroDePoligono: true,
          areaNombre: area.nombre
        };
      }
    }

    // 2. FALLBACK: Validación por radio circular (ubicaciones guardadas en DB)
    console.log('⚠️ No está en polígono, verificando por radio...');

    const ubicacionesValidas = await this.db.getUbicacionesValidas();

    if (ubicacionesValidas.length === 0) {
      console.warn('⚠️ No hay ubicaciones válidas configuradas');
      return {
        valida: false,
        distancia: 0,
        radioPermitido: 100,
        dentroDePoligono: false
      };
    }

    // Verificar cada ubicación válida
    for (const ubicacionValida of ubicacionesValidas) {
      const distancia = this.calcularDistancia(
        lat, lng,
        ubicacionValida.latitud,
        ubicacionValida.longitud
      );

      console.log(`📏 Distancia a ${ubicacionValida.nombre}: ${distancia.toFixed(2)}m`);

      if (distancia <= ubicacionValida.radio) {
        console.log(`✅ Ubicación válida en ${ubicacionValida.nombre} (por radio)`);
        return {
          valida: true,
          distancia,
          ubicacionPermitida: ubicacionValida,
          radioPermitido: ubicacionValida.radio,
          dentroDePoligono: false,
          areaNombre: ubicacionValida.nombre
        };
      }
    }

    // 3. Usuario fuera de rango
    const ubicacionMasCercana = ubicacionesValidas[0];
    const distanciaMasCercana = this.calcularDistancia(
      lat, lng,
      ubicacionMasCercana.latitud,
      ubicacionMasCercana.longitud
    );

    console.log(`❌ Fuera de rango. Distancia: ${distanciaMasCercana.toFixed(2)}m`);

    return {
      valida: false,
      distancia: distanciaMasCercana,
      ubicacionPermitida: ubicacionMasCercana,
      radioPermitido: ubicacionMasCercana.radio,
      dentroDePoligono: false
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

    const distancia = R * c;

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

  /**
   * Obtener lista de áreas permitidas
   */
  getAreasPermitidas(): AreaPermitida[] {
    return areasPermitidas;
  }
}
