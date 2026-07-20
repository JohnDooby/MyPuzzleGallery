# Modèles (templates)

Copier-coller pour créer de nouvelles entrées backlog.

---

## Template Épique (`epic.md`)

```markdown
# E0X — Titre

## Objectif
Pourquoi cette épique existe.

## Périmètre
- Inclus :
- Exclus :

## Features
| Id | Feature | Statut |
|----|---------|--------|
| F01 | … | draft |

## Notes
```

---

## Template Feature (`feature.md`)

```markdown
# F0X — Titre

**Épique parente :** E0X

## Résumé
Une capacité livrable, en 2–3 phrases.

## User Stories
| Id | Titre | Statut |
|----|-------|--------|
| US01 | … | draft |

## Notes techniques (optionnel)
```

---

## Template User Story (`US0X-….md`)

```markdown
# US0X — Titre court

**Feature :** F0X  
**Statut :** draft | ready | doing | done

## Récit

En tant que **…**,  
je veux **…**,  
afin de **…**.

## Critères d’acceptation

- [ ] …
- [ ] …

## Hors scope

- …

## Notes
```
