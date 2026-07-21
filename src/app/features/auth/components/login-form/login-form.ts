import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { AuthService } from '../../../../core/auth/auth.service';

/**
 * Formulaire de connexion (e-mail + mot de passe).
 */
@Component({
  selector: 'app-login-form',
  imports: [ReactiveFormsModule],
  templateUrl: './login-form.html',
  styleUrl: './login-form.scss',
})
export class LoginForm {
  private readonly auth = inject(AuthService);
  private readonly fb = inject(FormBuilder);

  /** Message d'erreur affiché sous le formulaire. */
  protected readonly errorMessage = signal<string | null>(null);

  /** true pendant l'appel signIn. */
  protected readonly isSubmitting = signal(false);

  /** Champs connexion. */
  protected readonly form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  /**
   * Soumet la connexion si le formulaire est valide.
   */
  protected async onSubmit(): Promise<void> {
    this.errorMessage.set(null);

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const { email, password } = this.form.getRawValue();
    this.isSubmitting.set(true);

    const result = await this.auth.signIn(email, password);
    this.isSubmitting.set(false);

    if (!result.success) {
      this.errorMessage.set(result.message);
    }
  }
}
