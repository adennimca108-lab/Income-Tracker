// ============================================================
// INCOME TRACKER
// GITHUB ONLY VERSION
// No Supabase
// No login
// Uses browser localStorage
// ============================================================


// ============================================================
// APP DATA
// ============================================================

let transactions = [];

let savingsGoal = {
name: "",
amount: 0
};


// ============================================================
// START APP
// ============================================================

document.addEventListener("DOMContentLoaded", function () {

console.log("Income Tracker started.");

loadData();

setupNavigation();

setupTransactionForm();

setupGoalForm();

setupClearAllButton();

setupViewTransactionsButton();

setTodayDate();

updateApp();

showPage("dashboard");

});


// ============================================================
// LOCAL STORAGE
// ============================================================

const TRANSACTIONS_KEY = "incomeTrackerTransactions";

const GOAL_KEY = "incomeTrackerSavingsGoal";


// ============================================================
// LOAD DATA
// ============================================================

function loadData() {

try {

const savedTransactions =
localStorage.getItem(TRANSACTIONS_KEY);

if (savedTransactions) {

const parsed =
JSON.parse(savedTransactions);

if (Array.isArray(parsed)) {

transactions = parsed;

}

}


const savedGoal =
localStorage.getItem(GOAL_KEY);

if (savedGoal) {

const parsedGoal =
JSON.parse(savedGoal);

if (parsedGoal) {

savingsGoal = {

name: parsedGoal.name || "",

amount:
Number(parsedGoal.amount) || 0

};

}

}

} catch (error) {

console.error(
"Could not load saved data:",
error
);

transactions = [];

savingsGoal = {
name: "",
amount: 0
};

}

}


// ============================================================
// SAVE TRANSACTIONS
// ============================================================

function saveTransactions() {

try {

localStorage.setItem(
TRANSACTIONS_KEY,
JSON.stringify(transactions)
);

} catch (error) {

console.error(
"Could not save transactions:",
error
);

alert(
"Your browser could not save the transaction."
);

}

}


// ============================================================
// SAVE GOAL
// ============================================================

function saveGoal() {

try {

localStorage.setItem(
GOAL_KEY,
JSON.stringify(savingsGoal)
);

} catch (error) {

console.error(
"Could not save savings goal:",
error
);

alert(
"Your browser could not save the savings goal."
);

}

}


// ============================================================
// NAVIGATION
// ============================================================

function setupNavigation() {

const buttons =
document.querySelectorAll(".nav-btn");


buttons.forEach(function (button) {

button.addEventListener(
"click",
function () {

const page =
button.getAttribute("data-page");

showPage(page);

}
);

});

}


// ============================================================
// SHOW PAGE
// ============================================================

function showPage(pageName) {

const pages =
document.querySelectorAll(".page");


pages.forEach(function (page) {

page.classList.remove("active-page");

});


const selectedPage =
document.getElementById(pageName);


if (selectedPage) {

selectedPage.classList.add("active-page");

}


const buttons =
document.querySelectorAll(".nav-btn");


buttons.forEach(function (button) {

button.classList.remove("active");

});


const activeButton =
document.querySelector(
'.nav-btn[data-page="' +
pageName +
'"]'
);


if (activeButton) {

activeButton.classList.add("active");

}


window.scrollTo({
top: 0,
behavior: "smooth"
});

}


// ============================================================
// TODAY'S DATE
// ============================================================

function setTodayDate() {

const dateInput =
document.getElementById(
"transactionDate"
);


if (!dateInput) {
return;
}


const today =
new Date();


const year =
today.getFullYear();


const month =
String(
today.getMonth() + 1
).padStart(2, "0");


const day =
String(
today.getDate()
).padStart(2, "0");


dateInput.value =
year + "-" +
month + "-" +
day;

}


// ============================================================
// TRANSACTION FORM
// ============================================================

function setupTransactionForm() {

const form =
document.getElementById(
"transactionForm"
);


if (!form) {

console.error(
"Transaction form not found."
);

return;

}


form.addEventListener(
"submit",
function (event) {

event.preventDefault();


const type =
document.getElementById(
"transactionType"
).value;


const name =
document.getElementById(
"transactionName"
).value.trim();


const category =
document.getElementById(
"transactionCategory"
).value;


const amountInput =
document.getElementById(
"transactionAmount"
).value;


const date =
document.getElementById(
"transactionDate"
).value;


const amount =
Number(amountInput);


// Validate description

if (!name) {

alert(
"Please enter a description."
);

return;

}


// Validate amount

if (
!Number.isFinite(amount) ||
amount <= 0
) {

alert(
"Please enter a valid amount greater than $0."
);

return;

}


// Validate date

if (!date) {

alert(
"Please select a date."
);

return;

}


// Create transaction

const newTransaction = {

id:
Date.now() +
Math.random()
.toString(16)
.slice(2),

type: type,

name: name,

category: category,

amount:
Math.round(
amount * 100
) / 100,

date: date,

createdAt:
new Date().toISOString()

};


console.log(
"Adding transaction:",
newTransaction
);


// Add to beginning

transactions.unshift(
newTransaction
);


// Save

saveTransactions();


// Update screen

updateApp();


// Clear form

form.reset();


// Put today's date back

setTodayDate();


// Show success message

alert(
"Transaction added successfully!"
);


// Go to transactions page

showPage("transactions");

}
);

}


