import { Component, OnInit } from '@angular/core';
import {
  IonButton,
  IonInput,
  IonItem,
  IonCard,
  IonIcon,
  IonContent,
} from '@ionic/angular/standalone';

@Component({
  standalone: true,
  imports: [IonButton, IonInput, IonItem, IonCard, IonIcon, IonContent],
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent implements OnInit {
  constructor() {}

  ngOnInit() {}
}
