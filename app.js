// ===== TaskFlow : gestion des tâches =====
// Sprint 1 : créer, afficher, modifier, supprimer, terminer
// Sprint 2 : sauvegarde dans localStorage
// Sprint 3 : une liste de tâches séparée pour chaque utilisateur connecté

let tasks = [];
let editingId = null;      // id de la tâche en cours de modification (null = aucune)
let storageKey = "tasks";  // devient "tasks_<identifiant>" après la connexion

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

// Appelée par la partie connexion (plus bas) quand l'utilisateur est connecté
function startApp(username) {
  storageKey = "tasks_" + username;
  editingId = null;
  load();
  render();
}


// ===== TaskFlow : connexion et robustesse du mot de passe (sprint 3, cybersécurité) =====
//
// LIMITE À CONNAÎTRE : tout se passe dans le navigateur. Une personne qui ouvre les
// outils de développement (F12) peut contourner cet écran ou lire localStorage.
// Une vraie authentification se fait sur un serveur. Ce code applique quand même
// les bons réflexes : mot de passe jamais stocké en clair, critères de robustesse,
// message d'erreur qui ne dit pas si c'est l'identifiant ou le mot de passe qui est faux,
// blocage temporaire après plusieurs échecs.

// Chaque règle est une fonction qui renvoie true si le mot de passe la respecte.
const PASSWORD_RULES = {
  length: (pwd) => pwd.length >= 12,          // 12 caractères minimum (recommandation CNIL / ANSSI)
  upper: (pwd) => /[A-Z]/.test(pwd),
  lower: (pwd) => /[a-z]/.test(pwd),
  digit: (pwd) => /[0-9]/.test(pwd),
  special: (pwd) => /[^A-Za-z0-9]/.test(pwd), // tout ce qui n'est ni lettre ni chiffre
};
const USERNAME_PATTERN = /^[A-Za-z0-9_.-]{3,30}$/;
const ITERATIONS = 100000;     // nombre de tours de hachage (ralentit la force brute)
const MAX_ATTEMPTS = 5;        // échecs autorisés avant blocage
const LOCK_DURATION_MS = 30000; // durée du blocage : 30 secondes

let mode = "login"; // "login" ou "register"
let failedAttempts = 0;
let lockedUntil = 0;

const authScreen = document.getElementById("auth-screen");
const appScreen = document.getElementById("app-screen");
const authForm = document.getElementById("auth-form");
const authTitle = document.getElementById("auth-title");
const authSubmit = document.getElementById("auth-submit");
const authMessage = document.getElementById("auth-message");
const usernameInput = document.getElementById("username");
const passwordInput = document.getElementById("password");
const rulesList = document.getElementById("password-rules");
const strengthBox = document.getElementById("strength");
const strengthBar = document.getElementById("strength-bar");
const toggleModeButton = document.getElementById("toggle-mode");
const currentUserLabel = document.getElementById("current-user");
const logoutButton = document.getElementById("logout");

// ---------- Robustesse du mot de passe ----------

// Renvoie par exemple { length: true, upper: false, ... }
function checkPassword(password) {
  const results = {};
  for (const [name, test] of Object.entries(PASSWORD_RULES)) {
    results[name] = test(password);
  }
  return results;
}

function isStrongPassword(password) {
  return Object.values(checkPassword(password)).every(Boolean);
}

// Coche les critères respectés et remplit la jauge
function showPasswordRules(password) {
  const results = checkPassword(password);
  let score = 0;
  for (const li of rulesList.querySelectorAll("li")) {
    const ok = results[li.dataset.rule];
    li.classList.toggle("ok", ok);
    if (ok) score++;
  }
  const total = Object.keys(PASSWORD_RULES).length;
  strengthBar.style.width = (score / total) * 100 + "%";
  strengthBar.className = score <= 2 ? "weak" : score < total ? "medium" : "strong";
}

// ---------- Hachage du mot de passe ----------

// Conversions entre octets et texte base64 (localStorage ne stocke que du texte)
function toBase64(bytes) {
  return btoa(String.fromCharCode(...bytes));
}
function fromBase64(text) {
  return Uint8Array.from(atob(text), (char) => char.charCodeAt(0));
}

// PBKDF2 avec SHA-256 : on hache le mot de passe 100 000 fois avec un "sel" aléatoire.
// - Le hachage est à sens unique : on ne peut pas retrouver le mot de passe à partir du hash.
// - Le sel fait que deux utilisateurs avec le même mot de passe ont des hash différents.
// - Les nombreuses itérations rendent chaque essai d'un attaquant plus lent.
async function hashPassword(password, salt) {
  const key = await crypto.subtle.importKey(
    "raw", new TextEncoder().encode(password), "PBKDF2", false, ["deriveBits"]
  );
  const bits = await crypto.subtle.deriveBits(
    { name: "PBKDF2", salt, iterations: ITERATIONS, hash: "SHA-256" }, key, 256
  );
  return toBase64(new Uint8Array(bits));
}

// ---------- Comptes ----------

