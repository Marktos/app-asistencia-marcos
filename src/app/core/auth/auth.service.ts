import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Router } from '@angular/router';
// import { SignInService } from '../../modules/auth/sign-in/services/sign-in.service';
import { environment } from '../../../environments/environment';
import { StorageService } from '../../shared/services/data-access/storage.service';

interface LoginResponse {
    success: boolean;
    message: string;
    result: {
        token: string;
    };
    errors: any[];
    menu: any[];
    token: string | null;
}

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private _authenticated: boolean = false;

    constructor(
        private http: HttpClient,
        private router: Router,
        private storageService: StorageService
    ) {}

    /**
     * Seteamos y obtenemos el token
     */
    set accessToken(token: string) {
        this.storageService.set('accessToken', token);
    }

    get accessToken(): string {
        return this.storageService.get<string>('accessToken') ?? '';
    }

    // canActivate(): boolean {
    //     return this.SignInService.isAuthenticated();
    // }

    /**
     * Iniciar sesión
     * @param email - El correo electrónico del usuario
     * @param password - La contraseña del usuario
     * @returns Un observable que emite la respuesta de inicio de sesión
     */
    login(email: string, password: string): Observable<LoginResponse> {
        return this.http.post<LoginResponse>(`${environment.auth.login}`, { email, password }).pipe(
            tap((response) => {
                const token = response?.result?.token;
                this.accessToken = token;
                this._authenticated = true;
            })
        );
    }
    // JSON.stringify(response)
    // isAuthenticated(): boolean {
    //     return this._authenticated || !!this.accessToken;
    // }

    /**
     * Cerrar sesión
     */
    signOut(): Observable<any> {
        // Eliminar el token de acceso del almacenamiento local
        localStorage.clear();
        // Establecer el indicador de autenticación en falso
        this._authenticated = false;
        // Devolver el observable
        return of(true);
    }

    check(): Observable<boolean> {
        // Comprobar si el usuario ha iniciado sesión
        if (this._authenticated) {
            return of(true);
        }

        // Comprobar la disponibilidad del token de acceso
        if (!this.accessToken) {
            return of(false);
        }

        // Si el token de acceso existe y no ha caducado, iniciar sesión con él
        return of(true);
    }
}
