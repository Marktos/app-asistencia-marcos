import { Injectable } from '@angular/core';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';

@Injectable({
  providedIn: 'root'
})
export class CameraService {
  constructor() {}

  // Sacamos una foto con la cámara del dispositivo
  async takePicture(): Promise<string | null> {
    try {
      // Verificamos los permisos antes de sacar la foto
      const hasPermission = await this.checkCameraPermissions();
      if (!hasPermission) {
        throw new Error('No se otorgaron permisos de cámara');
      }

      // Sacamos la foto
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
        console.log('Foto capturada correctamente');
        return `data:image/${photo.format};base64,${photo.base64String}`;
      }

      return null;

    } catch (error: any) {
      console.error('Error al tomar foto:', error);

      // Si el usuario canceló la foto
      if (error.message === 'User cancelled photos app') {
        console.log('Usuario canceló la foto');
        return null;
      }

      throw error;
    }
  }

  // Verificamos y solicitamos los permisos de cámara
  async checkCameraPermissions(): Promise<boolean> {
    try {
      const permissions = await Camera.checkPermissions();

      if (permissions.camera === 'granted' && permissions.photos === 'granted') {
        return true;
      }

      // Solicitamos permisos
      const requested = await Camera.requestPermissions();
      return requested.camera === 'granted' && requested.photos === 'granted';

    } catch (error) {
      console.error('Error al verificar permisos:', error);
      return false;
    }
  }
}
