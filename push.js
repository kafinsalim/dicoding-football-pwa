// run :
// npm instal web-push -g
// node push.js
// tested and works !!

var webPush = require("web-push");

const vapidKeys = {
  publicKey:
    "BCSpgn9yXj5iYM7xhhkPYekfUEqO4B5jSAhgbMHB7zjFfChiFQ2qtNf-Zbfr7KQlJ50mgicVO76r7vdn4HDe_nk",
  privateKey: "j4kuideRR15H3PjRIgR7ChPJUomtm-GlVMKKPkkLUl0"
};

webPush.setVapidDetails(
  "mailto:kafinsalim@gmail.com",
  vapidKeys.publicKey,
  vapidKeys.privateKey
);
var pushSubscription = {
  endpoint:
    "https://fcm.googleapis.com/fcm/send/cParxz2-mW0:APA91bG4h-Jjm00fEwPCT9JbAb7trm9WpVkRQkpL4dX8tNY7eZoLWAS2J-OG60Z5C1aKAUYQbZoc35PjzSoKSofkacQQRpZ4Nbu2TRF83Yb7EwGUk5l4qQX8OYrxwrLDNDYJd0zIglUz",
  keys: {
    p256dh:
      "BFKghTAZTVJF1+tWMutPCFE24jtjv9nNWJiJqeFpDQM7etKEQQq8QDokyhsphJmZxFFxDUOXRBWgRfoTffplf/o=",
    auth: "cDwydqmRN3A2veFzU5KGmg=="
  }
};
var payload = "Halo, Ini push notifikasi submission 2 Dicoding MPWA!";

var options = {
  gcmAPIKey: "266159070338",
  TTL: 60
};

webPush.sendNotification(pushSubscription, payload, options);
