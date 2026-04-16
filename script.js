// ---------- DATA MODEL ----------
let appData = {
    budgetItems: [],
    nonMonthly: [],
    netWorthItems: [],
    properties: [],
    vehicles: [],
    contacts: [],
    reminders: [],
    notes: [],
};

// Helper: Format as GBP with commas
function formatGBP(amount) {
    return "£" + amount.toLocaleString("en-GB", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function saveToLocal() {
    localStorage.setItem("lifestack_data", JSON.stringify(appData));
}
function loadFromLocal() {
    const d = localStorage.getItem("lifestack_data");
    if (d) {
        appData = JSON.parse(d);
        migrateOld();
        renderAll();
    } else {
        initSample();
    }
}
function migrateOld() {
    if (!appData.budgetItems) appData.budgetItems = [];
    if (!appData.nonMonthly) appData.nonMonthly = [];
    if (!appData.netWorthItems) appData.netWorthItems = [];
    if (!appData.properties) appData.properties = [];
    if (!appData.vehicles) appData.vehicles = [];
    if (!appData.contacts) appData.contacts = [];
    if (!appData.reminders) appData.reminders = [];
    if (!appData.notes) appData.notes = [];
}
function initSample() {
    appData.budgetItems = [
        { id: "b1", desc: "Salary", category: "Salary", amount: 4500, type: "income" },
        { id: "b2", desc: "Rent", category: "Housing", amount: 1400, type: "expense" },
        { id: "b3", desc: "Groceries", category: "Food", amount: 400, type: "expense" },
    ];
    appData.nonMonthly = [{ id: "nm1", desc: "Car Insurance", amount: 600 }];
    appData.netWorthItems = [
        { id: "nw1", desc: "House", category: "Property", amount: 350000, type: "asset" },
        { id: "nw2", desc: "Mortgage", category: "Loan", amount: 200000, type: "liability" },
        { id: "nw3", desc: "Savings Account", category: "Cash", amount: 25000, type: "asset" },
    ];
    appData.properties = [
        {
            id: "p1",
            purchaseDate: "2020-01-01",
            purchaseValue: 300000,
            mortgageBalance: 180000,
            mortgageMonthlyCost: 1200,
            mortgageInterestRate: 3.5,
        },
    ];
    appData.vehicles = [
        {
            id: "v1",
            registration: "ABC123",
            make: "Toyota",
            model: "Camry",
            year: 2019,
            purchaseDate: "2019-05-01",
            purchasePrice: 22000,
            soldDate: "",
        },
    ];
    appData.contacts = [
        {
            id: "c1",
            name: "Jane Doe",
            dob: "1990-07-15",
            addressList: [{ nick: "Home", val: "123 Main St" }],
            phoneList: [{ nick: "Mobile", val: "555-1234" }],
            emailList: [{ nick: "Work", val: "jane@mail.com" }],
            anniversary: "2015-06-10",
            dateOfDeath: "",
            bloodType: "O+",
            nationalInsurance: "AB123456C",
            bankDetails: [{ nick: "Savings", sort: "12-34-56", acc: "98765432", ref: "REF1" }],
        },
    ];
    appData.reminders = [{ id: "r1", desc: "Tax Filing", date: "2026-06-15", recurring: "Annually" }];
    appData.notes = [{ id: "n1", title: "Welcome", note: "Store anything important!" }];
    saveToLocal();
}

// Modal system
let activeModal = null;
function closeModal() {
    if (activeModal) {
        activeModal.remove();
        activeModal = null;
    }
}
function showModal(title, fieldsHtml, onSubmit) {
    closeModal();
    const modalDiv = document.createElement("div");
    modalDiv.className = "modal";
    modalDiv.innerHTML = `<div class="modal-content"><h3 class="mb-2">${title}</h3><div id="modalFields">${fieldsHtml}</div><div class="flex-between mt-3"><button id="modalCancelBtn" class="btn">Cancel</button><button id="modalSubmitBtn" class="primary">Save</button></div></div>`;
    document.body.appendChild(modalDiv);
    activeModal = modalDiv;
    modalDiv.querySelector("#modalCancelBtn").onclick = closeModal;
    modalDiv.querySelector("#modalSubmitBtn").onclick = () => {
        const formData = {};
        document
            .querySelectorAll("#modalFields input, #modalFields select, #modalFields textarea")
            .forEach((field) => {
                if (field.id) formData[field.id] = field.value;
            });
        onSubmit(formData);
        closeModal();
    };
}

// Navigation functions
function switchSection(sectionId) {
    document.querySelectorAll(".section").forEach((s) => s.classList.remove("active-section"));
    document.getElementById(sectionId).classList.add("active-section");

    document.querySelectorAll(".sidebar-nav-btn").forEach((btn) => {
        if (btn.dataset.section === sectionId) btn.classList.add("active");
        else btn.classList.remove("active");
    });

    document.querySelectorAll(".bottom-nav-btn").forEach((btn) => {
        if (btn.dataset.bottom === sectionId) btn.classList.add("active");
        else if (btn.id !== "moreMenuBtn") btn.classList.remove("active");
    });

    if (window.innerWidth <= 768) {
        document.getElementById("sidebar").classList.remove("mobile-open");
    }
    closeMoreMenu();
}

function closeMoreMenu() {
    document.getElementById("moreMenu").classList.remove("show");
    document.getElementById("moreOverlay").classList.remove("show");
}

function openMoreMenu() {
    document.getElementById("moreMenu").classList.add("show");
    document.getElementById("moreOverlay").classList.add("show");
}

// Render all sections
function renderAll() {
    renderDashboard();
    renderBudget();
    renderNonMonthly();
    renderNetWorth();
    renderProperties();
    renderVehicles();
    renderContacts();
    renderReminders();
    renderNotes();
    saveToLocal();
}

function renderDashboard() {
    const totalIncome = appData.budgetItems
        .filter((i) => i.type === "income")
        .reduce((s, i) => s + i.amount, 0);
    const totalExpense = appData.budgetItems
        .filter((i) => i.type === "expense")
        .reduce((s, i) => s + i.amount, 0);
    const monthlyBal = totalIncome - totalExpense;
    document.getElementById("dashBalance").innerHTML = formatGBP(monthlyBal);
    const totalAssets = appData.netWorthItems
        .filter((i) => i.type === "asset")
        .reduce((s, i) => s + i.amount, 0);
    const totalLiab = appData.netWorthItems
        .filter((i) => i.type === "liability")
        .reduce((s, i) => s + i.amount, 0);
    const netWorth = totalAssets - totalLiab;
    document.getElementById("dashNetWorth").innerHTML = formatGBP(netWorth);
    const today = new Date();
    const threeMonths = new Date();
    threeMonths.setMonth(today.getMonth() + 3);
    const upcoming = appData.reminders
        .filter((r) => {
            const d = new Date(r.date);
            return d >= today && d <= threeMonths;
        })
        .slice(0, 5);
    const birthdays = appData.contacts
        .filter((c) => c.dob)
        .map((c) => ({ desc: `${c.name}'s Birthday`, date: c.dob }));
    const anniversaries = appData.contacts
        .filter((c) => c.anniversary)
        .map((c) => ({ desc: `${c.name}'s Anniversary`, date: c.anniversary }));
    const allDates = [
        ...upcoming.map((r) => ({ desc: r.desc, date: r.date })),
        ...birthdays,
        ...anniversaries,
    ];
    const filteredDates = allDates
        .filter((dd) => {
            const d2 = new Date(dd.date);
            return d2 >= today && d2 <= threeMonths;
        })
        .slice(0, 6);
    const dashDiv = document.getElementById("dashRemindersList");
    dashDiv.innerHTML =
        filteredDates
            .map(
                (d) =>
                    `<div class="reminder-item">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" transform="rotate(0 0 0)">
<path d="M8.75 2.75C8.75 2.33579 8.41421 2 8 2C7.58579 2 7.25 2.33579 7.25 2.75V3.75H5.5C4.25736 3.75 3.25 4.75736 3.25 6V8.25H20.75V6C20.75 4.75736 19.7426 3.75 18.5 3.75H16.75V2.75C16.75 2.33579 16.4142 2 16 2C15.5858 2 15.25 2.33579 15.25 2.75V3.75H8.75V2.75Z" fill="currentColor"/>
<path d="M3.25 19V9.75H20.75V19C20.75 20.2426 19.7426 21.25 18.5 21.25H5.5C4.25736 21.25 3.25 20.2426 3.25 19ZM7.98438 11.95C7.54255 11.95 7.18438 12.3082 7.18438 12.75C7.18438 13.1918 7.54255 13.55 7.98438 13.55H7.99438C8.4362 13.55 8.79437 13.1918 8.79437 12.75C8.79437 12.3082 8.4362 11.95 7.99438 11.95H7.98438ZM11.9941 11.95C11.5523 11.95 11.1941 12.3082 11.1941 12.75C11.1941 13.1918 11.5523 13.55 11.9941 13.55H12.0041C12.446 13.55 12.8041 13.1918 12.8041 12.75C12.8041 12.3082 12.446 11.95 12.0041 11.95H11.9941ZM16.0039 11.95C15.5621 11.95 15.2039 12.3082 15.2039 12.75C15.2039 13.1918 15.5621 13.55 16.0039 13.55H16.0139C16.4557 13.55 16.8139 13.1918 16.8139 12.75C16.8139 12.3082 16.4557 11.95 16.0139 11.95H16.0039ZM7.98438 15.95C7.54255 15.95 7.18438 16.3082 7.18438 16.75C7.18438 17.1918 7.54255 17.55 7.98438 17.55H7.99438C8.4362 17.55 8.79437 17.1918 8.79437 16.75C8.79437 16.3082 8.4362 15.95 7.99438 15.95H7.98438ZM11.9941 15.95C11.5523 15.95 11.1941 16.3082 11.1941 16.75C11.1941 17.1918 11.5523 17.55 11.9941 17.55H12.0041C12.446 17.55 12.8041 17.1918 12.8041 16.75C12.8041 16.3082 12.446 15.95 12.0041 15.95H11.9941ZM16.0039 15.95C15.5621 15.95 15.2039 16.3082 15.2039 16.75C15.2039 17.1918 15.5621 17.55 16.0039 17.55H16.0139C16.4557 17.55 16.8139 17.1918 16.8139 16.75C16.8139 16.3082 16.4557 15.95 16.0139 15.95H16.0039Z" fill="currentColor"/>
</svg>

                        ${d.desc} - ${new Date(d.date).toLocaleDateString(
                        "en-GB"
                    )}</div>`
            )
            .join("") || "<div>No upcoming dates</div>";
}

// Budget with segregation
function renderBudget() {
    const incomes = appData.budgetItems.filter((i) => i.type === "income");
    const expenses = appData.budgetItems.filter((i) => i.type === "expense");
    const totalInc = incomes.reduce((s, i) => s + i.amount, 0);
    const totalExp = expenses.reduce((s, i) => s + i.amount, 0);
    const balance = totalInc - totalExp;
    document.getElementById(
        "budgetSummary"
    ).innerHTML = `<div class="summary-stat"><label>Total Income</label><div class="value">${formatGBP(
        totalInc
    )}</div></div>
<div class="summary-stat"><label>Total Expenses</label><div class="value">${formatGBP(totalExp)}</div></div>
<div class="summary-stat"><label>Monthly Balance</label><div class="value">${formatGBP(balance)}</div></div>`;

    // Income cards
    document.getElementById("budgetIncomeList").innerHTML =
        incomes
            .map(
                (item) => `
<div class="card-item">
    <div class="flex-between"><strong>${escapeHtml(
        item.desc
    )}</strong><span class="badge" style="background: var(--success);">Income</span></div>
    <div>${escapeHtml(item.category)}</div>
    <div class="flex-between mt-3"><span style="font-weight:600;">${formatGBP(
        item.amount
    )}</span><div class="button-container"><button class="editBudget" data-id="${item.id}">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" transform="rotate(0 0 0)">
<path d="M13.803 6.09787L5.83373 14.0672C5.57259 14.3283 5.37974 14.6497 5.27221 15.003L4.05204 19.0121C3.9714 19.2771 4.04336 19.565 4.23922 19.7608C4.43508 19.9567 4.72294 20.0287 4.98792 19.948L8.99703 18.7279C9.35035 18.6203 9.67176 18.4275 9.93291 18.1663L17.9022 10.1971L13.803 6.09787Z" fill="currentColor"/>
<path d="M18.9628 9.13643L20.22 7.87928C21.0986 7.0006 21.0986 5.57598 20.22 4.6973L19.3028 3.7801C18.4241 2.90142 16.9995 2.90142 16.1208 3.7801L14.8637 5.03721L18.9628 9.13643Z" fill="currentColor"/>
</svg>

                </button> <button class="deleteBudget gutter-left" data-id="${
                    item.id
                }"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" transform="rotate(0 0 0)">
<path d="M7.99902 4.25C7.99902 3.00736 9.00638 2 10.249 2H13.749C14.9917 2 15.999 3.00736 15.999 4.25V5H18.498C19.7407 5 20.748 6.00736 20.748 7.25C20.748 8.28958 20.043 9.16449 19.085 9.42267C18.8979 9.4731 18.7011 9.5 18.498 9.5H5.5C5.29694 9.5 5.10016 9.4731 4.91303 9.42267C3.95503 9.16449 3.25 8.28958 3.25 7.25C3.25 6.00736 4.25736 5 5.5 5H7.99902V4.25ZM14.499 5V4.25C14.499 3.83579 14.1632 3.5 13.749 3.5H10.249C9.83481 3.5 9.49902 3.83579 9.49902 4.25V5H14.499Z" fill="currentColor"/>
<path d="M4.97514 10.4578L5.54076 19.8848C5.61205 21.0729 6.59642 22 7.78672 22H16.2113C17.4016 22 18.386 21.0729 18.4573 19.8848L19.0229 10.4578C18.8521 10.4856 18.6767 10.5 18.498 10.5H5.5C5.32131 10.5 5.146 10.4856 4.97514 10.4578ZM10.774 13.4339L10.9982 17.9905C11.0185 18.4042 10.6996 18.7561 10.2859 18.7764C9.8722 18.7968 9.52032 18.4779 9.49997 18.0642L9.27581 13.5076C9.25546 13.0938 9.57434 12.742 9.98805 12.7216C10.4018 12.7013 10.7536 13.0201 10.774 13.4339ZM14.0101 12.7216C14.4238 12.742 14.7427 13.0938 14.7223 13.5076L14.4982 18.0642C14.4778 18.4779 14.1259 18.7968 13.7122 18.7764C13.2985 18.7561 12.9796 18.4042 13 17.9905L13.2241 13.4339C13.2445 13.0201 13.5964 12.7013 14.0101 12.7216Z" fill="currentColor"/>
</svg></button></div></div>
</div>`
            )
            .join("") ||
        "<div style='padding:20px; text-align:center; color:var(--text-secondary);'>No income items</div>";

    // Expense cards
    document.getElementById("budgetExpenseList").innerHTML =
        expenses
            .map(
                (item) => `
<div class="card-item">
    <div class="flex-between"><strong>${escapeHtml(
        item.desc
    )}</strong><span class="badge" style="background: var(--danger);">Expense</span></div>
    <div>${escapeHtml(item.category)}</div>
    <div class="flex-between mt-3"><span style="font-weight:600;">${formatGBP(
        item.amount
    )}</span><div class="button-container"><button class="editBudget" data-id="${item.id}">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" transform="rotate(0 0 0)">
<path d="M13.803 6.09787L5.83373 14.0672C5.57259 14.3283 5.37974 14.6497 5.27221 15.003L4.05204 19.0121C3.9714 19.2771 4.04336 19.565 4.23922 19.7608C4.43508 19.9567 4.72294 20.0287 4.98792 19.948L8.99703 18.7279C9.35035 18.6203 9.67176 18.4275 9.93291 18.1663L17.9022 10.1971L13.803 6.09787Z" fill="currentColor"/>
<path d="M18.9628 9.13643L20.22 7.87928C21.0986 7.0006 21.0986 5.57598 20.22 4.6973L19.3028 3.7801C18.4241 2.90142 16.9995 2.90142 16.1208 3.7801L14.8637 5.03721L18.9628 9.13643Z" fill="currentColor"/>
</svg>
                </button> <button class="deleteBudget gutter-left" data-id="${
                    item.id
                }"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" transform="rotate(0 0 0)">
<path d="M7.99902 4.25C7.99902 3.00736 9.00638 2 10.249 2H13.749C14.9917 2 15.999 3.00736 15.999 4.25V5H18.498C19.7407 5 20.748 6.00736 20.748 7.25C20.748 8.28958 20.043 9.16449 19.085 9.42267C18.8979 9.4731 18.7011 9.5 18.498 9.5H5.5C5.29694 9.5 5.10016 9.4731 4.91303 9.42267C3.95503 9.16449 3.25 8.28958 3.25 7.25C3.25 6.00736 4.25736 5 5.5 5H7.99902V4.25ZM14.499 5V4.25C14.499 3.83579 14.1632 3.5 13.749 3.5H10.249C9.83481 3.5 9.49902 3.83579 9.49902 4.25V5H14.499Z" fill="currentColor"/>
<path d="M4.97514 10.4578L5.54076 19.8848C5.61205 21.0729 6.59642 22 7.78672 22H16.2113C17.4016 22 18.386 21.0729 18.4573 19.8848L19.0229 10.4578C18.8521 10.4856 18.6767 10.5 18.498 10.5H5.5C5.32131 10.5 5.146 10.4856 4.97514 10.4578ZM10.774 13.4339L10.9982 17.9905C11.0185 18.4042 10.6996 18.7561 10.2859 18.7764C9.8722 18.7968 9.52032 18.4779 9.49997 18.0642L9.27581 13.5076C9.25546 13.0938 9.57434 12.742 9.98805 12.7216C10.4018 12.7013 10.7536 13.0201 10.774 13.4339ZM14.0101 12.7216C14.4238 12.742 14.7427 13.0938 14.7223 13.5076L14.4982 18.0642C14.4778 18.4779 14.1259 18.7968 13.7122 18.7764C13.2985 18.7561 12.9796 18.4042 13 17.9905L13.2241 13.4339C13.2445 13.0201 13.5964 12.7013 14.0101 12.7216Z" fill="currentColor"/>
</button></div></div>
</div>`
            )
            .join("") ||
        "<div style='padding:20px; text-align:center; color:var(--text-secondary);'>No expense items</div>";

    attachEditDelete("editBudget", "deleteBudget", appData.budgetItems, openBudgetModal);
}

// Net Worth with segregation
function renderNetWorth() {
    const assets = appData.netWorthItems.filter((i) => i.type === "asset");
    const liabilities = appData.netWorthItems.filter((i) => i.type === "liability");
    const totalAssets = assets.reduce((s, i) => s + i.amount, 0);
    const totalLiab = liabilities.reduce((s, i) => s + i.amount, 0);
    const net = totalAssets - totalLiab;
    document.getElementById(
        "networthSummary"
    ).innerHTML = `<div class="summary-stat"><label>Assets</label><div class="value">${formatGBP(
        totalAssets
    )}</div></div>
<div class="summary-stat"><label>Liabilities</label><div class="value">${formatGBP(totalLiab)}</div></div>
<div class="summary-stat"><label>Net Worth</label><div class="value">${formatGBP(net)}</div></div>`;

    document.getElementById("assetList").innerHTML =
        assets
            .map(
                (item) => `
<div class="card-item">
    <div class="flex-between"><strong>${escapeHtml(
        item.desc
    )}</strong><span class="badge" style="background: var(--success);">Asset</span></div>
    <div>${escapeHtml(item.category)}</div>
    <div class="flex-between mt-3"><span style="font-weight:600;">${formatGBP(
        item.amount
    )}</span><div class="button-container"><button class="editNW" data-id="${item.id}">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" transform="rotate(0 0 0)">
<path d="M13.803 6.09787L5.83373 14.0672C5.57259 14.3283 5.37974 14.6497 5.27221 15.003L4.05204 19.0121C3.9714 19.2771 4.04336 19.565 4.23922 19.7608C4.43508 19.9567 4.72294 20.0287 4.98792 19.948L8.99703 18.7279C9.35035 18.6203 9.67176 18.4275 9.93291 18.1663L17.9022 10.1971L13.803 6.09787Z" fill="currentColor"/>
<path d="M18.9628 9.13643L20.22 7.87928C21.0986 7.0006 21.0986 5.57598 20.22 4.6973L19.3028 3.7801C18.4241 2.90142 16.9995 2.90142 16.1208 3.7801L14.8637 5.03721L18.9628 9.13643Z" fill="currentColor"/>
</svg>
                </button> <button class="deleteNW gutter-left" data-id="${
                    item.id
                }"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" transform="rotate(0 0 0)">
<path d="M7.99902 4.25C7.99902 3.00736 9.00638 2 10.249 2H13.749C14.9917 2 15.999 3.00736 15.999 4.25V5H18.498C19.7407 5 20.748 6.00736 20.748 7.25C20.748 8.28958 20.043 9.16449 19.085 9.42267C18.8979 9.4731 18.7011 9.5 18.498 9.5H5.5C5.29694 9.5 5.10016 9.4731 4.91303 9.42267C3.95503 9.16449 3.25 8.28958 3.25 7.25C3.25 6.00736 4.25736 5 5.5 5H7.99902V4.25ZM14.499 5V4.25C14.499 3.83579 14.1632 3.5 13.749 3.5H10.249C9.83481 3.5 9.49902 3.83579 9.49902 4.25V5H14.499Z" fill="currentColor"/>
<path d="M4.97514 10.4578L5.54076 19.8848C5.61205 21.0729 6.59642 22 7.78672 22H16.2113C17.4016 22 18.386 21.0729 18.4573 19.8848L19.0229 10.4578C18.8521 10.4856 18.6767 10.5 18.498 10.5H5.5C5.32131 10.5 5.146 10.4856 4.97514 10.4578ZM10.774 13.4339L10.9982 17.9905C11.0185 18.4042 10.6996 18.7561 10.2859 18.7764C9.8722 18.7968 9.52032 18.4779 9.49997 18.0642L9.27581 13.5076C9.25546 13.0938 9.57434 12.742 9.98805 12.7216C10.4018 12.7013 10.7536 13.0201 10.774 13.4339ZM14.0101 12.7216C14.4238 12.742 14.7427 13.0938 14.7223 13.5076L14.4982 18.0642C14.4778 18.4779 14.1259 18.7968 13.7122 18.7764C13.2985 18.7561 12.9796 18.4042 13 17.9905L13.2241 13.4339C13.2445 13.0201 13.5964 12.7013 14.0101 12.7216Z" fill="currentColor"/>
</svg></button></div></div>
</div>`
            )
            .join("") ||
        "<div style='padding:20px; text-align:center; color:var(--text-secondary);'>No assets</div>";

    document.getElementById("liabilityList").innerHTML =
        liabilities
            .map(
                (item) => `
<div class="card-item">
    <div class="flex-between"><strong>${escapeHtml(
        item.desc
    )}</strong><span class="badge" style="background: var(--danger);">Liability</span></div>
    <div>${escapeHtml(item.category)}</div>
    <div class="flex-between mt-3"><span style="font-weight:600;">${formatGBP(
        item.amount
    )}</span><div class="button-container"><button class="editNW" data-id="${item.id}">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" transform="rotate(0 0 0)">
<path d="M13.803 6.09787L5.83373 14.0672C5.57259 14.3283 5.37974 14.6497 5.27221 15.003L4.05204 19.0121C3.9714 19.2771 4.04336 19.565 4.23922 19.7608C4.43508 19.9567 4.72294 20.0287 4.98792 19.948L8.99703 18.7279C9.35035 18.6203 9.67176 18.4275 9.93291 18.1663L17.9022 10.1971L13.803 6.09787Z" fill="currentColor"/>
<path d="M18.9628 9.13643L20.22 7.87928C21.0986 7.0006 21.0986 5.57598 20.22 4.6973L19.3028 3.7801C18.4241 2.90142 16.9995 2.90142 16.1208 3.7801L14.8637 5.03721L18.9628 9.13643Z" fill="currentColor"/>
</svg>
                </button> <button class="deleteNW gutter-leftr" data-id="${
                    item.id
                }"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" transform="rotate(0 0 0)">
<path d="M7.99902 4.25C7.99902 3.00736 9.00638 2 10.249 2H13.749C14.9917 2 15.999 3.00736 15.999 4.25V5H18.498C19.7407 5 20.748 6.00736 20.748 7.25C20.748 8.28958 20.043 9.16449 19.085 9.42267C18.8979 9.4731 18.7011 9.5 18.498 9.5H5.5C5.29694 9.5 5.10016 9.4731 4.91303 9.42267C3.95503 9.16449 3.25 8.28958 3.25 7.25C3.25 6.00736 4.25736 5 5.5 5H7.99902V4.25ZM14.499 5V4.25C14.499 3.83579 14.1632 3.5 13.749 3.5H10.249C9.83481 3.5 9.49902 3.83579 9.49902 4.25V5H14.499Z" fill="currentColor"/>
<path d="M4.97514 10.4578L5.54076 19.8848C5.61205 21.0729 6.59642 22 7.78672 22H16.2113C17.4016 22 18.386 21.0729 18.4573 19.8848L19.0229 10.4578C18.8521 10.4856 18.6767 10.5 18.498 10.5H5.5C5.32131 10.5 5.146 10.4856 4.97514 10.4578ZM10.774 13.4339L10.9982 17.9905C11.0185 18.4042 10.6996 18.7561 10.2859 18.7764C9.8722 18.7968 9.52032 18.4779 9.49997 18.0642L9.27581 13.5076C9.25546 13.0938 9.57434 12.742 9.98805 12.7216C10.4018 12.7013 10.7536 13.0201 10.774 13.4339ZM14.0101 12.7216C14.4238 12.742 14.7427 13.0938 14.7223 13.5076L14.4982 18.0642C14.4778 18.4779 14.1259 18.7968 13.7122 18.7764C13.2985 18.7561 12.9796 18.4042 13 17.9905L13.2241 13.4339C13.2445 13.0201 13.5964 12.7013 14.0101 12.7216Z" fill="currentColor"/>
</svg></button></div></div>
</div>`
            )
            .join("") ||
        "<div style='padding:20px; text-align:center; color:var(--text-secondary);'>No liabilities</div>";

    attachEditDelete("editNW", "deleteNW", appData.netWorthItems, openNetWorthModal);
}

function renderNonMonthly() {
    const total = appData.nonMonthly.reduce((s, i) => s + i.amount, 0);
    document.getElementById("nonmonthlyTotal").innerHTML = formatGBP(total);
    document.getElementById("nonmonthlyList").innerHTML = appData.nonMonthly
        .map(
            (i) => `
<div class="card-item">
    <strong>${escapeHtml(i.desc)}</strong>
    <div class="flex-between mt-2"><span style="font-weight:600;">${formatGBP(
        i.amount
    )}</span><div class="button-container"><button class="editNM" data-id="${i.id}">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" transform="rotate(0 0 0)">
<path d="M13.803 6.09787L5.83373 14.0672C5.57259 14.3283 5.37974 14.6497 5.27221 15.003L4.05204 19.0121C3.9714 19.2771 4.04336 19.565 4.23922 19.7608C4.43508 19.9567 4.72294 20.0287 4.98792 19.948L8.99703 18.7279C9.35035 18.6203 9.67176 18.4275 9.93291 18.1663L17.9022 10.1971L13.803 6.09787Z" fill="currentColor"/>
<path d="M18.9628 9.13643L20.22 7.87928C21.0986 7.0006 21.0986 5.57598 20.22 4.6973L19.3028 3.7801C18.4241 2.90142 16.9995 2.90142 16.1208 3.7801L14.8637 5.03721L18.9628 9.13643Z" fill="currentColor"/>
</svg>
        </button> <button class="deleteNM gutter-left" data-id="${
            i.id
        }"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" transform="rotate(0 0 0)">
<path d="M7.99902 4.25C7.99902 3.00736 9.00638 2 10.249 2H13.749C14.9917 2 15.999 3.00736 15.999 4.25V5H18.498C19.7407 5 20.748 6.00736 20.748 7.25C20.748 8.28958 20.043 9.16449 19.085 9.42267C18.8979 9.4731 18.7011 9.5 18.498 9.5H5.5C5.29694 9.5 5.10016 9.4731 4.91303 9.42267C3.95503 9.16449 3.25 8.28958 3.25 7.25C3.25 6.00736 4.25736 5 5.5 5H7.99902V4.25ZM14.499 5V4.25C14.499 3.83579 14.1632 3.5 13.749 3.5H10.249C9.83481 3.5 9.49902 3.83579 9.49902 4.25V5H14.499Z" fill="currentColor"/>
<path d="M4.97514 10.4578L5.54076 19.8848C5.61205 21.0729 6.59642 22 7.78672 22H16.2113C17.4016 22 18.386 21.0729 18.4573 19.8848L19.0229 10.4578C18.8521 10.4856 18.6767 10.5 18.498 10.5H5.5C5.32131 10.5 5.146 10.4856 4.97514 10.4578ZM10.774 13.4339L10.9982 17.9905C11.0185 18.4042 10.6996 18.7561 10.2859 18.7764C9.8722 18.7968 9.52032 18.4779 9.49997 18.0642L9.27581 13.5076C9.25546 13.0938 9.57434 12.742 9.98805 12.7216C10.4018 12.7013 10.7536 13.0201 10.774 13.4339ZM14.0101 12.7216C14.4238 12.742 14.7427 13.0938 14.7223 13.5076L14.4982 18.0642C14.4778 18.4779 14.1259 18.7968 13.7122 18.7764C13.2985 18.7561 12.9796 18.4042 13 17.9905L13.2241 13.4339C13.2445 13.0201 13.5964 12.7013 14.0101 12.7216Z" fill="currentColor"/>
</svg></button></div></div>
</div>`
        )
        .join("");
    attachEditDelete("editNM", "deleteNM", appData.nonMonthly, openNonMonthlyModal);
}

function renderProperties() {
    document.getElementById("propertiesList").innerHTML = appData.properties
        .map(
            (p) => `
<div class="card-item">
    <strong>Property</strong>
    <div class="gutter-bottom gutter-top">Purchase: ${p.purchaseDate || "N/A"}</div>
    <div class="gutter-bottom">Value: ${formatGBP(p.purchaseValue)}</div>
    <div class="gutter-bottom">Mortgage Bal: ${formatGBP(p.mortgageBalance)}</div>
    <div class="gutter-bottom">Monthly: ${formatGBP(p.mortgageMonthlyCost)}</div>
    <div class="gutter-bottom">Rate: ${p.mortgageInterestRate}%</div>
    <div class="mt-2 button-container float-right">
        <button class="editProp" data-id="${p.id}"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" transform="rotate(0 0 0)">
<path d="M13.803 6.09787L5.83373 14.0672C5.57259 14.3283 5.37974 14.6497 5.27221 15.003L4.05204 19.0121C3.9714 19.2771 4.04336 19.565 4.23922 19.7608C4.43508 19.9567 4.72294 20.0287 4.98792 19.948L8.99703 18.7279C9.35035 18.6203 9.67176 18.4275 9.93291 18.1663L17.9022 10.1971L13.803 6.09787Z" fill="currentColor"/>
<path d="M18.9628 9.13643L20.22 7.87928C21.0986 7.0006 21.0986 5.57598 20.22 4.6973L19.3028 3.7801C18.4241 2.90142 16.9995 2.90142 16.1208 3.7801L14.8637 5.03721L18.9628 9.13643Z" fill="currentColor"/>
</svg></button> 
<button class="deleteProp gutter-left" data-id="${p.id}"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" transform="rotate(0 0 0)">
<path d="M7.99902 4.25C7.99902 3.00736 9.00638 2 10.249 2H13.749C14.9917 2 15.999 3.00736 15.999 4.25V5H18.498C19.7407 5 20.748 6.00736 20.748 7.25C20.748 8.28958 20.043 9.16449 19.085 9.42267C18.8979 9.4731 18.7011 9.5 18.498 9.5H5.5C5.29694 9.5 5.10016 9.4731 4.91303 9.42267C3.95503 9.16449 3.25 8.28958 3.25 7.25C3.25 6.00736 4.25736 5 5.5 5H7.99902V4.25ZM14.499 5V4.25C14.499 3.83579 14.1632 3.5 13.749 3.5H10.249C9.83481 3.5 9.49902 3.83579 9.49902 4.25V5H14.499Z" fill="currentColor"/>
<path d="M4.97514 10.4578L5.54076 19.8848C5.61205 21.0729 6.59642 22 7.78672 22H16.2113C17.4016 22 18.386 21.0729 18.4573 19.8848L19.0229 10.4578C18.8521 10.4856 18.6767 10.5 18.498 10.5H5.5C5.32131 10.5 5.146 10.4856 4.97514 10.4578ZM10.774 13.4339L10.9982 17.9905C11.0185 18.4042 10.6996 18.7561 10.2859 18.7764C9.8722 18.7968 9.52032 18.4779 9.49997 18.0642L9.27581 13.5076C9.25546 13.0938 9.57434 12.742 9.98805 12.7216C10.4018 12.7013 10.7536 13.0201 10.774 13.4339ZM14.0101 12.7216C14.4238 12.742 14.7427 13.0938 14.7223 13.5076L14.4982 18.0642C14.4778 18.4779 14.1259 18.7968 13.7122 18.7764C13.2985 18.7561 12.9796 18.4042 13 17.9905L13.2241 13.4339C13.2445 13.0201 13.5964 12.7013 14.0101 12.7216Z" fill="currentColor"/>
</svg></button></div>
</div>`
        )
        .join("");
    attachEditDelete("editProp", "deleteProp", appData.properties, openPropertyModal);
}

function renderVehicles() {
    document.getElementById("vehiclesList").innerHTML = appData.vehicles
        .map(
            (v) => `
<div class="card-item">
    <strong>${escapeHtml(v.make)} ${escapeHtml(v.model)} (${v.year})</strong>
    <div class="gutter-bottom gutter-top">Reg: ${escapeHtml(v.registration)}</div>
    <div class="gutter-bottom">Purchase: ${v.purchaseDate}</div>
    <div class="gutter-bottom">Purchase Price: ${formatGBP(v.purchasePrice)}</div>
    <div class="gutter-bottom">Sold Date: ${v.soldDate || "Not sold"}</div>
    <div class="mt-2 button-container float-right"><button class="editVehicle" data-id="${v.id}">
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" transform="rotate(0 0 0)">
<path d="M13.803 6.09787L5.83373 14.0672C5.57259 14.3283 5.37974 14.6497 5.27221 15.003L4.05204 19.0121C3.9714 19.2771 4.04336 19.565 4.23922 19.7608C4.43508 19.9567 4.72294 20.0287 4.98792 19.948L8.99703 18.7279C9.35035 18.6203 9.67176 18.4275 9.93291 18.1663L17.9022 10.1971L13.803 6.09787Z" fill="currentColor"/>
<path d="M18.9628 9.13643L20.22 7.87928C21.0986 7.0006 21.0986 5.57598 20.22 4.6973L19.3028 3.7801C18.4241 2.90142 16.9995 2.90142 16.1208 3.7801L14.8637 5.03721L18.9628 9.13643Z" fill="currentColor"/>
</svg>
</button> <button class="deleteVehicle gutter-left" data-id="${
                v.id
            }"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" transform="rotate(0 0 0)">
<path d="M7.99902 4.25C7.99902 3.00736 9.00638 2 10.249 2H13.749C14.9917 2 15.999 3.00736 15.999 4.25V5H18.498C19.7407 5 20.748 6.00736 20.748 7.25C20.748 8.28958 20.043 9.16449 19.085 9.42267C18.8979 9.4731 18.7011 9.5 18.498 9.5H5.5C5.29694 9.5 5.10016 9.4731 4.91303 9.42267C3.95503 9.16449 3.25 8.28958 3.25 7.25C3.25 6.00736 4.25736 5 5.5 5H7.99902V4.25ZM14.499 5V4.25C14.499 3.83579 14.1632 3.5 13.749 3.5H10.249C9.83481 3.5 9.49902 3.83579 9.49902 4.25V5H14.499Z" fill="currentColor"/>
<path d="M4.97514 10.4578L5.54076 19.8848C5.61205 21.0729 6.59642 22 7.78672 22H16.2113C17.4016 22 18.386 21.0729 18.4573 19.8848L19.0229 10.4578C18.8521 10.4856 18.6767 10.5 18.498 10.5H5.5C5.32131 10.5 5.146 10.4856 4.97514 10.4578ZM10.774 13.4339L10.9982 17.9905C11.0185 18.4042 10.6996 18.7561 10.2859 18.7764C9.8722 18.7968 9.52032 18.4779 9.49997 18.0642L9.27581 13.5076C9.25546 13.0938 9.57434 12.742 9.98805 12.7216C10.4018 12.7013 10.7536 13.0201 10.774 13.4339ZM14.0101 12.7216C14.4238 12.742 14.7427 13.0938 14.7223 13.5076L14.4982 18.0642C14.4778 18.4779 14.1259 18.7968 13.7122 18.7764C13.2985 18.7561 12.9796 18.4042 13 17.9905L13.2241 13.4339C13.2445 13.0201 13.5964 12.7013 14.0101 12.7216Z" fill="currentColor"/>
</svg></button></div>
</div>`
        )
        .join("");
    attachEditDelete("editVehicle", "deleteVehicle", appData.vehicles, openVehicleModal);
}

function renderContacts() {
    document.getElementById("contactsList").innerHTML = appData.contacts
        .map(
            (c) => `
<div class="card-item">
    <strong>${escapeHtml(c.name)}</strong>
    <div class="gutter-bottom gutter-top">DOB: ${c.dob || "?"}</div>
    <div class="gutter-bottom">Anniversary: ${c.anniversary || "-"}</div>
    <div class="gutter-bottom">${c.phoneList?.map((p) => `${p.nick}:${p.val}`).join(", ") || ""}</div>
    <div>
        <div class="mt-2 button-container float-right"><button class="editContact" data-id="${
            c.id
        }"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" transform="rotate(0 0 0)">
<path d="M13.803 6.09787L5.83373 14.0672C5.57259 14.3283 5.37974 14.6497 5.27221 15.003L4.05204 19.0121C3.9714 19.2771 4.04336 19.565 4.23922 19.7608C4.43508 19.9567 4.72294 20.0287 4.98792 19.948L8.99703 18.7279C9.35035 18.6203 9.67176 18.4275 9.93291 18.1663L17.9022 10.1971L13.803 6.09787Z" fill="currentColor"/>
<path d="M18.9628 9.13643L20.22 7.87928C21.0986 7.0006 21.0986 5.57598 20.22 4.6973L19.3028 3.7801C18.4241 2.90142 16.9995 2.90142 16.1208 3.7801L14.8637 5.03721L18.9628 9.13643Z" fill="currentColor"/>
</svg></button> 
<button class="deleteContact gutter-left" data-id="${
                c.id
            }"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" transform="rotate(0 0 0)">
<path d="M7.99902 4.25C7.99902 3.00736 9.00638 2 10.249 2H13.749C14.9917 2 15.999 3.00736 15.999 4.25V5H18.498C19.7407 5 20.748 6.00736 20.748 7.25C20.748 8.28958 20.043 9.16449 19.085 9.42267C18.8979 9.4731 18.7011 9.5 18.498 9.5H5.5C5.29694 9.5 5.10016 9.4731 4.91303 9.42267C3.95503 9.16449 3.25 8.28958 3.25 7.25C3.25 6.00736 4.25736 5 5.5 5H7.99902V4.25ZM14.499 5V4.25C14.499 3.83579 14.1632 3.5 13.749 3.5H10.249C9.83481 3.5 9.49902 3.83579 9.49902 4.25V5H14.499Z" fill="currentColor"/>
<path d="M4.97514 10.4578L5.54076 19.8848C5.61205 21.0729 6.59642 22 7.78672 22H16.2113C17.4016 22 18.386 21.0729 18.4573 19.8848L19.0229 10.4578C18.8521 10.4856 18.6767 10.5 18.498 10.5H5.5C5.32131 10.5 5.146 10.4856 4.97514 10.4578ZM10.774 13.4339L10.9982 17.9905C11.0185 18.4042 10.6996 18.7561 10.2859 18.7764C9.8722 18.7968 9.52032 18.4779 9.49997 18.0642L9.27581 13.5076C9.25546 13.0938 9.57434 12.742 9.98805 12.7216C10.4018 12.7013 10.7536 13.0201 10.774 13.4339ZM14.0101 12.7216C14.4238 12.742 14.7427 13.0938 14.7223 13.5076L14.4982 18.0642C14.4778 18.4779 14.1259 18.7968 13.7122 18.7764C13.2985 18.7561 12.9796 18.4042 13 17.9905L13.2241 13.4339C13.2445 13.0201 13.5964 12.7013 14.0101 12.7216Z" fill="currentColor"/>
</svg></button></div>
    </div>
</div>`
        )
        .join("");
    attachEditDelete("editContact", "deleteContact", appData.contacts, openContactModal);
}

function renderReminders() {
    const today = new Date();
    const threeMonths = new Date();
    threeMonths.setMonth(today.getMonth() + 3);
    const upcoming = appData.reminders.filter((r) => {
        const d = new Date(r.date);
        return d >= today && d <= threeMonths;
    });
    document.getElementById("upcomingRemindersPanel").innerHTML =
        upcoming
            .map(
                (r) =>
                    `<div class="flex-row"><svg width="20" height="20" viewBox="0 0 25 25" fill="none" xmlns="http://www.w3.org/2000/svg" transform="rotate(0 0 0)">
<path d="M6.4228 18.2197C6.1299 18.5126 6.1299 18.9874 6.4228 19.2803C6.71569 19.5732 7.19056 19.5732 7.48346 19.2803L13.7335 13.0303C14.0263 12.7374 14.0263 12.2626 13.7335 11.9697L7.48346 5.71967C7.19056 5.42678 6.71569 5.42678 6.42279 5.71967C6.1299 6.01256 6.1299 6.48744 6.42279 6.78033L12.1425 12.5L6.4228 18.2197Z" fill="currentColor"/>
<path d="M10.9228 18.2197C10.6299 18.5126 10.6299 18.9874 10.9228 19.2803C11.2157 19.5732 11.6906 19.5732 11.9835 19.2803L18.2335 13.0303C18.5263 12.7374 18.5263 12.2626 18.2335 11.9697L11.9835 5.71967C11.6906 5.42678 11.2157 5.42678 10.9228 5.71967C10.6299 6.01256 10.6299 6.48744 10.9228 6.78033L16.6425 12.5L10.9228 18.2197Z" fill="currentColor"/>
</svg>
${escapeHtml(r.desc)} - ${new Date(r.date).toLocaleDateString("en-GB")} (${
                        r.recurring
                    })</div>`
            )
            .join("") || "<div>None in next 3 months</div>";
    document.getElementById("remindersList").innerHTML = appData.reminders
        .map(
            (r) => `
<div class="card-item">
    <strong>${escapeHtml(r.desc)}</strong>
    <div class="gutter-bottom gutter-top">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" transform="rotate(0 0 0)">
<path d="M8.75 2.75C8.75 2.33579 8.41421 2 8 2C7.58579 2 7.25 2.33579 7.25 2.75V3.75H5.5C4.25736 3.75 3.25 4.75736 3.25 6V8.25H20.75V6C20.75 4.75736 19.7426 3.75 18.5 3.75H16.75V2.75C16.75 2.33579 16.4142 2 16 2C15.5858 2 15.25 2.33579 15.25 2.75V3.75H8.75V2.75Z" fill="currentcolor"/>
<path d="M3.25 19V9.75H20.75V19C20.75 20.2426 19.7426 21.25 18.5 21.25H5.5C4.25736 21.25 3.25 20.2426 3.25 19ZM7.98438 11.95C7.54255 11.95 7.18438 12.3082 7.18438 12.75C7.18438 13.1918 7.54255 13.55 7.98438 13.55H7.99438C8.4362 13.55 8.79437 13.1918 8.79437 12.75C8.79437 12.3082 8.4362 11.95 7.99438 11.95H7.98438ZM11.9941 11.95C11.5523 11.95 11.1941 12.3082 11.1941 12.75C11.1941 13.1918 11.5523 13.55 11.9941 13.55H12.0041C12.446 13.55 12.8041 13.1918 12.8041 12.75C12.8041 12.3082 12.446 11.95 12.0041 11.95H11.9941ZM16.0039 11.95C15.5621 11.95 15.2039 12.3082 15.2039 12.75C15.2039 13.1918 15.5621 13.55 16.0039 13.55H16.0139C16.4557 13.55 16.8139 13.1918 16.8139 12.75C16.8139 12.3082 16.4557 11.95 16.0139 11.95H16.0039ZM7.98438 15.95C7.54255 15.95 7.18438 16.3082 7.18438 16.75C7.18438 17.1918 7.54255 17.55 7.98438 17.55H7.99438C8.4362 17.55 8.79437 17.1918 8.79437 16.75C8.79437 16.3082 8.4362 15.95 7.99438 15.95H7.98438ZM11.9941 15.95C11.5523 15.95 11.1941 16.3082 11.1941 16.75C11.1941 17.1918 11.5523 17.55 11.9941 17.55H12.0041C12.446 17.55 12.8041 17.1918 12.8041 16.75C12.8041 16.3082 12.446 15.95 12.0041 15.95H11.9941ZM16.0039 15.95C15.5621 15.95 15.2039 16.3082 15.2039 16.75C15.2039 17.1918 15.5621 17.55 16.0039 17.55H16.0139C16.4557 17.55 16.8139 17.1918 16.8139 16.75C16.8139 16.3082 16.4557 15.95 16.0139 15.95H16.0039Z" fill="currentColor"/>
</svg>
${r.date}</div>
    <div class="gutter-bottom">
        <svg width="20" height="20" viewBox="0 0 25 24" fill="none" xmlns="http://www.w3.org/2000/svg" transform="rotate(0 0 0)">
<path d="M7.17466 4.46302C8.83368 3.19001 10.8664 2.5 12.9575 2.5C15.0487 2.5 17.0814 3.19001 18.7404 4.46302C19.7896 5.26807 20.6522 6.27783 21.2815 7.42228L23.0527 6.92706C23.3449 6.84538 23.6575 6.94772 23.8447 7.18637C24.032 7.42502 24.0571 7.75297 23.9082 8.0173L22.1736 11.0983C22.076 11.2717 21.9136 11.3991 21.722 11.4527C21.5304 11.5063 21.3254 11.4815 21.1521 11.3839L18.0714 9.64919C17.8071 9.50036 17.6584 9.20697 17.6948 8.90582C17.7311 8.60466 17.9453 8.35506 18.2374 8.27338L19.7901 7.83927C19.2797 7.00108 18.6161 6.25835 17.8273 5.65305C16.4302 4.58106 14.7185 4 12.9575 4C11.1966 4 9.48486 4.58106 8.08781 5.65305C6.69076 6.72504 5.68647 8.22807 5.2307 9.92901C5.1235 10.3291 4.71225 10.5665 4.31215 10.4593C3.91205 10.3521 3.67461 9.94088 3.78182 9.54078C4.32304 7.52089 5.51565 5.73603 7.17466 4.46302Z" fill="currentColor"/>
<path d="M4.18603 12.5458C4.3776 12.4922 4.58261 12.517 4.75594 12.6146L7.83665 14.3493C8.10096 14.4981 8.2496 14.7915 8.21325 15.0927C8.17691 15.3938 7.96274 15.6434 7.6706 15.7251L6.1265 16.1568C6.63702 16.9958 7.30106 17.7392 8.09052 18.345C9.48757 19.417 11.1993 19.998 12.9602 19.998C14.7212 19.998 16.4329 19.417 17.83 18.345C19.227 17.273 20.2313 15.77 20.6871 14.069C20.7943 13.6689 21.2055 13.4315 21.6056 13.5387C22.0057 13.6459 22.2432 14.0572 22.136 14.4573C21.5947 16.4771 20.4021 18.262 18.7431 19.535C17.0841 20.808 15.0514 21.498 12.9602 21.498C10.8691 21.498 8.8364 20.808 7.17738 19.535C6.12761 18.7295 5.26458 17.719 4.63517 16.5738L2.85527 17.0714C2.56313 17.1531 2.25055 17.0507 2.06329 16.8121C1.87603 16.5734 1.85096 16.2455 1.99978 15.9812L3.73441 12.9001C3.832 12.7268 3.99445 12.5993 4.18603 12.5458Z" fill="currentColor"/>
</svg>
${r.recurring}</div>
    <div class="mt-2 button-container float-right"><button class="editRem" data-id="${r.id}">
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" transform="rotate(0 0 0)">
<path d="M13.803 6.09787L5.83373 14.0672C5.57259 14.3283 5.37974 14.6497 5.27221 15.003L4.05204 19.0121C3.9714 19.2771 4.04336 19.565 4.23922 19.7608C4.43508 19.9567 4.72294 20.0287 4.98792 19.948L8.99703 18.7279C9.35035 18.6203 9.67176 18.4275 9.93291 18.1663L17.9022 10.1971L13.803 6.09787Z" fill="currentColor"/>
<path d="M18.9628 9.13643L20.22 7.87928C21.0986 7.0006 21.0986 5.57598 20.22 4.6973L19.3028 3.7801C18.4241 2.90142 16.9995 2.90142 16.1208 3.7801L14.8637 5.03721L18.9628 9.13643Z" fill="currentColor"/>
</svg>
</button> <button class="deleteRem gutter-left" data-id="${r.id}">
<svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" transform="rotate(0 0 0)">
<path d="M7.99902 4.25C7.99902 3.00736 9.00638 2 10.249 2H13.749C14.9917 2 15.999 3.00736 15.999 4.25V5H18.498C19.7407 5 20.748 6.00736 20.748 7.25C20.748 8.28958 20.043 9.16449 19.085 9.42267C18.8979 9.4731 18.7011 9.5 18.498 9.5H5.5C5.29694 9.5 5.10016 9.4731 4.91303 9.42267C3.95503 9.16449 3.25 8.28958 3.25 7.25C3.25 6.00736 4.25736 5 5.5 5H7.99902V4.25ZM14.499 5V4.25C14.499 3.83579 14.1632 3.5 13.749 3.5H10.249C9.83481 3.5 9.49902 3.83579 9.49902 4.25V5H14.499Z" fill="currentColor"/>
<path d="M4.97514 10.4578L5.54076 19.8848C5.61205 21.0729 6.59642 22 7.78672 22H16.2113C17.4016 22 18.386 21.0729 18.4573 19.8848L19.0229 10.4578C18.8521 10.4856 18.6767 10.5 18.498 10.5H5.5C5.32131 10.5 5.146 10.4856 4.97514 10.4578ZM10.774 13.4339L10.9982 17.9905C11.0185 18.4042 10.6996 18.7561 10.2859 18.7764C9.8722 18.7968 9.52032 18.4779 9.49997 18.0642L9.27581 13.5076C9.25546 13.0938 9.57434 12.742 9.98805 12.7216C10.4018 12.7013 10.7536 13.0201 10.774 13.4339ZM14.0101 12.7216C14.4238 12.742 14.7427 13.0938 14.7223 13.5076L14.4982 18.0642C14.4778 18.4779 14.1259 18.7968 13.7122 18.7764C13.2985 18.7561 12.9796 18.4042 13 17.9905L13.2241 13.4339C13.2445 13.0201 13.5964 12.7013 14.0101 12.7216Z" fill="currentColor"/>
</svg>
</button></div>
</div>`
        )
        .join("");
    attachEditDelete("editRem", "deleteRem", appData.reminders, openReminderModal);
}

function renderNotes() {
    document.getElementById("notesList").innerHTML = appData.notes
        .map(
            (n) => `
<div class="card-item">
    <strong>${escapeHtml(n.title)}</strong>
    <div class="gutter-top">${escapeHtml(n.note.substring(0, 100))}${n.note.length > 100 ? "..." : ""}</div>
    <div class="mt-2 button-container float-right"><button class="editNote" data-id="${n.id}">
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" transform="rotate(0 0 0)">
<path d="M13.803 6.09787L5.83373 14.0672C5.57259 14.3283 5.37974 14.6497 5.27221 15.003L4.05204 19.0121C3.9714 19.2771 4.04336 19.565 4.23922 19.7608C4.43508 19.9567 4.72294 20.0287 4.98792 19.948L8.99703 18.7279C9.35035 18.6203 9.67176 18.4275 9.93291 18.1663L17.9022 10.1971L13.803 6.09787Z" fill="currentColor"/>
<path d="M18.9628 9.13643L20.22 7.87928C21.0986 7.0006 21.0986 5.57598 20.22 4.6973L19.3028 3.7801C18.4241 2.90142 16.9995 2.90142 16.1208 3.7801L14.8637 5.03721L18.9628 9.13643Z" fill="currentColor"/>
</svg>
</button> <button class="deleteNote gutter-left" data-id="${
                n.id
            }"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" transform="rotate(0 0 0)">
<path d="M7.99902 4.25C7.99902 3.00736 9.00638 2 10.249 2H13.749C14.9917 2 15.999 3.00736 15.999 4.25V5H18.498C19.7407 5 20.748 6.00736 20.748 7.25C20.748 8.28958 20.043 9.16449 19.085 9.42267C18.8979 9.4731 18.7011 9.5 18.498 9.5H5.5C5.29694 9.5 5.10016 9.4731 4.91303 9.42267C3.95503 9.16449 3.25 8.28958 3.25 7.25C3.25 6.00736 4.25736 5 5.5 5H7.99902V4.25ZM14.499 5V4.25C14.499 3.83579 14.1632 3.5 13.749 3.5H10.249C9.83481 3.5 9.49902 3.83579 9.49902 4.25V5H14.499Z" fill="currentColor"/>
<path d="M4.97514 10.4578L5.54076 19.8848C5.61205 21.0729 6.59642 22 7.78672 22H16.2113C17.4016 22 18.386 21.0729 18.4573 19.8848L19.0229 10.4578C18.8521 10.4856 18.6767 10.5 18.498 10.5H5.5C5.32131 10.5 5.146 10.4856 4.97514 10.4578ZM10.774 13.4339L10.9982 17.9905C11.0185 18.4042 10.6996 18.7561 10.2859 18.7764C9.8722 18.7968 9.52032 18.4779 9.49997 18.0642L9.27581 13.5076C9.25546 13.0938 9.57434 12.742 9.98805 12.7216C10.4018 12.7013 10.7536 13.0201 10.774 13.4339ZM14.0101 12.7216C14.4238 12.742 14.7427 13.0938 14.7223 13.5076L14.4982 18.0642C14.4778 18.4779 14.1259 18.7968 13.7122 18.7764C13.2985 18.7561 12.9796 18.4042 13 17.9905L13.2241 13.4339C13.2445 13.0201 13.5964 12.7013 14.0101 12.7216Z" fill="currentColor"/>
</svg></button></div>
</div>`
        )
        .join("");
    attachEditDelete("editNote", "deleteNote", appData.notes, openNoteModal);
}

function escapeHtml(str) {
    if (!str) return "";
    return str.replace(/[&<>]/g, function (m) {
        if (m === "&") return "&amp;";
        if (m === "<") return "&lt;";
        if (m === ">") return "&gt;";
        return m;
    });
}

function attachEditDelete(editClass, delClass, arr, openModalFn) {
    document.querySelectorAll(`.${editClass}`).forEach((btn) =>
        btn.addEventListener("click", () => {
            const item = arr.find((x) => x.id == btn.dataset.id);
            if (item) openModalFn(item);
        })
    );
    document.querySelectorAll(`.${delClass}`).forEach((btn) =>
        btn.addEventListener("click", () => {
            const idx = arr.findIndex((x) => x.id == btn.dataset.id);
            if (idx !== -1) arr.splice(idx, 1);
            renderAll();
        })
    );
}

// Modal open functions
function openBudgetModal(existing = null) {
    const fields = `<div><label>Description</label><input id="desc" value="${
        existing?.desc || ""
    }"></div><div><label>Category</label><input id="category" value="${
        existing?.category || ""
    }"></div><div><label>Amount (£)</label><input id="amount" type="number" step="0.01" value="${
        existing?.amount || ""
    }"></div><div><label>Type</label><select id="type"><option value="income" ${
        existing?.type === "income" ? "selected" : ""
    }>Income</option><option value="expense" ${
        existing?.type === "expense" ? "selected" : ""
    }>Expense</option></select></div>`;
    showModal(existing ? "Edit Budget Item" : "Add Budget Item", fields, (d) => {
        if (!d.desc || !d.amount) return alert("Description and Amount required");
        const amt = parseFloat(d.amount);
        if (isNaN(amt)) return alert("Invalid amount");
        if (existing) {
            existing.desc = d.desc;
            existing.category = d.category;
            existing.amount = amt;
            existing.type = d.type;
        } else {
            appData.budgetItems.push({
                id: Date.now() + "",
                desc: d.desc,
                category: d.category || "Other",
                amount: amt,
                type: d.type,
            });
        }
        renderAll();
    });
}
function openNonMonthlyModal(existing = null) {
    const fields = `<div><label>Description</label><input id="desc" value="${
        existing?.desc || ""
    }"></div><div><label>Amount (£)</label><input id="amount" type="number" step="0.01" value="${
        existing?.amount || ""
    }"></div>`;
    showModal(existing ? "Edit Expense" : "Add Expense", fields, (d) => {
        if (!d.desc || !d.amount) return;
        const amt = parseFloat(d.amount);
        if (existing) {
            existing.desc = d.desc;
            existing.amount = amt;
        } else {
            appData.nonMonthly.push({ id: Date.now() + "", desc: d.desc, amount: amt });
        }
        renderAll();
    });
}
function openNetWorthModal(existing = null) {
    const fields = `<div><label>Description</label><input id="desc" value="${
        existing?.desc || ""
    }"></div><div><label>Category</label><input id="category" value="${
        existing?.category || ""
    }"></div><div><label>Amount (£)</label><input id="amount" type="number" step="0.01" value="${
        existing?.amount || ""
    }"></div><div><label>Type</label><select id="type"><option value="asset" ${
        existing?.type === "asset" ? "selected" : ""
    }>Asset</option><option value="liability" ${
        existing?.type === "liability" ? "selected" : ""
    }>Liability</option></select></div>`;
    showModal(existing ? "Edit Item" : "Add Asset/Liability", fields, (d) => {
        if (!d.desc || !d.amount) return;
        const amt = parseFloat(d.amount);
        if (existing) {
            existing.desc = d.desc;
            existing.category = d.category;
            existing.amount = amt;
            existing.type = d.type;
        } else {
            appData.netWorthItems.push({
                id: Date.now() + "",
                desc: d.desc,
                category: d.category || "General",
                amount: amt,
                type: d.type,
            });
        }
        renderAll();
    });
}
function openPropertyModal(prop = null) {
    const fields = `<div><label>Purchase Date</label><input id="purchaseDate" type="date" value="${
        prop?.purchaseDate || ""
    }"></div><div><label>Purchase Value (£)</label><input id="purchaseValue" type="number" step="0.01" value="${
        prop?.purchaseValue || 0
    }"></div><div><label>Mortgage Balance (£)</label><input id="mortgageBalance" type="number" step="0.01" value="${
        prop?.mortgageBalance || 0
    }"></div><div><label>Monthly Cost (£)</label><input id="mortgageMonthlyCost" type="number" step="0.01" value="${
        prop?.mortgageMonthlyCost || 0
    }"></div><div><label>Interest Rate (%)</label><input id="mortgageInterestRate" type="number" step="any" value="${
        prop?.mortgageInterestRate || 0
    }"></div>`;
    showModal(prop ? "Edit Property" : "Add Property", fields, (d) => {
        if (prop) {
            prop.purchaseDate = d.purchaseDate;
            prop.purchaseValue = parseFloat(d.purchaseValue) || 0;
            prop.mortgageBalance = parseFloat(d.mortgageBalance) || 0;
            prop.mortgageMonthlyCost = parseFloat(d.mortgageMonthlyCost) || 0;
            prop.mortgageInterestRate = parseFloat(d.mortgageInterestRate) || 0;
        } else {
            appData.properties.push({
                id: Date.now() + "",
                purchaseDate: d.purchaseDate,
                purchaseValue: parseFloat(d.purchaseValue) || 0,
                mortgageBalance: parseFloat(d.mortgageBalance) || 0,
                mortgageMonthlyCost: parseFloat(d.mortgageMonthlyCost) || 0,
                mortgageInterestRate: parseFloat(d.mortgageInterestRate) || 0,
            });
        }
        renderAll();
    });
}
function openVehicleModal(veh = null) {
    const fields = `<div><label>Registration</label><input id="registration" value="${
        veh?.registration || ""
    }"></div><div><label>Make</label><input id="make" value="${
        veh?.make || ""
    }"></div><div><label>Model</label><input id="model" value="${
        veh?.model || ""
    }"></div><div><label>Year</label><input id="year" value="${
        veh?.year || ""
    }"></div><div><label>Purchase Date</label><input id="purchaseDate" value="${
        veh?.purchaseDate || ""
    }"></div><div><label>Purchase Price (£)</label><input id="purchasePrice" type="number" step="0.01" value="${
        veh?.purchasePrice || 0
    }"></div><div><label>Sold Date (optional)</label><input id="soldDate" value="${
        veh?.soldDate || ""
    }"></div>`;
    showModal(veh ? "Edit Vehicle" : "Add Vehicle", fields, (d) => {
        if (veh) {
            veh.registration = d.registration;
            veh.make = d.make;
            veh.model = d.model;
            veh.year = d.year;
            veh.purchaseDate = d.purchaseDate;
            veh.purchasePrice = parseFloat(d.purchasePrice) || 0;
            veh.soldDate = d.soldDate;
        } else {
            appData.vehicles.push({
                id: Date.now() + "",
                registration: d.registration,
                make: d.make,
                model: d.model,
                year: d.year,
                purchaseDate: d.purchaseDate,
                purchasePrice: parseFloat(d.purchasePrice) || 0,
                soldDate: d.soldDate,
            });
        }
        renderAll();
    });
}
function openContactModal(contact = null) {
    const fields = `<div><label>Name</label><input id="name" value="${
        contact?.name || ""
    }"></div><div><label>Date of Birth</label><input id="dob" type="date" value="${
        contact?.dob || ""
    }"></div><div><label>Anniversary</label><input id="anniversary" type="date" value="${
        contact?.anniversary || ""
    }"></div><div><label>Blood Type</label><input id="bloodType" value="${
        contact?.bloodType || ""
    }"></div><div><label>NI Number</label><input id="nationalInsurance" value="${
        contact?.nationalInsurance || ""
    }"></div>`;
    showModal(contact ? "Edit Contact" : "Add Contact", fields, (d) => {
        if (contact) {
            contact.name = d.name;
            contact.dob = d.dob;
            contact.anniversary = d.anniversary;
            contact.bloodType = d.bloodType;
            contact.nationalInsurance = d.nationalInsurance;
        } else {
            appData.contacts.push({
                id: Date.now() + "",
                name: d.name,
                dob: d.dob,
                addressList: [],
                phoneList: [],
                emailList: [],
                anniversary: d.anniversary,
                dateOfDeath: "",
                bloodType: d.bloodType,
                nationalInsurance: d.nationalInsurance,
                bankDetails: [],
            });
        }
        renderAll();
    });
}
function openReminderModal(rem = null) {
    const fields = `<div><label>Description</label><input id="desc" value="${
        rem?.desc || ""
    }"></div><div><label>Date</label><input id="date" type="date" value="${
        rem?.date || ""
    }"></div><div><label>Recurring</label><select id="recurring"><option value="None">None</option><option value="Monthly">Monthly</option><option value="Quarterly">Quarterly</option><option value="Annually">Annually</option></select></div>`;
    showModal(rem ? "Edit Reminder" : "Add Reminder", fields, (d) => {
        if (rem) {
            rem.desc = d.desc;
            rem.date = d.date;
            rem.recurring = d.recurring;
        } else {
            appData.reminders.push({
                id: Date.now() + "",
                desc: d.desc,
                date: d.date,
                recurring: d.recurring,
            });
        }
        renderAll();
    });
}
function openNoteModal(note = null) {
    const fields = `<div><label>Title</label><input id="title" value="${
        note?.title || ""
    }"></div><div><label>Note</label><textarea id="note" rows="4">${note?.note || ""}</textarea></div>`;
    showModal(note ? "Edit Note" : "Add Note", fields, (d) => {
        if (note) {
            note.title = d.title;
            note.note = d.note;
        } else {
            appData.notes.push({ id: Date.now() + "", title: d.title, note: d.note });
        }
        renderAll();
    });
}

// Event binding
document.getElementById("addBudgetItem").onclick = () => openBudgetModal();
document.getElementById("addNonMonthly").onclick = () => openNonMonthlyModal();
document.getElementById("addNetWorthItem").onclick = () => openNetWorthModal();
document.getElementById("addProperty").onclick = () => openPropertyModal();
document.getElementById("addVehicle").onclick = () => openVehicleModal();
document.getElementById("addContact").onclick = () => openContactModal();
document.getElementById("addReminder").onclick = () => openReminderModal();
document.getElementById("addNote").onclick = () => openNoteModal();

// Navigation setup
document
    .querySelectorAll(".sidebar-nav-btn")
    .forEach((btn) => btn.addEventListener("click", () => switchSection(btn.dataset.section)));
document.querySelectorAll(".bottom-nav-btn").forEach((btn) => {
    if (btn.dataset.bottom) btn.addEventListener("click", () => switchSection(btn.dataset.bottom));
});
document.querySelectorAll("[data-more]").forEach((btn) =>
    btn.addEventListener("click", () => {
        switchSection(btn.dataset.more);
        closeMoreMenu();
    })
);
document.getElementById("moreMenuBtn").addEventListener("click", openMoreMenu);
document.getElementById("moreOverlay").addEventListener("click", closeMoreMenu);
document
    .getElementById("menuToggle")
    .addEventListener("click", () => document.getElementById("sidebar").classList.toggle("mobile-open"));

// Import/Export & theme
document.getElementById("importBtnSide").onclick = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "application/json";
    input.onchange = (e) => {
        const file = e.target.files[0];
        const reader = new FileReader();
        reader.onload = (ev) => {
            try {
                appData = JSON.parse(ev.target.result);
                renderAll();
            } catch (e) {
                alert("Invalid JSON");
            }
        };
        reader.readAsText(file);
    };
    input.click();
};
document.getElementById("exportBtnSide").onclick = () => {
    const dataStr = JSON.stringify(appData);
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "lifestack_data.json";
    a.click();
    URL.revokeObjectURL(url);
};
document.getElementById("themeToggleSide").onclick = () => {
    document.body.classList.toggle("dark");
    localStorage.setItem("theme", document.body.classList.contains("dark") ? "dark" : "light");
};
if (localStorage.getItem("theme") === "dark") document.body.classList.add("dark");
else if (window.matchMedia("(prefers-color-scheme:dark)").matches) document.body.classList.add("dark");

loadFromLocal();