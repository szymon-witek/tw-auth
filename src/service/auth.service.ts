import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap, throwError } from 'rxjs';
import { jwtDecode } from 'jwt-decode';
import { BehaviorSubject } from 'rxjs';
import { environment } from '../environment'


@Injectable({ providedIn: 'root' })
export class AuthService {

  private apiUrl = environment.apiBaseUrl;

  private _decodedToken: any;
  private _token: string | null = null;           // <-- Add this field
  private _refreshToken: string | null = null;     // <-- And this
  private authState = new BehaviorSubject<boolean>(false);
  isAuthenticated$ = this.authState.asObservable();

  constructor(private http: HttpClient) {
    if (typeof window !== 'undefined') {
      this._token = localStorage.getItem('token');
      this._refreshToken = localStorage.getItem('refreshToken');
      if (this._token) {
        this._decodedToken = jwtDecode(this._token);
      }
    }
  }

  login(data: any) {
    return this.http.post<{ token: string, refreshToken: string, passwordNeedsChange: boolean }>(this.apiUrl + '/login', data).pipe(
      tap(res => {
        if (typeof window !== 'undefined') {
          localStorage.setItem('token', res.token);
          localStorage.setItem('refreshToken', res.refreshToken);
          this._token = res.token;                 // <-- Update memory
          this._refreshToken = res.refreshToken;    // <-- Update memory
        }
        this._decodedToken = jwtDecode(res.token);
        this.authState.next(true);
      })
    );
  }

  refreshAccessToken() {
    console.log('Refreshing token...');
    const refreshToken = this._refreshToken;  // <-- use memory value
    if (!refreshToken) {
      console.error('No refresh token available');
      return throwError(() => new Error('No refresh token'));
    }

    return this.http.post<{ token: string }>(
      this.apiUrl + 'refresh-token', { refreshToken }
    ).pipe(
      tap(res => {
        if (typeof window !== 'undefined') {
          localStorage.setItem('token', res.token);
          this._token = res.token;                  // <-- Update memory
        }
        this._decodedToken = jwtDecode(res.token);
      })
    );
  }

  logout() {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
    }
    this._token = null;          // <-- Clear memory
    this._refreshToken = null;   // <-- Clear memory
    this._decodedToken = null;
    this.authState.next(false);

  }

  // Getters
  get token(): string | null {
    return this._token;
  }

  get refreshToken(): string | null {
    return this._refreshToken;
  }

  isAdmin(): boolean {
    return this._decodedToken?.roles?.includes('ROLE_ADMIN') || false;
  }

  isAuthenticated(): boolean {
    return this.authState.value;
  }
  isModerator(): boolean {
    return this.isAuthenticated() && this._decodedToken?.role?.includes('MODERATOR') || false;
  }
}
