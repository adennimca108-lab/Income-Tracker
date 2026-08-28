"use strict";


// ========================================
// DATA
// ========================================

let transactions = [];

let savingsGoal = {
name: "",
target: 0
};


// ========================================
// LOAD DATA
// ========================================

function loadData() {

try {

const savedTransactions =
localStorage.getItem("financialTransactions");

if (savedTransactions) {

const parsed =
JSON.parse(savedTransactions);

if (Array.isArray(parsed)) {

transactions = parsed;

}

}


const savedGoal =
localStorage.getItem("financialSavingsGoal");

if (savedGoal) {

const parsedGoal =
JSON.parse(savedGoal);

if (parsedGoal) {

savingsGoal = parsedGoal;

}

}

} catch (error) {

console.error("Could not load data:", error);

}

}


// ========================================
// SAVE DATA
// ========================================

function saveTransactions() {

localStorage.setItem(
"financialTransactions",
JSON.stringify(transactions)
);

}


function saveGoal() {

localStorage.setItem(
"financialSavingsGoal",
JSON.stringify(savingsGoal)
);

}


// ========================================
// MONEY
// ========================================

function formatMoney(amount) {

return new Intl.NumberFormat(
"en-US",
{
style: "currency",
currency: "USD"
}
).format(Number(amount) || 0);

}


// ========================================
// NAVIGATION
// ========================================

function setupNavigation() {

const buttons =
document.querySelectorAll(".nav-btn");


buttons.forEach(function(button) {

button.addEventListener("click", function() {

const sectionId =
button.dataset.section;

showSection(sectionId);

});

});


const goalButton =
document.getElementById(
"dashboardGoalButton"
);


if (goalButton) {

goalButton.addEventListener(
"click",
function() {

showSection("goals");

}
);

}


const viewAllButton =
document.getElementById(
"viewAllButton"
);


if (viewAllButton) {

viewAllButton.addEventListener(
"click",
function() {

showSection("transactions");

}
);

}

}


function showSection(sectionId) {

document
.querySelectorAll(".section")
.forEach(function(section) {

section.classList.remove("active");

});


const selected =
document.getElementById(sectionId);


if (!selected) {

return;

}


selected.classList.add("active");


document
.querySelectorAll(".nav-btn")
.forEach(function(button) {

button.classList.remove("active");

});


const activeButton =
document.querySelector(
`.nav-btn[data-section="${sectionId}"]`
);


if (activeButton) {

activeButton.classList.add("active");

}


window.scrollTo({
top: 0,
behavior: "smooth"
});

}


// ========================================
// TOTALS
// ========================================

function getIncome() {

return transactions.reduce(
function(total, transaction) {

if (transaction.type === "income") {

return total + Number(transaction.amount);

}

return total;

},
0
);

}


function getExpenses() {

return transactions.reduce(
function(total, transaction) {

if (transaction.type === "expense") {

return total + Number(transaction.amount);

}

return total;

},
0
);

}


function getBalance() {

return getIncome() - getExpenses();

}


// ========================================
// DASHBOARD
// ========================================

function updateDashboard() {

const income =
getIncome();

const expenses =
getExpenses();

const balance =
getBalance();


document.getElementById(
"totalIncome"
).textContent =
formatMoney(income);


document.getElementById(
"totalExpenses"
).textContent =
formatMoney(expenses);


document.getElementById(
"balance"
).textContent =
formatMoney(balance);

}


// ========================================
// ADD TRANSACTION
// ========================================

function setupTransactionForm() {

const button =
document.getElementById(
"addTransactionButton"
);


button.addEventListener(
"click",
addTransaction
);

}


function addTransaction() {

const nameInput =
document.getElementById(
"transactionName"
);

const amountInput =
document.getElementById(
"transactionAmount"
);

const typeInput =
document.getElementById(
"transactionType"
);

const categoryInput =
document.getElementById(
"transactionCategory"
);


const name =
nameInput.value.trim();

const amount =
Number(amountInput.value);

const type =
typeInput.value;

const category =
categoryInput.value;


if (!name) {

alert(
"Please enter a transaction name."
);

return;

}


if (
!Number.isFinite(amount) ||
amount <= 0
) {

alert(
"Please enter a valid amount."
);

return;

}


const transaction = {

id:
Date.now().toString() +
Math.random()
.toString(36)
.substring(2, 8),

name: name,

amount: amount,

type: type,

category: category,

date:
new Date().toLocaleDateString(
"en-US",
{
month: "short",
day: "numeric",
year: "numeric"
}
)

};


transactions.unshift(transaction);


saveTransactions();


nameInput.value = "";

amountInput.value = "";


updateApp();


alert(
"Transaction added successfully! 💰"
);

}


// ========================================
// DELETE ONE TRANSACTION
// ========================================

function deleteTransaction(id) {

const transaction =
transactions.find(function(item) {

return String(item.id) === String(id);

});


if (!transaction) {

alert(
"Transaction could not be found."
);

return;

}


const confirmed =
window.confirm(
`Delete "${transaction.name}"?`
);


if (!confirmed) {

return;

}


// THIS REMOVES ONLY THE SELECTED ITEM.
transactions =
transactions.filter(function(item) {

return String(item.id) !== String(id);

});


saveTransactions();


updateApp();

}


// ========================================
// DISPLAY TRANSACTIONS
// ========================================

