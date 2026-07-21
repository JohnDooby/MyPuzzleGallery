import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';

import { AuthService } from '../../../../core/auth/auth.service';

/** Longueur max du pseudo (alignée BDD). */
const PSEUDO_MAX_LENGTH = 32;

/**
 * Formulaire d'inscription (pseudo, e-mail, mot de passe + acceptation des règles).
 */
@Component({
  selector: 'app-signup-form',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './signup-form.html',
  styleUrl: './signup-form.scss',
})
export class SignupForm {
  private readonly auth = inject(AuthService);
  private readonly fb = inject(FormBuilder);

  /** Message d'erreur affiché sous le formulaire. */
  protected readonly errorMessage = signal<string | null>(null);

  /** true pendant l'appel signUp. */
  protected readonly isSubmitting = signal(false);

  /** Champs inscription. */
  protected readonly form = this.fb.nonNullable.group({
    pseudo: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(PSEUDO_MAX_LENGTH)]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    acceptTerms: [false, [Validators.requiredTrue]],
  });

  /**
   * Soumet l'inscription si le formulaire est valide.
   */
  protected async onSubmit(): Promise<void> {
    this.errorMessage.set(null);

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const { pseudo, email, password } = this.form.getRawValue();
    this.isSubmitting.set(true);

    const result = await this.auth.signUp(email, password, pseudo);
    this.isSubmitting.set(false);

    if (!result.success) {
      this.errorMessage.set(result.message);
    }
  }
}
