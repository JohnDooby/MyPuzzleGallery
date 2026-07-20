# 🎨 MyPuzzleGallery 🧩

**MyPuzzleGallery** est une application web interactive conçue pour transformer une galerie d'art numérique en un espace de jeu ludique et familial. Initialement créé pour exposer et valoriser des dessins réalisés sur *Ibis Paint X*, ce site permet non seulement de contempler les œuvres, mais aussi de les reconstituer sous forme de puzzles tactiles, directement sur mobile et tablette.

L'application est propulsée par un frontend **Angular** hébergé de manière statique sur **GitHub Pages**, et s'appuie sur **Supabase** pour la gestion de la base de données partagée, du stockage des images et de l'authentification de l'artiste.

---

## ✨ Fonctionnalités

*   **Galerie Publique :** Une vitrine épurée, moderne et au thème clair pour mettre en valeur les dessins originaux.
*   **Mode Puzzle Interactif :** En un clic, un dessin se transforme en puzzle.
    *   **Découpage dynamique :** Génération des pièces côté client via CSS/HTML5 (aucun traitement d'image lourd côté serveur).
    *   **Niveaux de difficulté :** Choix du nombre de pièces (Facile, Moyen, Difficile).
    *   **Optimisé pour le Tactile :** Glisser-déposer fluide au doigt, spécialement calibré pour les smartphones et tablettes grâce à Angular CDK.
    *   **Effet Victoire :** Animation festive (confettis) dès que la dernière pièce est aimantée à sa place.
*   **Espace Admin Sécurisé :** Une page d'administration privée permettant à l'artiste d'uploader ses créations (fichiers PNG/JPEG) directement depuis son mobile, d'ajouter un titre, une description et de spécifier le temps passé sur l'œuvre.

---

## 🛠️ Architecture Technique

L'application utilise une architecture dite *Serverless / Backend-as-a-Service (BaaS)*, idéale pour combiner gratuité, performance et maintenance zéro.

*   **Frontend :** Angular (v17+)
*   **Gestion Tactile / Drag & Drop :** `@angular/cdk/drag-drop`
*   **Hébergement :** GitHub Pages (Fichiers statiques HTML/JS/CSS)
*   **Backend & Base de données :** Supabase (PostgreSQL)
*   **Stockage des images :** Supabase Storage (Seules les URLs publiques sont stockées en BDD)
*   **Sécurité :** Row Level Security (RLS) sur Supabase pour s'assurer que seule l'artiste connectée peut ajouter ou modifier du contenu.

---

