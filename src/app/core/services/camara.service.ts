import { Injectable } from '@angular/core';
import { Camera, CameraResultType, CameraSource, Photo } from '@capacitor/camera';

@Injectable({
  providedIn: 'root'
})
export class CameraService {

  constructor() {}

  /**
   *Metodo para tomar una foto con la cámara
   */
  async takePicture(): Promise<string | null> {
    try {
      const photo = await Camera.getPhoto({
        quality: 80,
        allowEditing: false,
        resultType: CameraResultType.Base64,
        source: CameraSource.Camera,
        saveToGallery: false,
        width: 800,
        height: 800,
        correctOrientation: true
      });

      if (photo.base64String) {
        console.log('Foto capturada exitosamente');
        return `data:image/${photo.format};base64,${photo.base64String}`;
      }

      return null;
    } catch (error: any) {
      console.error('Error al tomar foto:', error);

      // Si el usuario canceló
      if (error.message === 'User cancelled photos app') {
        console.log('Usuario canceló la captura');
        return null;
      }

      throw error;
    }
  }

  /**
   * Seleccionar foto de la galería
   */
  async selectFromGallery(): Promise<string | null> {
    try {
      const photo = await Camera.getPhoto({
        quality: 80,
        allowEditing: false,
        resultType: CameraResultType.Base64,
        source: CameraSource.Photos,
        width: 800,
        height: 800
      });

      if (photo.base64String) {
        console.log('Imagen seleccionada exitosamente');
        return `data:image/${photo.format};base64,${photo.base64String}`;
      }

      return null;
    } catch (error: any) {
      console.error('Error al seleccionar imagen:', error);

      if (error.message === 'User cancelled photos app') {
        console.log('Usuario canceló la selección');
        return null;
      }

      throw error;
    }
  }

  /**
   * Verifico los permisos de la cámara
   */
  async checkCameraPermissions(): Promise<boolean> {
    try {
      const permissions = await Camera.checkPermissions();

      if (permissions.camera === 'granted' && permissions.photos === 'granted') {
        return true;
      }

      // Solicito permisos si no están otorgados
      const requested = await Camera.requestPermissions();
      return requested.camera === 'granted' && requested.photos === 'granted';

    } catch (error) {
      console.error('Error al verificar permisos:', error);
      return false;
    }
  }
}
