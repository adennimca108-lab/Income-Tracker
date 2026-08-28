// ========================================
// FINANCIAL TRACKER
// ========================================


// ========================================
// STORAGE
// ========================================

let transactions =
JSON.parse(localStorage.getItem("transactions")) || [];

let savingsGoal =
JSON.parse(localStorage.getItem("savingsGoal")) || {
name: "",
target: 0
};


// ========================================
// SAVE DATA
// ========================================

function saveTransactions() {

localStorage.setItem(
"transactions",
JSON.stringify(transactions)
);

}


function saveSavingsGoal() {

localStorage.setItem(
"savingsGoal",
JSON.stringify(savingsGoal)
);

}


// ========================================
// PAGE NAVIGATION
// ========================================

function showSection(sectionId) {

document.querySelectorAll(".section").forEach(function(section) {

section.classList.remove("active");

});


const selectedSection =
document.getElementById(sectionId);


if (selectedSection) {

selectedSection.classList.add("active");

}


document.querySelectorAll(".nav-btn").forEach(function(button) {

button.classList.remove("active");

});


const buttons =
document.querySelectorAll(".nav-btn");


if (sectionId === "dashboard" && buttons[0]) {
buttons[0].classList.add("active");
}


if (sectionId === "transactions" && buttons[1]) {
buttons[1].classList.add("active");
}


if (sectionId === "goals" && buttons[2]) {
buttons[2].classList.add("active");
}


window.scrollTo({
top: 0,
behavior: "smooth"
});

}


// ========================================
// FORMAT MONEY
// ========================================

function formatMoney(amount) {

return new Intl.NumberFormat("en-US", {

style: "currency",

currency: "USD"

}).format(Number(amount) || 0);

}


// ========================================
// PROTECT TEXT
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
// CALCULATE TOTALS
// ========================================

function getTotalIncome() {

return transactions

.filter(function(transaction) {

return transaction.type === "income";

})

.reduce(function(total, transaction) {

return total + Number(transaction.amount);

}, 0);

}


function getTotalExpenses() {

return transactions

.filter(function(transaction) {

return transaction.type === "expense";

})

.reduce(function(total, transaction) {

return total + Number(transaction.amount);

}, 0);

}


function getBalance() {

return getTotalIncome() - getTotalExpenses();

}


// ========================================
// UPDATE DASHBOARD
// ========================================

function updateDashboard() {

const income =
getTotalIncome();

const expenses =
getTotalExpenses();

const balance =
getBalance();


const incomeElement =
document.getElementById("totalIncome");

const expenseElement =
document.getElementById("totalExpenses");

const balanceElement =
document.getElementById("balance");


if (incomeElement) {

incomeElement.textContent =
formatMoney(income);

}


if (expenseElement) {

expenseElement.textContent =
formatMoney(expenses);

}


if (balanceElement) {

balanceElement.textContent =
formatMoney(balance);

}

}


// ========================================
// ADD TRANSACTION
// ========================================

function addTransaction() {

const nameElement =
document.getElementById("transactionName");

const amountElement =
document.getElementById("transactionAmount");

const typeElement =
document.getElementById("transactionType");

const categoryElement =
document.getElementById("transactionCategory");


const name =
nameElement.value.trim();

const amount =
Number(amountElement.value);

const type =
typeElement.value;

const category =
categoryElement.value;


if (name === "") {

alert("Please enter a transaction name.");

return;

}


if (!amount || amount <= 0) {

alert("Please enter a valid amount.");

return;

}


const transaction = {

id: Date.now(),

name: name,

amount: amount,

type: type,

category: category,

date: new Date().toLocaleDateString("en-US", {

month: "short",

day: "numeric",

year: "numeric"

})

};


transactions.unshift(transaction);


saveTransactions();


nameElement.value = "";

amountElement.value = "";


updateApp();


alert("Transaction added successfully! 💰");

}


// ========================================
// DELETE ONE TRANSACTION
// ========================================

function deleteTransaction(id) {

// Find ONLY the transaction that was clicked
const transaction =
transactions.find(function(item) {

return Number(item.id) === Number(id);

});


// If it doesn't exist, stop
if (!transaction) {

return;

}


// Ask before deleting
const confirmed =
confirm(
`Delete "${transaction.name}"?`
);


if (!confirmed) {

return;

}


// IMPORTANT:
// Remove ONLY the selected transaction.
// Every other transaction stays.
transactions =
transactions.filter(function(item) {

return Number(item.id) !== Number(id);

});


// Save the remaining transactions
saveTransactions();


// Refresh everything
updateApp();

}


// Make the function available to HTML buttons
window.deleteTransaction =
deleteTransaction;


