import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { environment } from './../../environment';

import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
  AbstractControl,
  ValidationErrors,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-account-setup',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './account-setup.component.html',
  styleUrl: './account-setup.component.scss',
})
export class AccountSetupComponent implements OnInit {
  form: FormGroup;
  message = '';
  private apiUrl = environment.apiBaseUrl;

  constructor(
    private route: ActivatedRoute,
    private http: HttpClient,
    private fb: FormBuilder,
    private router: Router
  ) {
    this.form = this.fb.group(
      {
        externalId: [''],
        server: [''],
        password: ['', [Validators.required, Validators.minLength(8)]],
        confirmPassword: ['', Validators.required],
      },
      {
        validators: [this.passwordsMatchValidator],
      }
    );
  }
  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      const server = params['server'];
      const externalId = params['externalId'];
      if (externalId) {
        this.form.patchValue({ externalId });
      }
      if (server) {
        this.form.patchValue({ server });
      }
      console.log('Server:', server, 'External ID:', externalId);
    });
  }

  passwordsMatchValidator(control: AbstractControl): ValidationErrors | null {
    const password = control.get('password')?.value;
    const confirmPassword = control.get('confirmPassword')?.value;
    return password === confirmPassword ? null : { passwordMismatch: true };
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.message = 'Please fill the form correctly.';
      return;
    }

    const { externalId, password, server } = this.form.value;

    this.createAccount(externalId, password, server);
  }

  redirectCountdown = 5;
  redirecting = false;
  countdownInterval: any;

  createAccount(externalId: string, password: string, server: string): void {
    this.http
      .post(
        this.apiUrl + '/create-user',
        { externalId, password, server },
        { responseType: 'text' as const }
      )
      .subscribe({
        next: (response: string) => {
          this.message = response;
          this.startRedirectCountdown(); // ⬅️ start countdown
        },
        error: (err) => {
          console.error('Account creation error:', err);
          this.message = 'Account creation failed. Please try again.';
        },
      });
  }

  startRedirectCountdown(): void {
    this.redirecting = true;
    this.countdownInterval = setInterval(() => {
      this.redirectCountdown--;
      if (this.redirectCountdown === 0) {
        clearInterval(this.countdownInterval);
        this.router.navigate(['/login']);
      }
    }, 1000);
  }

  goToLogin(): void {
    clearInterval(this.countdownInterval); // optional: stop the countdown if clicking manually
    this.router.navigate(['/login']);
  }
}