function displayTransactions() {

const all =
document.getElementById(
"allTransactions"
);

const recent =
document.getElementById(
"recentTransactions"
);


if (transactions.length === 0) {

all.innerHTML = `
<div class="empty">
No transactions yet.
</div>
`;


recent.innerHTML = `
<div class="empty">
No transactions yet.
</div>
`;


return;

}


all.innerHTML =
transactions
.map(function(transaction) {

return transactionHTML(
transaction,
true
);

})
.join("");


recent.innerHTML =
transactions
.slice(0, 5)
.map(function(transaction) {

return transactionHTML(
transaction,
false
);

})
.join("");


// Add Delete listeners AFTER
// creating the buttons.

all
.querySelectorAll(".delete-btn")
.forEach(function(button) {

button.addEventListener(
"click",
function() {

const id =
button.dataset.id;

deleteTransaction(id);

}
);

});

}


// ========================================
// TRANSACTION HTML
// ========================================

function transactionHTML(
transaction,
showDelete
) {

const income =
transaction.type === "income";


const icon =
income ? "📈" : "📉";


const sign =
income ? "+" : "-";


const amountClass =
income ? "income" : "expense";


const iconClass =
income
? "income-icon"
: "expense-icon";


let deleteButton = "";


if (showDelete) {

deleteButton = `

<button
class="delete-btn"
data-id="${escapeHTML(transaction.id)}"
type="button">

Delete

</button>

`;

}


return `

<div class="transaction">

<div class="transaction-left">

<div class="
transaction-icon
${iconClass}
">

${icon}

</div>


<div>

<div class="transaction-name">

${escapeHTML(
transaction.name
)}

</div>


<div class="transaction-meta">

${escapeHTML(
transaction.category
)}

•

${escapeHTML(
transaction.date
)}

</div>

</div>

</div>


<div class="
transaction-amount
${amountClass}
">

${sign}
${formatMoney(
transaction.amount
)}

</div>


${deleteButton}

</div>

`;

}


// ========================================
// SAVINGS GOAL
// ========================================

function setupGoalForm() {

const saveButton =
document.getElementById(
"saveGoalButton"
);


const deleteButton =
document.getElementById(
"deleteGoalButton"
);


saveButton.addEventListener(
"click",
saveSavingsGoal
);


deleteButton.addEventListener(
"click",
deleteSavingsGoal
);

}


function saveSavingsGoal() {

const name =
document
.getElementById(
"goalInputName"
)
.value
.trim();


const target =
Number(
document.getElementById(
"goalInputAmount"
).value
);


if (!name) {

alert(
"Please enter a goal name."
);

return;

}


if (
!Number.isFinite(target) ||
target <= 0
) {

alert(
"Please enter a valid target amount."
);

return;

}


savingsGoal = {

name: name,

target: target

};


saveGoal();


document.getElementById(
"goalInputName"
).value = "";


document.getElementById(
"goalInputAmount"
).value = "";


updateApp();


alert(
"Savings goal saved! 🎯"
);

}


function deleteSavingsGoal() {

if (!savingsGoal.name) {

alert(
"There is no savings goal."
);

return;

}


const confirmed =
window.confirm(
"Delete your savings goal?"
);


if (!confirmed) {

return;

}


savingsGoal = {

name: "",

target: 0

};


saveGoal();


updateApp();

}


// ========================================
// UPDATE GOAL
// ========================================

function updateGoal() {

const target =
Number(savingsGoal.target) || 0;


// Balance is used as the current
// amount available toward the goal.
const saved =
Math.max(getBalance(), 0);


let percentage = 0;


if (target > 0) {

percentage =
Math.round(
(saved / target) * 100
);

}


percentage =
Math.min(
Math.max(percentage, 0),
100
);


document.getElementById(
"goalName"
).textContent =
savingsGoal.name ||
"No savings goal yet";


document.getElementById(
"goalPercent"
).textContent =
percentage + "%";


document.getElementById(
"goalProgress"
).style.width =
percentage + "%";


document.getElementById(
"savedAmount"
).textContent =
formatMoney(saved) +
" saved";


document.getElementById(
"targetAmount"
).textContent =
"Goal: " +
formatMoney(target);


const currentGoal =
document.getElementById(
"currentGoal"
);


if (!savingsGoal.name) {

currentGoal.innerHTML = `

<div class="empty">

No savings goal has been
created yet.

</div>

`;

return;

}


currentGoal.innerHTML = `

<h2>
${escapeHTML(
savingsGoal.name
)}
</h2>

<p style="margin:15px 0;color:#728391;">

${formatMoney(saved)}
saved out of
${formatMoney(target)}

</p>

<div class="progress-container">

<div
class="progress-bar"
style="width:${percentage}%">
</div>

</div>

<p style="margin-top:15px;">

${percentage}% complete

</p>

`;

}


// ========================================
// ESCAPE HTML
// ========================================

function escapeHTML(value) {

return String(value)

.replace(/&/g, "&amp;")

.replace(/</g, "&lt;")

.replace(/>/g, "&gt;")

.replace(/"/g, "&quot;")

.replace(/'/g, "&#039;");

}


// ========================================
// UPDATE EVERYTHING
// ========================================

function updateApp() {

updateDashboard();

updateGoal();

displayTransactions();

}


// ========================================
// START
// ========================================

document.addEventListener(
"DOMContentLoaded",
function() {

loadData();

setupNavigation();

setupTransactionForm();

setupGoalForm();

updateApp();

}
);