// Les comptes sont stockés sous forme de tableau : [{ username, salt, hash }, ...]
function getUsers() {
  try {
    const users = JSON.parse(localStorage.getItem("users"));
    return Array.isArray(users) ? users : [];
  } catch {
    return [];
  }
}

// Renvoie un message d'erreur, ou null si le compte a bien été créé
async function register(username, password) {
  const users = getUsers();
  if (users.some((user) => user.username === username)) {
    return "Cet identifiant est déjà utilisé.";
  }
  if (!isStrongPassword(password)) {
    return "Le mot de passe ne respecte pas tous les critères.";
  }
  const salt = crypto.getRandomValues(new Uint8Array(16)); // sel aléatoire de 16 octets
  const hash = await hashPassword(password, salt);
  users.push({ username, salt: toBase64(salt), hash });   // le mot de passe lui-même n'est jamais enregistré
  localStorage.setItem("users", JSON.stringify(users));
  return null;
}

// Renvoie true si l'identifiant et le mot de passe sont corrects
async function login(username, password) {
  const user = getUsers().find((u) => u.username === username);
  if (!user) {
    // On calcule quand même un hash pour que la réponse prenne le même temps
    // que l'identifiant existe ou non (sinon un attaquant pourrait le deviner).
    await hashPassword(password, new Uint8Array(16));
    return false;
  }
  const hash = await hashPassword(password, fromBase64(user.salt));
  return hash === user.hash;
}

// ---------- Écrans ----------

function setMode(newMode) {
  mode = newMode;
  const isRegister = mode === "register";
  authTitle.textContent = isRegister ? "Créer un compte" : "Connexion";
  authSubmit.textContent = isRegister ? "Créer mon compte" : "Se connecter";
  toggleModeButton.textContent = isRegister
    ? "Déjà un compte ? Se connecter"
    : "Pas encore de compte ? Créer un compte";
  passwordInput.setAttribute("autocomplete", isRegister ? "new-password" : "current-password");
  rulesList.hidden = !isRegister;
  strengthBox.hidden = !isRegister;
  authMessage.textContent = "";
  showPasswordRules(passwordInput.value);
}

function openApp(username) {
  sessionStorage.setItem("currentUser", username); // la session s'arrête à la fermeture de l'onglet
  authForm.reset();
  authScreen.hidden = true;
  appScreen.hidden = false;
  currentUserLabel.textContent = username;
  startApp(username); // fonction définie plus haut dans ce fichier
}

function logout() {
  sessionStorage.removeItem("currentUser");
  appScreen.hidden = true;
  authScreen.hidden = false;
  setMode("login");
  usernameInput.focus();
}

// ---------- Événements ----------

passwordInput.addEventListener("input", () => {
  if (mode === "register") showPasswordRules(passwordInput.value);
});

toggleModeButton.addEventListener("click", () => {
  setMode(mode === "login" ? "register" : "login");
});

logoutButton.addEventListener("click", logout);

authForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const username = usernameInput.value.trim();
  const password = passwordInput.value;
  authMessage.textContent = "";

  if (!USERNAME_PATTERN.test(username)) {
    authMessage.textContent = "L'identifiant doit contenir 3 à 30 caractères : lettres, chiffres, point, tiret ou tiret bas.";
    return;
  }

  if (mode === "register") {
    authSubmit.disabled = true;
    const error = await register(username, password);
    authSubmit.disabled = false;
    if (error) {
      authMessage.textContent = error;
      return;
    }
    openApp(username);
    return;
  }

  // Mode connexion : blocage temporaire après trop d'échecs
  if (Date.now() < lockedUntil) {
    const seconds = Math.ceil((lockedUntil - Date.now()) / 1000);
    authMessage.textContent = `Trop de tentatives. Réessayez dans ${seconds} s.`;
    return;
  }

  authSubmit.disabled = true;
  const ok = await login(username, password);
  authSubmit.disabled = false;

  if (ok) {
    failedAttempts = 0;
    openApp(username);
    return;
  }

  failedAttempts++;
  if (failedAttempts >= MAX_ATTEMPTS) {
    lockedUntil = Date.now() + LOCK_DURATION_MS;
    failedAttempts = 0;
    authMessage.textContent = "Trop de tentatives. Réessayez dans 30 s.";
  } else {
    // Même message dans les deux cas : on ne révèle pas si l'identifiant existe
    authMessage.textContent = "Identifiant ou mot de passe incorrect.";
  }
});

// ---------- Démarrage ----------

document.addEventListener("DOMContentLoaded", () => {
  // crypto.subtle n'existe que sur une page "sécurisée" (https ou localhost)
  if (!window.crypto?.subtle) {
    authMessage.textContent = "Ouvrez TaskFlow avec Live Server (adresse http://localhost ou http://127.0.0.1) pour activer la connexion.";
    authSubmit.disabled = true;
    return;
  }
  const savedUser = sessionStorage.getItem("currentUser");
  if (savedUser && getUsers().some((u) => u.username === savedUser)) {
    openApp(savedUser);
  } else {
    setMode("login");
  }
});
