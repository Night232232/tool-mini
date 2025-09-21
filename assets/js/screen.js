document.addEventListener("DOMContentLoaded", () => {
  // Lắng nghe sự kiện trên tất cả input URL
  const urlInputs = document.querySelectorAll(".url-input");

  urlInputs.forEach((input) => {
    input.addEventListener("blur", (event) => {
      const url = event.target.value.trim(); // Lấy URL từ input
      const cardWindow = input.closest(".card-window"); // Tìm phần tử cha gần nhất
      if (!cardWindow) return; // Nếu không có card-window, thoát

      const showArea = cardWindow.querySelector(".card-window__show");
      if (!showArea) return; // Nếu không có khu vực hiển thị, thoát

      // Nếu có URL, hiển thị iframe
      if (url) {
        showArea.innerHTML = `<iframe src="${url}" frameborder="0" class="card-window__iframe"></iframe>`;
      } else {
        showArea.innerHTML = ""; // Xóa nội dung nếu URL rỗng
      }
    });
  });
});

/**
 * =====================================
 *         XỬ LÝ SO SÁNH ĐỒNG HỒ
 * =====================================
 * Mô tả:
 * - Hàm xử lý chụp màn hình bảng
 */
// Khởi tạo dữ liệu cho tất cả các đồng hồ
const timers = [];

// Thiết lập sự kiện cho từng đồng hồ
document.querySelectorAll(".card-window").forEach((cardWindow, index) => {
  // Gán data-id nếu chưa có
  cardWindow.dataset.id = index;

  // Lấy các phần tử con của mỗi đồng hồ
  const minutesInput = cardWindow.querySelector(".card-window__input-minutes");
  const secondsInput = cardWindow.querySelector(".card-window__input-seconds");
  const display = cardWindow.querySelector(".timer-display");
  const startBtn = cardWindow.querySelector(".start-btn");
  const stopBtn = cardWindow.querySelector(".stop-btn");
  const resetBtn = cardWindow.querySelector(".reset-btn");


  // Khởi tạo dữ liệu timer cho đồng hồ hiện tại
  timers[index] = {
    minutes: 0,
    seconds: 0,
    interval: null,
  };

  // Cập nhật giao diện của đồng hồ
  const updateDisplay = () => {
    const { minutes, seconds } = timers[index];
    display.textContent = `${String(minutes).padStart(2, "0")}:${String(
      seconds
    ).padStart(2, "0")}`;
  };

  // Bắt đầu đồng hồ
  startBtn.addEventListener("click", () => handleRunStartTime());

  // Dừng đồng hồ
  stopBtn.addEventListener("click", () => {
    clearInterval(timers[index].interval);
  });

  // Đặt lại đồng hồ
  resetBtn.addEventListener("click", () => {
    clearInterval(timers[index].interval);
    timers[index].minutes = 0;
    timers[index].seconds = 0;
    updateDisplay();
  });

  // Hiển thị giá trị ban đầu
  updateDisplay();

  function handleRunStartTime() {
    // Lấy giá trị từ input
    const inputMinutes = parseInt(minutesInput.value, 10) || 0;
    const inputSeconds = parseInt(secondsInput.value, 10) || 0;

    // Lưu giá trị vào timer
    timers[index].minutes = inputMinutes;
    timers[index].seconds = inputSeconds;

    // Dừng bộ đếm cũ nếu đang chạy
    clearInterval(timers[index].interval);

    // Bắt đầu bộ đếm mới
    timers[index].interval = setInterval(() => {
      timers[index].seconds++;
      if (timers[index].seconds === 60) {
        timers[index].seconds = 0;
        timers[index].minutes++;
      }
      updateDisplay();
    }, 1000);
  }
});

/**
 * =====================================
 *      XỬ LÝ ẨN HIỆN KẾT QUẢ TEXT
 * =====================================
 * Mô tả:
 * - Hàm xử lý chụp màn hình bảng
 */
