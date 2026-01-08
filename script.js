/*************************************************
 GLOBAL HELPERS
**************************************************/
const $ = id => document.getElementById(id);
const qs = q => document.querySelector(q);
const qsa = q => document.querySelectorAll(q);

const isAdmin = () => localStorage.getItem("admin") === "true";
const isEditMode = () => localStorage.getItem("editMode") === "true";

/*************************************************
 APPLY ADMIN CLASS
**************************************************/
if (isAdmin()) document.body.classList.add("admin");

/*************************************************
 HEADER + SCROLL
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
 GALLERY MODAL (CLICK WORKS)
**************************************************/
const modal = $("galleryModal");
const modalImg = $("modalImg");
const closeModal = qs(".close-modal");

function attachGalleryModal() {
  qsa(".gallery-grid img").forEach(img => {
    img.onclick = () => {
      modal.style.display = "flex";
      modalImg.src = img.src;
    };
  });
}
attachGalleryModal();

closeModal.onclick = () => modal.style.display = "none";
modal.onclick = e => { if (e.target === modal) modal.style.display = "none"; };

/*************************************************
 ADMIN LOGIN
**************************************************/
const ADMIN_PASSWORD = "143214";

$("adminBtn").onclick = () => $("adminPanel").classList.toggle("show");

$("adminLoginBtn").onclick = () => {
  if ($("adminPass").value !== ADMIN_PASSWORD) {
    alert("Wrong password");
    return;
  }
  localStorage.setItem("admin", "true");
  localStorage.setItem("editMode", "false");
  location.reload();
};

$("adminLogoutBtn").onclick = () => {
  localStorage.removeItem("admin");
  localStorage.removeItem("editMode");
  location.reload();
};

if (isAdmin()) {
  $("adminLoginForm").style.display = "none";
  $("adminControls").hidden = false;
}

/*************************************************
 EDIT MODE
**************************************************/
const editBtn = $("editModeBtn");

function setEdit(state) {
  localStorage.setItem("editMode", state);
  document.body.classList.toggle("edit-mode", state);
  editBtn.innerText = state ? "Disable Edit Mode" : "Enable Edit Mode";
}

if (isAdmin()) setEdit(isEditMode());
editBtn.onclick = () => setEdit(!isEditMode());

/*************************************************
 INLINE TEXT EDIT
**************************************************/
function saveText() {
  const data = [];
  qsa("[data-edit]").forEach(el => data.push(el.innerHTML));
  localStorage.setItem("textContent", JSON.stringify(data));
}

function restoreText() {
  const data = JSON.parse(localStorage.getItem("textContent") || "[]");
  qsa("[data-edit]").forEach((el, i) => {
    if (data[i]) el.innerHTML = data[i];
  });
}

function enableEdit() {
  qsa("h1,h2,h3,p,span,a").forEach(el => {
    el.removeAttribute("contenteditable");
    el.removeAttribute("data-edit");
  });

  if (!isAdmin() || !isEditMode()) return;

  qsa("h1,h2,h3,p,span,a").forEach(el => {
    if (el.closest("button")) return;
    el.dataset.edit = "1";
    el.ondblclick = () => el.contentEditable = true;
    el.onblur = () => { el.contentEditable = false; saveText(); };
  });
}

restoreText();
enableEdit();

/*************************************************
 ADMIN SECTION HIDE (FINAL – FIXED)
**************************************************/
qsa(".admin-toggle").forEach(btn => {
  const id = btn.dataset.target;
  const section = $(id);
  const content =
    section.querySelector(".skills-grid") ||
    section.querySelector(".gallery-grid");

  const key = "hide_" + id;

  const hidden = localStorage.getItem(key) === "true";

  if (!isAdmin()) {
    btn.style.display = "none";
    if (hidden) content.style.display = "none";
    return;
  }

  btn.style.display = "inline-block";
  btn.innerText = hidden ? "Show" : "Hide";

  if (hidden) {
    content.style.opacity = "0.4";
    content.style.filter = "grayscale(100%)";
    content.style.border = "2px dashed #ffaa00";
  }

  btn.onclick = () => {
    const nowHidden = localStorage.getItem(key) !== "true";
    localStorage.setItem(key, nowHidden);
    location.reload();
  };
});

/*************************************************
 CERTIFICATES (UPLOAD + HIDE + DELETE)
**************************************************/
const uploadBtn = $("uploadCertBtn");
const certInput = $("certUpload");
const certList = $("certList");

let certs = JSON.parse(localStorage.getItem("certificates")) || [];

if (!isAdmin()) uploadBtn.style.display = "none";

uploadBtn.onclick = () => certInput.click();

certInput.onchange = () => {
  const file = certInput.files[0];
  if (!file) return;

  certs.push({ name: file.name, url: URL.createObjectURL(file), hidden:false });
  localStorage.setItem("certificates", JSON.stringify(certs));
  location.reload();
};

function renderCerts() {
  certList.innerHTML = "";

  certs.forEach((c,i) => {
    if (c.hidden && !isAdmin()) return;

    const wrap = document.createElement("div");
    wrap.className = "cert-item";

    const a = document.createElement("a");
    a.href = c.url;
    a.target = "_blank";
    a.className = "btn primary";
    a.textContent = c.name;

    wrap.appendChild(a);

    if (isAdmin()) {
      const h = document.createElement("button");
      h.textContent = c.hidden ? "Show" : "Hide";
      h.className = "admin-btn";
      h.onclick = () => {
        certs[i].hidden = !certs[i].hidden;
        localStorage.setItem("certificates", JSON.stringify(certs));
        location.reload();
      };

      const d = document.createElement("button");
      d.textContent = "Delete";
      d.className = "admin-btn";
      d.onclick = () => {
        certs.splice(i,1);
        localStorage.setItem("certificates", JSON.stringify(certs));
        location.reload();
      };

      wrap.append(h,d);
    }

    certList.appendChild(wrap);
  });
}
renderCerts();
document.addEventListener("DOMContentLoaded", () => {

  const menuBtn = document.getElementById("menuBtn");
  const menuDropdown = document.getElementById("menuDropdown");
  const themeToggle = document.getElementById("themeToggle");
  const themeIcon = document.getElementById("themeIcon");

  if (!menuBtn || !menuDropdown || !themeToggle || !themeIcon) {
    console.error("Theme menu elements missing");
    return;
  }

  // Restore theme
  const savedTheme = localStorage.getItem("theme");
  if (savedTheme === "light") {
    document.body.classList.add("light");
    themeIcon.textContent = "☀️";
  }

  // Open / close menu
  menuBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    menuDropdown.classList.toggle("show");
  });

  // Toggle theme
  themeToggle.addEventListener("click", () => {
    document.body.classList.toggle("light");

    const isLight = document.body.classList.contains("light");
    themeIcon.textContent = isLight ? "☀️" : "🌙";
    localStorage.setItem("theme", isLight ? "light" : "dark");

    menuDropdown.classList.remove("show");
  });

  // Close menu when clicking outside
  document.addEventListener("click", () => {
    menuDropdown.classList.remove("show");
  });

});
