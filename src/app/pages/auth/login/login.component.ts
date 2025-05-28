import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import {
  IonButton,
  IonInput,
  IonItem,
  IonCard,
  IonIcon,
  IonContent,
  IonNav,
  IonCardHeader,
  IonCardTitle,
  IonCardSubtitle,
  IonCardContent
} from '@ionic/angular/standalone';
import { AuthService } from 'src/app/core/auth/auth.service';
import { LoginForm } from 'src/app/core/interfaces/login.interface';



@Component({
  standalone: true,
  imports: [IonButton, IonInput, IonItem, IonCard, IonIcon, IonContent, IonNav, IonCardHeader, IonCardTitle, IonCardSubtitle, IonCardContent,  ],
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent implements OnInit {
  form!: FormGroup;
    errorMessage: string = '';
  constructor(
    private _form : FormBuilder,
    private auth: AuthService,
    private router: Router,
  ) {
    this.form = this._form.group<LoginForm>({
            email: this._form.nonNullable.control('', [Validators.required, Validators.email]),
            password: this._form.nonNullable.control('', [Validators.required])
        });
  }

  ngOnInit() {}

  login() {
    if (this.form.invalid) return;
        const { email, password } = this.form.getRawValue();
        this.auth.login(email, password).subscribe({
            next: (response) => {
                this.router.navigate(['/panel-asistencia']);
            },
            error: (error) => console.log(error)
        });
  }
}
