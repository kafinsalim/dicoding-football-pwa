// should initiated first var put here
var teamsData; // global State

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

        // add event on click app name
        logoContainer.addEventListener("click", function(event) {
          loadPage("home");
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
  mainContent.innerHTML = "";
  headerTitle.innerHTML = "";
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
  let renderTarget = mainContent;

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
  headerTitle.innerHTML = "English Premier Standings";
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
      teamsData = data; // write to global var (like state)
      showTeams(data);
    })
    .catch(error => {
      console.log(error);
    });
};

// simple render Standings, KEEP IT SIMPLE STUPID.
function showTeams(data) {
  let content = "";
  let renderTarget = mainContent;
  data.teams.forEach(function(team) {
    content += `
        <div class="col s12 m6">
            <div class="card">
                <div class="card-image">
                    <img src="${team.crestUrl}" style="padding: 16px; margin: auto; height: 135px; width: 135px">
                    <a onclick="addFavoriteTeam(${team.id})" class="btn-floating btn-medium halfway-fab waves-effect waves-light red"><i class="large material-icons">add</i></a>
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
  headerTitle.innerHTML = "English Premier Teams";
  hideLoader();
}

var loadFavoriteTeams = async () => {
  showLoader();
  const html = `
      <a class="waves-effect waves-light btn-small red" onclick="clearAllFavoriteTeam()">Kosongkan tim favorit</a>
      <div class="row" style="margin-top: 16px;">
        <div id="listFavoriteTeamElement"></div>
      </div>
    `;
  headerTitle.innerHTML = "Favorited Teams";
  mainContent.innerHTML = html;
  await renderFavoriteList(); // render favorited teams
  hideLoader();
};

// # indexedDB Operation
if (indexedDB) console.log("#5 indexedDB loaded");
if (!("indexedDB" in window)) {
  console.log("This browser doesn't support IndexedDB");
}

var db;

async function init() {
  db = await idb.openDb("teamsDb", 1, db => {
    db.createObjectStore("teams", { keyPath: "name" });
  });
}

async function renderFavoriteList() {
  await init();
  let tx = db.transaction("teams", "readwrite");
  let teamStore = tx.objectStore("teams");

  let teams = (await teamStore.getAll()) || [];

  if (teams.length) {
    listFavoriteTeamElement.innerHTML = teams
      .map(
        team => `
          <div class="col s12 m6 l6">
            <div class="card">
              <div class="card-content">
                <div class="center"><img width="64" height="64" src="${team.crestUrl}"></div>
                <div class="center flow-text">${team.name}</div>
                <div class="center">Founded: ${team.founded}</div>
                <div class="center">Venue: ${team.venue}</div>
                <div class="center"><a href="${team.website}" target="_blank">${team.website}</a></div>
              </div>
            </div>
          </div>
        `
      )
      .join("");
  } else {
    listFavoriteTeamElement.innerHTML =
      '<h5 class="center-align">You have no favorite team! get one !</h5>';
  }
  hideLoader();
}

async function clearAllFavoriteTeam() {
  let tx = db.transaction("teams", "readwrite");
  await tx.objectStore("teams").clear();
  loadFavoriteTeams();
  M.toast({ html: `Semua Team Favorit telah dihapus !` });
}

async function addFavoriteTeam(teamId) {
  var teamObject = teamsData.teams.filter(el => el.id == teamId)[0];
  let tx = db.transaction("teams", "readwrite");
  try {
    await tx.objectStore("teams").add(teamObject);
    M.toast({
      html: `${teamObject.name} ditambahkan ke Team Favorit.`
    });
  } catch (err) {
    if (err.name == "ConstraintError") {
      M.toast({
        html: `${teamObject.name} sudah pernah ditambahkan ke Team Favorit.`
      });
    } else {
      console.error("Team gagal disimpan", err);
      throw err;
    }
  }
}

// log and catch error
window.addEventListener("unhandledrejection", event => {
  console.warn("Error idb: " + JSON.stringify(event));
});

// #6 PUSH NOTIFICATION
var webPushConfig = {
  publicKey:
    "BCSpgn9yXj5iYM7xhhkPYekfUEqO4B5jSAhgbMHB7zjFfChiFQ2qtNf-Zbfr7KQlJ50mgicVO76r7vdn4HDe_nk",
  privateKey: "j4kuideRR15H3PjRIgR7ChPJUomtm-GlVMKKPkkLUl0"
};

// Periksa fitur Notification API
if ("Notification" in window) {
  requestPermission();
  if ("PushManager" in window) {
    navigator.serviceWorker.getRegistration().then(function(registration) {
      registration.pushManager
        .subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(webPushConfig.publicKey)
        })
        .then(function(subscribe) {
          console.log(
            "Berhasil melakukan subscribe dengan endpoint: ",
            subscribe.endpoint
          );
          console.log(
            "Berhasil melakukan subscribe dengan p256dh key: ",
            btoa(
              String.fromCharCode.apply(
                null,
                new Uint8Array(subscribe.getKey("p256dh"))
              )
            )
          );
          console.log(
            "Berhasil melakukan subscribe dengan auth key: ",
            btoa(
              String.fromCharCode.apply(
                null,
                new Uint8Array(subscribe.getKey("auth"))
              )
            )
          );
        })
        .catch(function(e) {
          console.log("Tidak dapat melakukan subscribe ", e.message);
        });
    });
  }
} else {
  console.log("Browser tidak mendukung notifikasi.");
}

// Meminta ijin menggunakan Notification API
function requestPermission() {
  Notification.requestPermission().then(function(result) {
    if (result === "denied") {
      console.log("Fitur notifikasi tidak diijinkan.");
      return;
    } else if (result === "default") {
      console.log("Pengguna menutup kotak dialog permintaan ijin.");
      return;
    }

    console.log("Fitur notifikasi diijinkan.");
  });
}

function showNotifikasiSederhana() {
  const title = "Notifikasi Sederhana";
  const options = {
    body: "Ini adalah konten notifikasi. \nBisa menggunakan baris baru."
  };
  if (Notification.permission === "granted") {
    navigator.serviceWorker.ready.then(function(registration) {
      registration.showNotification(title, options);
    });
  } else {
    console.log("FItur notifikasi tidak diijinkan.");
  }
}

function urlBase64ToUint8Array(base64String) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}
