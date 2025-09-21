import { saveToLocalStorage, getFromLocalStorage, removeFromLocalStorage, clearLocalStorage, createInputSheetModal } from './function.js';

// Biến Event bật Modal:
const addSheet = document.querySelector(".add-sheet");
const saveInput = document.getElementById('save-ApiSheet');
const modalInputSheetClose = document.getElementById('modalInputSheetClose');
const messageSheet = document.querySelector(".modal__message-sheet");

// Thông báo về dữ liệu bảng:
const loadingIndicator = document.getElementById('loading');
const notification = document.getElementById('notification');

// Truy xuất đến 3 input nhập liệu:
const apiKey = document.getElementById('code-apikey');
const sheetId = document.getElementById('code-sheetid');
const rangeApi = document.getElementById('rangeApi');

// Truy xuất đến nút lấy hoặc làm mới dữ liệu bảng:
const fetchButton = document.querySelector("#refresh-btn");

// Biến toàn cục:
let arrayTable = [];         // Dữ liệu gốc từ Google Sheets
let filteredData = [];       // Dữ liệu đã lọc

let oneDay = 0;  // Biến theo dõi ngày hiện tại

/**
 * =====================================
 *   showModalInputKeySheet() & close
 * =====================================
 * Mô tả:
 * - Chức năng bật lên và đóng Modal nhập keyApi và SheetId
 */
function showModalInputKeySheet() {
    const modalBox = document.getElementById('inputSheetModal');
    modalBox.style.display = 'flex';

    window.addEventListener('click', (e) => {
        if (e.target === modalBox) {
            modalBox.style.display = 'none';
        }
    })
}

function closeModalInputKeySheet() {
    const modalBox = document.getElementById('inputSheetModal');
    modalBox.style.display = 'none';
}

/**
 * =====================================
 *         saveInputApiSheet()
 * =====================================
 * Mô tả:
 * - Chức năng xử lý lưu apiKey và sheetId
 * - Có gọi đến hàm closeModalInputKeySheet() để đóng Modal khi Fetch Data xong
 */
async function saveInputApiSheet() {
    const apiKeyValue = apiKey.value.trim();
    const sheetIdValue = sheetId.value.trim();
    const rangeApiValue = rangeApi.value.trim();

    // Kiểm tra xem đã nhập đủ thông tin chưa
    if (!apiKeyValue || !sheetIdValue || !rangeApiValue) {
        messageSheet.style.color = "red";
        messageSheet.textContent = "Vui lòng nhập nhập đủ thông tin bên trên"

        // Đặt viền đỏ cho các input chưa điền thông tin
        if (!apiKeyValue) apiKey.style.borderColor = 'red';
        if (!sheetIdValue) sheetId.style.borderColor = 'red';
        if (!rangeApiValue) rangeApi.style.borderColor = 'red';

        sheetId.focus();
        return
    }

    // Lưu vào localStorage
    saveToLocalStorage('apiKeyValue', apiKeyValue);
    saveToLocalStorage('sheetIdValue', sheetIdValue);
    saveToLocalStorage('rangeApiValue', rangeApiValue);

    // Thông báo lưu thành công
    messageSheet.style.color = "green";
    messageSheet.textContent = "Thông tin Api Sheet đã được lưu thành công!";

    // Đặt lại viền input
    apiKey.style.borderColor = '';
    sheetId.style.borderColor = '';
    rangeApi.style.borderColor = '';
}

/**
 * =====================================
 *      EVENTS: Modal Input Sheet
 * =====================================
 * Mô tả:
 * - Event mở, lấy data và đóng modal nhập sheet id
 */
addSheet.addEventListener('click', showModalInputKeySheet);
saveInput.addEventListener('click', saveInputApiSheet);
modalInputSheetClose.addEventListener('click', closeModalInputKeySheet);

/**
 * =====================================
 *      EVENTS: Modal Input Sheet
 * =====================================
 * Mô tả:
 * - Thêm sự kiện input để xóa border đỏ khi người dùng nhập liệu
 */
apiKey.addEventListener('input', function () {
    this.style.borderColor = '';
});

sheetId.addEventListener('input', function () {
    this.style.borderColor = '';
});

rangeApi.addEventListener('input', function () {
    this.style.borderColor = '';
});

/**
 * =====================================
 *      EVENTS: Fetch Data
 * =====================================
 * Mô tả:
 * - Sự kiện cho nút lấy hoặc làm mới dữ liệu bảng
 */
fetchButton.addEventListener('click', () => fetchSheetData(apiKey.value, sheetId.value, rangeApi.value));

/**
 * =====================================
 *    MAIN FUNCTION fetchSheetData()
 * =====================================
 * Mô tả:
 * - Gọi Fetch Data từ Google Sheets về
 */
