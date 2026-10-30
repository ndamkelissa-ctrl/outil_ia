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
