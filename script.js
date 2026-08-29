/* ==========================================
MONEY TRACKER
LOCAL STORAGE
CHARTS
PAYMENT TOTALS
========================================== */


/* ==========================================
STORAGE
========================================== */

const TRANSACTIONS_STORAGE =
"moneyTrackerTransactions";

const GOAL_STORAGE =
"moneyTrackerGoal";

const PAYMENTS_STORAGE =
"moneyTrackerPayments";


/* ==========================================
DATA
========================================== */

let transactions = [];

let payments = [];

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

setupPaymentForm();

setupClearButton();

setupDashboardButtons();

setupReportButtons();

setToday();

setPaymentDate();

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


const savedPayments =
localStorage.getItem(
PAYMENTS_STORAGE
);


if (savedPayments) {

const parsedPayments =
JSON.parse(
savedPayments
);


if (Array.isArray(parsedPayments)) {
payments = parsedPayments;
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

payments = [];

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


function savePayments() {

localStorage.setItem(
PAYMENTS_STORAGE,
JSON.stringify(payments)
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


if (!incomeButton || !expenseButton) {
return;
}


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


const hidden =
document.getElementById(
"transactionType"
);


if (hidden) {
hidden.value = type;
}


const incomeButton =
document.getElementById(
"incomeTypeButton"
);


const expenseButton =
document.getElementById(
"expenseTypeButton"
);


if (!incomeButton || !expenseButton) {
return;
}


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

function getTodayString() {

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


return (
year +
"-" +
month +
"-" +
day
);

}


function setToday() {

const input =
document.getElementById(
"transactionDate"
);


if (!input) {
return;
}


input.value =
getTodayString();

}


function setPaymentDate() {

const input =
document.getElementById(
"paymentDueDate"
);


if (!input) {
return;
}


input.value =
getTodayString();

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


transactions.unshift(
transaction
);


saveTransactions();

updateApp();


document.getElementById(
"transactionName"
).value = "";


document.getElementById(
"transactionAmount"
).value = "";


setToday();


alert(
"Transaction added successfully!"
);


showPage(
"dashboardPage"
);

}


/* ==========================================
CALCULATE TOTALS
========================================== */

function calculateTotals(
transactionList = transactions
) {

let income = 0;

let expenses = 0;


transactionList.forEach(
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

updateCharts();

updateRecentTransactions();

updateAllTransactions();

updateGoal();

updatePayments();

updateDashboardPayments();

updatePaymentTotals();

}


/* ==========================================
DASHBOARD
========================================== */

function updateDashboard() {

const totals =
calculateTotals();


const income =
document.getElementById(
"totalIncome"
);


const expenses =
document.getElementById(
"totalExpenses"
);


const balance =
document.getElementById(
"balance"
);


if (income) {

income.textContent =
money(
totals.income
);

}


if (expenses) {

expenses.textContent =
money(
totals.expenses
);

}


if (balance) {

balance.textContent =
money(
totals.balance
);

}

}


/* ==========================================
INCOME VS EXPENSE CHART
========================================== */

function updateCharts() {

updateIncomeExpenseChart();

updateCategoryChart();

}


function updateIncomeExpenseChart() {

const totals =
calculateTotals();


const income =
totals.income;


const expenses =
totals.expenses;


const maximum =
Math.max(
income,
expenses,
1
);


const incomeHeight =
Math.min(
100,
(income / maximum) * 100
);


const expenseHeight =
Math.min(
100,
(expenses / maximum) * 100
);


const incomeBar =
document.getElementById(
"incomeBar"
);


const expenseBar =
document.getElementById(
"expenseBar"
);


const incomeValue =
document.getElementById(
"incomeBarValue"
);


const expenseValue =
document.getElementById(
"expenseBarValue"
);


const chartIncomeTotal =
document.getElementById(
"chartIncomeTotal"
);


const chartExpenseTotal =
document.getElementById(
"chartExpenseTotal"
);


if (incomeBar) {

incomeBar.style.height =
incomeHeight + "%";

}


if (expenseBar) {

expenseBar.style.height =
expenseHeight + "%";

}


if (incomeValue) {

incomeValue.textContent =
moneyShort(income);

}


if (expenseValue) {

expenseValue.textContent =
moneyShort(expenses);

}


if (chartIncomeTotal) {

chartIncomeTotal.textContent =
money(income);

}


if (chartExpenseTotal) {

chartExpenseTotal.textContent =
money(expenses);

}

}


/* ==========================================
CATEGORY CHART
========================================== */

function updateCategoryChart() {

const categoryChart =
document.getElementById(
"categoryChart"
);


const legend =
document.getElementById(
"categoryLegend"
);


if (!categoryChart || !legend) {
return;
}


const categoryData =
categoryTotals(
transactions,
"expense"
);


const entries =
Object.entries(
categoryData
)
.filter(
function (entry) {

return entry[1] > 0;

}
)
.sort(
function (a, b) {

return b[1] - a[1];

}
);


if (entries.length === 0) {

categoryChart.style.background =
"#edf1f1";


legend.innerHTML = `
<div class="empty-state">
No expenses yet.
</div>
`;

return;

}


const total =
entries.reduce(
function (sum, entry) {

return sum + entry[1];

},
0
);


const chartColors = [

"#287d6d",
"#c84d4d",
"#356aa0",
"#b8860b",
"#7455a6",
"#6a8f9b",
"#d06b43",
"#557c55",
"#8a5a83",
"#777777"

];


let currentAngle = 0;

const segments = [];


entries.forEach(
function (entry, index) {

const percentage =
(entry[1] / total) * 100;


const start =
currentAngle;


const end =
currentAngle +
percentage;


segments.push(
chartColors[
index % chartColors.length
] +
" " +
start +
"% " +
end +
"%"
);


currentAngle = end;

}
);


categoryChart.style.background =
"conic-gradient(" +
segments.join(",") +
")";


legend.innerHTML =
entries
.map(
function (entry, index) {

const category =
entry[0];


const amount =
entry[1];


const color =
chartColors[
index %
chartColors.length
];


return `

<div class="legend-item">

<span
class="legend-dot"
style="background:${color}"
></span>

<span class="legend-name">
${escapeHTML(category)}
</span>

<span class="legend-value">
${money(amount)}
</span>

</div>

`;

}
)
.join("");

}


/* ==========================================
RECENT TRANSACTIONS
========================================== */

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


if (!container) {
return;
}


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
Math.round(
percent
);


const dashboardGoalName =
document.getElementById(
"dashboardGoalName"
);


const dashboardGoalPercent =
document.getElementById(
"dashboardGoalPercent"
);


const dashboardSaved =
document.getElementById(
"dashboardSaved"
);


const dashboardGoalAmount =
document.getElementById(
"dashboardGoalAmount"
);


const dashboardProgress =
document.getElementById(
"dashboardProgressBar"
);


if (dashboardGoalName) {

dashboardGoalName.textContent =
savingsGoal.name ||
"No goal set";

}


if (dashboardGoalPercent) {

dashboardGoalPercent.textContent =
rounded + "%";

}


if (dashboardSaved) {

dashboardSaved.textContent =
money(saved) +
" saved";

}


if (dashboardGoalAmount) {

dashboardGoalAmount.textContent =
"Goal: " +
money(
savingsGoal.amount
);

}


if (dashboardProgress) {

dashboardProgress.style.width =
rounded + "%";

}


const goalDisplayName =
document.getElementById(
"goalDisplayName"
);


const goalPercent =
document.getElementById(
"goalPercent"
);


const goalSaved =
document.getElementById(
"goalSaved"
);


const goalTarget =
document.getElementById(
"goalTarget"
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


if (goalPercent) {

goalPercent.textContent =
rounded + "%";

}


if (goalSaved) {

goalSaved.textContent =
money(saved) +
" saved";

}


if (goalTarget) {

goalTarget.textContent =
"Goal: " +
money(
savingsGoal.amount
);

}


if (goalProgress) {

goalProgress.style.width =
rounded + "%";

}


const goalName =
document.getElementById(
"goalName"
);


const goalAmount =
document.getElementById(
"goalAmount"
);


if (goalName) {

goalName.value =
savingsGoal.name;

}


if (goalAmount) {

goalAmount.value =
savingsGoal.amount ||
"";

}

}


/* ==========================================
PAYMENT FORM
========================================== */

function setupPaymentForm() {

const form =
document.getElementById(
"paymentForm"
);


if (!form) {
return;
}


form.addEventListener(
"submit",
function (event) {

event.preventDefault();

addPayment();

}
);

}


/* ==========================================
ADD PAYMENT
========================================== */

function addPayment() {

const name =
document.getElementById(
"paymentName"
).value.trim();


const amount =
Number(
document.getElementById(
"paymentAmount"
).value
);


const dueDate =
document.getElementById(
"paymentDueDate"
).value;


const category =
document.getElementById(
"paymentCategory"
).value;


const recurring =
document.getElementById(
"paymentRecurring"
).value;


if (!name) {

alert(
"Please enter a payment name."
);

return;

}


if (
!Number.isFinite(amount) ||
amount <= 0
) {

alert(
"Please enter a valid payment amount."
);

return;

}


if (!dueDate) {

alert(
"Please select a due date."
);

return;

}


const payment = {

id:
Date.now().toString() +
Math.random()
.toString(16)
.slice(2),

name: name,

amount:
Math.round(
amount * 100
) / 100,

dueDate: dueDate,

category: category,

recurring: recurring,

status: "upcoming"

};


payments.push(
payment
);


savePayments();

updateApp();


document.getElementById(
"paymentName"
).value = "";


document.getElementById(
"paymentAmount"
).value = "";


setPaymentDate();


alert(
"Payment added successfully!"
);

}


/* ==========================================
PAYMENT STATUS
========================================== */

function getPaymentStatus(payment) {

if (
payment.status === "paid"
) {

return "paid";

}


const today =
getTodayString();


if (
payment.dueDate <
today
) {

return "overdue";

}


return "upcoming";

}


/* ==========================================
PAYMENT TOTALS
========================================== */

function calculatePaymentTotals() {

let upcomingTotal = 0;

let recurringTotal = 0;


payments.forEach(
function (payment) {

const status =
getPaymentStatus(
payment
);


const amount =
Number(
payment.amount
) || 0;


/*
Upcoming total includes
unpaid payments only.
*/

if (
status !== "paid"
) {

upcomingTotal += amount;

}


/*
Recurring total includes
unpaid recurring payments.
*/

if (
payment.recurring !==
"none" &&
status !== "paid"
) {

recurringTotal += amount;

}

}
);


return {

upcoming:
Math.round(
upcomingTotal * 100
) / 100,

recurring:
Math.round(
recurringTotal * 100
) / 100

};

}


function updatePaymentTotals() {

const totals =
calculatePaymentTotals();


const dashboardUpcoming =
document.getElementById(
"totalUpcomingPayments"
);


const dashboardRecurring =
document.getElementById(
"totalRecurringPayments"
);


const pageUpcoming =
document.getElementById(
"paymentsPageTotal"
);


const pageRecurring =
document.getElementById(
"paymentsPageRecurring"
);


if (dashboardUpcoming) {

dashboardUpcoming.textContent =
money(
totals.upcoming
);

}


if (dashboardRecurring) {

dashboardRecurring.textContent =
money(
totals.recurring
);

}


if (pageUpcoming) {

pageUpcoming.textContent =
money(
totals.upcoming
);

}


if (pageRecurring) {

pageRecurring.textContent =
money(
totals.recurring
);

}

}


/* ==========================================
PAYMENT DISPLAY
========================================== */

function updatePayments() {

const container =
document.getElementById(
"paymentsList"
);


if (!container) {
return;
}


if (
payments.length === 0
) {

container.innerHTML = `
<div class="empty-state">
No scheduled payments yet.<br>
Add your first bill above.
</div>
`;

return;

}


const sorted =
[...payments].sort(
function (a, b) {

return String(
a.dueDate
).localeCompare(
String(
b.dueDate
)
);

}
);


container.innerHTML =
sorted
.map(
function (payment) {

return paymentHTML(
payment
);

}
)
.join("");

}


function paymentHTML(
payment
) {

const status =
getPaymentStatus(
payment
);


const recurringText =
payment.recurring ===
"none"

? "One-time"

: capitalize(
payment.recurring
);


return `

<div class="payment-row">

<div class="payment-left">

<div class="payment-icon">
🧾
</div>


<div>

<div class="payment-name">
${escapeHTML(
payment.name
)}
</div>


<div class="payment-details">

${escapeHTML(
payment.category
)}

•

Due
${formatDate(
payment.dueDate
)}

•

${recurringText}

</div>

</div>

</div>


<div class="payment-right">

<div class="payment-amount">
${money(
payment.amount
)}
</div>


<span class="
status
${status}
">
${capitalize(
status
)}
</span>


<div class="payment-actions">

${
status !== "paid"

? `
<button
type="button"
class="small-action paid-button"
data-paid-id="${escapeAttribute(
payment.id
)}"
>
Paid
</button>
`

: ""
}


<button
type="button"
class="small-action remove-button"
data-remove-payment-id="${escapeAttribute(
payment.id
)}"
>
Delete
</button>

</div>

</div>

</div>

`;

}


/* ==========================================
PAYMENT CLICK ACTIONS
========================================== */

document.addEventListener(
"click",
function (event) {

const paidButton =
event.target.closest(
"[data-paid-id]"
);


if (paidButton) {

markPaymentPaid(
paidButton.getAttribute(
"data-paid-id"
)
);

return;

}


const removeButton =
event.target.closest(
"[data-remove-payment-id]"
);


if (removeButton) {

deletePayment(
removeButton.getAttribute(
"data-remove-payment-id"
)
);

}

}
);


/* ==========================================
MARK PAYMENT PAID
========================================== */

function markPaymentPaid(id) {

const payment =
payments.find(
function (item) {

return String(
item.id
) === String(id);

}
);


if (!payment) {
return;
}


payment.status =
"paid";


savePayments();

updateApp();


/*
If recurring,
create next payment.
*/

if (
payment.recurring !==
"none"
) {

const nextDate =
getNextRecurringDate(
payment.dueDate,
payment.recurring
);


const nextPayment = {

id:
Date.now().toString() +
Math.random()
.toString(16)
.slice(2),

name:
payment.name,

amount:
payment.amount,

dueDate:
nextDate,

category:
payment.category,

recurring:
payment.recurring,

status:
"upcoming"

};


payments.push(
nextPayment
);


savePayments();

updateApp();

}


alert(
"Payment marked as paid."
);

}


/* ==========================================
NEXT RECURRING DATE
========================================== */

function getNextRecurringDate(
dateString,
recurring
) {

const parts =
String(
dateString
).split("-");


if (
parts.length !== 3
) {

return getTodayString();

}


const date =
new Date(
Number(parts[0]),
Number(parts[1]) - 1,
Number(parts[2])
);


if (
recurring === "weekly"
) {

date.setDate(
date.getDate() + 7
);

}


if (
recurring === "monthly"
) {

date.setMonth(
date.getMonth() + 1
);

}


if (
recurring === "yearly"
) {

date.setFullYear(
date.getFullYear() + 1
);

}


return localDateString(
date
);

}


/* ==========================================
DELETE PAYMENT
========================================== */

function deletePayment(id) {

const payment =
payments.find(
function (item) {

return String(
item.id
) === String(id);

}
);


if (!payment) {
return;
}


const confirmed =
confirm(
'Delete "' +
payment.name +
'"?'
);


if (!confirmed) {
return;
}


payments =
payments.filter(
function (item) {

return String(
item.id
) !== String(id);

}
);


savePayments();

updateApp();

}


/* ==========================================
DASHBOARD UPCOMING PAYMENTS
========================================== */

function updateDashboardPayments() {

const container =
document.getElementById(
"dashboardUpcoming"
);


if (!container) {
return;
}


const upcoming =
payments
.filter(
function (payment) {

return (
getPaymentStatus(
payment
) !== "paid"
);

}
)
.sort(
function (a, b) {

return String(
a.dueDate
).localeCompare(
String(
b.dueDate
)
);

}
)
.slice(
0,
3
);


if (
upcoming.length === 0
) {

container.innerHTML = `
<div class="empty-state">
No upcoming payments.
</div>
`;

return;

}


container.innerHTML =
upcoming
.map(
function (payment) {

return paymentHTML(
payment
);

}
)
.join("");

}


/* ==========================================
DASHBOARD BUTTONS
========================================== */

function setupDashboardButtons() {

const viewAll =
document.getElementById(
"dashboardViewAll"
);


if (viewAll) {

viewAll.addEventListener(
"click",
function () {

showPage(
"transactionsPage"
);

}
);

}


const goalButton =
document.getElementById(
"dashboardGoalButton"
);


if (goalButton) {

goalButton.addEventListener(
"click",
function () {

showPage(
"goalsPage"
);

}
);

}


const paymentsButton =
document.getElementById(
"dashboardPaymentsButton"
);


if (paymentsButton) {

paymentsButton.addEventListener(
"click",
function () {

showPage(
"paymentsPage"
);

}
);

}

}


/* ==========================================
REPORT BUTTONS
========================================== */

function setupReportButtons() {

const generateButton =
document.getElementById(
"generateReportButton"
);


const printButton =
document.getElementById(
"printReportButton"
);


if (generateButton) {

generateButton.addEventListener(
"click",
generateReport
);

}


if (printButton) {

printButton.addEventListener(
"click",
function () {

const report =
document.getElementById(
"reportContainer"
);


if (
!report ||
!report.classList.contains(
"visible"
)
) {

alert(
"Generate a report first."
);

return;

}


window.print();

}
);

}


setDefaultReportDates();

}


/* ==========================================
DEFAULT REPORT DATES
========================================== */

function setDefaultReportDates() {

const start =
document.getElementById(
"reportStartDate"
);


const end =
document.getElementById(
"reportEndDate"
);


if (!start || !end) {
return;
}


const today =
new Date();


const firstDay =
new Date(
today.getFullYear(),
today.getMonth(),
1
);


start.value =
localDateString(
firstDay
);


end.value =
localDateString(
today
);

}


/* ==========================================
GENERATE REPORT
========================================== */

function generateReport() {

const startDate =
document.getElementById(
"reportStartDate"
).value;


const endDate =
document.getElementById(
"reportEndDate"
).value;


if (
!startDate ||
!endDate
) {

alert(
"Please select a start and end date."
);

return;

}


if (
startDate >
endDate
) {

alert(
"Start date cannot be after end date."
);

return;

}


const filteredTransactions =
transactions.filter(
function (transaction) {

return (
transaction.date >=
startDate &&
transaction.date <=
endDate
);

}
);


const totals =
calculateTotals(
filteredTransactions
);


const filteredPayments =
payments.filter(
function (payment) {

return (
payment.dueDate >=
startDate &&
payment.dueDate <=
endDate
);

}
);


const incomeByCategory =
categoryTotals(
filteredTransactions,
"income"
);


const expenseByCategory =
categoryTotals(
filteredTransactions,
"expense"
);


const report =
document.getElementById(
"reportContainer"
);


if (!report) {
return;
}


report.innerHTML = `

<div class="report-header">

<h3>
Money Tracker Report
</h3>

<p>
${formatDate(startDate)}
-
${formatDate(endDate)}
</p>

</div>


<div class="report-summary">

<div class="report-stat income">

<span>
Total Income
</span>

<strong>
${money(
totals.income
)}
</strong>

</div>


<div class="report-stat expense">

<span>
Total Expenses
</span>

<strong>
${money(
totals.expenses
)}
</strong>

</div>


<div class="report-stat">

<span>
Net Balance
</span>

<strong>
${money(
totals.balance
)}
</strong>

</div>


<div class="report-stat">

<span>
Transactions
</span>

<strong>
${filteredTransactions.length}
</strong>

</div>

</div>


<div class="report-section">

<h4>
Income by Category
</h4>

${
categoryHTML(
incomeByCategory
)
}

</div>


<div class="report-section">

<h4>
Expenses by Category
</h4>

${
categoryHTML(
expenseByCategory
)
}

</div>


<div class="report-section">

<h4>
Payments in Period
</h4>

${
paymentReportHTML(
filteredPayments
)
}

</div>


<div class="report-section">

<h4>
Savings Goal
</h4>

<div class="report-line">

<span>
${escapeHTML(
savingsGoal.name ||
"No goal set"
)}
</span>

<span>
${
savingsGoal.amount > 0
? money(
savingsGoal.amount
)
: "$0.00"
}
</span>

</div>

</div>


<div class="report-section">

<h4>
Transactions
</h4>

${
transactionReportHTML(
filteredTransactions
)
}

</div>

`;


report.classList.add(
"visible"
);

}


/* ==========================================
CATEGORY TOTALS
========================================== */

function categoryTotals(
list,
type
) {

const result = {};


list.forEach(
function (transaction) {

if (
String(
transaction.type
).toLowerCase() !==
type
) {

return;

}


const category =
transaction.category ||
"Other";


if (!result[category]) {
result[category] = 0;
}


result[category] +=
Number(
transaction.amount
) || 0;

}
);


return result;

}


function categoryHTML(
categories
) {

const keys =
Object.keys(
categories
);


if (
keys.length === 0
) {

return `
<div class="empty-state">
No data for this period.
</div>
`;

}


return keys
.sort(
function (a, b) {

return (
categories[b] -
categories[a]
);

}
)
.map(
function (category) {

return `

<div class="report-line">

<span>
${escapeHTML(
category
)}
</span>

<span>
${money(
categories[category]
)}
</span>

</div>

`;

}
)
.join("");

}


/* ==========================================
PAYMENT REPORT
========================================== */

function paymentReportHTML(
list
) {

if (
list.length === 0
) {

return `
<div class="empty-state">
No payments in this period.
</div>
`;

}


return list
.sort(
function (a, b) {

return String(
a.dueDate
).localeCompare(
String(
b.dueDate
)
);

}
)
.map(
function (payment) {

return `

<div class="report-line">

<span>

${escapeHTML(
payment.name
)}

-

${capitalize(
getPaymentStatus(
payment
)
)}

</span>

<span>
${money(
payment.amount
)}
</span>

</div>

`;

}
)
.join("");

}


/* ==========================================
TRANSACTION REPORT
========================================== */

function transactionReportHTML(
list
) {

if (
list.length === 0
) {

return `
<div class="empty-state">
No transactions in this period.
</div>
`;

}


return list
.map(
function (transaction) {

const isIncome =
String(
transaction.type
).toLowerCase() ===
"income";


return `

<div class="report-line">

<span>

${escapeHTML(
transaction.name
)}

<br>

${formatDate(
transaction.date
)}

</span>

<span>

${
isIncome
? "+"
: "-"
}

${money(
transaction.amount
)}

</span>

</div>

`;

}
)
.join("");

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


function moneyShort(value) {

const number =
Number(value) || 0;


if (
number >= 1000000
) {

return (
"$" +
(
number / 1000000
).toFixed(1) +
"M"
);

}


if (
number >= 1000
) {

return (
"$" +
(
number / 1000
).toFixed(1) +
"K"
);

}


return (
"$" +
Math.round(number)
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
String(
value
).split("-");


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


function localDateString(
date
) {

const year =
date.getFullYear();


const month =
String(
date.getMonth() + 1
).padStart(
2,
"0"
);


const day =
String(
date.getDate()
).padStart(
2,
"0"
);


return (
year +
"-" +
month +
"-" +
day
);

}


/* ==========================================
HELPERS
========================================== */

function capitalize(value) {

if (!value) {
return "";
}


return (
String(value)
.charAt(0)
.toUpperCase() +
String(value)
.slice(1)
);

}


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


function escapeAttribute(
value
) {

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
