import { saveToLocalStorage, getFromLocalStorage, removeFromLocalStorage, clearLocalStorage, createConfirmModal } from './function.js';

// API Key và thông tin Sheet
const apiKeyInput = document.querySelector('#code-apikey');
const sheetIdInput = document.querySelector('#code-sheetid');
const rangeSheetApi = document.querySelector("#rangeApi");
const fetchDataBtn = document.querySelector('#fetchDataBtn');
const messageApiNoti = document.querySelector('.filter__key-api--noti');

// Lấy các phần tử HTML
const resultContainer = document.getElementById('data-container');
const columnSelector = document.getElementById('columns-selector'); // Thay đổi ID ở đây
const valueSelector = document.getElementById('value-selector');
const loadingIndicator = document.getElementById('loading');
const notification = document.getElementById('notification');
const alignmentSelector = document.getElementById('alignment-selector'); // Chọn căn chỉnh
const applyAlignmentBtn = document.getElementById('apply-alignment-btn'); // Nút áp dụng căn chỉnh

// Xử lý bật lên Modal Filter
const openModalFilter = document.getElementById("openModal-filter");
const modalFilter = document.querySelector(".filter-modal");
const modalFilterClose = document.querySelector(".filter-modal__close");

// Biến chứa dữ liệu bảng
let arrayTable = [];     // Dữ liệu gốc từ Google Sheets

// Event Nút FetchData:
fetchDataBtn.addEventListener('click', () => {
    const apiKey = apiKeyInput.value.trim();
    const sheetId = sheetIdInput.value.trim();
    const rangeApi = rangeSheetApi.value.trim();

    if (apiKey && sheetId) {
        // Lưu apiKey và sheetId vào localStorage
        saveToLocalStorage('apiKey', apiKey);
        saveToLocalStorage('sheetId', sheetId);
        saveToLocalStorage('rangeApi', rangeApi);

        // Gọi hàm fetchSheetData để lấy dữ liệu
        fetchSheetData(apiKey, sheetId, rangeApi);
    } else {
        messageApiNoti.textContent = "Vui lòng nhập API Key và Sheet ID!";
        messageApiNoti.style.color = "red";
        messageApiNoti.style.display = "block";

        // Ẩn thông báo sau 5 giây:
        setTimeout(() => {
            messageApiNoti.style.color = "";
            messageApiNoti.style.display = "none";
        }, 5000);
    }
})


