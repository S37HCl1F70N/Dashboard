document.addEventListener("DOMContentLoaded", () => {
  const $ = (selector) => document.querySelector(selector);
  const $$ = (selector) => document.querySelectorAll(selector);

  // Local Storage Helpers
  window.getFromStorage = (key) => {
    const item = localStorage.getItem(key);
    try {
      return item ? JSON.parse(item) : null;
    } catch (e) {
      console.error(`Error parsing localStorage key "${key}":`, e);
      return null;
    }
  };

  window.saveToStorage = (key, value) => {
    localStorage.setItem(key, JSON.stringify(value));
  };

  // --- DIGITAL CLOCK WIDGET ---
  const hourEl = $(".digital-clock-widget .hour");
  const dotEl = $(".digital-clock-widget .dot");
  const minEl = $(".digital-clock-widget .min");
  const ampmEl = $(".digital-clock-widget .ampm");
  const weekDaysContainer = $(".digital-clock-widget .week");
  let showDot = true;

  function updateClock() {
    if (!hourEl || !minEl || !ampmEl || !weekDaysContainer || !dotEl) return;
    showDot = !showDot;
    const now = new Date();
    dotEl.style.visibility = showDot ? "visible" : "hidden";
    let currentHour = now.getHours();
    let period = "AM";
    if (currentHour >= 12) {
      period = "PM";
      if (currentHour > 12) currentHour -= 12;
    }
    if (currentHour === 0) currentHour = 12;
    hourEl.textContent = String(currentHour).padStart(2, "0");
    minEl.textContent = String(now.getMinutes()).padStart(2, "0");
    ampmEl.textContent = period;
    Array.from(weekDaysContainer.children).forEach((dayEl) =>
      dayEl.classList.remove("active")
    );
    weekDaysContainer.children[now.getDay()].classList.add("active");
  }

  setInterval(updateClock, 500);
  updateClock();

  // --- COUNTDOWN WIDGET ---
  const startTimeInput = $("#startTime");
  const endTimeInput = $("#endTime");
  const startCountdownBtn = $("#startCountdownBtn");
  const countdownLabel = $("#countdown-label");
  const progressBar = $("#progress-bar");
  let countdownInterval = null;

  function startCountdown() {
    if (!startTimeInput || !endTimeInput || !countdownLabel || !progressBar) return;
    if (countdownInterval) clearInterval(countdownInterval);

    const startValue = startTimeInput.value.trim();
    const endValue = endTimeInput.value.trim();

    const now = new Date();
    let startTime, endTime;

    if (!startValue && !endValue) {
      // 🕗 Default to 8-hour countdown from now
      startTime = new Date(now);
      endTime = new Date(now.getTime() + 8 * 60 * 60 * 1000); // +8 hours

      // 🖋 Display the calculated times in the inputs
      const formatTime = date => date.toTimeString().slice(0, 5);
      startTimeInput.value = formatTime(startTime);
      endTimeInput.value = formatTime(endTime);
    } else {
      // 📜 Use provided inputs if available
      startTime = startValue ? new Date(now.toDateString() + " " + startValue) : new Date();
      endTime = new Date(now.toDateString() + " " + endValue);

      if (endTime <= startTime) {
        alert("End time must be after start time.");
        return;
      }
    }

    const totalMillis = endTime - startTime;
    saveToStorage("countdownData", {
      startTime: startTime.getTime(),
      endTime: endTime.getTime()
    });

    function updateCountdownDisplay() {
      const current = new Date();
      let elapsed = current - startTime;
      let remaining = endTime - current;
      if (remaining <= 0) {
        clearInterval(countdownInterval);
        progressBar.style.width = "100%";
        countdownLabel.textContent = "00:00:00";
        localStorage.removeItem("countdownData");
        return;
      }
      const hrs = Math.floor(remaining / 3600000);
      const mins = Math.floor((remaining % 3600000) / 60000);
      const secs = Math.floor((remaining % 60000) / 1000);
      countdownLabel.textContent = `${String(hrs).padStart(2, "0")}:${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
      const progressPercentage = Math.min(100, (elapsed / totalMillis) * 100);
      progressBar.style.width = `${progressPercentage}%`;
    }

    updateCountdownDisplay();
    countdownInterval = setInterval(updateCountdownDisplay, 1000);
  }


  function resumeCountdown(startMillis, endMillis) {
    if (countdownInterval) clearInterval(countdownInterval);
    const startTime = new Date(startMillis);
    const endTime = new Date(endMillis);
    const totalMillis = endTime - startTime;

    function updateCountdownDisplay() {
      const current = new Date();
      let elapsed = current - startTime;
      let remaining = endTime - current;

      if (remaining <= 0) {
        clearInterval(countdownInterval);
        progressBar.style.width = "100%";
        countdownLabel.textContent = "00:00:00";
        localStorage.removeItem("countdownData");
        return;
      }

      const hrs = Math.floor(remaining / 3600000);
      const mins = Math.floor((remaining % 3600000) / 60000);
      const secs = Math.floor((remaining % 60000) / 1000);
      countdownLabel.textContent = `${String(hrs).padStart(2, "0")}:${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
      const progressPercentage = Math.min(100, (elapsed / totalMillis) * 100);
      progressBar.style.width = `${progressPercentage}%`;
    }

    updateCountdownDisplay();
    countdownInterval = setInterval(updateCountdownDisplay, 1000);
  }

  if (startCountdownBtn) {
    startCountdownBtn.addEventListener("click", startCountdown);
  }

  const savedCountdown = getFromStorage("countdownData");
  if (savedCountdown && savedCountdown.endTime > Date.now()) {
    const start = new Date(savedCountdown.startTime);
    const end = new Date(savedCountdown.endTime);

    const formatTime = date => date.toTimeString().slice(0, 5);
    startTimeInput.value = formatTime(start);
    endTimeInput.value = formatTime(end);
    resumeCountdown(savedCountdown.startTime, savedCountdown.endTime);
  }

  const resetCountdownBtn = $("#resetCountdownBtn");

  function resetCountdown() {
    if (countdownInterval) clearInterval(countdownInterval);
    localStorage.removeItem("countdownData");
    startTimeInput.value = "";
    endTimeInput.value = "";
    progressBar.style.width = "0%";
    countdownLabel.textContent = "00:00:00";
  }

  if (resetCountdownBtn) {
    resetCountdownBtn.addEventListener("click", resetCountdown);
  }

  // --- QUICK LINKS WIDGET ---
  const linkNameInput = $("#linkNameInput");
  const linkUrlInput = $("#linkUrlInput");
  const addLinkBtn = $("#addLinkBtn");
  const linkList = $("#linkList");

  const saveLinksToStorage = () => {
    const links = Array.from(linkList.children).map(li => {
      const btn = li.querySelector(".quick-link-btn");
      return {
        name: btn.textContent,
        url: btn.getAttribute("data-url")
      };
    });
    saveToStorage("quickLinks", links);
  };

  const addLink = (name, url) => {
    const li = document.createElement("li");

    const btn = document.createElement("button");
    btn.textContent = name;
    btn.className = "quick-link-btn";
    btn.setAttribute("data-url", url);
    btn.addEventListener("click", () => window.open(url, "_blank"));

    const removeBtn = document.createElement("button");
    removeBtn.textContent = "✕";
    removeBtn.className = "remove-item-btn";
    removeBtn.addEventListener("click", () => {
      li.remove();
      saveLinksToStorage();
    });

    li.appendChild(btn);
    li.appendChild(removeBtn);
    linkList.appendChild(li);
  };

  const loadLinksFromStorage = () => {
    const stored = getFromStorage("quickLinks") || [];
    stored.forEach(link => addLink(link.name, link.url));
    if (stored.length > 0) saveLinksToStorage(); // ensure persistence if DOM was cleared
  };

  if (addLinkBtn) {
    addLinkBtn.addEventListener("click", () => {
      const name = linkNameInput.value.trim();
      const url = linkUrlInput.value.trim();
      if (!name || !url) return;

      // Optional: Prevent duplicates
      const exists = Array.from(linkList.children).some(li => 
        li.querySelector(".quick-link-btn").textContent === name
      );
      if (exists) {
        alert("A link with this name already exists.");
        return;
      }

      addLink(name, url);
      saveLinksToStorage();

      linkNameInput.value = "";
      linkUrlInput.value = "";
    });
  }

  loadLinksFromStorage();


  // --- Log ---
  // console.log("All widget functionalities initialized.");
});
