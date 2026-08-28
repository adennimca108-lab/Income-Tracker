/* =====================================================
FINANCIAL TRACKER
===================================================== */


/* ================= STORAGE ================= */

const TRANSACTION_KEY = "financialTrackerTransactions";
const GOAL_KEY = "financialTrackerGoal";


let transactions = JSON.parse(
localStorage.getItem(TRANSACTION_KEY)
) || [];

let savingsGoal = JSON.parse(
localStorage.getItem(GOAL_KEY)
) || null;


/* ================= HELPERS ================= */

function saveTransactions() {

localStorage.setItem(
TRANSACTION_KEY,
JSON.stringify(transactions)
);

}


function saveGoal() {

localStorage.setItem(
GOAL_KEY,
JSON.stringify(savingsGoal)
);

}


function money(amount) {

return new Intl.NumberFormat("en-US", {
style: "currency",
currency: "USD"
}).format(amount);

}


function escapeHTML(value) {

return String(value)
.replaceAll("&", "&amp;")
.replaceAll("<", "&lt;")
.replaceAll(">", "&gt;")
.replaceAll('"', "&quot;")
.replaceAll("'", "&#039;");

}


/* ================= NAVIGATION ================= */

const navButtons = document.querySelectorAll(".nav-btn");

const pages = document.querySelectorAll(".page");


navButtons.forEach(button => {

button.addEventListener("click", () => {

const pageName = button.dataset.page;

pages.forEach(page => {
page.classList.remove("active-page");
});

const selectedPage =
document.getElementById(pageName);

if (selectedPage) {
selectedPage.classList.add("active-page");
}


navButtons.forEach(btn => {
btn.classList.remove("active");
});

button.classList.add("active");


window.scrollTo({
top: 0,
behavior: "smooth"
});

});

});


/* ================= CALCULATIONS ================= */

function getIncome() {

return transactions
.filter(transaction => transaction.type === "income")
.reduce(
(total, transaction) =>
total + Number(transaction.amount),
0
);

}


function getExpenses() {

return transactions
.filter(transaction => transaction.type === "expense")
.reduce(
(total, transaction) =>
total + Number(transaction.amount),
0
);

}


function getBalance() {

return getIncome() - getExpenses();

}


/* ================= DASHBOARD ================= */

function updateDashboard() {

document.getElementById("dashboardBalance").textContent =
money(getBalance());

document.getElementById("dashboardIncome").textContent =
money(getIncome());

document.getElementById("dashboardExpenses").textContent =
money(getExpenses());


updateGoalDisplay();

renderRecentTransactions();

}


/* ================= TRANSACTIONS ================= */

function renderRecentTransactions() {

const container =
document.getElementById("recentTransactions");


if (transactions.length === 0) {

container.innerHTML = `
<div class="empty">
No transactions yet.
</div>
`;

return;
}


const recent =
transactions.slice(0, 5);


container.innerHTML =
recent.map(createTransactionHTML).join("");

}


function renderAllTransactions() {

const container =
document.getElementById("allTransactions");


if (transactions.length === 0) {

container.innerHTML = `
<div class="empty">
No transactions yet.
</div>
`;

return;
}


container.innerHTML =
transactions
.map(createTransactionHTML)
.join("");

}


function createTransactionHTML(transaction) {

const isIncome =
transaction.type === "income";


const icon =
isIncome ? "📈" : "📉";


const amount =
isIncome
? `+ ${money(transaction.amount)}`
: `- ${money(transaction.amount)}`;


const amountClass =
isIncome
? "income-amount"
: "expense-amount";


const iconClass =
isIncome
? "income-icon"
: "expense-icon";


const date =
new Date(transaction.date)
.toLocaleDateString("en-US", {
month: "short",
day: "numeric",
year: "numeric"
});


return `

<div class="transaction">

<div class="transaction-left">

<div class="transaction-icon ${iconClass}">
${icon}
</div>

<div class="transaction-info">

<h3>
${escapeHTML(transaction.name)}
</h3>

<p>
${escapeHTML(transaction.category)}
• ${date}
</p>

</div>

</div>


<div class="transaction-right">

<span class="${amountClass}">
${amount}
</span>

<button
class="delete-button"
data-id="${transaction.id}"
title="Delete transaction"
>
🗑️
</button>

</div>

</div>

`;

}


/* ================= ADD TRANSACTION ================= */

const transactionForm =
document.getElementById("transactionForm");


transactionForm.addEventListener("submit", event => {

event.preventDefault();


const name =
document.getElementById("transactionName")
.value.trim();


const amount =
Number(
document.getElementById("transactionAmount")
.value
);


const type =
document.getElementById("transactionType")
.value;


const category =
document.getElementById("transactionCategory")
.value;


if (!name || amount <= 0) {

alert("Please enter a valid description and amount.");

return;
}


const transaction = {

id: Date.now(),

name: name,

amount: amount,

type: type,

category: category,

date: new Date().toISOString()

};


transactions.unshift(transaction);


saveTransactions();


transactionForm.reset();


updateDashboard();

renderAllTransactions();


alert("Transaction added successfully! 💰");

});


/* ================= DELETE TRANSACTION ================= */

