import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import { DisclaimerService } from '../../../core/disclaimer/disclaimer.service';

/**
 * Bandeau 1er usage (style cookies) : audit, modération, cadre familial.
 */
@Component({
  selector: 'app-disclaimer-banner',
  imports: [RouterLink],
  templateUrl: './disclaimer-banner.html',
  styleUrl: './disclaimer-banner.scss',
})
export class DisclaimerBanner {
  private readonly disclaimer = inject(DisclaimerService);

  /** Visibilité du bandeau. */
  protected readonly visible = signal(this.disclaimer.shouldShow());

  /**
   * Accepte et mémorise sur le device.
   */
  protected onAccept(): void {
    this.disclaimer.accept();
    this.visible.set(false);
  }
}
