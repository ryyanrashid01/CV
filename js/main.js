// Show menu
const showMenu = (toggleId, navId, menuOpenId, menuCloseId) => {
  const toggle = document.getElementById(toggleId),
    nav = document.getElementById(navId),
    menuOpen = document.getElementById(menuOpenId),
    menuClose = document.getElementById(menuCloseId);
  if (toggle && nav) {
    toggle.addEventListener("click", () => {
      nav.classList.toggle("show-menu");
      menuOpen.classList.toggle("hide-menu-icon");
      menuClose.classList.toggle("show-menu-icon");
    });
  }
};
showMenu("navToggle", "navMenu", "menuOpen", "menuClose");

// Remove menu mobile after clicking on a link
const navLink = document.querySelectorAll(".nav-link");
function linkAction() {
  const navMenu = document.getElementById("navMenu"),
    menuOpen = document.getElementById("menuOpen"),
    menuClose = document.getElementById("menuClose");
  navMenu.classList.remove("show-menu");
  menuOpen.classList.toggle("hide-menu-icon");
  menuClose.classList.toggle("show-menu-icon");
}
navLink.forEach((n) => n.addEventListener("click", linkAction));

// Scroll sections active link
const sections = document.querySelectorAll("section[id]");
function scrollActive() {
  const scrollY = window.pageYOffset;
  sections.forEach((current) => {
    const sectionHeight = current.offsetHeight;
    const sectionTop = current.offsetTop - 50;
    let sectionId = current.getAttribute("id");
    if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
      document
        .querySelector(".nav-menu a[href*=" + sectionId + "]")
        .classList.add("active-link");
    } else {
      document
        .querySelector(".nav-menu a[href*=" + sectionId + "]")
        .classList.remove("active-link");
    }
  });
}
window.addEventListener("scroll", scrollActive);

// Remove menu mobile if clicked on canvas
const canvas = document.querySelector(".resume");
const hideMenu = () => {
  const navMenu = document.querySelector(".show-menu"),
    menuOpen = document.getElementById("menuOpen"),
    menuClose = document.getElementById("menuClose");
  if (navMenu) {
    navMenu.classList.remove("show-menu");
    menuOpen.classList.toggle("hide-menu-icon");
    menuClose.classList.toggle("show-menu-icon");
  }
};
canvas.addEventListener("click", hideMenu);
// Show scroll top
function scrollTop() {
  const scrollTop = document.getElementById("scrollTop");
  if (this.scrollY >= 200) scrollTop.classList.add("show-scroll");
  else scrollTop.classList.remove("show-scroll");
}
window.addEventListener("scroll", scrollTop);

// Dark / light theme
const themeButton = document.getElementById("themeButton");
const darkTheme = "dark-theme";
const iconTheme = "bx-sun";
// Select theme based on time of day
const setTheme = () => {
  let timeHours = new Date().getHours();
  let selectedTheme, selectedIcon;
  if (timeHours > 5 && timeHours < 19) {
    selectedTheme = "light";
    selectedIcon = "bx-sun";
  } else {
    selectedTheme = "dark";
    selectedIcon = "bx-moon";
  }
  return [selectedTheme, selectedIcon];
};
const [selectedTheme, selectedIcon] = setTheme();
if (selectedTheme) {
  document.body.classList[selectedTheme === "dark" ? "add" : "remove"](
    darkTheme
  );
  themeButton.classList[selectedIcon === "bx-moon" ? "add" : "remove"](
    iconTheme
  );
}
// Activate / deactivate the theme manually with the button
themeButton.addEventListener("click", () => {
  document.body.classList.toggle(darkTheme);
  themeButton.classList.toggle(iconTheme);
});