document.addEventListener("DOMContentLoaded", () => {
  const comparisonList = document.querySelector("#comparison-list"); // Vùng chứa thông báo so sánh
  const startButtons = document.querySelectorAll(".start-btn"); // Tất cả các nút khởi chạy
  const cardItems = document.querySelectorAll(".card-window"); // Các card-item

  let timers = []; // Mảng lưu thời gian đã được chạy
  let timeIntervals = []; // Mảng lưu các interval để dừng khi cần

  // Lắng nghe sự kiện nhấn nút khởi chạy cho mỗi card-item
  startButtons.forEach((btn, index) => {
    btn.addEventListener("click", () => {
      const cardItem = btn.closest(".card-window");
      const minuteInput = cardItem.querySelector(".card-window__input-minutes");
      const secondInput = cardItem.querySelector(".card-window__input-seconds");

      // Lấy thời gian từ các input phút và giây
      const minutes = parseInt(minuteInput.value, 10) || 0;
      const seconds = parseInt(secondInput.value, 10) || 0;

      // Lưu thời gian dưới dạng giây và bắt đầu đồng hồ
      const startTimeInSeconds = minutes * 60 + seconds;
      timers[index] = startTimeInSeconds;

      // Bắt đầu đếm thời gian cho card-item này
      startTimer(index, startTimeInSeconds);
    });
  });

  // Hàm bắt đầu đồng hồ
  function startTimer(index, startTimeInSeconds) {
    // Lưu giá trị vào mảng timers
    timeIntervals[index] = setInterval(() => {
      timers[index]++;
    }, 1000); // Tăng 1 giây mỗi lần
  }

  // Khi nhấn nút so sánh, thực hiện so sánh thời gian giữa card-item đầu tiên và các card-item khác
  const compareButton = document.querySelector("#compare-button"); // Nút so sánh
  compareButton.addEventListener("click", () => {
    const notiElement = document.querySelector(".card-window__noti");
    const icon1 = compareButton.querySelector(".compare-button__icon-1");
    const icon2 = compareButton.querySelector(".compare-button__icon-2");
    const textSpan = compareButton.querySelector(".filter-show__text");

    if (notiElement.style.display === "none" || !notiElement.style.display) {
      notiElement.style.display = "flex";
    } else {
      notiElement.style.display = "none";
    }

    // Toggle display of icons
    if (icon1.style.display === "none") {
      icon1.style.display = "inline"; // Hiển thị icon1
      icon2.style.display = "none"; // Ẩn icon2
      textSpan.textContent = "Show Result"; // Đổi text
    } else {
      icon1.style.display = "none"; // Ẩn icon1
      icon2.style.display = "inline"; // Hiển thị icon2
      textSpan.textContent = "Hide Result"; // Đổi text
    }

    // Lấy thời gian từ card-item 1 (card-item đầu tiên)
    const card1Time = timers[0] || 0;

    let comparisonMessages = [];

    // So sánh với card-item từ 2 đến 6 (nếu có)
    for (let i = 1; i < Math.min(6, cardItems.length); i++) {
      const currentCardTime = timers[i] || 0;

      // Lấy tên từ tiêu đề người dùng nhập vào (nếu có)
      const card1Title =
        cardItems[0].querySelector(".card-window__name").innerText.trim() ||
        `Card-item 1`;
      const cardTitle =
        cardItems[i].querySelector(".card-window__name").innerText.trim() ||
        `Card-item ${i + 1}`;

      if (currentCardTime === 0) {
        comparisonMessages.push(`${cardTitle} OFF`);
      } else {
        const difference = card1Time - currentCardTime;
        const formattedDifference = formatTimeDifference(Math.abs(difference));

        if (difference > 0) {
          comparisonMessages.push(
            `${card1Title} nhanh ${formattedDifference} so với ${cardTitle}`
          );
        } else if (difference < 0) {
          comparisonMessages.push(
            `${card1Title} chậm ${formattedDifference} so với ${cardTitle}`
          );
        } else {
          comparisonMessages.push(`${card1Title} và ${cardTitle} bằng nhau`);
        }
      }
    }

    // Hiển thị các thông báo so sánh
    comparisonList.innerHTML = "";
    comparisonMessages.forEach((message) => {
      const listItem = document.createElement("li");
      listItem.textContent = message;
      comparisonList.appendChild(listItem);
    });
  });

  // Hàm format thời gian chênh lệch thành phút và giây
  function formatTimeDifference(seconds) {
    const minutes = Math.floor(seconds / 60)
      .toString()
      .padStart(2, "0");
    const remainingSeconds = (seconds % 60).toString().padStart(2, "0");

    if (minutes > 0) {
      return `${minutes}p${remainingSeconds}s`;
    } else {
      return `${remainingSeconds}s`;
    }
  }
});

