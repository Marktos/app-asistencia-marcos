import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class StorageService {
    private storage = localStorage;

    get<T>(key: string): T | null {
        const value = this.storage.getItem(key);

        if (!value) {
            return null;
        }
        try {
            return JSON.parse(value) as T;
        } catch (error) {
            return null;
        }
    }

    set(key: string, value: string) {
        this.storage.setItem(key, value);
    }

    remove(key: string) {
        this.storage.removeItem(key);
    }
}
