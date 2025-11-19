import { Injectable } from '@angular/core';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';

@Injectable({
  providedIn: 'root'
})
export class CameraService {
  constructor() {}

  /**
   * Tomar foto con la cámara del dispositivo
   * Retorna Base64 string o null
   */
  async takePicture(): Promise<string | null> {
    try {
      // Verificar permisos
      const hasPermission = await this.checkCameraPermissions();
      if (!hasPermission) {
        throw new Error('No se otorgaron permisos de cámara');
      }

      // Capturar foto
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

      if (photo.base64String) {
        console.log('📸 Foto capturada correctamente');
        return `data:image/${photo.format};base64,${photo.base64String}`;
      }

      return null;

    } catch (error: any) {
      console.error('❌ Error al tomar foto:', error);

      // Usuario canceló la captura
      if (error.message === 'User cancelled photos app') {
        console.log('Usuario canceló la captura');
        return null;
      }

      throw error;
    }
  }

  /**
   * Verificar y solicitar permisos de cámara
   */
  async checkCameraPermissions(): Promise<boolean> {
    try {
      const permissions = await Camera.checkPermissions();

      if (permissions.camera === 'granted' && permissions.photos === 'granted') {
        return true;
      }

      // Solicitar permisos
      const requested = await Camera.requestPermissions();
      return requested.camera === 'granted' && requested.photos === 'granted';

    } catch (error) {
      console.error('❌ Error al verificar permisos:', error);
      return false;
    }
  }
}