async function fetchSheetData(apiKey, sheetId, rangeApi) {

    // Khởi tạo arrayTable từ localStorage nếu có dữ liệu lưu trước đó
    arrayTable = getFromLocalStorage('sheetData') || [];

    try {
        // Hiển thị loading khi đang tải dữ liệu
        loadingIndicator.style.display = 'block';
        notification.style.display = 'none';

        // Tạo URL động từ apiKey và sheetId
        const url = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${rangeApi}?key=${apiKey}`;

        const response = await fetch(url);

        // Kiểm tra nếu response không thành công (mã không phải 200-299)
        if (!response.ok) {
            throw new Error("Không tải được dữ liệu từ Google Sheets.");
        }

        const data = await response.json(); // Chắc chắn rằng dữ liệu trả về là JSON

        // Kiểm tra nếu không có dữ liệu
        if (!data.values || data.values.length === 0) {
            throw new Error("Không có dữ liệu trong phạm vi này.");
        }

        // Lấy dữ liệu hiện tại từ localStorage để so sánh
        const newArrayTable = data.values;
        const currentData = getFromLocalStorage('sheetData'); // Lấy dữ liệu hiện tại từ localStorage

        // Kiểm tra xem dữ liệu mới có khác với dữ liệu hiện tại không
        if (JSON.stringify(newArrayTable) === JSON.stringify(currentData)) {
            notification.textContent = "Dữ liệu không thay đổi.";
        } else {
            // Cập nhật dữ liệu mới vào localStorage và arrayTable
            saveToLocalStorage('sheetData', newArrayTable);
            arrayTable = newArrayTable; // Cập nhật dữ liệu hiện tại

            // console.log("Fetched Array Table: ", arrayTable)

            // Thông báo thành công
            notification.textContent = "Dữ liệu mới đã được cập nhật thành công.";
        }

    } catch (error) {
        // Thông báo lỗi cho người dùng
        console.error("Lỗi khi lấy dữ liệu từ Google Sheets:", error);
        notification.textContent = `Lỗi: ${error.message}`; // Hiển thị thông báo lỗi chi tiết
    } finally {
        // Ẩn loading sau khi hoàn tất
        loadingIndicator.style.display = 'none';

        // Cập nhật arrayTable từ localStorage (nếu có)
        arrayTable = getFromLocalStorage('sheetData') || arrayTable;

        // Kiểm tra nếu arrayTable có dữ liệu, gọi các hàm khác chỉ khi có dữ liệu
        if (arrayTable && arrayTable.length > 0) {
            filterSheetDataCustom(arrayTable);
            handleShowDataFiltered(arrayTable)
            goToPrevDay(arrayTable);
            goToNextDay(arrayTable);
            updateDataBasedOnDay(arrayTable);
            displayData(arrayTable); // Hiển thị nội dung bảng
            displayReport(arrayTable); // Hiển thị nôi dung Report
            displayDashboard(arrayTable); // Hiển thị nôi dung Report
            displayTextSend(arrayTable);
        }

        // Hiển thị thông báo trong 5 giây
        if (notification.textContent) {
            notification.style.display = 'block';
            setTimeout(() => {
                notification.style.display = 'none';
            }, 5000);
        }
    }
}

/**
 * =====================================
 *      FUNCTION 2 displayData()
 * =====================================
 * Mô tả:
 * - Gọi Fetch Data từ Google Sheets về
 */
function displayData(data) {

    // Kiểm tra xem dữ liệu có hợp lệ không
    if (!Array.isArray(data) || data.length === 0) {
        console.log("Dữ liệu không hợp lệ hoặc rỗng.");
        return;
    }

    // 1. Chọn vị trí container
    const dataTable = document.querySelector("#data-container");

    if (!dataTable) {
        console.error("Không tìm thấy phần tử #data-container.");
        return;
    }

    dataTable.innerHTML = ""; // Xoá nội dung cũ nếu có

    // 2. Tạo các phần tử bảng HTML
    const table = document.createElement("table");
    const thead = document.createElement("thead");
    const tbody = document.createElement("tbody");

    // 3. Tạo tiêu đề cột từ hàng đầu tiên
    const headerRow = document.createElement("tr");
    data[0].forEach(header => {
        const th = document.createElement('th');
        th.textContent = header;
        headerRow.appendChild(th);
    })
    thead.appendChild(headerRow);

    // 4. Tạo các hàng dữ liệu
    data.slice(1).forEach(row => { // Bỏ qua hàng đầu tiên vì đã dùng làm tiêu đề
        const tableRow = document.createElement('tr');
        row.forEach((cellData, index) => {
            const td = document.createElement('td');
            const childTd = document.createElement('span');
            childTd.classList.add("child-of-td");
            td.appendChild(childTd);

            // CSS cho cột đầu tiên của bảng:
            if (index === 0) { // Cột số 8 (index = 7)
                childTd.classList.add("width-custom");
            }

            // Áp dụng logic thay đổi text hoặc CSS
            if (index === 8) { // Cột số 8 (index = 7)
                if (cellData === "TRUE") {
                    childTd.textContent = "Done";
                    childTd.classList.add("done");
                } else if (cellData === "FALSE") {
                    childTd.textContent = "Doing";
                    childTd.classList.add("doing");
                } else {
                    childTd.textContent = cellData; // Giữ nguyên nội dung nếu không phải TRUE/FALSE
                }
            } else if (index === 7) {
                if (cellData === "NIGHT") {
                    childTd.textContent = cellData;
                    childTd.classList.add("user-1");
                } else if (cellData === "GOKU") {
                    childTd.textContent = cellData;
                    childTd.classList.add("user-2");
                }
            } else if (index === 5) {
                if (cellData !== "Nhà Đài") {
                    childTd.textContent = cellData;
                    childTd.classList.add("voice");
                } else {
                    childTd.textContent = cellData;
                }
            } else {
                childTd.textContent = cellData; // Các cột khác
            }
            tableRow.appendChild(td);
        })
        tbody.appendChild(tableRow);
    })

    // 5. Thêm thead và tbody vào bảng:
    table.appendChild(thead);
    table.appendChild(tbody);

    // 6. Thêm bảng vào khu vực cần hiển thị:
    dataTable.appendChild(table);

    // Sau khi tạo bảng, áp dụng số cột mặc định là 9
    applyColumnLimit();  // Giới hạn số cột mặc định là 9
}

/**
 * =====================================
 *      FUNCTION 3 initializeData()
 * =====================================
 * Mô tả:
 * - Hàm khởi tạo dữ liệu từ localStorage
 */
function initializeData() {
    const savedOneDay = localStorage.getItem('oneDay');
    if (savedOneDay !== null) {
        oneDay = parseInt(savedOneDay, 10);
    }

    const savedFilteredData = localStorage.getItem('filteredData');
    if (savedFilteredData !== null) {
        filteredData = JSON.parse(savedFilteredData);
        displayData(filteredData);
        displayReport(filteredData);
        displayDashboard(filteredData);
        displayTextSend(filteredData);
    } else {
        updateDataBasedOnDay();
    }

    const storedFilteredData = getFromLocalStorage('dataFiltered'); // Lấy dữ liệu đã lọc từ localStorage
    const storedData = getFromLocalStorage("sheetData"); // Lấy dữ liệu gốc từ localStorage

    if (storedData && Array.isArray(storedData)) {
        arrayTable = storedData;
        displayData(arrayTable); // Hiển thị toàn bộ dữ liệu
        displayReport(arrayTable);
        displayDashboard(arrayTable);
        displayTextSend(arrayTable);
    } else {
        // Nếu không có dữ liệu trong localStorage, gọi API để lấy dữ liệu
        const apiKey = getFromLocalStorage('apiKey');
        const sheetId = getFromLocalStorage('sheetId');
        const rangeApi = getFromLocalStorage('rangeApi');

        if (apiKey && sheetId && rangeApi) {
            fetchSheetData(apiKey, sheetId, rangeApi);
        } else {
            notification.textContent = "Vui lòng nhập API Key, Sheet ID và Range API!";
            notification.style.display = "block";
        }
    }
}

// Hàm để áp dụng số cột hiển thị
function applyColumnLimit() {
    const columnLimit = parseInt(document.getElementById('columnLimit').value, 10);
    const table = document.getElementById('data-container').querySelector('table'); // Chỉnh sửa từ table

    if (!table) {
        console.error('Bảng chưa được tạo ra!');
        return; // Dừng hàm nếu bảng chưa tồn tại
    }

    // Lấy các hàng trong bảng
    const rows = table.querySelectorAll('tr');

    // Lấy số cột thực tế từ bảng (dựa trên số cột của hàng đầu tiên)
    const columnCount = rows.length > 0 ? rows[0].children.length : 0;

    // Xác định số cột tối đa sẽ hiển thị
    const columnsToShow = Math.min(columnLimit, columnCount);

    // Duyệt qua tất cả các hàng và reset lại trạng thái cột
    rows.forEach(row => {
        // Duyệt qua tất cả các cột trong mỗi hàng và hiển thị lại
        for (let i = 0; i < row.children.length; i++) {
            row.children[i].style.display = ''; // Hiển thị lại tất cả các cột
        }
    });

    // Duyệt qua các hàng và ẩn các cột thừa nếu cần
    rows.forEach(row => {
        for (let i = columnsToShow; i < row.children.length; i++) {
            row.children[i].style.display = 'none'; // Ẩn cột thừa
        }
    });

    // Giãn chiều rộng các cột còn lại để chúng chiếm trọn phần không gian có sẵn
    const visibleColumns = table.querySelectorAll('th, td');  // Lấy tất cả th và td của các cột hiển thị

    // Tính toán chiều rộng cho mỗi cột hiển thị
    const widthPerColumn = 100 / columnsToShow + '%';  // Tính toán tỷ lệ phần trăm

    // Cập nhật chiều rộng cho mỗi cột hiển thị
    visibleColumns.forEach(cell => {
        cell.style.width = widthPerColumn;  // Cập nhật chiều rộng cho các th và td
    });

    // Nếu bảng đã có chiều rộng lớn hơn container, thêm cuộn ngang
    const dataContainer = document.querySelector('#data-container');
    if (dataContainer) {
        dataContainer.style.overflowX = 'auto'; // Thêm cuộn ngang nếu cần
    }
}

// Thêm sự kiện cho nút "Áp dụng"
document.getElementById('applyColumnLimit').addEventListener('click', applyColumnLimit);

/**
 * =====================================
 *     window ('DOMContentLoaded')
 * =====================================
 * Mô tả:
 * - Xử lý các vấn đề sau khi HTML tải xong
 */
// Kiểm tra và hiển thị thông báo khi tải lại trang
window.addEventListener('DOMContentLoaded', () => {
    const apiKeyValue = getFromLocalStorage('apiKeyValue');
    const sheetIdValue = getFromLocalStorage('sheetIdValue');
    const rangeApiValue = getFromLocalStorage('rangeApiValue');

    // Hiển thị thông báo nếu đã có dữ liệu hoặc chưa nhập
    if (apiKeyValue && sheetIdValue && rangeApiValue) {
        messageSheet.style.color = "green";
        messageSheet.textContent = "Thông tin Api Sheet được lưu tại localStorage!";
    } else {
        messageSheet.style.color = "red";
        messageSheet.textContent = "Thông tin Api Sheet chưa được lưu";
    }

    // Đặt giá trị các ô input từ localStorage (nếu có)
    if (apiKeyValue) {
        apiKey.value = apiKeyValue;
        apiKey.style.color = '#e9e9e9';
    }
    if (sheetIdValue) {
        sheetId.value = sheetIdValue;
        sheetId.style.color = '#e9e9e9';
    }
    if (rangeApiValue) {
        rangeApi.value = rangeApiValue;
        rangeApi.style.color = '#e9e9e9';
    }

    initializeData();
});

/**
 * =====================================
 * FUNCTION FILTER: filterSheetDataCustom()
 * =====================================
 * Mô tả:
 * - Xử lý các vấn đề sau khi HTML tải xong
 */
function filterSheetDataCustom(data, oneDay = 0) {
    // Kiểm tra dữ liệu đầu vào
    if (!Array.isArray(data) || data.length === 0) {
        console.error("Dữ liệu không hợp lệ hoặc rỗng:", data);
        return []; // Trả về mảng rỗng nếu không có dữ liệu hợp lệ
    }

    // 1. Lấy ra mốc thời gian từ ngày hôm nay 11:00 đến 10:59 hôm sau:
    const today = new Date();
    today.setDate(today.getDate() + oneDay);
    const startDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 11, 0);
    const endDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1, 10, 59);

    // Nếu ngày hiện tại trước 11:00 sáng, điều chỉnh khoảng từ 11:00 hôm qua đến 10:59 hôm nay
    if (today < startDay) {
        startDay.setDate(startDay.getDate() - 1);
        endDay.setDate(endDay.getDate() - 1);
    }

    // 2. Lọc dữ liệu theo khoảng thời gian
    const headerRow = data[0];  // Lấy tiêu đề cột
    const dataRows = data.slice(1);  // Các dữ liệu còn lại

    const filteredDataRows = dataRows.filter(row => {
        // Lấy ra mảng chứa từng giá trị ngày tháng năm giờ phút
        const dateParts = row[3].split('/'); // Cột ngày (index = 3)
        const timeParts = row[4].split(':'); // Cột giờ (index = 4)

        // Chuyển giá trị bên trên thành số nguyên cho việc lọc so sánh. Cơ số 10 (hệ thập phân)
        const day = parseInt(dateParts[0], 10);
        const month = parseInt(dateParts[1], 10) - 1; // Tháng bắt đầu từ 0
        const year = parseInt(dateParts[2], 10) + 2000; // Giả định năm là 20xx
        const hour = parseInt(timeParts[0], 10);
        const minute = parseInt(timeParts[1], 10);

        const rowDateTime = new Date(year, month, day, hour, minute);
        // console.log(rowDateTime)

        // Kiểm tra xem ngày giờ trong hàng có nằm trong khoảng thời gian không
        return rowDateTime >= startDay && rowDateTime <= endDay;
    });

    // 3. Trả về dữ liệu đã lọc kèm tiêu đề
    return [headerRow, ...filteredDataRows];
}

/**
 * =====================================
 *      EVENTS: Hỗ Trợ Filter
 * =====================================
 * Mô tả:
 * - Các sự kiện thao thác lọc
 */
// Lọc ngày hiện tại
document.querySelector('#filterByDayWork').addEventListener('click', handleShowDataFiltered);

// Lọc ngày hôm qua
document.getElementById('prevDate').addEventListener('click', goToPrevDay);

// Lọc ngày mai
document.getElementById('nextDate').addEventListener('click', goToNextDay);

/**
 * =====================================
 * handleShowDataFiltered() : Hôm nay
 * =====================================
 * Mô tả:
 * - Xử lý lọc dữ liệu cho ngày hôm nay
 */
function handleShowDataFiltered() {
    const filteredData = filterSheetDataCustom(arrayTable);
    saveToLocalStorage('dataFiltered', filteredData)
    displayData(filteredData);
    oneDay = 0; // Đặt lại oneDay về 0 khi bấm nút filter
    updateDataBasedOnDay(); // Cập nhật lại dữ liệu với oneDay = 0
}

/**
 * =====================================
 * handleShowDataFiltered() : Ngày mai
 * =====================================
 * Mô tả:
 * - Xử lý lọc dữ liệu cho ngày mai
 */
function goToNextDay() {
    oneDay++; // Tăng oneDay lên 1
    updateDataBasedOnDay(); // Cập nhật dữ liệu sau khi thay đổi oneDay
}

/**
 * =====================================
 * handleShowDataFiltered() : Ngày hôm qua
 * =====================================
 * Mô tả:
 * - Xử lý lọc dữ liệu cho ngày hôm qua
 */
function goToPrevDay() {
    oneDay--; // Giảm oneDay đi 1
    updateDataBasedOnDay(); // Cập nhật dữ liệu sau khi thay đổi oneDay
}

// Hàm gọi filterSheetDataCustom với oneDay
function updateDataBasedOnDay() {
    // Giả sử data là dữ liệu bảng mà bạn đã tải từ Google Sheets hoặc dữ liệu gốc
    const filteredData = filterSheetDataCustom(arrayTable, oneDay);
    displayData(filteredData); // Hiển thị dữ liệu đã lọc
    displayReport(filteredData); // Hiển thị dữ liệu đã lọc
    displayDashboard(filteredData); // Hiển thị dữ liệu đã lọc
    displayTextSend(filteredData)

    saveToLocalStorage('oneDay', oneDay); // Lưu ngày
    saveToLocalStorage('filteredData', filteredData); // Lưu dữ liệu đã lọc
}

// ===============
// Hàm hiển thị thông tin textReport
function displayReport(data) {
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
    filteredData.forEach((row) => {
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
            <p class="text-report__item--title"> ${row[5]} - ${row[4]}</p>
            <p class="d-none"><span class="input-value">[Chưa nhập]</span></p>
        </div>
        `;
    });

    // Cập nhật lại toàn bộ nội dung của textReport
    textReport.innerHTML = htmlContent;

    // Gọi hàm để cập nhật các sự kiện cho nút Back và Copy
    updateEventListeners(filteredData);
}

