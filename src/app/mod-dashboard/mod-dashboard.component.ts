import { environment } from './../../environment';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-mod-dashboard',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './mod-dashboard.component.html',
  styleUrl: './mod-dashboard.component.scss'
})
export class ModDashboardComponent {

  private apiUrl = environment.apiBaseUrl;
  scheduleForm: FormGroup;

  constructor(private fb: FormBuilder, private http: HttpClient) {
    this.scheduleForm = this.fb.group({
      description: ['', Validators.required],
      localDate: ['', Validators.required],
      allowedExternalIdPlayers: [[]]
    });
  }

  
  onSubmit() {
    if (this.scheduleForm.valid) {
      const headers = new HttpHeaders().set('Authorization', `Bearer ${localStorage.getItem('token')}`);
      const formData = this.scheduleForm.value;
  
      this.http.post(this.apiUrl + '/create-schedule', formData, { headers })
        .subscribe({
          next: (response) => {
            console.log('Schedule created successfully!', response);
          },
          error: (error) => {
            console.error('Error creating schedule', error);
          }
        });
    }
  }
  

  onAllowedPlayersChange(event: Event) {
    const inputElement = event.target as HTMLInputElement;
    const value = inputElement.value;
    const playersArray = value.split(',').map(player => player.trim());
    this.scheduleForm.get('allowedExternalIdPlayers')?.setValue(playersArray);
  }
  
  
}





