
// ======= record.service.ts =======
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { catchError } from 'rxjs/operators';
import { of, throwError } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { environment } from '../environment' 

@Injectable({ providedIn: 'root' })
export class RecordService {
    private apiUrl = environment.apiBaseUrl;

  constructor(private http: HttpClient) {}

  getRecords() {
    const headers = new HttpHeaders().set('Authorization', `Bearer ${localStorage.getItem('token')}`);
    return this.http.get<any[]>(this.apiUrl + '/core', { headers }).pipe(
      catchError((error: HttpErrorResponse) => {
        console.error('❌ Error fetching records:', {
          message: error.message,
          status: error.status,
          error: error.error,
          url: error.url
        });
  
        return of([]); // fallback value
      })
    );
  }
}