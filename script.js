// ==========================================
// FINANCIAL TRACKER
// ==========================================


// ---------- DEFAULT DATA ----------

let transactions = JSON.parse(
localStorage.getItem("transactions")
) || [
{
id: 1,
description: "Other",
amount: 0.99,
type: "expense",
category: "Other",
date: "2026-08-28"
},
{
id: 2,
description: "2 paychecks",
amount: 2000,
type: "income",
category: "Salary",
date: "2026-08-28"
},
{
id: 3,
description: "Transferred by nimo",
amount: 200,
type: "expense",
category: "Food",
date: "2026-08-27"
}
];


let goal = JSON.parse(
localStorage.getItem("savingsGoal")
) || {
name: "Save every paycheck",
target: 1000
};


// ---------- SAVE DATA ----------

function saveTransactions() {
localStorage.setItem(
"transactions",
JSON.stringify(transactions)
);
}


function saveGoal() {
localStorage.setItem(
"savingsGoal",
JSON.stringify(goal)
);
}


// ---------- PAGE NAVIGATION ----------

const navButtons = document.querySelectorAll(".nav-btn");

navButtons.forEach(function(button) {

button.addEventListener("click", function() {

const pageName = button.dataset.page;

showPage(pageName);

});

});


function showPage(pageName) {

document.querySelectorAll(".page").forEach(function(page) {
page.classList.remove("active-page");
});

const selectedPage = document.getElementById(pageName);

if (selectedPage) {
selectedPage.classList.add("active-page");
}


navButtons.forEach(function(button) {

button.classList.remove("active");

if (button.dataset.page === pageName) {
button.classList.add("active");
}

});


window.scrollTo({
top: 0,
behavior: "smooth"
});

}


// ---------- CALCULATE TOTALS ----------

function calculateTotals() {

let income = 0;
let expenses = 0;

transactions.forEach(function(transaction) {

if (transaction.type === "income") {
income += Number(transaction.amount);
} else {
expenses += Number(transaction.amount);
}

});

const balance = income - expenses;

return {
income,
expenses,
balance
};

}


// ---------- UPDATE DASHBOARD ----------

function updateDashboard() {

const totals = calculateTotals();

document.getElementById("balance").textContent =
formatMoney(totals.balance);

document.getElementById("income").textContent =
formatMoney(totals.income);

document.getElementById("expenses").textContent =
formatMoney(totals.expenses);

updateGoalDisplay();

renderRecentTransactions();

}


// ---------- MONEY FORMAT ----------

function formatMoney(amount) {

return new Intl.NumberFormat("en-US", {
style: "currency",
currency: "USD"
}).format(amount);

}


// ---------- DATE FORMAT ----------

function formatDate(dateString) {

const date = new Date(dateString + "T00:00:00");

return date.toLocaleDateString("en-US", {
month: "short",
day: "numeric",
year: "numeric"
});

}


// ---------- ICON ----------

function getIcon(transaction) {

if (transaction.type === "income") {
return "📈";
}

if (transaction.category === "Food") {
return "🍔";
}

if (transaction.category === "Shopping") {
return "🛍️";
}

if (transaction.category === "Transportation") {
return "🚗";
}

if (transaction.category === "Bills") {
return "🧾";
}

if (transaction.category === "Housing") {
return "🏠";
}

return "📉";

}


// ---------- TRANSACTION HTML ----------

function transactionHTML(transaction, showDelete = false) {

const isIncome = transaction.type === "income";

const sign = isIncome ? "+" : "-";

const iconClass = isIncome
? "income-icon"
: "expense-icon";

const amountClass = isIncome
? "income-amount"
: "expense-amount";


return `
<div class="transaction">

<div class="transaction-left">

<div class="transaction-icon ${iconClass}">
${getIcon(transaction)}
</div>

<div>
<h3>${escapeHTML(transaction.description)}</h3>

<p>
${escapeHTML(transaction.category)}
•
${formatDate(transaction.date)}
</p>
</div>

</div>

<div>
<span class="transaction-amount ${amountClass}">
${sign} ${formatMoney(Number(transaction.amount))}
</span>

${
showDelete
?
`<button
class="delete-btn"
onclick="deleteTransaction(${transaction.id})">
Delete
</button>`
:
""
}

</div>

</div>
`;

}


// ---------- RECENT TRANSACTIONS ----------

function renderRecentTransactions() {

const container =
document.getElementById("recentTransactions");

if (transactions.length === 0) {

container.innerHTML =
`<div class="empty">No transactions yet.</div>`;

return;
}


const recent = [...transactions]
.sort(function(a, b) {
return new Date(b.date) - new Date(a.date);
})
.slice(0, 5);


container.innerHTML = recent
.map(function(transaction) {
return transactionHTML(transaction, false);
})
.join("");

}


// ---------- ALL TRANSACTIONS ----------

