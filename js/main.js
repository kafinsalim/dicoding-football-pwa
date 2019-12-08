// #0 execute this file
console.log("#0 main.js executed");

// #1 register sw
console.log("#1 sw.js executed");
// Periksa service worker
if (!("serviceWorker" in navigator)) {
  console.log("Service worker tidak didukung browser ini.");
} else {
  registerServiceWorker();
}
// Register service worker
function registerServiceWorker() {
  return navigator.serviceWorker
    .register("../sw.js")
    .then(function(registration) {
      console.warn("Registrasi service worker berhasil.", registration);
      return registration;
    })
    .catch(function(err) {
      console.error("Registrasi service worker gagal.", err);
    });
}

// #2 Load Navigator
document.addEventListener("DOMContentLoaded", function() {
  console.log("#2 DOMContentLoaded");
  // Activate sidebar nav
  var elems = document.querySelectorAll(".sidenav");
  M.Sidenav.init(elems);

  loadNav();
  function loadNav() {
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
      if (this.readyState == 4) {
        if (this.status != 200) return;

        // Muat daftar tautan menu
        document.querySelectorAll(".topnav, .sidenav").forEach(function(elm) {
          elm.innerHTML = xhttp.responseText;
        });

        // Daftarkan event listener untuk setiap tautan menu
        document
          .querySelectorAll(".sidenav a, .topnav a")
          .forEach(function(elm) {
            elm.addEventListener("click", function(event) {
              // Tutup sidenav
              var sidenav = document.querySelector(".sidenav");
              M.Sidenav.getInstance(sidenav).close();

              // Muat konten halaman yang dipanggil
              page = event.target.getAttribute("href").substr(1);
              loadPage(page);
            });
          });
      }
    };
    xhttp.open("GET", "nav.html", true);
    xhttp.send();
  }

  // Load page content
  var page = window.location.hash.substr(1);
  if (page == "") page = "home";

  loadPage(page);
  function loadPage(page) {
    if (page == "home") console.log("go home"); //loadStandings();
    if (page == "teams") console.log("go team"); //loadTeams();
    if (page == "favorite-team") console.log("go favorite-team"); //loadFavoriteTeams();
  }
});

//#3 define render function
