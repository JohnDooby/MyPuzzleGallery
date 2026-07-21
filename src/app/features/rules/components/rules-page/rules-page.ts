import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

/**
 * Page Règles & sécurité — résumé des conditions d'accès (E10-F07).
 */
@Component({
  selector: 'app-rules-page',
  imports: [RouterLink],
  templateUrl: './rules-page.html',
  styleUrl: './rules-page.scss',
})
export class RulesPage {}
