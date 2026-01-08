/*************************************************
 SAFE GLOBAL STATE
**************************************************/
const ADMIN_PASSWORD = "143214";

const $ = (id) => document.getElementById(id);
const qs = (q) => document.querySelector(q);
const qsa = (q) => document.querySelectorAll(q);

const isAdmin = () => localStorage.getItem("admin") === "true";
const isEditMode = () => localStorage.getItem("editMode") === "true";

if (isAdmin()) document.body.classList.add("admin");

/*************************************************
 HEADER + SCROLL BAR
**************************************************/
const header = qs(".header");
const bar = $("scrollProgress");
let lastScroll = window.scrollY;

window.addEventListener("scroll", () => {
  const y = window.scrollY;

  if (header) {
    if (y > lastScroll && y > 120) header.classList.add("header-hidden");
    else header.classList.remove("header-hidden");
  }

  if (bar) {
    const h = document.documentElement.scrollHeight -
              document.documentElement.clientHeight;
    bar.style.width = (y / h) * 100 + "%";
  }

  lastScroll = y;
});

/*************************************************
 GALLERY MODAL (FIXED)
**************************************************/
const modal = $("galleryModal");
const modalImg = $("modalImg");
const closeModal = qs(".close-modal");

function attachGalleryModal() {
  qsa(".gallery-grid img").forEach(img => {
    img.onclick = () => {
      if (!modal || !modalImg) return;
      modal.style.display = "flex";
      modalImg.src = img.src;
    };
  });
}
attachGalleryModal();

if (closeModal && modal) {
  closeModal.onclick = () => (modal.style.display = "none");
  modal.onclick = (e) => {
    if (e.target === modal) modal.style.display = "none";
  };
}

/*************************************************
 ADMIN PANEL (FIXED)
**************************************************/
const adminBtn = $("adminBtn");
const adminPanel = $("adminPanel");
const adminUser = $("adminUser");
const adminPass = $("adminPass");
const adminLoginBtn = $("adminLoginBtn");
const adminLogoutBtn = $("adminLogoutBtn");
const adminControls = $("adminControls");
const adminLoginForm = $("adminLoginForm");

if (adminBtn && adminPanel) {
  adminBtn.onclick = () => {
    adminPanel.classList.toggle("show");

  };
}

let attempts = Number(localStorage.getItem("adminAttempts")) || 0;
let lockedUntil = Number(localStorage.getItem("adminLockedUntil")) || 0;

if (adminLoginBtn) {
  adminLoginBtn.onclick = () => {

    const now = Date.now();

    if (lockedUntil && now < lockedUntil) {
      alert("Admin login locked. Try again later.");
      return;
    }

    if (!adminUser.value.trim()) {
      alert("Enter admin name");
      return;
    }

    if (adminPass.value !== ADMIN_PASSWORD) {
      attempts++;
      localStorage.setItem("adminAttempts", attempts);

      adminLoginForm.classList.add("shake");
      setTimeout(() => adminLoginForm.classList.remove("shake"), 400);

      if (attempts >= 3) {
        lockedUntil = now + 5 * 60 * 1000; // 5 minutes
        localStorage.setItem("adminLockedUntil", lockedUntil);
        alert("Too many attempts. Login locked for 5 minutes.");
      } else {
        alert(`Wrong password (${3 - attempts} attempts left)`);
      }
      return;
    }

    // SUCCESS
    localStorage.removeItem("adminAttempts");
    localStorage.removeItem("adminLockedUntil");

    localStorage.setItem("admin", "true");
    localStorage.setItem("editMode", "false");
    location.reload();
  };
}

if (adminLogoutBtn) {
  adminLogoutBtn.onclick = () => {
    if (!confirm("Logout admin?")) return;
    localStorage.removeItem("admin");
    localStorage.removeItem("editMode");
    location.reload();
  };
}

if (isAdmin()) {
  adminLoginForm && (adminLoginForm.style.display = "none");
  adminControls && (adminControls.hidden = false);
}

