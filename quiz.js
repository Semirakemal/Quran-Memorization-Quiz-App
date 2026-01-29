document.addEventListener("DOMContentLoaded", () => {

  // Hamburger menu toggle
  const icon = document.getElementById("icon");
  const nav = document.querySelector(".remove1");

  icon?.addEventListener("click", () => {
    nav.classList.toggle("is-open");
  });

  // Quiz elements
  const quizText = document.getElementById("quizText");
  const optionsDiv = document.getElementById("options");
  const message = document.getElementById("message");
  const submitBtn = document.getElementById("submit");
  const nextBtn = document.getElementById("next");
  const surahSelect = document.getElementById("surahSelect");
  const resultBtn = document.getElementById("result");

  if (!quizText) return;

  let correctAnswer = "";
  let score = 0;
  let total = 0;
  let answered = false;
  let ayahs = [];

  // Load Surahs into select
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

  // Load Quiz when Surah is selected
  surahSelect.addEventListener("change", async () => {
    answered = false;
    submitBtn.disabled = false;
    const surah = surahSelect.value;

    const res = await fetch(`https://api.alquran.cloud/v1/surah/${surah}`);
    const data = await res.json();
    ayahs = data.data.ayahs;

    loadQuizQuestion();
  });

  // Next button
  nextBtn.addEventListener("click", () => {
    if (!ayahs.length) return message.textContent = "Please select a Surah first!";
    answered = false;
    submitBtn.disabled = false;
    loadQuizQuestion();
  });

  // Submit button
  submitBtn.addEventListener("click", () => {
    if (answered) return;
    const selected = document.querySelector("input[name='q']:checked");
    if (!selected) {
      message.textContent = "⚠️ Please select an answer";
      message.style.color = "red";
      return;
    }

    answered = true;
    submitBtn.disabled = true;

    if (selected.value === correctAnswer) {
      score++;
      message.textContent = "✅ Correct!";
      message.style.color = "green";
    } else {
      message.textContent = "❌ Wrong!";
      message.style.color = "red";
    }
  });

  // Result button
  resultBtn.addEventListener("click", () => {
    message.textContent = `Score: ${score} / ${total}`;
    message.style.color = "blue";
  });

  // Function to load a random quiz question
  function loadQuizQuestion() {
    const i = Math.floor(Math.random() * (ayahs.length - 1));
    const currentAyah = ayahs[i].text;
    correctAnswer = ayahs[i + 1].text;

    // Generate 3 wrong options
    let options = [correctAnswer];
    while (options.length < 4) {
      const r = ayahs[Math.floor(Math.random() * ayahs.length)].text;
      if (!options.includes(r)) options.push(r);
    }
    options.sort(() => Math.random() - 0.5);

    quizText.textContent = currentAyah;
    optionsDiv.innerHTML = options.map(o =>
      `<label><input type="radio" name="q" value="${o}"> ${o}</label>`
    ).join("");

    message.textContent = "";
    total++;
  }
});