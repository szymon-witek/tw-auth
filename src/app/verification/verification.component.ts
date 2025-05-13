import { environment } from './../../environment';
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { FormGroup, FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';


@Component({
  selector: 'app-verification',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './verification.component.html',
  styleUrl: './verification.component.scss',
})
export class VerificationComponent implements OnInit {
    private apiUrl = environment.apiBaseUrl;
  
  servers = [206, 210];
  nicks: { externalId: number; nick: string }[] = [];
  verifying = false;
  verificationSuccess = false;
  verificationFailed = false;
  token = '';
  statusMessage = '';
  isError = false;
  isLoading = false;
  form: FormGroup;

  constructor(private http: HttpClient, private fb: FormBuilder, private router: Router) {
    this.form = this.fb.group({
      server: [null],
      nick: [null],
    });
  }

  ngOnInit(): void {
    this.form.get('server')?.valueChanges.subscribe((server) => {
      if (server !== null) {
        this.getNicks(server);
      }
    });
  }

  getNicks(server: number): void {
    const params = new HttpParams().set('server', server.toString());
    this.http
      .get<{ externalId: number; nick: string }[]>(
        this.apiUrl + '/world/players',
        { params }
      )
      .subscribe({
        next: (response) => {
          this.nicks = response;
          this.form.get('nick')?.setValue(null);
        },
        error: (error) => {
          console.error('Error fetching nicks:', error);
        },
      });
  }

  onSubmit(): void {
    const server = this.form.value.server;
    const externalId = this.form.value.nick;
    if (server && externalId) {
      this.createVerificationToken(server, externalId);
    }
  }

  createVerificationToken(server: number, externalId: string): void {
    this.resetState();

    const params = new HttpParams()
      .set('server', server.toString())
      .set('externalId', externalId);

    this.isLoading = true;

    this.http
      .post(this.apiUrl + '/verify/request', null, {
        params,
        responseType: 'text' as const,
      })
      .subscribe({
        next: (response: string) => {
          this.isLoading = false;

          if (response.includes('Token already verified')) {
            this.statusMessage = response;
            this.token = '';
            this.isError = false;
          } else if (response.includes('A token is already pending')) {
            this.statusMessage = response;
            this.token = '';
            this.isError = true;
          } else if (response.includes('Add this code to your profile:')) {
            this.token = response
              .replace('Add this code to your profile: ', '')
              .trim();
            this.statusMessage = 'Token wygenerowany pomyślnie.';
            this.isError = false;
          } else {
            this.statusMessage = 'Nieoczekiwana odpowiedź z serwera.';
            this.token = '';
            this.isError = true;
          }
        },
        error: (error) => {
          this.isLoading = false;
          this.token = '';
          this.statusMessage = 'Wystąpił błąd przy generowaniu tokenu.';
          this.isError = true;
          console.error('Error requesting token:', error);
        },
      });
  }

  onVerify(): void {
    if (!this.form.value.server || !this.form.value.nick) return;

    this.verifying = true;
    this.verificationSuccess = false;
    this.verificationFailed = false;

    const params = new HttpParams()
      .set('server', this.form.value.server.toString())
      .set('externalId', this.form.value.nick);

    this.http
      .post<{ verified: boolean }>(
        this.apiUrl + '/verify/check',
        null,
        { params }
      )
      .subscribe({
        next: (result) => {
          this.verifying = false;
          this.verificationSuccess = result.verified;
          this.verificationFailed = !result.verified;

          this.router.navigate(['/account-setup'], {
            queryParams: {
              server: this.form.value.server,
              externalId: this.form.value.nick,
            },
          });
        },
        error: (err) => {
          this.verifying = false;
          this.verificationFailed = true;
          console.error('Verification error:', err);
        },
      });
  }

  private resetState(): void {
    this.token = '';
    this.statusMessage = '';
    this.isError = false;
    this.verificationSuccess = false;
    this.verificationFailed = false;
  }
}
