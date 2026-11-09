# Documentation des Prompts - TaskFlow

## User Story 1 : Enregistrement des tâches
*En tant qu'utilisateur, je veux ajouter une nouvelle tâche à ma liste pour ne pas l'oublier.*

- **Itération 1 (Prompt initial) :** "Rédige une fonction en Python/JS pour ajouter une tâche dans une liste avec un titre et un statut par défaut 'à faire'."
- **Itération 2 (Ajustement) :** "Ajoute une vérification pour éviter d'ajouter une tâche si le titre est vide."
- **Itération 3 (Finalisation) :** "Refactore le code pour inclure une date de création automatique et formate le retour en JSON."

---

## User Story 2 : Affichage de la liste
*En tant qu'utilisateur, je veux voir toutes mes tâches pour savoir ce qu'il me reste à faire.*

- **Itération 1 (Prompt initial) :** "Crée une fonction qui affiche toutes les tâches enregistrées."
- **Itération 2 (Ajustement) :** "Trie la liste pour afficher les tâches non terminées en premier."
- **Itération 3 (Finalisation) :** "Ajoute un affichage clair avec un numéro pour chaque tâche et un indicateur visuel (ex: [X] ou [ ])."

---

## User Story 3 : Validation d'une tâche
*En tant qu'utilisateur, je veux marquer une tâche comme terminée pour suivre mon avancement.*

- **Itération 1 (Prompt initial) :** "Écris une fonction pour changer le statut d'une tâche de 'à faire' à 'terminé' via son identifiant."
- **Itération 2 (Ajustement) :** "Gère le cas où l'identifiant renseigné n'existe pas dans la liste."
- **Itération 3 (Finalisation) :** "Ajoute la possibilité de repasser une tâche terminée en 'à faire' si besoin."

---

## User Story 4 : Suppression d'une tâche
*En tant qu'utilisateur, je veux supprimer une tâche pour nettoyer ma liste.*

- **Itération 1 (Prompt initial) :** "Donne-moi le code pour supprimer une tâche de la liste par son ID."
- **Itération 2 (Ajustement) :** "Demande une confirmation avant d'effectuer la suppression définitive."
- **Itération 3 (Finalisation) :** "Ajoute un message de confirmation une fois la tâche supprimée avec succès."

---

## User Story 5 : Filtrage des tâches
*En tant qu'utilisateur, je veux filtrer mes tâches par statut pour me concentrer sur ce qui est urgent.*

- **Itération 1 (Prompt initial) :** "Crée un filtre pour afficher uniquement les tâches terminées."
- **Itération 2 (Ajustement) :** "Modifie la fonction pour qu'elle accepte un paramètre de filtre ('toutes', 'à faire', 'terminées')."
- **Itération 3 (Finalisation) :** "Optimise le code et ajoute la gestion des erreurs si le filtre saisi est invalide."

## Séance 2 · Sprint 1 · Fonctions de base

- **Outil :** Claude (chat)
- **Prompt :** « Je suis en cybersécurité, suis toutes les étapes et fais JavaScript sans framework pour être dans les consignes » (avec le diaporama de la séance joint).
- **Code produit :** `index.html`, `app.js` : créer, afficher, modifier, supprimer et terminer une tâche.
- **Points relus :** titre vide refusé, id unique, affichage avec `textContent` au lieu de `innerHTML` pour éviter la faille XSS.
- **Gardé / modifié / rejeté :** Gardé.
- **Pourquoi :** Le code fonctionne quand je le teste dans le navigateur et je l'ai relu.

## Séance 2 · Sprint 2 · Sauvegarde et mise en forme

- **Outil :** Claude (chat)
- **Prompt :** même conversation. Sauvegarde des tâches dans localStorage et feuille de style CSS.
- **Code produit :** fonctions `save()` et `load()` dans `app.js`, `style.css`.
- **Points relus :** `JSON.stringify` car localStorage ne stocke que du texte ; liste vide au premier lancement ; sauvegarde après chaque action. Les données ne sont pas privées : elles sont visibles avec F12.
- **Gardé / modifié / rejeté :** Gardé.
- **Pourquoi :** Les tâches restent bien affichées après avoir rechargé la page.

## Séance 2 · Sprint 3 · Fonctionnalité cybersécurité

- **Outil :** Claude (chat)
- **Prompt :** même conversation. Écran de connexion et contrôle de robustesse du mot de passe.
- **Code produit :** partie connexion à la fin de `app.js`, écran de connexion dans `index.html`, styles associés.
- **Points relus :** mot de passe de 12 caractères minimum avec majuscule, minuscule, chiffre et caractère spécial ; mot de passe haché (SHA-256 avec un sel) et jamais stocké en clair ; même message d'erreur si l'identifiant ou le mot de passe est faux ; blocage de 30 secondes après 5 échecs.
- **Limites connues :** tout se passe dans le navigateur, donc la connexion peut être contournée avec F12 ; le blocage disparaît si on recharge la page.
- **Gardé / modifié / rejeté :** Modifié.
- **Pourquoi :** La première version faisait 340 lignes avec un hachage trop compliqué (PBKDF2) : on ne savait pas l'expliquer, donc on l'a refusée et on a demandé une version plus simple de moins de 200 lignes.

## Corrections après nos tests

- **Bug repéré :** une adresse e-mail était refusée comme identifiant. Trouvé en testant avec Live Server, corrigé en assouplissant la règle.
- **Oubli repéré :** notre readme annonçait une date automatique pour chaque tâche, mais l'application ne l'affichait pas. Trouvé en comparant avec notre cahier des charges, date ajoutée.
