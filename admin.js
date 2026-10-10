/* ===================================================
   PLEIADES ADMIN PANEL LOGIC
   =================================================== */

// ============ CHANGE THIS PASSWORD ============
const ADMIN_PASSWORD = "pleiades2026";
// ==============================================

const STORAGE_KEY = "pleiades_tutors";

// ---------- LOGIN ----------
function tryLogin() {
  const entered = document.getElementById("passwordInput").value;
  const errorEl = document.getElementById("loginError");

  if (entered === ADMIN_PASSWORD) {
    sessionStorage.setItem("pleiades_admin_logged_in", "yes");
    showAdmin();
  } else {
    errorEl.textContent = "❌ Wrong password. Try again.";
    document.getElementById("passwordInput").value = "";
  }
}

// Allow pressing Enter on password field
document.addEventListener("DOMContentLoaded", () => {
  const pwd = document.getElementById("passwordInput");
  if (pwd) {
    pwd.addEventListener("keydown", (e) => {
      if (e.key === "Enter") tryLogin();
    });
  }

  // Auto-login if session is active
  if (sessionStorage.getItem("pleiades_admin_logged_in") === "yes") {
    showAdmin();
  }
});

function showAdmin() {
  document.getElementById("loginScreen").style.display = "none";
  document.getElementById("adminPanel").style.display = "block";
  renderTutorList();
}

function logout() {
  sessionStorage.removeItem("pleiades_admin_logged_in");
  location.reload();
}

// ---------- DATA STORAGE ----------
function getTutors() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

function saveTutors(tutors) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tutors));
}

// ---------- ADD TUTOR ----------
function addTutor() {
  const msg = document.getElementById("formMessage");

  const tutor = {
    name: document.getElementById("f_name").value.trim(),
    photo: document.getElementById("f_photo").value.trim(),
    subjects: document.getElementById("f_subjects").value.split(",").map(s => s.trim()).filter(Boolean),
    levels: document.getElementById("f_levels").value.split(",").map(s => s.trim()).filter(Boolean),
    pricePerHour: Number(document.getElementById("f_price").value),
    currency: "GHS",
    location: document.getElementById("f_location").value.trim(),
    phone: document.getElementById("f_phone").value.trim(),
    email: document.getElementById("f_email").value.trim(),
    qualifications: document.getElementById("f_quals").value.trim(),
    bio: document.getElementById("f_bio").value.trim()
  };

  // Validation
  if (!tutor.name || !tutor.photo || !tutor.subjects.length || !tutor.levels.length ||
      !tutor.pricePerHour || !tutor.location || !tutor.phone ||
      !tutor.email || !tutor.qualifications || !tutor.bio) {
    msg.textContent = "⚠️ Please fill in ALL fields marked with *.";
    msg.className = "form-message error";
    return;
  }

  const tutors = getTutors();
  tutors.unshift(tutor); // newest first
  saveTutors(tutors);

  msg.textContent = `✅ "${tutor.name}" added successfully!`;
  msg.className = "form-message success";

  clearForm();
  renderTutorList();

  // Clear success message after 4 sec
  setTimeout(() => { msg.textContent = ""; }, 4000);
}

function clearForm() {
  ["f_name","f_photo","f_subjects","f_levels","f_price",
   "f_location","f_phone","f_email","f_quals","f_bio"].forEach(id => {
    document.getElementById(id).value = "";
  });
}

// ---------- RENDER TUTOR LIST ----------
function renderTutorList() {
  const container = document.getElementById("tutorList");
  const tutors = getTutors();

  document.getElementById("tutorCount").textContent = tutors.length;

  if (!tutors.length) {
    container.innerHTML = '<p class="empty-list">No tutors yet. Add one using the form above.</p>';
    return;
  }

  container.innerHTML = tutors.map((t, i) => `
    <div class="tutor-row">
      <img src="${t.photo}" alt="${t.name}"
           onerror="this.src='https://via.placeholder.com/100/0b6e4f/ffffff?text=${encodeURIComponent(t.name.charAt(0))}'" />
      <div class="tutor-row-info">
        <h3>${t.name}</h3>
        <p>${t.subjects.join(", ")} · ${t.levels.join(", ")} · GHS ${t.pricePerHour}/hr</p>
        <p>📍 ${t.location}</p>
      </div>
      <div class="tutor-row-actions">
        <button class="btn-delete" onclick="deleteTutor(${i})">🗑 Delete</button>
      </div>
    </div>
  `).join("");
}

// ---------- DELETE TUTOR ----------
function deleteTutor(index) {
  const tutors = getTutors();
  const name = tutors[index].name;
  if (!confirm(`Delete "${name}"? This cannot be undone.`)) return;

  tutors.splice(index, 1);
  saveTutors(tutors);
  renderTutorList();
}