// ========================================
// DISPLAY TRANSACTIONS
// ========================================

function displayTransactions() {

const allContainer =
document.getElementById("allTransactions");

const recentContainer =
document.getElementById("recentTransactions");


if (!allContainer || !recentContainer) {

return;

}


if (transactions.length === 0) {

allContainer.innerHTML = `
<div class="empty">
No transactions yet.
</div>
`;


recentContainer.innerHTML = `
<div class="empty">
No transactions yet.
</div>
`;


return;

}


// ALL TRANSACTIONS
allContainer.innerHTML =
transactions
.map(function(transaction) {

return createTransactionHTML(
transaction,
true
);

})
.join("");


// RECENT TRANSACTIONS
recentContainer.innerHTML =
transactions
.slice(0, 5)
.map(function(transaction) {

return createTransactionHTML(
transaction,
false
);

})
.join("");

}


// ========================================
// CREATE TRANSACTION HTML
// ========================================

function createTransactionHTML(
transaction,
showDelete
) {

const isIncome =
transaction.type === "income";


const icon =
isIncome ? "📈" : "📉";


const sign =
isIncome ? "+" : "-";


const amountClass =
isIncome ? "income" : "expense";


const iconClass =
isIncome
? "income-icon"
: "expense-icon";


let deleteButton = "";


if (showDelete) {

deleteButton = `

<button
class="delete-btn"
onclick="deleteTransaction(${transaction.id})">

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

${escapeHTML(transaction.name)}

</div>


<div class="transaction-meta">

${escapeHTML(transaction.category)}

•

${escapeHTML(transaction.date)}

</div>

</div>

</div>


<div
class="
transaction-amount
${amountClass}
"
>

${sign}
${formatMoney(transaction.amount)}

</div>


${deleteButton}

</div>

`;

}


// ========================================
// SAVINGS GOAL
// ========================================

function saveGoal() {

const nameElement =
document.getElementById("goalInputName");

const amountElement =
document.getElementById("goalInputAmount");


const name =
nameElement.value.trim();

const target =
Number(amountElement.value);


if (name === "") {

alert("Please enter a goal name.");

return;

}


if (!target || target <= 0) {

alert("Please enter a valid target amount.");

return;

}


savingsGoal = {

name: name,

target: target

};


saveSavingsGoal();


nameElement.value = "";

amountElement.value = "";


updateApp();


alert("Savings goal saved! 🎯");

}


// ========================================
// DELETE SAVINGS GOAL
// ========================================

function deleteGoal() {

if (!savingsGoal.name) {

alert("You don't have a savings goal.");

return;

}


const confirmed =
confirm("Delete your savings goal?");


if (!confirmed) {

return;

}


savingsGoal = {

name: "",

target: 0

};


saveSavingsGoal();


updateApp();

}


// ========================================
// UPDATE SAVINGS GOAL DISPLAY
// ========================================

function updateGoal() {

const saved =
Math.max(getBalance(), 0);


const target =
Number(savingsGoal.target) || 0;


let percentage = 0;


if (target > 0) {

percentage =
Math.round(
(saved / target) * 100
);

}


if (percentage > 100) {

percentage = 100;

}


const goalName =
savingsGoal.name ||
"No savings goal yet";


const goalNameElement =
document.getElementById("goalName");


const goalPercentElement =
document.getElementById("goalPercent");


const progressElement =
document.getElementById("goalProgress");


const savedElement =
document.getElementById("savedAmount");


const targetElement =
document.getElementById("targetAmount");


if (goalNameElement) {

goalNameElement.textContent =
goalName;

}


if (goalPercentElement) {

goalPercentElement.textContent =
percentage + "%";

}


if (progressElement) {

progressElement.style.width =
percentage + "%";

}


if (savedElement) {

savedElement.textContent =
formatMoney(saved) + " saved";

}


if (targetElement) {

targetElement.textContent =
"Goal: " + formatMoney(target);

}


const currentGoal =
document.getElementById("currentGoal");


if (currentGoal) {

if (!savingsGoal.name) {

currentGoal.innerHTML = `

<div class="empty">

No savings goal has been created yet.

</div>

`;

} else {

currentGoal.innerHTML = `

<h2>
${escapeHTML(savingsGoal.name)}
</h2>

<p style="margin:15px 0;">

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

}

}


// ========================================
// UPDATE ENTIRE APP
// ========================================

function updateApp() {

updateDashboard();

updateGoal();

displayTransactions();

}


// ========================================
// START APP
// ========================================

document.addEventListener(
"DOMContentLoaded",
function() {

updateApp();

}
);
