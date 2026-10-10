/* ===================================================
   PLEIADES ADMIN PANEL — Firebase Version
   =================================================== */

const ADMIN_PASSWORD = "pleiades2026";  // ← Change this later!

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

document.addEventListener("DOMContentLoaded", () => {
  const pwd = document.getElementById("passwordInput");
  if (pwd) {
    pwd.addEventListener("keydown", (e) => {
      if (e.key === "Enter") tryLogin();
    });
  }
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

// ---------- ADD TUTOR (Firebase) ----------
async function addTutor() {
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

  msg.textContent = "⏳ Saving to Firebase...";
  msg.className = "form-message";

  try {
    const { collection, addDoc, serverTimestamp } = window.fb;
    await addDoc(collection(window.db, "tutors"), {
      ...tutor,
      createdAt: serverTimestamp()
    });
    msg.textContent = `✅ "${tutor.name}" saved to Firebase!`;
    msg.className = "form-message success";
    clearForm();
    renderTutorList();
    setTimeout(() => { msg.textContent = ""; }, 4000);
  } catch (err) {
    console.error(err);
    msg.textContent = "❌ Error: " + err.message;
    msg.className = "form-message error";
  }
}

function clearForm() {
  ["f_name","f_photo","f_subjects","f_levels","f_price",
   "f_location","f_phone","f_email","f_quals","f_bio"].forEach(id => {
    document.getElementById(id).value = "";
  });
}

// ---------- LOAD & RENDER TUTORS ----------
async function renderTutorList() {
  const container = document.getElementById("tutorList");
  container.innerHTML = '<p class="empty-list">Loading from Firebase...</p>';

  try {
    const { collection, getDocs, orderBy, query } = window.fb;
    const q = query(collection(window.db, "tutors"), orderBy("createdAt", "desc"));
    const snapshot = await getDocs(q);
    const tutors = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));

    document.getElementById("tutorCount").textContent = tutors.length;

    if (!tutors.length) {
      container.innerHTML = '<p class="empty-list">No tutors yet. Add one using the form above.</p>';
      return;
    }

    container.innerHTML = tutors.map(t => `
      <div class="tutor-row">
        <img src="${t.photo}" alt="${t.name}"
             onerror="this.src='https://via.placeholder.com/100/0b6e4f/ffffff?text=${encodeURIComponent(t.name.charAt(0))}'" />
        <div class="tutor-row-info">
          <h3>${t.name}</h3>
          <p>${t.subjects.join(", ")} · ${t.levels.join(", ")} · GHS ${t.pricePerHour}/hr</p>
          <p>📍 ${t.location}</p>
        </div>
        <div class="tutor-row-actions">
          <button class="btn-delete" onclick="deleteTutor('${t.id}', '${t.name.replace(/'/g, "")}')">🗑 Delete</button>
        </div>
      </div>
    `).join("");
  } catch (err) {
    console.error(err);
    container.innerHTML = `<p class="empty-list">❌ Error loading: ${err.message}</p>`;
  }
}

// ---------- DELETE TUTOR ----------
async function deleteTutor(id, name) {
  if (!confirm(`Delete "${name}"? This cannot be undone.`)) return;
  try {
    const { doc, deleteDoc } = window.fb;
    await deleteDoc(doc(window.db, "tutors", id));
    renderTutorList();
  } catch (err) {
    alert("Error deleting: " + err.message);
  }
}

// ---------- MAKE FUNCTIONS GLOBAL ----------
window.tryLogin = tryLogin;
window.logout = logout;
window.addTutor = addTutor;
window.clearForm = clearForm;
window.deleteTutor = deleteTutor;
