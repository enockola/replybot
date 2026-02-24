// 1. Navigation and Resize function
const navButton = document.querySelector(".hamburger");

function toggleNav() {
    const navList = document.querySelector(".nav-list");
    navList.classList.toggle("hide");
}

navButton.addEventListener("click", toggleNav);

function handleResize() {
    const Nav = document.querySelector(".nav-list");
    if (window.innerWidth > 1000) {
        Nav.classList.remove("hide");
    } else {
        Nav.classList.add("hide");
    }
}

window.addEventListener("resize", handleResize);