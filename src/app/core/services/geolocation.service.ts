import { Injectable } from '@angular/core';
import { Geolocation } from '@capacitor/geolocation';

@Injectable({
  providedIn: 'root'
})
export class GeolocationService {

  constructor() {}

  // Obtenemos la ubicación actual del dispositivo
  async getCurrentPosition(): Promise<any> {
    try {
      // Verificamos permisos
      const hasPermission = await this.checkPermissions();
      if (!hasPermission) {
        throw new Error('No se otorgaron permisos de ubicación');
      }

      const USAR_UBICACION_MOCK = true;
      if (USAR_UBICACION_MOCK) {
        console.log('Usando ubicación de prueba');
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

      // Obtener ubicación real del GPS
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

  // Verificamos y solicitamos permisos de ubicación
  async checkPermissions(): Promise<boolean> {
    try {
      const permissions = await Geolocation.checkPermissions();

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

  // Validar si la ubicación está dentro del área permitida
  async validarUbicacion(coords: any): Promise<{
    valida: boolean;
    distancia: number;
    mensaje: string;
    ubicacionNombre?: string;
  }> {
    // Coordenadas de la oficina
    const oficinaLat = -39.0333;
    const oficinaLng = -67.5833;
    const radioPermitido = 500; // metros
    const diffLat = Math.abs(coords.latitude - oficinaLat);
    const diffLng = Math.abs(coords.longitude - oficinaLng);

    // Convertimos a metros
    const distanciaLat = diffLat * 111000;
    const distanciaLng = diffLng * 111000;

    // Calculo distancia total
    const distancia = Math.sqrt((distanciaLat * distanciaLat) + (distanciaLng * distanciaLng));

    console.log('Distancia calculada:', distancia.toFixed(2), 'metros');
    console.log('Tu ubicación:', coords.latitude, coords.longitude);
    console.log('Oficina:', oficinaLat, oficinaLng);

    // Verificar si está dentro del rango
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
