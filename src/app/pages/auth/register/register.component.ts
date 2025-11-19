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
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss'],
})
export class RegisterComponent implements OnInit {
  registerForm!: FormGroup;
  showPassword: boolean = false;
  showConfirmPassword: boolean = false;
errorMessage: any;

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
    this.registerForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(2)]],
      apellido: ['', [Validators.required, Validators.minLength(2)]],
      dni: ['', [Validators.required, Validators.pattern(/^\d{7,8}$/)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]]
    }, {
      validators: this.passwordMatchValidator
    });
  }

  passwordMatchValidator(group: FormGroup) {
    const password = group.get('password')?.value;
    const confirmPassword = group.get('confirmPassword')?.value;
    return password === confirmPassword ? null : { passwordMismatch: true };
  }

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  toggleConfirmPassword() {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  async register() {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    const loading = await this.loadingCtrl.create({
      message: 'Creando cuenta...',
      spinner: 'crescent'
    });
    await loading.present();

    try {
      const { nombre, apellido, dni, email, password } = this.registerForm.value;

      // Registro con SQLite
      const result = await this.auth.register({
        nombre,
        apellido,
        dni,
        email,
        password
      });

      if (result.success) {
        console.log('✅ Registro exitoso');
        await this.mostrarToast('Cuenta creada exitosamente!', 'success');
        this.router.navigate(['/panel-asistencia']);
      } else {
        await this.mostrarToast(result.message, 'danger');
      }

    } catch (error) {
      console.error('❌ Error en registro:', error);
      await this.mostrarToast('Error al crear cuenta', 'danger');
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
