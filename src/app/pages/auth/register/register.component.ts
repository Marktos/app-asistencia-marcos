import { Component, OnInit } from '@angular/core';
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
@Component({
  standalone: true,
    imports: [IonButton, IonInput, IonItem, IonCard, IonIcon, IonContent, IonCardHeader, IonCardTitle, IonCardSubtitle, IonCardContent,  ],

  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss'],
})
export class RegisterComponent implements OnInit {
  constructor() {}

  ngOnInit() {}
}