function renderAllTransactions() {

const container =
document.getElementById("allTransactions");


if (transactions.length === 0) {

container.innerHTML =
`<div class="empty">No transactions yet.</div>`;

return;
}


const sorted = [...transactions]
.sort(function(a, b) {
return new Date(b.date) - new Date(a.date);
});


container.innerHTML = sorted
.map(function(transaction) {
return transactionHTML(transaction, true);
})
.join("");

}


// ---------- DELETE TRANSACTION ----------

function deleteTransaction(id) {

const transaction = transactions.find(function(item) {
return item.id === id;
});


if (!transaction) {
return;
}


const confirmed = confirm(
`Delete "${transaction.description}"?`
);


if (!confirmed) {
return;
}


transactions = transactions.filter(function(item) {
return item.id !== id;
});


saveTransactions();

updateDashboard();
renderAllTransactions();

}


// Make function available to HTML onclick
window.deleteTransaction = deleteTransaction;


// ---------- ADD TRANSACTION ----------

const transactionForm =
document.getElementById("transactionForm");


transactionForm.addEventListener("submit", function(event) {

event.preventDefault();


const description =
document.getElementById("description").value.trim();

const amount =
Number(document.getElementById("amount").value);

const type =
document.getElementById("type").value;

const category =
document.getElementById("category").value;

const date =
document.getElementById("date").value;


if (!description || amount <= 0 || !date) {

alert("Please fill in all fields correctly.");

return;
}


const newTransaction = {

id: Date.now(),

description: description,

amount: amount,

type: type,

category: category,

date: date

};


transactions.push(newTransaction);

saveTransactions();


transactionForm.reset();


document.getElementById("date").value =
getToday();


updateDashboard();

renderAllTransactions();


alert("Transaction added successfully!");


showPage("transactions");

});


// ---------- SAVINGS GOAL ----------

function updateGoalDisplay() {

const totals = calculateTotals();


// Amount saved is income minus expenses,
// but never show a negative savings amount.
const saved = Math.max(0, totals.balance);


let percent = 0;

if (goal.target > 0) {

percent =
Math.round((saved / goal.target) * 100);

}


percent = Math.min(percent, 100);


// Dashboard

document.getElementById("goalName").textContent =
goal.name;

document.getElementById("goalPercent").textContent =
percent + "%";

document.getElementById("goalProgress").style.width =
percent + "%";

document.getElementById("savedAmount").textContent =
formatMoney(saved) + " saved";

document.getElementById("goalAmount").textContent =
"Goal: " + formatMoney(goal.target);


// Savings page

document.getElementById("savingsGoalName").textContent =
goal.name;

document.getElementById("savingsPercent").textContent =
percent + "%";

document.getElementById("savingsProgress").style.width =
percent + "%";

document.getElementById("savingsSaved").textContent =
formatMoney(saved) + " saved";

document.getElementById("savingsTarget").textContent =
"Target: " + formatMoney(goal.target);

document.getElementById("savingsGoalDetails").textContent =
`${formatMoney(saved)} of ${formatMoney(goal.target)} saved.`;

}


// ---------- OPEN GOAL MODAL ----------

const goalModal =
document.getElementById("goalModal");


function openGoalModal() {

document.getElementById("goalTitle").value =
goal.name;

document.getElementById("goalTarget").value =
goal.target;

goalModal.classList.add("show");

}


// ---------- CLOSE GOAL MODAL ----------

function closeGoalModal() {

goalModal.classList.remove("show");

}


document
.getElementById("setGoalBtn")
.addEventListener("click", openGoalModal);


document
.getElementById("changeGoalBtn")
.addEventListener("click", openGoalModal);


document
.getElementById("closeModal")
.addEventListener("click", closeGoalModal);


// Close when clicking outside modal

goalModal.addEventListener("click", function(event) {

if (event.target === goalModal) {
closeGoalModal();
}

});


// ---------- SAVE GOAL ----------

document
.getElementById("saveGoalBtn")
.addEventListener("click", function() {

const name =
document.getElementById("goalTitle")
.value
.trim();

const target =
Number(
document.getElementById("goalTarget").value
);


if (!name) {

alert("Please enter a goal name.");

return;
}


if (!target || target <= 0) {

alert("Please enter a valid target amount.");

return;
}


goal = {
name: name,
target: target
};


saveGoal();

updateGoalDisplay();

closeGoalModal();


alert("Savings goal saved successfully!");

});


// ---------- VIEW ALL ----------

document
.getElementById("viewAllBtn")
.addEventListener("click", function() {

renderAllTransactions();

showPage("transactions");

});


// ---------- TODAY ----------

function getToday() {

const today = new Date();

const year = today.getFullYear();

const month =
String(today.getMonth() + 1).padStart(2, "0");

const day =
String(today.getDate()).padStart(2, "0");

return `${year}-${month}-${day}`;

}


// ---------- SECURITY ----------

function escapeHTML(text) {

return String(text)
.replace(/&/g, "&amp;")
.replace(/</g, "&lt;")
.replace(/>/g, "&gt;")
.replace(/"/g, "&quot;")
.replace(/'/g, "&#039;");

}


// ---------- START APP ----------

document.getElementById("date").value =
getToday();

updateDashboard();

renderAllTransactions();
