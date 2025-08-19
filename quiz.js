

document.addEventListener("DOMContentLoaded", () => {

  // Hamburger menu (works on any page with nav)
  const homebutton = document.getElementById("icon");
  const nav = document.getElementsByClassName("remove1")[0];

  if(homebutton && nav){
    homebutton.addEventListener("click", () => {
      nav.classList.toggle("is-open");
    });
  }



const quizText = document.getElementById("quizText");
const optionsDiv = document.getElementById("options");
const message1 = document.getElementById("message");
const submitBtn = document.getElementById("submit");
const nextBtn = document.getElementById("next");
const surahSelect = document.getElementById("surahSelect");
const resultBtn = document.getElementById("result");

let correctAnswer = "";
let score = 0;
let totalQuestions = 0;





nextBtn.addEventListener("click", async function () {
  try {
    const surahNum = parseInt(surahSelect.value);
    const response = await fetch(`https://api.alquran.cloud/v1/surah/${surahNum}`);
    const data = await response.json();
    const ayahs = data.data.ayahs;

    const currentIndex = Math.floor(Math.random() * (ayahs.length - 1));
    const currentAyah = ayahs[currentIndex].text;
    const nextAyah = ayahs[currentIndex + 1]?.text || ayahs[currentIndex].text;
    correctAnswer = nextAyah;

    
    let wrongChoices = [];
    const keywords = nextAyah.split(" ").slice(0, 3);
    for (let ay of ayahs) {
      if (ay.text !== nextAyah && wrongChoices.length < 3) {
        if (keywords.some(k => ay.text.includes(k))) wrongChoices.push(ay.text);
      }
    }

    while (wrongChoices.length < 3) {
      let randSurahNum = Math.floor(Math.random() * 114) + 1;
      if (randSurahNum === surahNum) continue;
      const randResp = await fetch(`https://api.alquran.cloud/v1/surah/${randSurahNum}`);
      const randData = await randResp.json();
      const randAyahs = randData.data.ayahs;
      let randAyahText = randAyahs[Math.floor(Math.random() * randAyahs.length)].text;
      if (!wrongChoices.includes(randAyahText) && randAyahText !== nextAyah) wrongChoices.push(randAyahText);
    }

    
    let options = [correctAnswer, ...wrongChoices].sort(() => Math.random() - 0.5);

    
    quizText.textContent = ` ${currentAyah}`
    optionsDiv.innerHTML = options
      .map(opt => `<label><input type="radio" name="q1" value="${opt}"> ${opt}</label><br>`)
      .join("");

    message1.textContent = "";
    totalQuestions++;

  } catch (error) {
    console.error(error);
    message1.textContent = "⚠️ حدث خطأ في جلب السؤال";
  }
});

submitBtn.addEventListener("click", function () {
  let selected = document.querySelector('input[name="q1"]:checked');
  if (!selected) {
    message1.textContent = "⚠️ الرجاء اختيار إجابة";
    message1.style.color = "red";
    return;
  }

  if (selected.value === correctAnswer) {
    message1.textContent = "✅ إجابة صحيحة!";
    message1.style.color = "green";
    score++;
  } else {
    message1.textContent = "❌ إجابة خاطئة";
    message1.style.color = "red";
  }
});


resultBtn.addEventListener("click", function () {
  message1.textContent = `نتيجتك: ${score} من ${totalQuestions}`;
  message1.style.color = "blue";
});
});