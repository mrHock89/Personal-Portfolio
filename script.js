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

// For accessing back to top button
window.onscroll = function () {
  const btn = document.getElementById("backToTop");
  if (document.body.scrollTop > 200 || document.documentElement.scrollTop > 200) {
    btn.style.display = "block";
  } else {
    btn.style.display = "none";
  }
};

document.getElementById("backToTop").addEventListener("click", function () {
  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });
});
