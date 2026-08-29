/* ==========================================
MONEY TRACKER
GITHUB ONLY
LOCAL STORAGE
========================================== */


/* ==========================================
STORAGE
========================================== */

const TRANSACTIONS_STORAGE =
"moneyTrackerTransactions";

const GOAL_STORAGE =
"moneyTrackerGoal";


/* ==========================================
DATA
========================================== */

let transactions = [];

let savingsGoal = {
name: "",
amount: 0
};

let currentType = "income";


/* ==========================================
START
========================================== */

document.addEventListener(
"DOMContentLoaded",
function () {

loadData();

setupNavigation();

setupTransactionForm();

setupTypeButtons();

setupGoalForm();

setupClearButton();

setupDashboardButtons();

setToday();

updateApp();

showPage("dashboardPage");

}
);


/* ==========================================
LOAD DATA
========================================== */

function loadData() {

try {

const savedTransactions =
localStorage.getItem(
TRANSACTIONS_STORAGE
);


if (savedTransactions) {

const parsed =
JSON.parse(
savedTransactions
);


if (Array.isArray(parsed)) {

transactions = parsed;

}

}


const savedGoal =
localStorage.getItem(
GOAL_STORAGE
);


if (savedGoal) {

const parsedGoal =
JSON.parse(
savedGoal
);


if (parsedGoal) {

savingsGoal = {

name:
parsedGoal.name || "",

amount:
Number(
parsedGoal.amount
) || 0

};

}

}

} catch (error) {

console.error(
"Loading error:",
error
);

transactions = [];

savingsGoal = {
name: "",
amount: 0
};

}

}


/* ==========================================
SAVE DATA
========================================== */

function saveTransactions() {

localStorage.setItem(
TRANSACTIONS_STORAGE,
JSON.stringify(transactions)
);

}


function saveGoal() {

localStorage.setItem(
GOAL_STORAGE,
JSON.stringify(savingsGoal)
);

}


/* ==========================================
NAVIGATION
========================================== */

function setupNavigation() {

const buttons =
document.querySelectorAll(
".bottom-nav-button"
);


buttons.forEach(
function (button) {

button.addEventListener(
"click",
function () {

const page =
button.getAttribute(
"data-page"
);


showPage(page);

}
);

}
);

}


function showPage(pageId) {

const pages =
document.querySelectorAll(
".page"
);


pages.forEach(
function (page) {

page.classList.remove(
"active"
);

}
);


const selected =
document.getElementById(
pageId
);


if (selected) {

selected.classList.add(
"active"
);

}


const buttons =
document.querySelectorAll(
".bottom-nav-button"
);


buttons.forEach(
function (button) {

button.classList.remove(
"active"
);

}
);


const activeButton =
document.querySelector(
'[data-page="' +
pageId +
'"]'
);


if (activeButton) {

activeButton.classList.add(
"active"
);

}


window.scrollTo({
top: 0,
behavior: "smooth"
});

}


/* ==========================================
TYPE BUTTONS
========================================== */

function setupTypeButtons() {

const incomeButton =
document.getElementById(
"incomeTypeButton"
);


const expenseButton =
document.getElementById(
"expenseTypeButton"
);


incomeButton.addEventListener(
"click",
function () {

setTransactionType(
"income"
);

}
);


expenseButton.addEventListener(
"click",
function () {

setTransactionType(
"expense"
);

}
);

}


function setTransactionType(type) {

currentType = type;


document.getElementById(
"transactionType"
).value = type;


const incomeButton =
document.getElementById(
"incomeTypeButton"
);


const expenseButton =
document.getElementById(
"expenseTypeButton"
);


incomeButton.classList.remove(
"selected-income"
);


expenseButton.classList.remove(
"selected-expense"
);


if (type === "income") {

incomeButton.classList.add(
"selected-income"
);

} else {

expenseButton.classList.add(
"selected-expense"
);

}

}


/* ==========================================
TODAY
========================================== */