/*************************************************
 EDIT MODE (FIXED)
**************************************************/
const editModeBtn = $("editModeBtn");

function setEditMode(state) {
  localStorage.setItem("editMode", state ? "true" : "false");
  document.body.classList.toggle("edit-mode", state);
  if (editModeBtn)
    editModeBtn.innerText = state ? "Disable Edit Mode" : "Enable Edit Mode";
  enableInlineEdit();
}

if (isAdmin()) setEditMode(isEditMode());

if (editModeBtn) {
  editModeBtn.onclick = () => setEditMode(!isEditMode());
}

/*************************************************
 INLINE TEXT EDIT (SAFE)
**************************************************/
function saveTextContent() {
  const data = [];
  qsa("[data-editable]").forEach(el => data.push(el.innerHTML));
  localStorage.setItem("textContent", JSON.stringify(data));
  showSaved();

}

function restoreTextContent() {
  const data = JSON.parse(localStorage.getItem("textContent") || "[]");
  qsa("[data-editable]").forEach((el, i) => {
    if (data[i]) el.innerHTML = data[i];
  });
}

function enableInlineEdit() {
  qsa("h1,h2,h3,p,span,a").forEach(el => {
    el.removeAttribute("contenteditable");
  });

  if (!isAdmin() || !isEditMode()) return;

  qsa("h1,h2,h3,p,span,a").forEach(el => {
    if (el.closest("button")) return;

    el.setAttribute("data-editable", "true");

    el.ondblclick = () => {
      el.contentEditable = "true";
      el.focus();
    };

    el.onblur = () => {
      el.contentEditable = "false";
      saveTextContent();
    };
  });
}

restoreTextContent();
enableInlineEdit();

/*************************************************
 PROFILE IMAGE UPLOAD (FIXED)
**************************************************/
const profileImg = qs("#profileFloat img");
const profileUpload = document.createElement("input");
profileUpload.type = "file";
profileUpload.accept = "image/*";
profileUpload.hidden = true;
document.body.appendChild(profileUpload);

if (profileImg) {
  profileImg.onclick = (e) => {
    if (!isAdmin() || !isEditMode()) return;
    e.stopPropagation();
    profileUpload.click();
  };
}

profileUpload.onchange = () => {
  const file = profileUpload.files[0];
  if (!file || !profileImg) return;
  const url = URL.createObjectURL(file);
  profileImg.src = url;
  localStorage.setItem("profileImg", url);
};

const savedProfile = localStorage.getItem("profileImg");
if (savedProfile && profileImg) profileImg.src = savedProfile;

/*************************************************
 GALLERY SAVE / RESTORE
**************************************************/
function saveGallery() {
  const imgs = [];
  qsa(".gallery-grid img").forEach(img => imgs.push(img.src));
  localStorage.setItem("galleryImgs", JSON.stringify(imgs));
}

function restoreGallery() {
  const imgs = JSON.parse(localStorage.getItem("galleryImgs") || "[]");
  if (!imgs.length) return;

  const grid = qs(".gallery-grid");
  if (!grid) return;

  grid.innerHTML = "";
  imgs.forEach(src => {
    const img = document.createElement("img");
    img.src = src;
    grid.appendChild(img);
  });

  attachGalleryModal();
}
restoreGallery();
/*************************************************
 MOBILE HAPTIC FEEDBACK (ANDROID ONLY)
**************************************************/
if (/Android/i.test(navigator.userAgent) && "vibrate" in navigator) {

  /* Profile photo tap */
  const profileImg = document.querySelector("#profileFloat img");
  if (profileImg) {
    profileImg.addEventListener("click", () => {
      navigator.vibrate(20);
    });
  }

  /* Button taps */
  document.querySelectorAll(".btn").forEach(btn => {
    btn.addEventListener("click", () => {
      navigator.vibrate(10);
    });
  });

}
/*************************************************
 THEME TOGGLE + 3 DOT MENU
**************************************************/
const menuBtn = document.getElementById("menuBtn");
const menuDropdown = document.getElementById("menuDropdown");
const themeToggle = document.getElementById("themeToggle");
const themeIcon = document.getElementById("themeIcon");

