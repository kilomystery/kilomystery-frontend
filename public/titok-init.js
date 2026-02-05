(function (w, d, t) {
  w.TiktokAnalyticsObject = t;
  var ttq = (w[t] = w[t] || []);
  ttq.methods = [
    "page",
    "track",
    "identify",
    "instances",
    "debug",
    "on",
    "off",
    "once",
    "ready",
    "alias",
    "group",
    "enableCookie",
    "disableCookie",
  ];
  ttq.setAndDefer = function (t, e) {
    t[e] = function () {
      t.push([e].concat([].slice.call(arguments)));
    };
  };
  for (var i = 0; i < ttq.methods.length; i++) ttq.setAndDefer(ttq, ttq.methods[i]);

  ttq.load = function (e) {
    var s = d.createElement("script");
    s.type = "text/javascript";
    s.async = true;
    s.src = "https://analytics.tiktok.com/i18n/pixel/events.js?sdkid=" + e + "&lib=" + t;
    var x = d.getElementsByTagName("script")[0];
    x.parentNode.insertBefore(s, x);
  };

  // 👇 ID PIXEL
  ttq.load("D625ESBC77U70QB7D710");
  ttq.page();
})(window, document, "ttq");