function setToday() {

const input =
document.getElementById(
"transactionDate"
);


if (!input) {
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


input.value =
year +
"-" +
month +
"-" +
day;

}


/* ==========================================
TRANSACTION FORM
========================================== */

function setupTransactionForm() {

const form =
document.getElementById(
"transactionForm"
);


if (!form) {

console.error(
"Transaction form missing."
);

return;

}


form.addEventListener(
"submit",
function (event) {

event.preventDefault();


addTransaction();

}
);

}


/* ==========================================
ADD TRANSACTION
========================================== */

function addTransaction() {

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


const amount =
Number(
document.getElementById(
"transactionAmount"
).value
);


const date =
document.getElementById(
"transactionDate"
).value;


/* VALIDATION */

if (!name) {

alert(
"Please enter a description."
);

return;

}


if (
!Number.isFinite(amount) ||
amount <= 0
) {

alert(
"Please enter an amount greater than $0."
);

return;

}


if (!date) {

alert(
"Please select a date."
);

return;

}


/* CREATE */

const transaction = {

id:
Date.now().toString() +
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

date: date

};


/* ADD */

transactions.unshift(
transaction
);


/* SAVE */

saveTransactions();


/* UPDATE */

updateApp();


/* RESET */

document.getElementById(
"transactionName"
).value = "";


document.getElementById(
"transactionAmount"
).value = "";


setToday();


/* SUCCESS */

alert(
"Transaction added successfully!"
);


/* GO HOME */

showPage(
"dashboardPage"
);

}


/* ==========================================
CALCULATE TOTALS
========================================== */

function calculateTotals() {

let income = 0;

let expenses = 0;


transactions.forEach(
function (transaction) {

const amount =
Number(
transaction.amount
) || 0;


if (
String(
transaction.type
).toLowerCase() ===
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


/* ==========================================
UPDATE EVERYTHING
========================================== */

function updateApp() {

updateDashboard();

updateRecentTransactions();

updateAllTransactions();

updateGoal();

}


/* ==========================================
DASHBOARD
========================================== */

function updateDashboard() {

const totals =
calculateTotals();


document.getElementById(
"totalIncome"
).textContent =
money(
totals.income
);


document.getElementById(
"totalExpenses"
).textContent =
money(
totals.expenses
);


document.getElementById(
"balance"
).textContent =
money(
totals.balance
);

}


/* ==========================================
RECENT TRANSACTIONS
========================================== */

function updateRecentTransactions() {

const container =
document.getElementById(
"recentTransactions"
);


if (
transactions.length === 0
) {

container.innerHTML = `
<div class="empty-state">
No transactions yet.<br>
Add your first transaction.
</div>
`;

return;

}


const recent =
transactions.slice(
0,
5
);


container.innerHTML =
recent
.map(
function (transaction) {

return transactionHTML(
transaction,
false
);

}
)
.join("");

}


/* ==========================================
ALL TRANSACTIONS
========================================== */

function updateAllTransactions() {

const container =
document.getElementById(
"allTransactions"
);


const count =
document.getElementById(
"transactionCount"
);


if (count) {

count.textContent =
transactions.length +
(
transactions.length === 1
? " transaction"
: " transactions"
);

}


if (
transactions.length === 0
) {

container.innerHTML = `
<div class="empty-state">
No transactions yet.<br>
Add your first transaction.
</div>
`;

return;

}


container.innerHTML =
transactions
.map(
function (transaction) {

return transactionHTML(
transaction,
true
);

}
)
.join("");

}


/* ==========================================
TRANSACTION HTML
========================================== */

function transactionHTML(
transaction,
showDelete
) {

const isIncome =
String(
transaction.type
).toLowerCase() ===
"income";


const icon =
isIncome
? "↑"
: "↓";


const sign =
isIncome
? "+"
: "-";


const amount =
money(
transaction.amount
);


const deleteButton =
showDelete
? `
<button
type="button"
class="delete-button"
data-delete-id="${escapeAttribute(
transaction.id
)}"
>
Delete
</button>
`
: "";


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

${formatDate(
transaction.date
)}

</div>

</div>

</div>


<div class="transaction-right">

<span class="
transaction-amount
${isIncome ? "income" : "expense"}
">

${sign}${amount}

</span>


${deleteButton}

</div>

</div>

`;

}


/* ==========================================
DELETE TRANSACTION
========================================== */

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


function deleteTransaction(id) {

const transaction =
transactions.find(
function (item) {

return String(
item.id
) === String(id);

}
);


if (!transaction) {
return;
}


const confirmed =
confirm(
'Delete "' +
transaction.name +
'"?'
);


if (!confirmed) {
return;
}


transactions =
transactions.filter(
function (item) {

return String(
item.id
) !== String(id);

}
);


saveTransactions();

updateApp();

}


/* ==========================================
CLEAR ALL
========================================== */

function setupClearButton() {

const button =
document.getElementById(
"clearAllButton"
);


button.addEventListener(
"click",
function () {

if (
transactions.length === 0
) {

alert(
"There are no transactions."
);

return;

}


const confirmed =
confirm(
"Delete all transactions?"
);


if (!confirmed) {
return;
}


transactions = [];


saveTransactions();

updateApp();


alert(
"All transactions deleted."
);

}
);

}


/* ==========================================
GOAL FORM
========================================== */

function setupGoalForm() {

const form =
document.getElementById(
"goalForm"
);


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

updateGoal();

alert(
"Savings goal saved!"
);

}
);

}


/* ==========================================
UPDATE GOAL
========================================== */

function updateGoal() {

const totals =
calculateTotals();


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
Math.max(
0,
Math.min(
100,
percent
)
);


const rounded =
Math.round(percent);


/* DASHBOARD */

document.getElementById(
"dashboardGoalName"
).textContent =
savingsGoal.name ||
"No goal set";


document.getElementById(
"dashboardGoalPercent"
).textContent =
rounded + "%";


document.getElementById(
"dashboardSaved"
).textContent =
money(saved) +
" saved";


document.getElementById(
"dashboardGoalAmount"
).textContent =
"Goal: " +
money(
savingsGoal.amount
);


document.getElementById(
"dashboardProgressBar"
).style.width =
rounded + "%";


/* GOALS PAGE */

document.getElementById(
"goalDisplayName"
).textContent =
savingsGoal.name ||
"No goal set";


document.getElementById(
"goalPercent"
).textContent =
rounded + "%";


document.getElementById(
"goalSaved"
).textContent =
money(saved) +
" saved";


document.getElementById(
"goalTarget"
).textContent =
"Goal: " +
money(
savingsGoal.amount
);


document.getElementById(
"goalProgressBar"
).style.width =
rounded + "%";


/* PUT CURRENT GOAL INTO FORM */

document.getElementById(
"goalName"
).value =
savingsGoal.name;


document.getElementById(
"goalAmount"
).value =
savingsGoal.amount || "";

}


/* ==========================================
DASHBOARD BUTTONS
========================================== */

function setupDashboardButtons() {

document.getElementById(
"dashboardViewAll"
).addEventListener(
"click",
function () {

showPage(
"transactionsPage"
);

}
);


document.getElementById(
"dashboardGoalButton"
).addEventListener(
"click",
function () {

showPage(
"goalsPage"
);

}
);

}


/* ==========================================
MONEY
========================================== */

function money(value) {

return new Intl.NumberFormat(
"en-US",
{
style: "currency",
currency: "USD"
}
).format(
Number(value) || 0
);

}


/* ==========================================
DATE
========================================== */

function formatDate(value) {

if (!value) {
return "";
}


const parts =
String(value).split("-");


if (
parts.length !== 3
) {

return value;

}


const date =
new Date(
Number(parts[0]),
Number(parts[1]) - 1,
Number(parts[2])
);


if (
Number.isNaN(
date.getTime()
)
) {

return value;

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


/* ==========================================
SECURITY HELPERS
========================================== */

function escapeHTML(value) {

const div =
document.createElement(
"div"
);


div.textContent =
value == null
? ""
: String(value);


return div.innerHTML;

}


function escapeAttribute(value) {

return String(value)
.replace(
/&/g,
"&amp;"
)
.replace(
/"/g,
"&quot;"
)
.replace(
/</g,
"&lt;"
)
.replace(
/>/g,
"&gt;"
);

}
