import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import {
  IonButton, IonInput, IonItem, IonIcon, IonContent,
  LoadingController, ToastController
} from '@ionic/angular/standalone';
import { AuthService } from 'src/app/core/auth/auth.service';

@Component({
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, RouterLink,
    IonButton, IonInput, IonItem, IonIcon, IonContent
  ],
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent implements OnInit {
  loginForm!: FormGroup;
  showPassword: boolean = false;

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private router: Router,
    private loadingCtrl: LoadingController,
    private toastCtrl: ToastController
  ) {}

  ngOnInit() {
    this.initForm();
  }

  initForm() {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  async login() {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    const loading = await this.loadingCtrl.create({
      message: 'Iniciando sesión...',
      spinner: 'crescent'
    });
    await loading.present();

    try {
      const { email, password } = this.loginForm.value;

      // Login con SQLite
      const result = await this.auth.login(email, password);

      if (result.success) {
        console.log('✅ Login exitoso');
        await this.mostrarToast('Bienvenido!', 'success');
        this.router.navigate(['/panel-asistencia']);
      } else {
        await this.mostrarToast(result.message, 'danger');
      }

    } catch (error) {
      console.error('❌ Error en login:', error);
      await this.mostrarToast('Error al iniciar sesión', 'danger');
    } finally {
      await loading.dismiss();
    }
  }

  private async mostrarToast(message: string, color: string) {
    const toast = await this.toastCtrl.create({
      message,
      duration: 3000,
      color,
      position: 'top'
    });
    await toast.present();
  }
}