// ============================================================
// DELETE TRANSACTION
// ============================================================

function deleteTransaction(id) {

const transaction =
transactions.find(
function (item) {

return String(item.id) ===
String(id);

}
);


if (!transaction) {

alert(
"Transaction not found."
);

return;

}


const amount =
formatMoney(
Number(transaction.amount)
);


const confirmed =
confirm(
'Delete "' +
transaction.name +
'" for ' +
amount +
"?"
);


if (!confirmed) {

return;

}


transactions =
transactions.filter(
function (item) {

return String(item.id) !==
String(id);

}
);


saveTransactions();

updateApp();

}


// Make function available to buttons

window.deleteTransaction =
deleteTransaction;


// ============================================================
// CLEAR ALL
// ============================================================

function setupClearAllButton() {

const button =
document.getElementById(
"clearAllBtn"
);


if (!button) {
return;
}


button.addEventListener(
"click",
function () {

if (
transactions.length === 0
) {

alert(
"There are no transactions to delete."
);

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

updateApp();


alert(
"All transactions have been deleted."
);

}
);

}


// ============================================================
// VIEW ALL TRANSACTIONS BUTTON
// ============================================================

function setupViewTransactionsButton() {

const button =
document.getElementById(
"viewTransactionsBtn"
);


if (!button) {
return;
}


button.addEventListener(
"click",
function () {

showPage("transactions");

}
);

}


// ============================================================
// CALCULATE TOTALS
// ============================================================

function calculateTotals() {

let income = 0;

let expenses = 0;


transactions.forEach(
function (transaction) {

const amount =
Number(transaction.amount) || 0;


if (
String(transaction.type)
.toLowerCase() ===
"income"
) {

income += amount;

} else {

expenses += amount;

}

}
);


return {

income: income,

expenses: expenses,

balance:
income - expenses

};

}


// ============================================================
// UPDATE APP
// ============================================================

function updateApp() {

updateDashboard();

updateAllTransactions();

updateGoalDisplay();

}


// ============================================================
// UPDATE DASHBOARD
// ============================================================

function updateDashboard() {

const totals =
calculateTotals();


const incomeElement =
document.getElementById(
"totalIncome"
);


const expensesElement =
document.getElementById(
"totalExpenses"
);


const balanceElement =
document.getElementById(
"balance"
);


if (incomeElement) {

incomeElement.textContent =
formatMoney(
totals.income
);

}


if (expensesElement) {

expensesElement.textContent =
formatMoney(
totals.expenses
);

}


if (balanceElement) {

balanceElement.textContent =
formatMoney(
totals.balance
);

}


updateRecentTransactions();

}


// ============================================================
// RECENT TRANSACTIONS
// ============================================================

function updateRecentTransactions() {

const container =
document.getElementById(
"recentTransactions"
);


if (!container) {
return;
}


if (
transactions.length === 0
) {

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
recent
.map(
function (transaction) {

return createTransactionHTML(
transaction,
false
);

}
)
.join("");

}


// ============================================================
// ALL TRANSACTIONS
// ============================================================

function updateAllTransactions() {

const container =
document.getElementById(
"allTransactions"
);


if (!container) {
return;
}


if (
transactions.length === 0
) {

container.innerHTML = `
<div class="empty">
No transactions yet.
<br>
Add your first transaction above.
</div>
`;

return;

}


container.innerHTML =
transactions
.map(
function (transaction) {

return createTransactionHTML(
transaction,
true
);

}
)
.join("");

}


// ============================================================
// CREATE TRANSACTION HTML
// ============================================================

function createTransactionHTML(
transaction,
showDelete
) {

const isIncome =
String(transaction.type)
.toLowerCase() ===
"income";


const icon =
isIncome
? "📈"
: "📉";


const sign =
isIncome
? "+"
: "-";


const amount =
formatMoney(
Number(transaction.amount) || 0
);


const formattedDate =
formatDate(
transaction.date
);


let deleteButton = "";


if (showDelete) {

deleteButton = `

<button
class="delete-btn"
type="button"
data-delete-id="${escapeAttribute(
transaction.id
)}"
>
Delete
</button>

`;

}


return `

<div class="transaction">

<div class="transaction-left">

<div class="
transaction-icon
${isIncome ? "income" : "expense"}
">
${icon}
</div>


<div>

<div class="transaction-name">
${escapeHTML(
transaction.name
)}
</div>


<div class="transaction-details">

${escapeHTML(
transaction.category
)}

•

${escapeHTML(
formattedDate
)}

</div>

</div>

</div>


<div class="transaction-right">

<div class="
transaction-amount
${isIncome ? "income" : "expense"}
">

${sign}${amount}

</div>


${deleteButton}

</div>

</div>

`;

}


// ============================================================
// DELETE BUTTON HANDLER
// ============================================================

document.addEventListener(
"click",
function (event) {

const button =
event.target.closest(
"[data-delete-id]"
);


if (!button) {
return;
}


const id =
button.getAttribute(
"data-delete-id"
);


deleteTransaction(id);

}
);


// ============================================================
// SAVINGS GOAL FORM
// ============================================================

function setupGoalForm() {

const form =
document.getElementById(
"goalForm"
);


if (!form) {
return;
}


form.addEventListener(
"submit",
function (event) {

event.preventDefault();


const name =
document.getElementById(
"goalName"
).value.trim();


const amount =
Number(
document.getElementById(
"goalAmount"
).value
);


if (!name) {

alert(
"Please enter a goal name."
);

return;

}


if (
!Number.isFinite(amount) ||
amount <= 0
) {

alert(
"Please enter a valid goal amount."
);

return;

}


savingsGoal = {

name: name,

amount:
Math.round(
amount * 100
) / 100

};


saveGoal();


updateGoalDisplay();


form.reset();


alert(
"Savings goal saved successfully!"
);

}
);

}


// ============================================================
// UPDATE GOAL DISPLAY
// ============================================================

function updateGoalDisplay() {

const totals =
calculateTotals();


// Current balance is used as savings

const saved =
Math.max(
0,
totals.balance
);


let percent = 0;


if (
savingsGoal.amount > 0
) {

percent =
(
saved /
savingsGoal.amount
) * 100;

}


percent =
Math.min(
100,
Math.max(
0,
percent
)
);


const roundedPercent =
Math.round(percent);


// Dashboard

const dashboardGoalName =
document.getElementById(
"dashboardGoalName"
);


const dashboardGoalAmount =
document.getElementById(
"dashboardGoalAmount"
);


const dashboardGoalPercent =
document.getElementById(
"dashboardGoalPercent"
);


const dashboardSaved =
document.getElementById(
"dashboardSaved"
);


const dashboardProgress =
document.getElementById(
"dashboardProgressBar"
);


if (dashboardGoalName) {

dashboardGoalName.textContent =
savingsGoal.name ||
"Set a savings goal";

}


if (dashboardGoalAmount) {

dashboardGoalAmount.textContent =
"Goal: " +
formatMoney(
savingsGoal.amount
);

}


if (dashboardGoalPercent) {

dashboardGoalPercent.textContent =
roundedPercent + "%";

}


if (dashboardSaved) {

dashboardSaved.textContent =
formatMoney(saved) +
" saved";

}


if (dashboardProgress) {

dashboardProgress.style.width =
roundedPercent + "%";

}


// Goals page

const goalDisplayName =
document.getElementById(
"goalDisplayName"
);


const goalTarget =
document.getElementById(
"goalTarget"
);


const goalPercent =
document.getElementById(
"goalPercent"
);


const goalSaved =
document.getElementById(
"goalSaved"
);


const goalProgress =
document.getElementById(
"goalProgressBar"
);


if (goalDisplayName) {

goalDisplayName.textContent =
savingsGoal.name ||
"No goal set";

}


if (goalTarget) {

goalTarget.textContent =
"Goal: " +
formatMoney(
savingsGoal.amount
);

}


if (goalPercent) {

goalPercent.textContent =
roundedPercent + "%";

}


if (goalSaved) {

goalSaved.textContent =
formatMoney(saved) +
" saved";

}


if (goalProgress) {

goalProgress.style.width =
roundedPercent + "%";

}

}


// ============================================================
// FORMAT MONEY
// ============================================================

function formatMoney(amount) {

return new Intl.NumberFormat(
"en-US",
{
style: "currency",
currency: "USD"
}
).format(
Number(amount) || 0
);

}


// ============================================================
// FORMAT DATE
// ============================================================

function formatDate(dateString) {

if (!dateString) {

return "";

}


const parts =
String(dateString).split("-");


if (parts.length !== 3) {

return dateString;

}


const year =
Number(parts[0]);


const month =
Number(parts[1]) - 1;


const day =
Number(parts[2]);


const date =
new Date(
year,
month,
day
);


if (
Number.isNaN(
date.getTime()
)
) {

return dateString;

}


return new Intl.DateTimeFormat(
"en-US",
{
month: "short",
day: "numeric",
year: "numeric"
}
).format(date);

}


// ============================================================
// ESCAPE HTML
// ============================================================

function escapeHTML(text) {

const div =
document.createElement("div");


div.textContent =
text == null
? ""
: String(text);


return div.innerHTML;

}


// ============================================================
// ESCAPE ATTRIBUTE
// ============================================================

function escapeAttribute(value) {

return String(value)
.replace(/&/g, "&amp;")
.replace(/"/g, "&quot;")
.replace(/</g, "&lt;")
.replace(/>/g, "&gt;");
}
