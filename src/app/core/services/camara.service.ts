import { Injectable } from '@angular/core';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';

@Injectable({
  providedIn: 'root', // Este servicio estará disponible en toda la aplicación sin necesidad de declararlo en módulos
})
export class CameraService {
  constructor() {}

  /**
   * Método para tomar una foto usando la cámara del dispositivo.
   * Devuelve un string Base64 o null.
   */
  async takePicture(): Promise<string | null> {
    try {
      // Primero verificamos si la app tiene permisos para usar la cámara
      const hasPermission = await this.checkPermissions();
      if (!hasPermission) {
        throw new Error('No se otorgaron permisos de cámara');
      }

      // Abrimos la cámara del dispositivo para capturar una imagen
      const photo = await Camera.getPhoto({
        quality: 80,
        allowEditing: false,
        resultType: CameraResultType.Base64,
        source: CameraSource.Camera,
        saveToGallery: false,
        width: 800,
        height: 800,
        correctOrientation: true,
      });

      // Si la foto fue capturada correctamente, viene con la propiedad base64String
      if (photo.base64String) {
        console.log('Foto capturada correctamente');
        // Se arma el string completo del recurso Base64
        return `data:image/${photo.format};base64,${photo.base64String}`;
      }
      // Si la foto no tiene base64String, devolvemos null
      return null;
    } catch (error: any) {
      console.error('Error al tomar foto:', error);
      // Cuando el usuario cancela la captura, Camera lanza este mensaje específico
      if (error.message === 'User cancelled photos app') {
        console.log('Usuario canceló la captura');
        return null;
      }
      throw error;
    }
  }

  /**
   * Verifica y solicita permisos de cámara y fotos.
   * Devuelve true si ambos permisos fueron otorgados.
   */
  async checkPermissions(): Promise<boolean> {
    try {
      const permissions = await Camera.checkPermissions();
      // Si la app ya tiene permisos, no hace falta pedirlos nuevamente
      if (
        permissions.camera === 'granted' &&
        permissions.photos === 'granted'
      ) {
        return true;
      }
      // Si no tiene permisos suficientes, los solicita al usuario
      const requested = await Camera.requestPermissions();
      return requested.camera === 'granted' && requested.photos === 'granted';
    } catch (error) {
      console.error('Error al verificar permisos de cámara:', error);
      return false;
    }
  }
}