document.addEventListener("click", event => {

const deleteButton =
event.target.closest(".delete-button");


if (!deleteButton) {
return;
}


const id =
Number(deleteButton.dataset.id);


const confirmed =
confirm("Delete this transaction?");


if (!confirmed) {
return;
}


transactions =
transactions.filter(
transaction => transaction.id !== id
);


saveTransactions();


updateDashboard();

renderAllTransactions();

});


/* ================= CLEAR TRANSACTIONS ================= */

document
.getElementById("clearTransactionsButton")
.addEventListener("click", () => {


if (transactions.length === 0) {

alert("There are no transactions to delete.");

return;
}


const confirmed =
confirm(
"Are you sure you want to delete ALL transactions?"
);


if (!confirmed) {
return;
}


transactions = [];


saveTransactions();


updateDashboard();

renderAllTransactions();

});


/* ================= GOAL CALCULATION ================= */

function getSavingsAmount() {

/*
For this simple tracker, savings is based on
your current positive balance.
*/

return Math.max(getBalance(), 0);

}


function getGoalPercentage() {

if (!savingsGoal) {
return 0;
}


if (savingsGoal.target <= 0) {
return 0;
}


const percentage =
(getSavingsAmount() / savingsGoal.target) * 100;


return Math.min(
Math.max(percentage, 0),
100
);

}


/* ================= UPDATE GOAL ================= */

function updateGoalDisplay() {

const percentage =
getGoalPercentage();


const saved =
getSavingsAmount();


const target =
savingsGoal
? Number(savingsGoal.target)
: 0;


const name =
savingsGoal
? savingsGoal.name
: "No savings goal yet";


/* Dashboard */

document.getElementById("goalPercent")
.textContent =
`${Math.round(percentage)}%`;


document.getElementById("dashboardGoalName")
.textContent = name;


document.getElementById("goalProgressBar")
.style.width =
`${percentage}%`;


document.getElementById("goalSaved")
.textContent =
`${money(saved)} saved`;


document.getElementById("goalTarget")
.textContent =
`Goal: ${money(target)}`;


/* Savings page */

document.getElementById("savingsGoalTitle")
.textContent = name;


document.getElementById("savingsPercent")
.textContent =
`${Math.round(percentage)}%`;


document.getElementById("savingsProgressBar")
.style.width =
`${percentage}%`;


document.getElementById("savingsSaved")
.textContent =
`${money(saved)} saved`;


document.getElementById("savingsTarget")
.textContent =
`Goal: ${money(target)}`;

}


/* ================= SAVINGS GOAL FORM ================= */

const goalForm =
document.getElementById("goalForm");


goalForm.addEventListener("submit", event => {

event.preventDefault();


const name =
document.getElementById("goalName")
.value.trim();


const target =
Number(
document.getElementById("goalAmount")
.value
);


if (!name || target <= 0) {

alert("Please enter a valid goal and amount.");

return;
}


savingsGoal = {

name: name,

target: target

};


saveGoal();


goalForm.reset();


updateDashboard();


alert("Savings goal saved successfully! 🎯");

});


/* ================= MODAL ================= */

const goalModal =
document.getElementById("goalModal");


const openGoalButton =
document.getElementById("openGoalButton");


const closeGoalModal =
document.getElementById("closeGoalModal");


const goalModalForm =
document.getElementById("goalModalForm");


/*
OPEN MODAL
*/

openGoalButton.addEventListener("click", () => {

goalModal.classList.add("show");

});


/*
CLOSE MODAL
*/

closeGoalModal.addEventListener("click", () => {

goalModal.classList.remove("show");

});


/*
CLOSE WHEN CLICKING OUTSIDE
*/

goalModal.addEventListener("click", event => {

if (event.target === goalModal) {

goalModal.classList.remove("show");

}

});


/*
CLOSE WITH ESC KEY
*/

document.addEventListener("keydown", event => {

if (
event.key === "Escape" &&
goalModal.classList.contains("show")
) {

goalModal.classList.remove("show");

}

});


/*
SAVE GOAL FROM MODAL
*/

goalModalForm.addEventListener("submit", event => {

event.preventDefault();


const name =
document.getElementById("modalGoalName")
.value.trim();


const target =
Number(
document.getElementById("modalGoalAmount")
.value
);


if (!name || target <= 0) {

alert("Please enter a valid goal and amount.");

return;
}


savingsGoal = {

name: name,

target: target

};


saveGoal();


goalModalForm.reset();


goalModal.classList.remove("show");


updateDashboard();


alert("Savings goal saved successfully! 🎯");

});


/* ================= VIEW ALL ================= */

document
.getElementById("viewAllButton")
.addEventListener("click", () => {

pages.forEach(page => {
page.classList.remove("active-page");
});


document
.getElementById("transactions")
.classList.add("active-page");


navButtons.forEach(button => {
button.classList.remove("active");
});


document
.querySelector('[data-page="transactions"]')
.classList.add("active");


renderAllTransactions();


window.scrollTo({
top: 0,
behavior: "smooth"
});

});


/* ================= INITIAL LOAD ================= */

updateDashboard();

renderAllTransactions();
