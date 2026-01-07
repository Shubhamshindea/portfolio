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
    adminPanel.style.display =
      adminPanel.style.display === "block" ? "none" : "block";
  };
}

if (adminLoginBtn) {
  adminLoginBtn.onclick = () => {
    if (!adminUser?.value.trim()) return alert("Enter admin name");
    if (adminPass?.value !== ADMIN_PASSWORD) return alert("Wrong password");

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
