// #1 register sw
if ("serviceWorker" in navigator) {
  window.addEventListener("load", function() {
    navigator.serviceWorker.register("sw.js").then(
      function(registration) {
        console.log(
          "ServiceWorker registration successful with scope: ",
          registration.scope
        );
      },
      function(err) {
        console.log("ServiceWorker registration failed: ", err);
      }
    );
  });
}

// #6 PUSH NOTIFICATION
var webPushConfig = {
  publicKey:
    "BCSpgn9yXj5iYM7xhhkPYekfUEqO4B5jSAhgbMHB7zjFfChiFQ2qtNf-Zbfr7KQlJ50mgicVO76r7vdn4HDe_nk",
  privateKey: "j4kuideRR15H3PjRIgR7ChPJUomtm-GlVMKKPkkLUl0"
};

// Periksa fitur Notification API
if ("Notification" in window) {
  // Meminta ijin menggunakan Notification API
  Notification.requestPermission().then(result => {
    if (result === "denied") {
      console.log("Fitur notifikasi tidak diizinkan.");
    } else if (result === "default") {
      console.log("Pengguna menutup kotak dialog permintaan ijin.");
    } else {
      console.log("Fitur notifikasi diizinkan.");
    }
  });
} else {
  console.log("Browser tidak mendukung notifikasi.");
}

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
} else {
  console.log("PushManager tidak tersedia.");
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
