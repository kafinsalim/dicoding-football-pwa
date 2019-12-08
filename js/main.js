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
    if (page == "home") loadStandings();
    if (page == "teams") loadTeams();
    if (page == "favorite-teams") loadFavoriteTeams();
  }
});

//#3 define render function
function showLoader() {
  document.getElementById("main-content").innerHTML = "";
  const html = `<div style="padding: 30% 15%; height: 50%;">
                  <div class="preloader-wrapper big active">
                    <div class="spinner-layer spinner-layer ">
                      <div class="circle-clipper left">
                        <div class="circle"></div>
                      </div><div class="gap-patch">
                        <div class="circle"></div>
                      </div><div class="circle-clipper right">
                        <div class="circle"></div>
                      </div>
                    </div>
                  </div>
                </div>`;
  document.getElementById("loader").innerHTML = html;
}

function hideLoader() {
  document.getElementById("loader").innerHTML = "";
}

const loadFavoriteTeams = () => {
  setTimeout(function() {
    document.getElementById("header-title").innerHTML = "Your Favorited Team";
    document.getElementById("main-content").innerHTML = "favorited team";
  }, 750);
};

// #4 LETS GIVE THEM SOME DATA
// data config
const CONFIG = {
  API_KEY: "0e05abcdd5bb40da99cb05516b5c2f9d",
  BASE_URL: "https://api.football-data.org/v2/",
  LEAGUE_ID: 2021 // Premier League (Liga Inggris)
};
const API = {
  STANDINGS: `${CONFIG.BASE_URL}competitions/${CONFIG.LEAGUE_ID}/standings`,
  TEAMS: `${CONFIG.BASE_URL}competitions/${CONFIG.LEAGUE_ID}/teams`,
  REQUEST_HEADER: {
    headers: {
      "X-Auth-Token": CONFIG.API_KEY
    }
  }
};

console.log("#4 load config", CONFIG, API);

// pseudo backend
const fetchData = url => {
  return fetch(url, API.REQUEST_HEADER)
    .then(res => {
      if (res.status !== 200) {
        console.log("Error: " + res.status);
        return Promise.reject(new Error(res.statusText));
      } else {
        return Promise.resolve(res);
      }
    })
    .then(res => res.json())
    .catch(err => {
      console.log("fetch failed", err);
    });
};

const loadStandings = () => {
  showLoader();
  if ("caches" in window) {
    caches.match(API.STANDINGS).then(function(response) {
      if (response) {
        response.json().then(function(data) {
          showStandings(data);
        });
      }
    });
  }

  fetchData(API.STANDINGS)
    .then(data => {
      showStandings(data);
    })
    .catch(error => {
      console.log(error);
    });
};

// simple render Standings, KEEP IT SIMPLE STUPID.
function showStandings(data) {
  let content = "";
  let renderTarget = document.getElementById("main-content");

  data.standings[0].table.forEach(function(standing) {
    content += `
                <tr>
                    <td><img src="${standing.team.crestUrl.replace(
                      /^http:\/\//i,
                      "https://"
                    )}" width="30px" alt="badge"/></td>
                    <td>${standing.team.name}</td>
                    <td>${standing.won}</td>
                    <td>${standing.draw}</td>
                    <td>${standing.lost}</td>
                    <td>${standing.points}</td>
                    <td>${standing.goalsFor}</td>
                    <td>${standing.goalsAgainst}</td>
                    <td>${standing.goalDifference}</td>
                </tr>
        `;
  });

  renderTarget.innerHTML = `
                <div class="card" style="padding-left: 24px; padding-right: 24px; margin-top: 30px;">

                <table class="striped responsive-table">
                    <thead>
                        <tr>
                            <th></th>
                            <th>Team Name</th>
                            <th>W</th>
                            <th>D</th>
                            <th>L</th>
                            <th>P</th>
                            <th>GF</th>
                            <th>GA</th>
                            <th>GD</th>
                        </tr>
                     </thead>
                    <tbody id="standings">
                        ${content}
                    </tbody>
                </table>
                
                </div>
    `;
  document.getElementById("header-title").innerHTML =
    "English Premier Standings";
  hideLoader();
}

const loadTeams = () => {
  showLoader();
  if ("caches" in window) {
    caches.match(API.TEAMS).then(function(response) {
      if (response) {
        response.json().then(function(data) {
          showTeams(data);
        });
      }
    });
  }

  fetchData(API.TEAMS)
    .then(data => {
      showTeams(data);
    })
    .catch(error => {
      console.log(error);
    });
};

// simple render Standings, KEEP IT SIMPLE STUPID.
function showTeams(data) {
  let content = "";
  let renderTarget = document.getElementById("main-content");
  console.log("data teams", data.teams);
  data.teams.forEach(function(team) {
    content += `
        <div class="col s12 m6">
            <div class="card">
                <div class="card-image">
                    <img src="${team.crestUrl}" style="padding: 16px; margin: auto; height: 135px; width: 135px">
                    <a class="btn-floating btn-medium halfway-fab waves-effect waves-light red"><i class="large material-icons">add</i></a>
                </div>
                <div class="card-content">
                    <h6>${team.name}</h6>
                    <p>Founded: ${team.founded}</p>
                    <p>Venue: ${team.venue}</p>
                    <a href="${team.website}">${team.website}</a>
                </div>
            </div>
        </div>
        `;
  });

  renderTarget.innerHTML = content;
  document.getElementById("header-title").innerHTML = "English Premier Teams";
  hideLoader();
}
