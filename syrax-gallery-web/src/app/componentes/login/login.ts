import { Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  LoginForm = inject(FormBuilder).group({
    username: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]]
  });

  isLoading = signal(false);
  result = signal('');

  formStatus = toSignal(this.LoginForm.statusChanges, { initialValue: 'INVALID' as const });
  canSubmit = computed(() => this.formStatus() === 'VALID' && !this.isLoading());

  onSubmit() : void {
    console.log('Credenciales:', this.LoginForm.value);
    this.result.set('Intentando ingresar...');
  }
}
