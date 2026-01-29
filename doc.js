document.addEventListener("DOMContentLoaded", () => {

  /* ================= NAV ================= */
  const icon = document.getElementById("icon");
  icon?.addEventListener("click", () => {
    document.querySelector(".remove1")?.classList.toggle("is-open");
  });

  /* ================= ELEMENTS ================= */
  const surahSelect = document.getElementById("surah-select");
  const ayahSelect = document.getElementById("ayah-select");
  const ayahDisplay = document.getElementById("ayah-display");
  const translationDisplay = document.getElementById("translation-display");
  const playAudioBtn = document.getElementById("play-audio");
  const saveStatusBtn = document.getElementById("save-status");
  const statusSelect = document.getElementById("status-select");

  const challengeAyahDiv = document.getElementById("challenge-ayah");
  const challengeTranslationDiv = document.getElementById("challenge-translation");
  const progressList = document.getElementById("progress-list");

  /* ================= STATE ================= */
  let currentSurah = null;
  let currentAyah = null;
  let reciter = "ar.alafasy";
  let language = "en";

  let memorizedStatus = JSON.parse(
    localStorage.getItem("memorizedStatus") || "{}"
  );

  /* ================= LOAD SURAHS ================= */
  if (surahSelect) {
    fetch("https://api.alquran.cloud/v1/surah")
      .then(res => res.json())
      .then(data => {
        surahSelect.innerHTML = `<option disabled selected>Select Surah</option>`;
        data.data.forEach(surah => {
          const option = document.createElement("option");
          option.value = surah.number;
          option.textContent = `${surah.number}. ${surah.englishName}`;
          surahSelect.appendChild(option);
        });
      });
  }

  /* ================= LOAD AYAHS ================= */
  function loadAyahs(surah) {
    fetch(`https://api.alquran.cloud/v1/surah/${surah}`)
      .then(res => res.json())
      .then(data => {
        ayahSelect.innerHTML = `<option disabled selected>Select Ayah</option>`;
        data.data.ayahs.forEach(ayah => {
          const option = document.createElement("option");
          option.value = ayah.numberInSurah;
          option.textContent = `Ayah ${ayah.numberInSurah}`;
          ayahSelect.appendChild(option);
        });
      });
  }

  /* ================= DISPLAY AYAH ================= */
  function displayAyah(surah, ayah) {
    currentSurah = surah;
    currentAyah = ayah;

    fetch(`https://api.alquran.cloud/v1/ayah/${surah}:${ayah}/ar`)
      .then(res => res.json())
      .then(data => {
        ayahDisplay.textContent = data.data.text;
      });

    fetch(`https://api.alquran.cloud/v1/ayah/${surah}:${ayah}/${language}.asad`)
      .then(res => res.json())
      .then(data => {
        translationDisplay.textContent = data.data.text;
      });
  }

  /* ================= AUDIO ================= */
  function playAudio() {
    if (!currentSurah || !currentAyah) return;

    fetch(`https://api.alquran.cloud/v1/ayah/${currentSurah}:${currentAyah}/${reciter}`)
      .then(res => res.json())
      .then(data => {
        new Audio(data.data.audio).play();
      });
  }

  /* ================= SAVE STATUS ================= */
  function saveMemorizationStatus() {
    if (!currentSurah || !currentAyah) return;

    const key = `${currentSurah}:${currentAyah}`;
    memorizedStatus[key] = statusSelect.value;
    localStorage.setItem("memorizedStatus", JSON.stringify(memorizedStatus));
    updateProgress();
    alert("Status saved ✔");
  }

  /* ================= DAILY CHALLENGE ================= */
  window.loadDailyChallenge = function () {
    const surah = Math.floor(Math.random() * 114) + 1;

    fetch(`https://api.alquran.cloud/v1/surah/${surah}`)
      .then(res => res.json())
      .then(data => {
        const ayah = Math.floor(Math.random() * data.data.numberOfAyahs) + 1;
        const today = new Date().toDateString();

        localStorage.setItem(`challenge-${today}`, JSON.stringify({
          surah,
          ayah,
          done: false
        }));

        fetch(`https://api.alquran.cloud/v1/ayah/${surah}:${ayah}/ar`)
          .then(res => res.json())
          .then(data => challengeAyahDiv.textContent = data.data.text);

        fetch(`https://api.alquran.cloud/v1/ayah/${surah}:${ayah}/${language}.asad`)
          .then(res => res.json())
          .then(data => challengeTranslationDiv.textContent = data.data.text);
      });
  };

  window.markChallengeMemorized = function () {
    const today = new Date().toDateString();
    const key = `challenge-${today}`;
    const challenge = JSON.parse(localStorage.getItem(key));

    if (!challenge) return;

    challenge.done = true;
    localStorage.setItem(key, JSON.stringify(challenge));
    alert("🌟 Challenge memorized!");
    updateProgress();
  };

  /* ================= PROGRESS ================= */
  function updateProgress() {
    if (!progressList) return;
    progressList.innerHTML = "";

    const items = [];

    Object.keys(memorizedStatus).forEach(key => {
      items.push(`Surah ${key} → ${memorizedStatus[key]}`);
    });

    Object.keys(localStorage)
      .filter(k => k.startsWith("challenge-"))
      .forEach(k => {
        const c = JSON.parse(localStorage.getItem(k));
        items.push(`${k.replace("challenge-", "")} → Surah ${c.surah}:${c.ayah} ${c.done ? "✅" : "⏳"}`);
      });

    if (items.length === 0) {
      progressList.textContent = "No progress yet.";
      return;
    }

    items.forEach(text => {
      const div = document.createElement("div");
      div.textContent = text;
      progressList.appendChild(div);
    });
  }

  /* ================= EVENTS ================= */
  surahSelect?.addEventListener("change", () => {
    loadAyahs(surahSelect.value);
  });

  ayahSelect?.addEventListener("change", () => {
    displayAyah(surahSelect.value, ayahSelect.value);
  });

  playAudioBtn?.addEventListener("click", playAudio);
  saveStatusBtn?.addEventListener("click", saveMemorizationStatus);

  /* ================= INIT ================= */
  loadDailyChallenge();
  updateProgress();

});