/**
 * =====================================
 * displayDashboard()
 * =====================================
 * Mô tả:
 * - Hiển thị tổng quan Report
 */
// Hàm hiển thị thông tin textReport
function displayDashboard(data) {
    const dashboard = document.querySelector('.dashboard');
    const dashboardTextarea = document.getElementById('summaryTemplate');

    // Xoá tất cả các mục hiện có trong dashboard
    dashboard.innerHTML = "";

    // Biến tổng hợp các kết quả
    let dayRows = data[1][3];
    let totalRows = data.length - 1;
    let name1Rows = 0;
    let name2Rows = 0;
    let lowRows = 0;
    let highRows = 0;
    let blogSeo = 0;

    // Lọc dữ liệu nội bộ
    data.forEach((row) => {
        if (row[7] && row[7].toLowerCase().includes("night")) {
            name1Rows++;
        }

        if (row[7] && row[7].toLowerCase().includes("goku")) {
            name2Rows++;
        }

        if (row[5] && row[5].toLowerCase().includes("nhà đài")) {
            lowRows++;
        } else {
            if (row[5] && row[5].trim() !== "" && !row[5].toLowerCase().includes("nhà đài")) {
                highRows++;
            }
        }

        // Lọc số lượng bài viết
        if (row[14] && row[14].trim() !== "") {
            blogSeo++;
        }
    });

    // Kiểm tra nếu textarea tồn tại
    if (dashboardTextarea) {
        // Lấy cấu trúc từ localStorage nếu có
        const savedTemplate = localStorage.getItem("summaryTemplate");
        if (savedTemplate) {
            dashboardTextarea.value = savedTemplate;
            renderDashboard(savedTemplate);
        } else {
            renderDashboard(dashboardTextarea.value);
        }

        // Sự kiện tự động lưu vào localStorage khi người dùng nhập
        dashboardTextarea.addEventListener("input", () => {
            const template = dashboardTextarea.value;
            localStorage.setItem("summaryTemplate", template);
            renderDashboard(template);
        });
    }


    // Hàm hiển thị nội dung dashboard
    function renderDashboard(template) {
        // Thay thế các biến số bằng dữ liệu mẫu
        const summaryContent = template
            .replace('${dayRows}', dayRows)
            .replace('${totalRows}', totalRows)
            .replace('${name1Rows}', name1Rows)
            .replace('${name2Rows}', name2Rows)
            .replace('${lowRows}', lowRows)
            .replace('${highRows - 1}', highRows - 1)
            .replace('${blogSeo - 1}', blogSeo - 1)
            .replace(/\n/g, '<br>');

        // Cập nhật nội dung vào dashboard
        dashboard.innerHTML = `<div class="dashboard__summary">${summaryContent}</div>`;
    }
}

