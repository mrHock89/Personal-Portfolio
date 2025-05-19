// For applying hover to Profile photo
const profilePic = document.getElementById("profilePic");

profilePic.addEventListener("mouseover", () => {
  profilePic.classList.add("hover-effect");
});

profilePic.addEventListener("mouseout", () => {
  profilePic.classList.remove("hover-effect");
});

// Typed Animation
var typed = new Typed(".auto-type", {
    strings: ["Manoj", "Mondal"],
    typeSpeed: 150,
    backSpeed: 150,
    loop: true
})