// ===== TaskFlow : gestion des tâches =====
// Sprint 1 : créer, afficher, modifier, supprimer, terminer
// Sprint 2 : sauvegarde dans localStorage

let tasks = [];
let editingId = null;      // id de la tâche en cours de modification (null = aucune)
const storageKey = "tasks"; // nom de la "case" dans localStorage

const form = document.getElementById("task-form");
const titleInput = document.getElementById("task-title");
const prioritySelect = document.getElementById("task-priority");
const list = document.getElementById("task-list");
const emptyMessage = document.getElementById("empty");
const errorMessage = document.getElementById("task-error");

// Date.now() seul peut donner deux fois le même id si deux tâches sont créées
// dans la même milliseconde : on ajoute une partie aléatoire.
function createId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

// ---------- Sauvegarde (sprint 2) ----------

// localStorage ne stocke que du texte : JSON.stringify transforme le tableau en texte.
function save() {
  localStorage.setItem(storageKey, JSON.stringify(tasks));
}

// Au premier lancement, getItem renvoie null : on part d'une liste vide.
function load() {
  const data = localStorage.getItem(storageKey);
  try {
    tasks = data ? JSON.parse(data) : [];
  } catch {
    tasks = []; // texte illisible (modifié à la main par exemple) : on repart à zéro
  }
}

// ---------- Actions sur les tâches ----------

function addTask(title, priority = "moyenne") {
  const cleanTitle = title.trim();
  if (!cleanTitle) return null; // refuse un titre vide ou fait seulement d'espaces

  const task = {
    id: createId(),
    titre: cleanTitle,
    priorite: priority,
    statut: "a_faire",
  };
  tasks.push(task);
  save();
  render();
  return task;
}

function deleteTask(id) {
  tasks = tasks.filter((task) => task.id !== id);
  save();
  render();
}

function toggleTask(id) {
  const task = tasks.find((t) => t.id === id);
  if (!task) return;
  task.statut = task.statut === "terminee" ? "a_faire" : "terminee";
  save();
  render();
}

function updateTask(id, newTitle) {
  const task = tasks.find((t) => t.id === id);
  const cleanTitle = newTitle.trim();
  if (!task || !cleanTitle) return false;
  task.titre = cleanTitle;
  editingId = null;
  save();
  render();
  return true;
}

function cancelEdit() {
  editingId = null;
  render();
}

// ---------- Affichage ----------

function makeButton(label, className, onClick) {
  const button = document.createElement("button");
  button.type = "button";
  button.textContent = label;
  if (className) button.className = className;
  button.addEventListener("click", onClick);
  return button;
}

// Les éléments sont créés avec createElement + textContent, jamais avec innerHTML :
// un titre comme <img src=x onerror=alert(1)> s'affiche alors comme du texte
// au lieu d'être exécuté (protection contre la faille XSS).
function render() {
  list.replaceChildren(); // vide la liste avant de la redessiner
  emptyMessage.hidden = tasks.length > 0;

  for (const task of tasks) {
    const li = document.createElement("li");
    li.className = "task prio-" + task.priorite;
    if (task.statut === "terminee") li.classList.add("done");

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = task.statut === "terminee";
    checkbox.setAttribute("aria-label", "Marquer comme terminée");
    checkbox.addEventListener("change", () => toggleTask(task.id));
    li.append(checkbox);

    if (task.id === editingId) {
      // Mode modification : un champ texte à la place du titre
      const input = document.createElement("input");
      input.type = "text";
      input.value = task.titre;
      input.maxLength = 100;
      input.className = "edit-input";
      input.setAttribute("aria-label", "Nouveau titre");
      input.addEventListener("keydown", (event) => {
        if (event.key === "Enter") updateTask(task.id, input.value);
        if (event.key === "Escape") cancelEdit();
      });
      li.append(
        input,
        makeButton("Enregistrer", "", () => updateTask(task.id, input.value)),
        makeButton("Annuler", "secondary", cancelEdit)
      );
    } else {
      const title = document.createElement("span");
      title.className = "title";
      title.textContent = task.titre;

      const badge = document.createElement("span");
      badge.className = "badge";
      badge.textContent = task.priorite;

      li.append(
        title,
        badge,
        makeButton("Modifier", "secondary", () => { editingId = task.id; render(); }),
        makeButton("Supprimer", "danger", () => deleteTask(task.id))
      );
    }
    list.append(li);
  }

  list.querySelector(".edit-input")?.focus(); // place le curseur dans le champ en cours de modification
}

form.addEventListener("submit", (event) => {
  event.preventDefault(); // empêche le formulaire de recharger la page
  const task = addTask(titleInput.value, prioritySelect.value);
  if (!task) {
    errorMessage.textContent = "Le titre ne peut pas être vide.";
    return;
  }
  errorMessage.textContent = "";
  form.reset();
  titleInput.focus();
});

// Au chargement de la page : on récupère les tâches sauvegardées puis on les affiche
load();
render();