/**
 * =====================================
 *        XỬ LÝ TIÊU ĐỀ CARD ITEM
 * =====================================
 * Mô tả:
 * - Hàm xử lý chụp màn hình bảng
 */
document.addEventListener("DOMContentLoaded", () => {
  // Lắng nghe sự kiện trên tất cả các thẻ tiêu đề có thể chỉnh sửa (contenteditable)
  const titles = document.querySelectorAll(".card-window__name");

  titles.forEach((title) => {
    title.addEventListener("blur", (event) => {
      const newTitle = event.target.innerText.trim();
      if (newTitle) {
        // Lưu tiêu đề mới, có thể lưu vào localStorage hoặc gửi đến server nếu cần
        // Ví dụ: Lưu vào localStorage với data-id tương ứng
        const cardWindow = title.closest(".card-window");
        const cardId = cardWindow ? cardWindow.getAttribute("data-id") : null;
        if (cardId) {
          localStorage.setItem(`cardTitle-${cardId}`, newTitle); // Lưu vào localStorage
        }
      }
    });

    // Nếu có dữ liệu đã lưu từ localStorage, hiển thị vào tiêu đề
    const cardWindow = title.closest(".card-window");
    const cardId = cardWindow ? cardWindow.getAttribute("data-id") : null;
    if (cardId) {
      const savedTitle = localStorage.getItem(`cardTitle-${cardId}`);
      if (savedTitle) {
        title.innerText = savedTitle;
      }
    }
  });
});

// ADD:
document.addEventListener("DOMContentLoaded", () => {
  const urlInputs = document.querySelectorAll(".url-input");
  const saveButton = document.querySelector("#save-urls");
  const clearButton = document.querySelector("#clear-urls");
  const cardWindows = document.querySelectorAll(".card-window");

  // Load URL từ localStorage khi tải trang
  const loadUrls = () => {
    cardWindows.forEach((cardWindow, index) => {
      const url = localStorage.getItem(`cardURL-${index}`);
      const showArea = cardWindow.querySelector(".card-window__show");
      if (url && showArea) {
        showArea.innerHTML = `<iframe src="${url}" frameborder="0" class="card-window__iframe"></iframe>`;
      }
    });
  };

  // Lưu URL từ input vào localStorage và hiển thị trên card
  saveButton.addEventListener("click", () => {
    urlInputs.forEach((input, index) => {
      const url = input.value.trim();
      if (url) {
        localStorage.setItem(`cardURL-${index}`, url); // Lưu URL vào localStorage
        const showArea = cardWindows[index].querySelector(".card-window__show");
        if (showArea) {
          showArea.innerHTML = `<iframe src="${url}" frameborder="0" class="card-window__iframe"></iframe>`;
        }
      }
    });
  });

  // Xóa URL khỏi card nhưng vẫn giữ trong localStorage
  clearButton.addEventListener("click", () => {
    cardWindows.forEach((cardWindow) => {
      const showArea = cardWindow.querySelector(".card-window__show");
      if (showArea) {
        showArea.innerHTML = ""; // Xóa iframe khỏi card
      }
    });
  });

  // Tải URL đã lưu khi trang load
  loadUrls();
});

document
  .getElementById("copy-comparison")
  .addEventListener("click", function () {
    // Lấy phần tử ul
    const comparisonList = document.getElementById("comparison-list");
    const notiCopied = document.querySelector(".card-window__copied");

    if (comparisonList) {
      // Lấy text từ các thẻ <li>
      const textToCopy = Array.from(comparisonList.querySelectorAll("li"))
        .map((item) => item.textContent.trim()) // Lấy nội dung từng <li>
        .join("\n"); // Ngăn cách các mục bằng xuống dòng

      // Sao chép vào clipboard
      navigator.clipboard
        .writeText(textToCopy)
        .then(() => {
          notiCopied.style.opacity = "1";
          notiCopied.style.visibility = "visible";

          setTimeout(() => {
            notiCopied.style.opacity = "0";
            notiCopied.style.visibility = "hidden";
          }, 1000);
        })
        .catch((err) => {
          console.error("Lỗi khi sao chép nội dung:", err);
          alert("Có lỗi xảy ra khi sao chép.");
        });
    } else {
      alert("Không có danh sách để sao chép.");
    }
  });
