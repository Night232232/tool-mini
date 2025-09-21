// Hàm lưu dữ liệu vào localStorage
export function saveToLocalStorage(key, data) {
    // Kiểm tra nếu dữ liệu hợp lệ
    if (data && data !== undefined) {
        try {
            localStorage.setItem(key, JSON.stringify(data));
        } catch (e) {
            console.error("Lỗi khi lưu dữ liệu vào localStorage", e);
        }
    } else {
        // Nếu dữ liệu không hợp lệ, xóa khóa khỏi localStorage
        localStorage.removeItem(key);
    }
}

// Hàm lấy dữ liệu từ localStorage
export function getFromLocalStorage(key) {
    const data = localStorage.getItem(key);
    if (data) {
        try {
            return JSON.parse(data); // Thử parse dữ liệu
        } catch (error) {
            console.error('Dữ liệu trong localStorage không hợp lệ:', error);
            return []; // Trả về mảng rỗng nếu parse lỗi
        }
    }
    return []; // Trả về mảng rỗng nếu không có dữ liệu
}

// Hàm xóa dữ liệu khỏi localStorage
export function removeFromLocalStorage(key) {
    localStorage.removeItem(key);
}

// Hàm xóa tất cả dữ liệu trong localStorage
export function clearLocalStorage() {
    localStorage.clear();
}

// Hàm tạo ra modal xác nhận hoặc huỷ yêu cầu:
export function createConfirmModal(title, message, onConfirm, onCancel) {
    const modal = document.createElement("div");
    modal.classList = "modal__box"

    const modalContent = `
    <div class="modal__content">
                <div class="modal__row">
                    <img src="./assets/images/modal-delete.svg" alt="" class="modal__icon" />
                    <button class="modal__close">
                    <img src="./assets/images/cross.svg" alt="" class="icon">
                    </button>
                </div>
                <h3 class="modal__title">${title}</h3>
                <p class="modal__desc">${message}</p>
                <div class="modal__row">
                    <button class="btn btn--outline modal__btn-cancel">Cancel</button>
                    <button class="btn btn--danger modal__btn-delete">Delete</button>
                </div>
            </div>
    `;

    modal.innerHTML = modalContent;

    document.body.appendChild(modal);

    const btnDelete = document.querySelector(".modal__btn-delete")
    const btnCancel = document.querySelector(".modal__btn-cancel")
    const btnClose = document.querySelector(".modal__close")

    btnDelete.addEventListener('click', () => {
        onConfirm();
        document.body.removeChild(modal)
    })

    btnCancel.addEventListener('click', () => {
        onCancel();
        document.body.removeChild(modal)
    })

    btnClose.addEventListener('click', () => {
        document.body.removeChild(modal)
    })

    window.addEventListener('click', (e) => {
        if (e.target === modal) {
            document.body.removeChild(modal)
        }
    })
}

// Hàm tạo ra modal xác nhận hoặc huỷ yêu cầu:
export function createInputSheetModal(title, htmlContent, onConfirm) {
    // Kiểm tra nếu modal đang tồn tại để tránh trùng lặp
    if (document.querySelector(".modal__box")) return;

    const modal = document.createElement("div");
    modal.classList = "modal__box"

    const modalContent = `
    <div class="modal__content">
                <button class="modal__close">
                    <img src="./assets/images/cross.svg" alt="" class="icon">
                </button>
                <h3 class="modal__title">${title}</h3>
                ${htmlContent}
                <div class="modal__row">
                    <button class="btn btn--primary modal__btn-fetch">Fetch</button>
                </div>
            </div>
    `;

    modal.innerHTML = modalContent;
    document.body.appendChild(modal);

    const btnFetch = document.querySelector(".modal__btn-fetch")
    const btnClose = document.querySelector(".modal__close")

    btnFetch.addEventListener('click', () => {
        onConfirm();
        document.body.removeChild(modal)
    })

    btnClose.addEventListener('click', () => {
        document.body.removeChild(modal)
    })

    window.addEventListener('click', (e) => {
        if (e.target === modal) {
            document.body.removeChild(modal)
        }
    })

    // Ngăn tạo thêm modal khi nhấn Enter
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            if (document.body.contains(modal)) {
                return; // Ngăn tạo thêm modal nếu modal hiện tại đang mở
            }
        }
    });
}