/* Restore theme */
const savedTheme = localStorage.getItem("theme");
if (savedTheme === "light") {
  document.body.classList.add("light");
  themeIcon.textContent = "☀️";
}

/* Toggle menu */
menuBtn.onclick = () => {
  menuDropdown.classList.toggle("show");
};

/* Toggle theme */
themeToggle.onclick = () => {
  document.body.classList.toggle("light");

  const isLight = document.body.classList.contains("light");
  themeIcon.textContent = isLight ? "☀️" : "🌙";
  localStorage.setItem("theme", isLight ? "light" : "dark");

  menuDropdown.classList.remove("show");
};

/* Close menu on outside click */
document.addEventListener("click", (e) => {
  if (!e.target.closest(".theme-menu")) {
    menuDropdown.classList.remove("show");
  }
});
document.addEventListener("click", (e) => {
  const panel = document.getElementById("adminPanel");
  const btn = document.getElementById("adminBtn");

  if (!panel || !btn) return;

  if (
    panel.classList.contains("show") &&
    !panel.contains(e.target) &&
    e.target !== btn
  ) {
    panel.classList.remove("show");
  }
});
function showSaved() {
  let tag = document.getElementById("saveTag");
  if (!tag) {
    tag = document.createElement("div");
    tag.id = "saveTag";
    tag.innerText = "Saved ✓";
    tag.style.cssText =
      "position:fixed;bottom:20px;left:20px;background:#00e5a8;color:#000;padding:6px 12px;border-radius:12px;font-size:12px;z-index:6000;";
    document.body.appendChild(tag);
  }

  tag.style.opacity = "1";
  setTimeout(() => (tag.style.opacity = "0"), 1200);
}
window.addEventListener("beforeunload", (e) => {
  if (localStorage.getItem("editMode") === "true") {
    e.preventDefault();
    e.returnValue = "";
  }
});
const sections = document.querySelectorAll("section");
const navLinks = document.querySelectorAll(".nav-links a");

window.addEventListener("scroll", () => {
  let current = "";

  sections.forEach(sec => {
    const top = sec.offsetTop - 140;
    if (scrollY >= top) current = sec.getAttribute("id");
  });

  navLinks.forEach(a => {
    a.classList.remove("active");
    if (a.getAttribute("href") === "#" + current) {
      a.classList.add("active");
    }
  });
});
document.querySelectorAll("img").forEach(img => {
  img.onerror = () => {
    img.src = "images/profile.jpg";
  };
});
if (isAdmin()) {
  let timer;
  const reset = () => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      alert("Admin session expired");
      localStorage.removeItem("admin");
      localStorage.removeItem("editMode");
      location.reload();
    }, 10 * 60 * 1000);
  };

  ["click","mousemove","keydown","scroll"].forEach(e =>
    document.addEventListener(e, reset)
  );

  reset();
}
if (isAdmin()) {
  window.addEventListener("beforeunload", (e) => {
    if (isEditMode()) {
      e.preventDefault();
      e.returnValue = "";
    }
  });
}
window.addEventListener("load", () => {
  document.body.classList.add("loaded");
});
/* MOUSE FOLLOW GLOW */
const glow = document.querySelector(".cursor-glow");

if (glow && window.innerWidth > 768) {
  document.addEventListener("mousemove", (e) => {
    glow.style.left = e.clientX + "px";
    glow.style.top = e.clientY + "px";
  });
}
/* MAGNETIC CURSOR EFFECT */
if (window.innerWidth > 768) {
  document.querySelectorAll(
    ".btn, .nav-links a, .skill-card, .gallery-grid img"
  ).forEach(el => {

    el.classList.add("magnetic");

    el.addEventListener("mousemove", (e) => {
      const rect = el.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;

      el.style.transform = `translate(${x * 0.15}px, ${y * 0.15}px)`;
    });

    el.addEventListener("mouseleave", () => {
      el.style.transform = "translate(0,0)";
    });
  });
}
