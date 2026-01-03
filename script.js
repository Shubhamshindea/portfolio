/* THEME */
const toggle=document.getElementById("themeToggle");
document.body.className=localStorage.getItem("theme")||"dark";
toggle.onclick=()=>{document.body.classList.toggle("light");localStorage.setItem("theme",document.body.className);};

/* HEADER HIDE */
const header=document.querySelector(".header");
let last=window.scrollY;
window.addEventListener("scroll",()=>{let y=window.scrollY;if(y>last&&y>120)header.classList.add("header-hidden");else header.classList.remove("header-hidden");last=y;});

/* SCROLL BAR */
const bar=document.getElementById("scrollProgress");
window.addEventListener("scroll",()=>{const h=document.documentElement.scrollHeight-document.documentElement.clientHeight;bar.style.width=(window.scrollY/h)*100+"%";});

/* PROFILE FLOAT */
const profile=document.getElementById("profileFloat");
window.addEventListener("scroll",()=>{window.scrollY>150?profile.classList.add("scrolled"):profile.classList.remove("scrolled");});
profile.onclick=()=>document.getElementById("home").scrollIntoView({behavior:"smooth"});

/* PHONE */
document.querySelector(".phone-copy").onclick=()=>{/Mobi|Android/i.test(navigator.userAgent)?location.href="tel:+916362123723":navigator.clipboard.writeText("+916362123723");};

/* GALLERY MODAL */
const modal=document.getElementById("galleryModal");
const modalImg=document.getElementById("modalImg");
document.querySelectorAll(".gallery-grid img").forEach(img=>img.onclick=()=>{modal.style.display="flex";modalImg.src=img.src;});
document.querySelector(".close-modal").onclick=()=>modal.style.display="none";
modal.onclick=e=>{if(e.target===modal)modal.style.display="none";};

/* ADMIN MODE */
const ADMIN_PASSWORD="143214";
const adminBtn=document.getElementById("adminBtn");
const adminPanel=document.getElementById("adminPanel");
const adminLogin=document.getElementById("adminLogin");
const adminPass=document.getElementById("adminPass");
const adminControls=document.getElementById("adminControls");

adminBtn.onclick=()=>adminPanel.style.display=adminPanel.style.display==="block"?"none":"block";
adminLogin.onclick=()=>{if(adminPass.value===ADMIN_PASSWORD){localStorage.setItem("admin","true");adminControls.hidden=false;adminPass.style.display="none";adminLogin.style.display="none";}else alert("Wrong password");};
document.getElementById("logoutAdmin").onclick=()=>{localStorage.removeItem("admin");location.reload();};
if(localStorage.getItem("admin")==="true"){adminControls.hidden=false;adminPass.style.display="none";adminLogin.style.display="none";}

/* CERT UPLOAD */
const certUpload=document.getElementById("certUpload");
const certList=document.getElementById("certList");
document.getElementById("addCert").onclick=()=>certUpload.click();
certUpload.onchange=()=>{const f=certUpload.files[0];if(!f)return;const url=URL.createObjectURL(f);const c=JSON.parse(localStorage.getItem("certs")||"[]");c.push({name:f.name,url});localStorage.setItem("certs",JSON.stringify(c));renderCerts();};
function renderCerts(){certList.innerHTML="";(JSON.parse(localStorage.getItem("certs")||"[]")).forEach(c=>{const li=document.createElement("li");li.innerHTML=`<a href="${c.url}" target="_blank">${c.name}</a>`;certList.appendChild(li);});}
renderCerts();

/* MOBILE PERFORMANCE */
if(/Mobi|Android/i.test(navigator.userAgent)){const glow=document.getElementById("cursorGlow");if(glow)glow.remove();}
