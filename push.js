// run the application ( i use http-server . )
// copy all generated pushSubscription key (endpoint, key pd256dh, auth) to this file
// run command npm instal web-push -g
// run command node push.js (in this directory)
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
    "https://fcm.googleapis.com/fcm/send/dkG9dYOWgwQ:APA91bFgLSHU4cvaJ8IvUfMaWCuDjljyXvPHU3LpL2J2qCKCWY7gKAoWM4Fh3CXJ9By9cdd_Cz8XuZaBiVaceJqXnXoPvYtFCG3qmnOe4rO9XBazvhV-3flLrpiw4nHUqYLDe01JcML_",
  keys: {
    p256dh:
      "BBlaG4SPw/jxocgT+hl5Kro6hH9LJ/XFcmZ+xJjCcH7QIhxTQiOYqxO0dyd8aF0jtiFifRlypYndmWheQGGxjU0=",
    auth: "UcNz57MMbnV+Y7w25u8oNg=="
  }
};
var payload = "Halo, Ini push notifikasi submission 2 Dicoding MPWA!";

var options = {
  gcmAPIKey: "266159070338",
  TTL: 60
};

webPush.sendNotification(pushSubscription, payload, options);