// Cập nhật các sự kiện cho nút Copy và Back
function updateEventListeners(filteredData) {
    // Lưu trữ trạng thái sao chép
    const copiedItems = getFromLocalStorage('copiedItems') || [];
    const customTemplateTextarea = document.getElementById('reportTextAreaOutput'); // Lấy nội dung từ textarea

    // Khôi phục giá trị từ localStorage nếu có
    const savedTemplate = getFromLocalStorage('reportTextAreaOutputValue');
    if (savedTemplate) {
        customTemplateTextarea.value = savedTemplate;
    }

    // Lắng nghe sự kiện input trên textarea để lưu giá trị vào localStorage
    customTemplateTextarea.addEventListener('input', () => {
        saveToLocalStorage('reportTextAreaOutputValue', customTemplateTextarea.value);
    });

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
            const inputValue = inputField.value;  // Lấy giá trị từ ô input
            let textToCopy = customTemplateTextarea.value; // Lấy mẫu văn bản từ textarea

            // Tạo một đoạn text từ nội dung của `text-report__item`
            textToCopy = textToCopy
                .replace('${filteredData[index][1]}', filteredData[index][1])
                .replace('${filteredData[index][3]}', filteredData[index][3])
                .replace('${filteredData[index][4]}', filteredData[index][4])
                .replace('${filteredData[index][5]}', filteredData[index][5])
                .replace('${filteredData[index][7]}', filteredData[index][7])
                .replace('${filteredData[index][13]}', filteredData[index][13])
                .replace('${inputValue}', inputValue)
                .replace('${filteredData[index][10]}', filteredData[index][10])
                .replace('${filteredData[index][11]}', filteredData[index][11])
                .replace('${filteredData[index][12]}', filteredData[index][12]);

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

/**
 * =====================================
 * displayTextSend()
 * =====================================
 * Mô tả:
 * - Hiển thị text Send
 */
function displayTextSend(data) {
    const textSendContainer = document.querySelector('.text-send');
    const textSendTextArea = document.getElementById("textSend");
    const itemTextSend = document.querySelector(".text-send__item");

    if (!textSendContainer) {
        console.error("Không tìm thấy phần tử '.text-send' trên giao diện.");
        return;
    }

    // Xóa nội dung cũ
    textSendContainer.innerHTML = "";

    // Mảng các giá trị cần loại bỏ
    const excludedValues = ["nhà đài", "david", "pepe", "royce", "eric", "xavi", "kroos"];

    // Lọc dữ liệu: Bỏ dòng tiêu đề, chỉ lấy hàng có cột thứ 6 không thuộc mảng excludedValues
    const filteredData = data.slice(1).filter(row => {
        const column6 = row[5]?.trim().toLowerCase(); // Cột thứ 6
        const condition1 = row[7] === "NIGHT"; // Điều kiện lọc cột 7
        return !excludedValues.includes(column6) && condition1;
    });

    // Hiển thị dữ liệu đã lọc
    filteredData.forEach((row) => {
        const title = row[1];
        const nameUser = row[5];
        const day = row[3]; // Cột ngày
        const hour = row[4]; // Cột giờ

        // Tạo phần tử item
        const textSendItem = document.createElement('div');
        textSendItem.classList.add('text-send__item');

        const textSendInfo = document.createElement('div');
        textSendInfo.classList.add('text-send__info');
        textSendInfo.innerHTML = `<span class="text-send__title">${nameUser} - ${day} - ${hour}</span>`;

        const copyButton = document.createElement('button');
        copyButton.classList.add('text-send__btn');
        copyButton.innerHTML = `<img src="./assets/images/copy.svg" alt="Copy" class="icon" />`;

        // Xử lý sự kiện sao chép
        copyButton.addEventListener('click', () => {
            // Lấy nội dung từ textSendTextArea và thay thế các biến
            let textToCopy = textSendTextArea.value.trim();

            // Thay thế các biến trong mẫu
            textToCopy = textToCopy
                .replace('${title}', title)
                .replace('${day}', day)
                .replace('${hour}', hour)
                .replace('${nameUser}', nameUser);

            // Sao chép nội dung vào clipboard
            if (textToCopy) {
                navigator.clipboard.writeText(textToCopy)
                    .then(() => {
                        // Thêm class 'copied' vào textSendItem khi sao chép thành công
                        textSendItem.classList.toggle("copied");
                    })
                    .catch((err) => console.error('Không thể sao chép nội dung:', err));
            } else {
                alert('Vui lòng nhập nội dung trước khi sao chép.');
            }
        });

        textSendItem.appendChild(textSendInfo);
        textSendItem.appendChild(copyButton);
        textSendContainer.appendChild(textSendItem);
    });

    // Lưu nội dung textArea vào localStorage
    if (textSendTextArea) {
        // Kiểm tra và hiển thị nội dung đã lưu từ localStorage khi trang tải lại
        const savedText = localStorage.getItem('textSend');
        if (savedText) {
            textSendTextArea.value = savedText;
        }

        // Lắng nghe sự kiện input để lưu giá trị vào localStorage
        textSendTextArea.addEventListener('input', () => {
            const text = textSendTextArea.value; // Lấy nội dung người dùng nhập
            localStorage.setItem('textSend', text); // Lưu vào localStorage
        });
    }
}

/**
 * =====================================
 *      EVENTS: Open Modal Report
 * =====================================
 * Mô tả:
 * - Các sự kiện mở Modal Report Output
 */
const openModalReport = document.querySelector("#openModal-report");
const reportModal = document.querySelector(".report-modal");
const btnReportClose = document.querySelector("#modalReportClose");


openModalReport.addEventListener('click', handleOpenModalReport);

// Xử lý bấm vào button hoặc vùng trống đóng modal Report:
btnReportClose.addEventListener('click', () => {
    reportModal.style.display = "none";
});
window.addEventListener('click', (e) => {
    if (e.target === reportModal) {
        reportModal.style.display = "none";
    }
})

// Hàm xử hiện modal Report:
function handleOpenModalReport() {
    reportModal.style.display = "flex";
}


/**
 * =====================================
 *      FUNCTION: takeScreenshot
 * =====================================
 * Mô tả:
 * - Hàm xử lý chụp màn hình bảng
 */
// Sử dụng hàm này khi người dùng muốn chụp ảnh
document.getElementById("screenshot-btn").addEventListener("click", expandTableForScreenshot);

// Hàm để mở rộng bảng và tắt thanh cuộn khi chuẩn bị chụp ảnh
function expandTableForScreenshot() {
    const table = document.querySelector('.dataTable');
    table.classList.add('expanded');  // Mở rộng bảng

    // Sử dụng requestAnimationFrame để đảm bảo CSS được áp dụng trước khi chụp màn hình
    requestAnimationFrame(() => {
        // Đảm bảo rằng bảng đã mở rộng và có đủ nội dung
        setTimeout(() => {
            // Sau khi CSS đã được áp dụng, thực hiện chụp ảnh
            takeScreenshot();
        }, 500); // Chờ một chút để CSS được áp dụng
    });
}
// Hàm chụp ảnh
function takeScreenshot() {
    const dataContainer = document.getElementById('data-container');  // Đảm bảo đúng id của phần tử bảng

    html2canvas(dataContainer, { scale: 3 }).then(canvas => {
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

/**
 * =====================================
 *  XỬ LÝ NÚT CHUYỂN TAB LỌC THEO NGÀY
 * =====================================
 * Mô tả:
 * - Hàm xử lý chụp màn hình bảng
 */
const tabListFilter = document.querySelectorAll(".tab-page__item");

tabListFilter.forEach(item => {
    item.addEventListener('click', () => {
        // Xóa class "tab-page__item--active" khỏi tất cả các item
        tabListFilter.forEach(tab => tab.classList.remove("tab-page__item--active"));

        // Thêm class "tab-page__item--active" vào item được nhấp
        item.classList.add("tab-page__item--active");
    });
});

/**
 * =====================================
 *  XỬ LÝ NÚT BACK XOÁ CÁC CARD ĐÃ COPY
 * =====================================
 * Mô tả:
 * - Hàm xử lý xoá các Card highlight khi nhấn vào Copy
 */
document.querySelector(".back-copy").addEventListener('click', deleteHighlightCopy);
function deleteHighlightCopy() {
    const listHighlightCopy = document.querySelectorAll(".text-report__item");

    [...listHighlightCopy].forEach(card => {
        if (card.classList.contains('copied')) {
            card.classList.remove("copied");
        }
    })

    removeFromLocalStorage('copiedItems');
}

/**
 * =====================================
 *         XỬ LÝ LẤY TEXT REPORT
 * =====================================
 * Mô tả:
 * - ...
 */
async function fetchSpecificCellData(apiKey, sheetId, specificCell) {
    try {
        // Kiểm tra đầu vào
        if (!apiKey || !sheetId || !specificCell) {
            throw new Error("Thông tin API Key, Sheet ID hoặc phạm vi không hợp lệ.");
        }

        // Tạo URL API
        const url = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${specificCell}?key=${apiKey}`;

        // Gửi yêu cầu đến Google Sheets API
        const response = await fetch(url);

        // Kiểm tra nếu response không thành công
        if (!response.ok) {
            throw new Error(`Lỗi từ API: ${response.status} ${response.statusText}`);
        }

        // Parse JSON
        const data = await response.json();

        // Kiểm tra nếu không có dữ liệu
        if (!data.values || data.values.length === 0) {
            console.warn("Không có dữ liệu trong phạm vi được chỉ định.");
            return null; // Không có dữ liệu
        }

        return data.values; // Trả về dữ liệu
    } catch (error) {
        console.error("Lỗi khi lấy dữ liệu từ Google Sheets:", error);
        alert(`Lỗi: ${error.message}`);
        return null;
    }
}

document.getElementById("fetchCellData").addEventListener("click", async function () {
    const apiKey = getFromLocalStorage("apiKeyValue");
    const sheetId = getFromLocalStorage("sheetIdValue");
    const specificCell = document.getElementById("specificCell").value;
    const textReport = document.getElementById('outputCellData');

    if (!specificCell) {
        alert("Vui lòng nhập phạm vi cụ thể (VD: Sheet1!A1).");
        return;
    }

    const cellData = await fetchSpecificCellData(apiKey, sheetId, specificCell);

    if (cellData && cellData[0] && cellData[0][0]) {
        // Xử lý xuống dòng
        const formattedText = cellData[0][0].replace(/\n/g, "<br>");

        // Hiển thị dữ liệu lên trang web
        textReport.innerHTML = formattedText;
    } else {
        textReport.textContent = "Không có dữ liệu.";
    }
});

document.querySelector(".report__output--copy").addEventListener("click", function () {
    const outputElement = document.getElementById("outputCellData");
    const notification = document.querySelector(".report__noti");

    // Kiểm tra nếu có nội dung
    if (outputElement && outputElement.innerHTML.trim() !== "") {
        // Chuyển đổi các thẻ <br> thành ký tự xuống dòng \n và loại bỏ tất cả các thẻ HTML khác
        let textToCopy = outputElement.innerHTML
            .replace(/<br\s*\/?>/gi, '\n')  // Chuyển <br> thành xuống dòng
            .replace(/<[^>]+>/g, '')       // Loại bỏ tất cả các thẻ HTML
            .replace(/&gt;/g, '>')         // Giải mã các ký tự đặc biệt
            .replace(/&lt;/g, '<')
            .replace(/&amp;/g, '&')
            .replace(/&quot;/g, '"')
            .replace(/&#039;/g, "'");

        // Sử dụng Clipboard API để copy nội dung
        navigator.clipboard.writeText(textToCopy)
            .then(() => {
                // Hiển thị thông báo "Đã Copy"
                notification.classList.add("show");

                // Ẩn thông báo sau 2 giây
                setTimeout(() => {
                    notification.classList.remove("show");
                }, 2000);
            })
            .catch(err => {
                console.error("Lỗi khi copy nội dung:", err);
            });
    } else {
        alert("Không có nội dung để copy.");
    }
});