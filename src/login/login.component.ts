import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../service/auth.service';
import { FormBuilder, Validators, FormGroup } from '@angular/forms'; // Import FormGroup and FormBuilder
import { ReactiveFormsModule } from '@angular/forms'; // Import ReactiveFormsModule
import { MatFormFieldModule } from '@angular/material/form-field'; // Import Angular Material Form Field
import { MatInputModule } from '@angular/material/input'; // Import Angular Material Input

@Component({
  selector: 'app-login',
  standalone: true,
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  imports: [ReactiveFormsModule, MatFormFieldModule, MatInputModule],  // Add ReactiveFormsModule and Material modules
})
export class LoginComponent implements OnInit {


  form!: FormGroup;  // Declare form as FormGroup type

  constructor(private fb: FormBuilder, private auth: AuthService, private router: Router) {}

  ngOnInit() {
    // Initialize form in ngOnInit to ensure dependencies are injected before usage
    this.form = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required],
    });
  }

  login() {
    this.auth.login(this.form.value).subscribe({
      next: () => {
        console.log('Login success, navigating...');
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        console.error('Login error:', err);
      }
    });
    
  }
  logout() {
    this.auth.logout();
  }
  signIn() {
    this.router.navigate(['/verify']);
  }
}
