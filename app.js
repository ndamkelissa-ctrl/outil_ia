// ===== TaskFlow : application de gestion de tâches =====

let tasks = [];   // la liste des tâches
let user = null;  // l'identifiant de la personne connectée
// ========== SPRINT 2 : SAUVEGARDE ==========
// localStorage ne stocke que du texte : JSON.stringify transforme le tableau en texte.
// Chaque utilisateur a sa propre liste : "tasks_" + son identifiant.
function save() {
  localStorage.setItem("tasks_" + user, JSON.stringify(tasks));
}

// Au premier lancement il n'y a rien (null) : on part d'une liste vide.
function load() {
  const data = localStorage.getItem("tasks_" + user);
  tasks = data ? JSON.parse(data) : [];
}

// ========== SPRINT 1 : LES TÂCHES ==========
function addTask(title, priority) {
  if (title.trim() === "") return false; // refuse un titre vide
   tasks.push({ id: Date.now(), titre: title.trim(), priorite: priority, terminee: false, date: new Date().toLocaleDateString("fr-FR") });
  save(); render();
  return true;
}

function deleteTask(id) {
  tasks = tasks.filter((task) => task.id !== id); // garde toutes les tâches sauf celle-ci
  save(); render();
}

function toggleTask(id) {
  const task = tasks.find((t) => t.id === id);
  task.terminee = !task.terminee; // true devient false, false devient true
  save(); render();
}

function editTask(id) {
  const task = tasks.find((t) => t.id === id);
  const newTitle = prompt("Nouveau titre :", task.titre);
  if (newTitle && newTitle.trim() !== "") {
    task.titre = newTitle.trim();
    save(); render();
  }
}

// Crée un bouton avec un texte, une classe CSS et une action au clic
function makeButton(text, className, action) {
  const button = document.createElement("button");
  button.textContent = text;
  button.className = className;
  button.onclick = action;
  return button;
}

// Redessine toute la liste à l'écran
function render() {
  const list = document.getElementById("task-list");
  list.textContent = ""; // vide la liste
  document.getElementById("empty").hidden = tasks.length > 0;
  for (const task of tasks) {
    const li = document.createElement("li");
    li.className = "task prio-" + task.priorite + (task.terminee ? " done" : "");
    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = task.terminee;
    checkbox.onchange = () => toggleTask(task.id);
    const title = document.createElement("span");
    title.className = "title";
        title.textContent = task.titre + (task.date ? " (" + task.date + ")" : ""); // textContent : protège contre la faille XSS
    const editButton = makeButton("Modifier", "secondary", () => editTask(task.id));
    const deleteButton = makeButton("Supprimer", "danger", () => deleteTask(task.id));
    li.append(checkbox, title, editButton, deleteButton);
    list.append(li);
  }
}

// Formulaire d'ajout de tâche
document.getElementById("task-form").onsubmit = (event) => {
  event.preventDefault(); // empêche la page de se recharger
  const input = document.getElementById("task-title");
  const ok = addTask(input.value, document.getElementById("task-priority").value);
  document.getElementById("task-error").textContent = ok ? "" : "Le titre ne peut pas être vide.";
  if (ok) input.value = "";
};

// ========== SPRINT 3 : CONNEXION (CYBERSÉCURITÉ) ==========
// Limite : tout se passe dans le navigateur, on peut contourner cet écran avec F12.
// Les 5 règles du mot de passe
const rules = {
  length: (p) => p.length >= 12,
  upper: (p) => /[A-Z]/.test(p),
  lower: (p) => /[a-z]/.test(p),
  digit: (p) => /[0-9]/.test(p),
  special: (p) => /[^A-Za-z0-9]/.test(p), // ni lettre ni chiffre
};

let registerMode = false; // false = connexion, true = création de compte
let failures = 0;         // nombre d'échecs de connexion
// Coche en vert les règles respectées. Renvoie true si les 5 sont respectées.
function checkPassword(password) {
  let score = 0;
  for (const li of document.querySelectorAll("#password-rules li")) {
    const ok = rules[li.dataset.rule](password);
    li.classList.toggle("ok", ok);
    if (ok) score++;
  }
  return score === 5;
}