// Hàm lấy dữ liệu từ Google Sheets
async function fetchSheetData(apiKey, sheetId, rangeApi) {
    try {
        // Hiển thị loading khi đang tải dữ liệu
        loadingIndicator.style.display = 'block';
        notification.style.display = 'none';

        // Tạo URL động từ apiKey và sheetId
        const url = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${rangeApi}?key=${apiKey}`;

        const response = await fetch(url);

        // Kiểm tra nếu response không thành công (mã không phải 200-299)
        if (!response.ok) {
            throw new Error("Không tải được dữ liệu từ Google Sheet.");
        }

        const data = await response.json();

        const headers = data.values[0];
        if (headers && headers.length) {
            populateColumnSelector(headers); // Điền tiêu đề cột nếu hợp lệ
        } else {
            console.error("Tiêu đề không hợp lệ.");
        }

        // Kiểm tra nếu không có dữ liệu
        if (!data.values) {
            throw new Error("Không có dữ liệu trong phạm vi này.");
        }

        // Cập nhật dữ liệu và hiển thị bảng khi thành công
        const newArrayTable = data.values;

        // Lấy dữ liệu hiện tại từ localStorage để so sánh
        const currentData = getFromLocalStorage("sheetData");

        // Kiểm tra xem dữ liệu mới có khác với dữ liệu hiện tại không
        if (JSON.stringify(newArrayTable) === JSON.stringify(currentData)) {
            notification.textContent = "Dữ liệu không thay đổi.";
        } else {
            // Cập nhật dữ liệu mới vào localStorage
            saveToLocalStorage('sheetData', newArrayTable);
            arrayTable = newArrayTable; // Cập nhật dữ liệu hiện tại
            populateColumnSelector(arrayTable[0]); // Điền tiêu đề bảng vào bộ chọn lọc
            displayData(arrayTable); // Hiển thị nội dung bảng
            updateTextReport(arrayTable)
            // handleTextReport(arrayTable);

            // Thông báo thành công
            notification.textContent = "Dữ liệu mới đã được cập nhật thành công.";
        }
    } catch (error) {
        // Thông báo lỗi cho người dùng
        console.error("Lỗi khi lấy dữ liệu từ Google Sheets:", error);
        notification.textContent = "Không tải được dữ liệu."; // Thông báo lỗi
    } finally {
        // Ẩn loading sau khi hoàn tất
        loadingIndicator.style.display = 'none';

        // Hiển thị thông báo trong 2 giây
        if (notification.textContent) {
            notification.style.display = 'block';
            setTimeout(() => {
                notification.style.display = 'none';
            }, 2000);
        }
    }
}



// Hàm khởi tạo dữ liệu từ localStorage
function initializeData() {
    const storedData = getFromLocalStorage("sheetData");
    const apiKey = getFromLocalStorage('apiKey');
    const sheetId = getFromLocalStorage('sheetId');
    const rangeApi = getFromLocalStorage('rangeApi');
    if (storedData) {
        arrayTable = storedData;
        populateColumnSelector(arrayTable[0]);
        displayData(arrayTable);
        updateTextReport(arrayTable)
    } else {
        // Nếu không có dữ liệu trong localStorage, gọi API để lấy dữ liệu
        if (apiKey && sheetId && rangeApi) {
            fetchSheetData(apiKey, sheetId, rangeApi);
        } else {
            alert("Vui lòng nhập API Key, Sheet ID và Range API!");
        }
    }
}

// Hàm điền tiêu đề cột vào ô chọn
function populateColumnSelector(headers) {
    if (!headers || headers.length === 0) {
        console.error("Tiêu đề bảng không hợp lệ.");
        return;
    }

    const currentHtml = Array.from(columnSelector.options).map(option => option.value);
    const newOptions = headers.map((header, index) => `<option value="${index}">${header}</option>`).join('');

    if (newOptions !== currentHtml.join('')) {
        columnSelector.innerHTML = '<option value="">Chọn tiêu đề cột ▾</option>' + newOptions;
    }
}

// Hiển thị dữ liệu lên bảng
function displayData(data) {
    const maxColumns = 9; // Giới hạn số cột là 9
    const table = resultContainer.querySelector('table');

    if (table) {
        const tbody = table.querySelector('tbody');

        // Hiển thị dữ liệu trong <tbody>, chỉ lấy 9 cột đầu
        tbody.innerHTML = data.slice(1).map(row =>
            `<tr>${row.slice(0, maxColumns).map(cell => `<td>${cell}</td>`).join('')}</tr>`
        ).join('');
    } else {
        // Tạo bảng mới nếu chưa tồn tại bảng
        let html = '<table class="data-table"><thead><tr>';

        // Chỉ hiển thị 9 cột đầu trong tiêu đề
        html += data[0].slice(0, maxColumns).map(header => `<th>${header}</th>`).join('');
        html += '</tr></thead><tbody>';

        // Hiển thị dữ liệu trong <tbody>, chỉ lấy 9 cột đầu cho mỗi hàng
        html += data.slice(1).map(row =>
            `<tr>${row.slice(0, maxColumns).map(cell => `<td>${cell}</td>`).join('')}</tr>`
        ).join('');

        html += '</tbody></table>';

        resultContainer.innerHTML = html;
    }
}


// Tự động điền giá trị vào ô chọn dựa trên cột được chọn
columnSelector.addEventListener('change', () => {
    const selectedColumnIndexes = Array.from(columnSelector.selectedOptions).map(option => option.value);
    valueSelector.innerHTML = '<option value="">Chọn giá trị ▾</option>'; // Reset lại ô chọn giá trị

    // Tìm phần tử <select> chứa lựa chọn
    const selectedOption = columnSelector.options[columnSelector.selectedIndex];

    // Thêm class "selected" để thay đổi màu sắc của text
    columnSelector.classList.add('filter__selected');

    // Nếu không có lựa chọn, loại bỏ class "selected"
    if (selectedOption.value === "") {
        columnSelector.classList.remove('filter__selected');
    }

    if (selectedColumnIndexes.length) {
        const uniqueValues = new Set();
        selectedColumnIndexes.forEach(index => {
            arrayTable.slice(1).forEach(row => {
                uniqueValues.add(row[index]);
            });
        });
        uniqueValues.forEach(value => {
            const option = document.createElement('option');
            option.value = value;
            option.textContent = value;
            valueSelector.appendChild(option);
        });
    }
});



// Gọi Hàm lọc dữ liệu và hiển thị kết quả khi có event
document.getElementById('filter-btn').addEventListener('click', filterDataByDateTime);

let lastFilterData = null;

function filterDataByDateTime() {
    const selectedColumnIndex = columnSelector.value;
    const selectedValue = valueSelector.value;
    const startDateTimeValue = document.getElementById('start-datetime').value;
    const endDateTimeValue = document.getElementById('end-datetime').value;

    if (!startDateTimeValue || !endDateTimeValue) {
        alert("Vui lòng chọn đầy đủ ngày và giờ.");
        return;
    }

    const startDateTime = new Date(startDateTimeValue);
    const endDateTime = new Date(endDateTimeValue);

    if (startDateTime >= endDateTime) {
        alert("Ngày giờ bắt đầu phải trước ngày giờ kết thúc.");
        return;
    }

    // Caching lọc
    const filterKey = `${selectedColumnIndex}-${selectedValue}-${startDateTime}-${endDateTime}`;
    if (lastFilterData && lastFilterData.key === filterKey) {
        displayData(lastFilterData.filtered);
        return;
    }

    // Lọc dữ liệu
    const filteredData = arrayTable.filter((row, index) => {
        if (index === 0) return true;
        const rowDate = row[3];
        const rowTime = row[4];

        if (!rowDate || !rowTime) return false;

        const dateParts = rowDate.split('/');
        const rowDay = dateParts[0];
        const rowMonth = dateParts[1] - 1;
        let rowYear = dateParts[2];
        if (rowYear < 100) {
            rowYear = `20${rowYear}`;
        }

        const rowDateTime = new Date(rowYear, rowMonth, rowDay, ...rowTime.split(':'));
        if (isNaN(rowDateTime)) return false;

        const isWithinRange = rowDateTime >= startDateTime && rowDateTime <= endDateTime;
        const isColumnMatch = !selectedColumnIndex || row[selectedColumnIndex] === selectedValue;

        return isColumnMatch && isWithinRange;
    });

    lastFilterData = { key: filterKey, filtered: filteredData };

    displayData(filteredData); // Gọi hàm hiển thị dữ liệu bảng
    updateTextReport(filteredData); // Gọi hàm hiển thị text Report
}


// Nút reset filter
document.getElementById('reset-filter-btn').addEventListener('click', () => {
    createConfirmModal(
        "Reset bộ lọc",
        "Bạn chắc chắn muốn xoá bộ lọc chứ?",
        () => {
            displayData(arrayTable); // Hiển thị lại toàn bộ dữ liệu từ arrayTable
            columnSelector.value = ""; // Đặt lại các giá trị chọn về mặc định
            valueSelector.innerHTML = '<option value="">Chọn giá trị ▾</option>'; // Xóa các giá trị đã chọn
        },
        () => {
            console.log("Đã hủy bỏ reset filter."); // Không làm gì nếu người dùng hủy
        }
    )
});

// Nút làm mới dữ liệu với hiệu ứng
document.getElementById('refresh-btn').addEventListener('click', () => {
    const apiKey = getFromLocalStorage('apiKey');
    const sheetId = getFromLocalStorage('sheetId');
    const rangeApi = getFromLocalStorage('rangeApi');

    // Kiểm tra nếu có giá trị hợp lệ trong localStorage
    if (apiKey && sheetId && rangeApi) {
        fetchSheetData(apiKey, sheetId, rangeApi);
    } else {
        alert('Vui lòng nhập đầy đủ API Key, Sheet ID và Range ở Open Filer');
    }
});

// Hàm để mở rộng bảng và tắt thanh cuộn khi chuẩn bị chụp ảnh
function expandTableForScreenshot() {
    const table = document.querySelector('.dataTable');
    table.classList.add('expanded');  // Mở rộng bảng

    // Sử dụng requestAnimationFrame để đảm bảo CSS được áp dụng
    requestAnimationFrame(() => {
        // Sau khi CSS đã được áp dụng, thực hiện chụp ảnh
        takeScreenshot();
    });
}

// Hàm chụp ảnh
function takeScreenshot() {
    const dataContainer = document.getElementById('data-container');  // Đảm bảo đúng id của phần tử bảng

    html2canvas(dataContainer, { scale: 4 }).then(canvas => {
        // Chuyển canvas thành URL hình ảnh
        const imageURL = canvas.toDataURL('image/png');

        // Tạo một thẻ <a> để tải ảnh xuống
        const link = document.createElement('a');
        link.href = imageURL;
        link.download = 'screenshot.png';
        link.click();

        // Khôi phục lại trạng thái bảng sau khi chụp ảnh
        restoreTable();
    }).catch(error => {
        console.error('Lỗi khi chụp màn hình:', error);
        // Khôi phục lại trạng thái bảng nếu có lỗi
        restoreTable();
    });
}

// Hàm khôi phục lại trạng thái bảng ban đầu
function restoreTable() {
    const table = document.querySelector('.dataTable');
    table.classList.remove('expanded');  // Khôi phục lại trạng thái ban đầu
}

// Sử dụng hàm này khi người dùng muốn chụp ảnh
document.getElementById("screenshot-btn").addEventListener("click", expandTableForScreenshot);

// Lắng nghe sự kiện thay đổi của nút căn chỉnh
applyAlignmentBtn.addEventListener('click', () => {
    const selectedColumnIndexes = Array.from(columnSelector.selectedOptions).map(option => option.value);
    const selectedAlignment = alignmentSelector.value;

    // Cập nhật CSS cho các tiêu đề cột tương ứng
    selectedColumnIndexes.forEach(index => {
        // Kiểm tra nếu `index` là một số hợp lệ
        const columnIndex = parseInt(index);
        if (!isNaN(columnIndex)) {
            const tableHeaders = document.querySelectorAll('.data-table th');
            const bodyCells = document.querySelectorAll(`.data-table td:nth-child(${columnIndex + 1})`);

            // Cập nhật căn chỉnh cho tiêu đề cột
            tableHeaders[columnIndex].style.textAlign = selectedAlignment; // Căn chỉnh tiêu đề

            // Cập nhật căn chỉnh cho các ô trong cột
            bodyCells.forEach(cell => {
                cell.style.textAlign = selectedAlignment; // Căn chỉnh các ô dữ liệu
            });
        }
    });
});

// =====

// Lấy ngày giờ hiện tại và thiết lập mặc định cho start và end
const now = new Date();
const startDateTimeDefault = new Date(now);
startDateTimeDefault.setHours(11, 0, 0, 0); // 11:00 hôm nay

const endDateTimeDefault = new Date(now);
endDateTimeDefault.setDate(endDateTimeDefault.getDate() + 1); // Ngày hôm sau
endDateTimeDefault.setHours(10, 59, 0, 0); // 10:59 hôm sau

// Khởi tạo Flatpickr cho start-datetime với giá trị mặc định
flatpickr("#start-datetime", {
    enableTime: true,
    dateFormat: "Y-m-d H:i",
    defaultDate: startDateTimeDefault, // Thiết lập mặc định
    time_24hr: true
});

// Khởi tạo Flatpickr cho end-datetime với giá trị mặc định
flatpickr("#end-datetime", {
    enableTime: true,
    dateFormat: "Y-m-d H:i",
    defaultDate: endDateTimeDefault, // Thiết lập mặc định
    time_24hr: true
});

// Cập nhật ngày hôm nay và ngày mai cho các input sau khi tải trang
window.onload = function () {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);  // Tính ngày tiếp theo

    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0'); // Tháng bắt đầu từ 0
    const day = String(today.getDate()).padStart(2, '0'); // Thêm số 0 nếu ngày nhỏ hơn 10
    const hourToday = "11:00";
    const hourTomorrow = "10:59";

    // Định dạng ngày hôm nay và ngày tiếp theo
    const todayFormatted = `${year}-${month}-${day} ${hourToday}`;
    const tomorrowFormatted = `${tomorrow.getFullYear()}-${String(tomorrow.getMonth() + 1).padStart(2, '0')}-${String(tomorrow.getDate()).padStart(2, '0')} ${hourTomorrow}`;

    // Cập nhật giá trị cho các input ngày
    document.getElementById('start-datetime').value = todayFormatted;
    document.getElementById('end-datetime').value = tomorrowFormatted;
};

// Xử lý bật lên Modal Filter:
openModalFilter.addEventListener('click', () => {
    if (modalFilter) {
        modalFilter.classList.add("filter-modal__show");
    }
})

modalFilterClose.addEventListener('click', () => {
    if (modalFilter) {
        modalFilter.classList.remove("filter-modal__show");
    }
})

window.addEventListener('click', (e) => {
    if (e.target === modalFilter) {
        modalFilter.classList.remove("filter-modal__show");
    }
})

// function handleTextReport(data) {
//     console.log(data)
// }

// Hàm hiển thị thông tin textReport
function updateTextReport(data) {
    const textReport = document.querySelector('.text-report');
    const arrName = ["Nhà Đài", ""];

    // Xoá tất cả các mục hiện có trong textReport:
    textReport.innerHTML = "";

    // Lọc dữ liệu nội bộ:
    const filteredData = data.filter(row => {
        const condition1 = row[7] === "NIGHT"; // Điều kiện lọc cột 7
        const condition2 = !arrName.includes(row[5]); // Điều kiện lọc cột 5
        return condition1 && condition2;
    });

    // Tạo HTML mới cho toàn bộ báo cáo
    let htmlContent = '';
    filteredData.forEach((row, index) => {
        // Tạo HTML cho từng item
        htmlContent += `
        <div class="text-report__item">
            <div class="text-report__row">
                <input type="text" class="text-report__input-key">
                <button class="text-report__item-back">
                <img src="./assets/images/back.svg" alt="" class="icon">
                </button>
                <button class="text-report__item-copy">
                <img src="./assets/images/copy.svg" alt="" class="icon">
                </button>
            </div>
            <p class="text-report__item--title">${row[1]} - ${row[3]}</p>
            <p class="text-report__item--title"> ${row[5]}</p>
            <p class="d-none">🔶Server:</p>
            <p class="d-none">${row[12]}</p>
            <p class="d-none">🔶Server Key: ${row[6]}</p>
            <p class="d-none"><span class="input-value">[Chưa nhập]</span></p>
            <p class="d-none">✅ START STREAM TRƯỚC 15 PHÚT!</p>
            <p class="d-none">🔷Link Chính 1: ${row[9]}</p>
            <p class="d-none">🔷Link Chính 2: ${row[10]}</p>
            <p class="d-none">🔹Link Backup: ${row[11]}</p>
            <p class="d-none">🔴 LƯU Ý: ƯU TIÊN SỬ DỤNG LINK CÓ AU GỐC (TIẾNG SÂN GỐC)</p>
        </div>
        `;
    });

    // Cập nhật lại toàn bộ nội dung của textReport
    textReport.innerHTML = htmlContent;

    // Gọi hàm để cập nhật các sự kiện cho nút Back và Copy
    updateEventListeners(filteredData);
}

// Cập nhật các sự kiện cho nút Copy và Back
function updateEventListeners(filteredData) {
    // Lưu trữ trạng thái sao chép
    const copiedItems = getFromLocalStorage('copiedItems') || [];

    // Lặp qua từng item trong text-report
    document.querySelectorAll('.text-report__item').forEach((item, index) => {
        const inputField = item.querySelector('.text-report__input-key');
        const inputValueDisplay = item.querySelector('.input-value');

        // Cập nhật giá trị input vào trong phần hiển thị (span) mỗi khi người dùng nhập
        inputField.addEventListener('input', () => {
            inputValueDisplay.textContent = inputField.value || '[Chưa nhập]';  // Cập nhật khi giá trị thay đổi
        });

        // Kiểm tra xem item đã được sao chép chưa
        if (copiedItems.includes(index)) {
            item.classList.add('copied');
        }

        // Gắn sự kiện cho nút "Copy"
        const copyButton = item.querySelector('.text-report__item-copy');
        copyButton.addEventListener('click', () => {
            const inputValue = item.querySelector('.text-report__input-key').value;  // Lấy giá trị từ ô input

            // Tạo một đoạn text từ nội dung của `text-report__item`
            const textToCopy = `
**Trận Đấu:** ${filteredData[index][1]}
**Ngày:** ${filteredData[index][3]}
**BLV:** ${filteredData[index][5]}
**Kỹ Thuật:** ${filteredData[index][7]}
------------------
**🔶Server:**
${filteredData[index][12]}

**🔶Server Key:**
${inputValue}

**✅ START STREAM TRƯỚC 15 PHÚT!**

**🔷Link Chính 1:** ${filteredData[index][9]}

**🔷Link Chính 2:** ${filteredData[index][10]}

🔹Link Backup: ${filteredData[index][11]}

**🔴 LƯU Ý: ƯU TIÊN SỬ DỤNG LINK CÓ AU GỐC (TIẾNG SÂN GỐC)**
`;
            // Sử dụng Clipboard API để sao chép nội dung
            navigator.clipboard.writeText(textToCopy)
                .then(() => {
                    console.log("Copied to clipboard!");

                    // Đánh dấu item đã sao chép bằng cách thêm lớp "copied"
                    item.classList.add('copied');

                    // Lưu lại trạng thái sao chép trong localStorage
                    if (!copiedItems.includes(index)) {
                        copiedItems.push(index);
                        saveToLocalStorage('copiedItems', copiedItems);
                    }
                })
                .catch((err) => {
                    console.error("Failed to copy text: ", err);
                });
        });

        // Gắn sự kiện cho nút "Back" (hoàn tác)
        const backButton = item.querySelector('.text-report__item-back');
        backButton.addEventListener('click', () => {
            // Loại bỏ lớp "copied" khi nhấn Back
            item.classList.remove('copied');

            // Xóa item khỏi danh sách copiedItems trong localStorage
            const updatedCopiedItems = copiedItems.filter(itemIndex => itemIndex !== index);
            saveToLocalStorage('copiedItems', updatedCopiedItems);
        });
    });
}

// Khởi tạo dữ liệu và các phần tử khi trang tải
document.addEventListener('DOMContentLoaded', () => {
    initializeData();

    // Xử lý lưu sự kiện click vào nút filter auto sau khi vừa tải lại trang
    const btnFilterAuto = document.querySelector("#filter-btn");
    if (btnFilterAuto) {
        btnFilterAuto.click();
    }

    // Xử lý load lại dữ liệu apikey và sheetid khi vừa tải lại trang
    const savedApiKey = getFromLocalStorage('apiKey');
    const savedSheetId = getFromLocalStorage('sheetId');
    const savedRangeApi = getFromLocalStorage('rangeApi');

    if (savedApiKey) {
        apiKeyInput.value = savedApiKey;
    }
    if (savedSheetId) {
        sheetIdInput.value = savedSheetId;
    }
    if (savedRangeApi) {
        rangeSheetApi.value = savedRangeApi;
    }
});

// =======