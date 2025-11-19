import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import {
  IonButton,
  IonInput,
  IonItem,
  IonIcon,
  IonContent,
  IonRouterLink
} from '@ionic/angular/standalone';
import { AuthService } from 'src/app/core/auth/auth.service';

@Component({
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    IonButton,
    IonInput,
    IonItem,
    IonIcon,
    IonContent,
    IonRouterLink
  ],
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent implements OnInit {
  loginForm!: FormGroup;
  showPassword: boolean = false;
  errorMessage: string = '';

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private router: Router,
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

  login() {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    // Por ahora navegamos directo

    const { email, password } = this.loginForm.value;
    console.log('Login attempt:', { email, password });

    // Simulamos login exitoso
    this.router.navigate(['/panel-asistencia']);

    /*
    // Cuando tengas backend, descomenta esto:
    this.auth.login(email, password).subscribe({
      next: (response) => {
        console.log('Login successful', response);
        this.router.navigate(['/panel-asistencia']);
      },
      error: (error) => {
        console.error('Login error', error);
        this.errorMessage = 'Credenciales inválidas';
      }
    });
    */
  }
}
