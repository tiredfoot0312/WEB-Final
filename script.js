document.addEventListener("DOMContentLoaded", () => {
  const textSelection = document.getElementById("text-selection");
  const textDisplays = Array.from(
    document.getElementsByClassName("text-display")
  );
  const typingInputs = Array.from(
    document.getElementsByClassName("typing-input")
  );
  const rateDisplay = document.querySelector(".rate");
  const bestRateDisplay = document.querySelector(".best-rate");
  const clearBestRateBtn = document.querySelector(".clear-best-rate");

  let currentSentences = [];
  let currentIndex = 0;
  let timer;
  let startTime;
  let bestTimes = JSON.parse(localStorage.getItem("bestTimes")) || {};

  // json 연결
  fetch("texts.json")
    .then((response) => response.json())
    .then((data) => {
      const texts = data.texts;
      texts.forEach((text, index) => {
        const option = document.createElement("option");
        option.value = index;
        option.textContent = text.title;
        textSelection.appendChild(option);
      });

      textSelection.addEventListener("change", () => {
        const selectedIndex = textSelection.value;
        if (selectedIndex !== "") {
          currentSentences = texts[selectedIndex].sentences;
          currentIndex = 0;
          displaySentences();
          resetTimer();
          displayBestTime(texts[selectedIndex].title);
        }
      });
    });

  // 글 문장 표시
  function displaySentences() {
    textDisplays.forEach((textDisplay, index) => {
      const sentence = currentSentences[currentIndex + index];
      textDisplay.textContent = sentence || "";
    });
    typingInputs.forEach((input) => {
      input.value = "";
      input.style.backgroundColor = ""; // Reset background color
    });
  }

  // 타이머 리셋
  function resetTimer() {
    clearInterval(timer);
    rateDisplay.textContent = "00:00";
    startTime = null;
  }

  // 시간 표현법
  function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  }

  // 타이머 시작
  function startTimer() {
    startTime = Date.now();
    timer = setInterval(() => {
      const elapsedTime = (Date.now() - startTime) / 1000;
      rateDisplay.textContent = formatTime(elapsedTime);
    }, 100);
  }

  // 최고 기록 표현
  function displayBestTime(title) {
    if (bestTimes[title]) {
      bestRateDisplay.textContent = `최고 기록: ${formatTime(
        bestTimes[title]
      )}`;
    } else {
      bestRateDisplay.textContent = "최고 기록: --:--";
    }
  }

  // 최고 기록 초기화
  clearBestRateBtn.addEventListener("click", () => {
    const selectedTextTitle =
      textSelection.options[textSelection.selectedIndex].text;
    delete bestTimes[selectedTextTitle];
    localStorage.setItem("bestTimes", JSON.stringify(bestTimes));
    displayBestTime(selectedTextTitle);
  });

  // 입력 전반
  typingInputs.forEach((input, index) => {
    input.setAttribute("autocomplete", "off"); // 과거 입력 추천 제거

    input.addEventListener("input", () => {
      if (!startTime) {
        startTimer();
      }
      // 문장 일치 여부
      const correspondingDisplay = textDisplays[index];
      if (input.value === correspondingDisplay.textContent) {
        input.style.backgroundColor = "lightgreen";
      } else {
        input.style.backgroundColor = "lightcoral";
      }
    });

    input.addEventListener("keydown", (event) => {
      if (event.key === "Enter") {
        event.preventDefault();

        const isLastSentence =
          currentIndex + index + 1 >= currentSentences.length;

        if (isLastSentence) {
          clearInterval(timer);
          const elapsedTime = (Date.now() - startTime) / 1000;

          const selectedTextTitle =
            textSelection.options[textSelection.selectedIndex].text;

          if (
            !bestTimes[selectedTextTitle] ||
            elapsedTime < bestTimes[selectedTextTitle]
          ) {
            bestTimes[selectedTextTitle] = elapsedTime;
            localStorage.setItem("bestTimes", JSON.stringify(bestTimes));
            displayBestTime(selectedTextTitle);
          }

          alert("수고하셨습니다!");
        } else if (index < typingInputs.length - 1) {
          typingInputs[index + 1].focus();
        } else {
          currentIndex += typingInputs.length;
          displaySentences();
          typingInputs[0].focus();
        }
      }
    });
  });
});
