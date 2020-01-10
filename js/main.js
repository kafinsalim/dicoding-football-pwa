// should initiated first var put here
var teamsData; // global State

// #0 execute this file
console.log("#0 main.js executed");

// #2 Load Navigator
document.addEventListener("DOMContentLoaded", function() {
  console.log("DOMContentLoaded");
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

// # indexedDB Operation
if (!("indexedDB" in window)) {
  console.log("This browser doesn't support IndexedDB");
}

var db;

async function init() {
  console.log("idb initiated");
  try {
    db = await idb.openDb("teamsDb", 1, db => {
      db.createObjectStore("teams", { keyPath: "id" });
    });
    console.log("#5 idb executed");
  } catch (e) {
    console.log("#5 idb execution failed", e);
  }
}

init();
var db;
// simple render Standings, KEEP IT SIMPLE STUPID.
async function showTeams(data) {
  const tx = db.transaction("teams", "readwrite").objectStore("teams");
  const txFavTeams = (await tx.getAll()) || [];
  const favTeams = txFavTeams.map(i => i.id);
  function renderButton(teamId) {
    if (!favTeams.includes(teamId)) {
      return `
        <a
          id="button-${teamId}"
          onclick="addFavoriteTeam(${teamId})"
          class="btn-floating btn-medium halfway-fab waves-effect waves-light blue"
        >
          <i id="icon-${teamId}" class="large material-icons">favorite</i>
        </a>`;
    } else {
      return "";
    }
  }
  let content = "";
  let renderTarget = mainContent;
  data.teams.forEach(function(team) {
    content += `
        <div class="col s12 m6">
            <div class="card">
                <div class="card-image">
                    <img src="${
                      team.crestUrl
                    }" style="padding: 16px; margin: auto; height: 135px; width: 135px">
                    ${renderButton(team.id)}
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

async function renderFavoriteList() {
  await init();
  let tx = db.transaction("teams", "readwrite").objectStore("teams");
  let teams = (await tx.getAll()) || [];

  if (teams.length) {
    listFavoriteTeamElement.innerHTML = teams
      .map(
        team => `
          <div class="col s12 m6 l6">
            <div class="card" id="card-${team.id}">
              <div class="card-image">
                <img src="${team.crestUrl}" style="padding: 16px; margin: auto; height: 135px; width: 135px">
                <a onclick="removeFavoriteTeam(${team.id})" class="btn-floating btn-medium halfway-fab waves-effect waves-light red"><i class="large material-icons">delete</i></a>
              </div>
              <div class="card-content">
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
  try {
    var teamObject = teamsData.teams.filter(el => el.id == teamId)[0];
    let tx = db.transaction("teams", "readwrite");
    if (await tx.objectStore("teams").add(teamObject)) {
      // remove the button
      var element = document.getElementById(`button-${teamId}`);
      element.parentNode.removeChild(element);
    }
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
      M.toast({
        html: `Tim gagal disimpan, silahkan cek jaringan anda.`
      });
      throw err;
    }
  }
}

async function removeFavoriteTeam(teamId) {
  try {
    let tx = db.transaction("teams", "readwrite");
    await tx.objectStore("teams").delete(teamId);
    var element = document.getElementById(`card-${teamId}`);
    element.parentNode.removeChild(element);
    M.toast({
      // html: `${teamObject.name} ditambahkan ke Team Favorit.`
      html: `Team dihapus dari Favorit.`
    });
  } catch (err) {
    console.error("Team gagal dihapus", err);
    M.toast({
      html: `Tim gagal dihapus, silahkan cek jaringan anda.`
    });
    throw err;
  }
}

// log and catch error
window.addEventListener("unhandledrejection", event => {
  console.warn("Error idb: " + JSON.stringify(event));
});
