document.addEventListener("DOMContentLoaded", function () {
    // Khai báo biến:
    const menuToggle = document.querySelector(".menu-toggle")
    const sidebar = document.querySelector(".sidebar")
    const htmlElement = document.documentElement;
    const toggleDarkMode = document.querySelector('.theme-checkbox__label');
    const dropdownBtn = document.querySelector(".dropdown__icon")
    const dropdownList = document.querySelector(".dropdown__list")

    // Event cho nút menu
    if (menuToggle && sidebar) {
        menuToggle.addEventListener("click", () => {
            sidebar.classList.toggle("hidden");
        });
    }

    // Event cho nút toggle dark mode
    if (toggleDarkMode) {
        toggleDarkMode.addEventListener("change", () => {
            htmlElement.classList.toggle("dark", toggleDarkMode.checked);
        });
    }

    // Kiểm tra nếu `dropdownList` tồn tại
    if (dropdownList) {
        // Event khi click vào nút dropdown
        dropdownBtn.addEventListener("click", () => {
            dropdownList.classList.toggle("show");
        });

        // Event khi click bên ngoài dropdown để đóng nó
        document.addEventListener("click", (e) => {
            // Kiểm tra nếu click không nằm trong `dropdownList` hoặc `dropdownBtn`
            if (!dropdownList.contains(e.target) && !dropdownBtn.contains(e.target)) {
                dropdownList.classList.remove("show"); // Đóng dropdown
            }
        });
    }

})