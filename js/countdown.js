/* countdown.js — timer ao vivo até a data do casamento */
(function () {
  var cfg = window.WEDDING || {};
  var target = new Date(cfg.weddingDate || "2027-03-27T08:30:00").getTime();

  var el = {
    days: document.querySelector("[data-days]"),
    hours: document.querySelector("[data-hours]"),
    minutes: document.querySelector("[data-minutes]"),
    seconds: document.querySelector("[data-seconds]"),
  };
  if (!el.days) return;

  var pad = function (n) { return String(n).padStart(2, "0"); };
  var timer = null;

  function render() {
    var diff = target - Date.now();

    if (diff <= 0) {
      el.days.textContent = "0";
      el.hours.textContent = el.minutes.textContent = el.seconds.textContent = "00";
      var title = document.querySelector(".countdown__title");
      if (title) title.textContent = "É hoje!";
      stop();
      return;
    }

    var s = Math.floor(diff / 1000);
    el.days.textContent = Math.floor(s / 86400);
    el.hours.textContent = pad(Math.floor((s % 86400) / 3600));
    el.minutes.textContent = pad(Math.floor((s % 3600) / 60));
    el.seconds.textContent = pad(s % 60);
  }

  function start() { if (!timer) { render(); timer = setInterval(render, 1000); } }
  function stop() { if (timer) { clearInterval(timer); timer = null; } }

  // Pausa o timer quando a aba está oculta (economia).
  document.addEventListener("visibilitychange", function () {
    document.hidden ? stop() : start();
  });

  start();
})();
