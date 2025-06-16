document.addEventListener("DOMContentLoaded", () => {
  if (!document.body.classList.contains("radar-page")) return;

  // Clock
  function updateClock() {
    const now = new Date();
    const localTime = now.toLocaleTimeString();
    const utcTime = now.toUTCString().split(" ")[4];
    const clockBar = document.getElementById("clock-bar");
    if (clockBar) {
      clockBar.textContent = `Local: ${localTime} | UTC: ${utcTime}`;
    }
  }
  setInterval(updateClock, 1000);
  updateClock();

  // NOAA Alerts
  const alertFeed = "https://api.weather.gov/alerts/active?area=FL";
  async function loadAlerts() {
    try {
      const res = await fetch(alertFeed);
      const data = await res.json();

      const alerts = data.features.map(f => {
        const title = f.properties.headline;
        const link = f.properties.web;
        return `<a href="${link}" target="_blank">${title}</a>`;
      });

      const alertsText = document.getElementById("alerts-text");
      const updatedTime = document.getElementById("last-updated");
      const alertBar = document.getElementById("rss-alerts");
      const alertSound = document.getElementById("alert-sound");

      if (alertsText && updatedTime && alertBar) {
        alertsText.innerHTML = alerts.join(" | ");
        updatedTime.textContent = `Last Updated: ${new Date().toLocaleTimeString()}`;
        alertBar.classList.toggle("alert-flash", alerts.length > 0);
        if (alerts.length > 0 && alertSound) alertSound.play();

        applyScrollSpeed("alerts-text", 60);
      }
    } catch (err) {
      console.error("Alert feed error:", err);
      const alertsText = document.getElementById("alerts-text");
      if (alertsText) alertsText.textContent = "Alert load failed.";
    }
  }
  setInterval(loadAlerts, 300000);
  loadAlerts();

  // NOAA Forecast
  const forecastFeed = "https://api.weather.gov/gridpoints/MOB/60,57/forecast";
  async function loadForecast() {
    try {
      const res = await fetch(forecastFeed);
      const data = await res.json();

      const forecastText = data.properties.periods
        .slice(0, 6)
        .map(p => `${p.name}: ${p.detailedForecast}`)
        .join(" | ");

      const forecastMain = document.getElementById("forecast-text");
      const forecastClone = document.getElementById("forecast-text-clone");

      if (forecastMain && forecastClone) {
        forecastMain.textContent = forecastText;
        forecastClone.textContent = forecastText;
        applyScrollSpeed("forecast-bar", 60);
      }
    } catch (err) {
      console.error("Forecast error:", err);
      const forecastMain = document.getElementById("forecast-text");
      if (forecastMain) forecastMain.textContent = "Forecast load failed.";
    }
  }
  setInterval(loadForecast, 300000);
  loadForecast();

  // Scroll Speed
  function applyScrollSpeed(id, pixelsPerSecond = 60) {
    const el = document.getElementById(id);
    if (!el) return;

    requestAnimationFrame(() => {
      const textWidth = el.scrollWidth / 2;
      const parentWidth = el.parentElement.offsetWidth;
      const totalDistance = textWidth + parentWidth;
      const duration = totalDistance / pixelsPerSecond;

      el.style.animationDuration = `${duration}s`;
    });
  }

  // Weather Conditions
  async function loadConditions() {
    const conditionsFeed = "https://api.weather.gov/stations/KVPS/observations/latest";
    try {
      const res = await fetch(conditionsFeed);
      const data = await res.json();
      const props = data.properties;

      const temp = props.temperature.value !== null
        ? Math.round(props.temperature.value * 9 / 5 + 32) + "°F"
        : "N/A";

      const condition = props.textDescription || "N/A";
      const wind = props.windSpeed.value !== null
        ? `${Math.round(props.windSpeed.value * 0.621371)} mph`
        : "—";

      document.getElementById("temp").innerHTML = `<span class="emoji">🌡️</span> ${temp}`;
      document.getElementById("cond").innerHTML = `<span class="emoji">🌤️</span> ${condition}`;
      document.getElementById("wind").innerHTML = `<span class="emoji">💨</span> ${wind}`;
    } catch (err) {
      console.error("Conditions load failed:", err);
      document.getElementById("cond").textContent = "Conditions unavailable";
    }
  }
  setInterval(loadConditions, 300000);
  loadConditions();
});
