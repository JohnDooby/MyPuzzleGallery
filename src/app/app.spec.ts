/**
 * Tests unitaires du composant racine App.
 * Vérifie le montage et la présence du routeur / prompt PWA.
 */
import { TestBed } from '@angular/core/testing';
import { App } from './app';

describe('App', () => {
  // --- Arrange commun ---
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
    }).compileComponents();
  });

  it('crée le composant racine', () => {
    // --- Act ---
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;

    // --- Assert ---
    expect(app).toBeTruthy();
  });

  it('affiche le routeur et le prompt PWA', async () => {
    // --- Arrange / Act ---
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const compiled = fixture.nativeElement as HTMLElement;

    // --- Assert ---
    expect(compiled.querySelector('router-outlet')).toBeTruthy();
    expect(compiled.querySelector('app-pwa-install-prompt')).toBeTruthy();
  });
});
