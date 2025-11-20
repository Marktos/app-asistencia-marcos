import { Injectable } from '@angular/core';
import { Geolocation } from '@capacitor/geolocation';

@Injectable({
  providedIn: 'root'
})
export class GeolocationService {

  constructor() {}

  // Obtener la ubicación actual
async getCurrentPosition(): Promise<any> {
  try {
    // Pedimo permisos
    const hasPermission = await this.checkPermissions();
    if (!hasPermission) {
      throw new Error('No se otorgaron permisos de ubicación');
    }

    const USAR_UBICACION_MOCK = true;
    if (USAR_UBICACION_MOCK) {
      console.log('Usando ubicación MOCK de General Roca');
      return {
        latitude: -39.0333,
        longitude: -67.5833,
        accuracy: 10,
        altitude: null,
        altitudeAccuracy: null,
        heading: null,
        speed: null
      };
    }

    // Ubicación real del dispositivo
    const position = await Geolocation.getCurrentPosition({
      enableHighAccuracy: true,
      timeout: 10000
    });

    console.log('Ubicación obtenida:', position.coords);
    return position.coords;

  } catch (error: any) {
    console.error('Error al obtener ubicación:', error);
    throw new Error('No se pudo obtener la ubicación');
  }
}

  // Verificar los permisos de ubicación
  async checkPermissions(): Promise<boolean> {
    try {
      const permissions = await Geolocation.checkPermissions();

      if (permissions.location === 'granted') {
        return true;
      }

      // Solicitamos los permisos
      const requested = await Geolocation.requestPermissions();
      return requested.location === 'granted';

    } catch (error) {
      console.error('Error al verificar permisos:', error);
      return false;
    }
  }

  // Validar si está cerca de la oficina
  async validarUbicacion(coords: any): Promise<{
    valida: boolean;
    distancia: number;
    mensaje: string;
    ubicacionNombre?: string;
  }> {
    // Coordenadas de General Roca
    const oficinaLat = -39.0333;
    const oficinaLng = -67.5833;
    const radioPermitido = 500;

    // Calcular diferencias
    const diffLat = Math.abs(coords.latitude - oficinaLat);
    const diffLng = Math.abs(coords.longitude - oficinaLng);

    // Calcular distancia aproximada en metros
    const distanciaLat = diffLat * 111000;
    const distanciaLng = diffLng * 111000;
    const distancia = Math.sqrt((distanciaLat * distanciaLat) + (distanciaLng * distanciaLng));

    console.log('Distancia calculada:', distancia.toFixed(2), 'metros');
    console.log('Tu ubicación:', coords.latitude, coords.longitude);
    console.log('Oficina:', oficinaLat, oficinaLng);

    // Validar si está dentro del rango
    if (distancia <= radioPermitido) {
      return {
        valida: true,
        distancia: distancia,
        mensaje: 'Ubicación válida en Oficina Principal',
        ubicacionNombre: 'Oficina Principal'
      };
    } else {
      return {
        valida: false,
        distancia: distancia,
        mensaje: `Estás a ${distancia.toFixed(0)}m de la oficina. Debes estar dentro de ${radioPermitido}m`
      };
    }
  }
}