// Hachage SHA-256 : on ne garde jamais le mot de passe, seulement son "empreinte".
// Le sel (texte aléatoire) fait que deux mots de passe identiques donnent des empreintes différentes.
async function hash(password, salt) {
  const bytes = new TextEncoder().encode(salt + password);
  const result = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(result), (b) => b.toString(16).padStart(2, "0")).join("");
}

// Les comptes : { "identifiant": { salt: "...", hash: "..." } }
function getUsers() {
  return JSON.parse(localStorage.getItem("comptes")) || {};
}

// Passe de l'écran "Connexion" à l'écran "Créer un compte" et inversement
function setRegisterMode(on) {
  registerMode = on;
  document.getElementById("auth-title").textContent = on ? "Créer un compte" : "Connexion";
  document.getElementById("auth-submit").textContent = on ? "Créer mon compte" : "Se connecter";
  document.getElementById("toggle-mode").textContent = on ? "Déjà un compte ? Se connecter" : "Pas encore de compte ? Créer un compte";
  document.getElementById("password-rules").hidden = !on;
  document.getElementById("auth-message").textContent = "";
}

// Cache l'écran de connexion et affiche les tâches de l'utilisateur
function openApp(name) {
  user = name;
  sessionStorage.setItem("user", name); // reste connecté tant que l'onglet est ouvert
  document.getElementById("auth-screen").hidden = true;
  document.getElementById("app-screen").hidden = false;
  document.getElementById("current-user").textContent = name;
  load(); render();
}

// Formulaire de connexion / création de compte
document.getElementById("auth-form").onsubmit = async (event) => {
  event.preventDefault();
  const name = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value;
  const message = document.getElementById("auth-message");
  const submit = document.getElementById("auth-submit");
  const users = getUsers();
  if (name.length < 3) {
    message.textContent = "L'identifiant doit faire au moins 3 caractères.";
    return;
  }
  // Création de compte
  if (registerMode) {
    if (users[name]) {
      message.textContent = "Cet identifiant existe déjà.";
    } else if (!checkPassword(password)) {
      message.textContent = "Le mot de passe ne respecte pas toutes les règles.";
    } else {
      const salt = crypto.randomUUID(); // sel aléatoire
      users[name] = { salt: salt, hash: await hash(password, salt) };
      localStorage.setItem("comptes", JSON.stringify(users));
      openApp(name);
    }
    return;
  }
  // Connexion : on hache le mot de passe tapé et on compare avec l'empreinte enregistrée
  const account = users[name];
  if (account && (await hash(password, account.salt)) === account.hash) {
    failures = 0;
    return openApp(name);
  }
  // Même message dans tous les cas : on ne dit pas si c'est l'identifiant ou le mot de passe qui est faux
  failures++;
  message.textContent = "Identifiant ou mot de passe incorrect.";
  // Après 5 échecs, le bouton est bloqué 30 secondes
  if (failures >= 5) {
    message.textContent = "Trop d'essais. Attendez 30 secondes.";
    submit.disabled = true;
    setTimeout(() => { submit.disabled = false; failures = 0; }, 30000);
  }
};
// Les règles se mettent à jour pendant qu'on tape le mot de passe
document.getElementById("password").oninput = (event) => {
  if (registerMode) checkPassword(event.target.value);
};
document.getElementById("toggle-mode").onclick = () => setRegisterMode(!registerMode);
document.getElementById("logout").onclick = () => {
  sessionStorage.removeItem("user");
  document.getElementById("app-screen").hidden = true;
  document.getElementById("auth-screen").hidden = false;
  document.getElementById("auth-form").reset();
  setRegisterMode(false);
};
// Au chargement : si quelqu'un est déjà connecté dans cet onglet, on ouvre directement ses tâches
const savedUser = sessionStorage.getItem("user");
if (savedUser) openApp(savedUser);
