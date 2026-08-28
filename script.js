// ================================
// FINANCIAL TRACKER
// ================================

// Get saved data
let transactions = JSON.parse(
localStorage.getItem("financialTransactions")
) || [];

let savingsGoal = JSON.parse(
localStorage.getItem("financialSavingsGoal")
) || {
name: "",
amount: 0
};


// ================================
// PAGE NAVIGATION
// ================================

function showPage(pageName) {

document.querySelectorAll(".page").forEach(function(page) {
page.classList.remove("active-page");
});

const selectedPage = document.getElementById(pageName);

if (selectedPage) {
selectedPage.classList.add("active-page");
}

document.querySelectorAll(".nav-btn").forEach(function(button) {
button.classList.remove("active");
});

const activeButton = document.querySelector(
'.nav-btn[data-page="' + pageName + '"]'
);

if (activeButton) {
activeButton.classList.add("active");
}

window.scrollTo({
top: 0,
behavior: "smooth"
});
}


// Make navigation buttons work
document.querySelectorAll(".nav-btn").forEach(function(button) {

button.addEventListener("click", function() {

const page = button.getAttribute("data-page");

showPage(page);

});

});


// ================================
// SAVE TRANSACTIONS
// ================================

function saveTransactions() {

localStorage.setItem(
"financialTransactions",
JSON.stringify(transactions)
);

}


// ================================
// ADD TRANSACTION
// ================================

const transactionForm = document.getElementById("transactionForm");

transactionForm.addEventListener("submit", function(event) {

event.preventDefault();

const type = document.getElementById("transactionType").value;

const name = document.getElementById("transactionName").value.trim();

const category =
document.getElementById("transactionCategory").value;

const amount =
parseFloat(document.getElementById("transactionAmount").value);


if (!name) {
alert("Please enter a description.");
return;
}

if (!amount || amount <= 0) {
alert("Please enter a valid amount.");
return;
}


const newTransaction = {

id: Date.now(),

type: type,

name: name,

category: category,

amount: amount,

date: new Date().toLocaleDateString("en-US", {
month: "short",
day: "numeric",
year: "numeric"
})

};


transactions.unshift(newTransaction);

saveTransactions();

transactionForm.reset();

updateApp();

alert("Transaction added successfully!");


// Go back to dashboard
showPage("dashboard");

});


// ================================
// DELETE ONE TRANSACTION
// ================================

function deleteTransaction(id) {

const transaction = transactions.find(function(item) {

return item.id === id;

});


if (!transaction) {
return;
}


const confirmed = confirm(
'Delete "' +
transaction.name +
'" for $' +
transaction.amount.toFixed(2) +
'?'
);


if (!confirmed) {
return;
}


// IMPORTANT:
// Only remove the transaction with this ID.
transactions = transactions.filter(function(item) {

return item.id !== id;

});


saveTransactions();

updateApp();

}


// ================================
// CLEAR ALL TRANSACTIONS
// ================================

document.getElementById("clearAllBtn").addEventListener(
"click",
function() {

if (transactions.length === 0) {

alert("There are no transactions to clear.");

return;
}


const confirmed = confirm(
"Are you sure you want to delete ALL transactions?"
);


if (!confirmed) {
return;
}


transactions = [];

saveTransactions();

updateApp();

}
);


// ================================
// CALCULATE TOTALS
// ================================

function calculateTotals() {

let income = 0;

let expenses = 0;


transactions.forEach(function(transaction) {

if (transaction.type === "income") {

income += transaction.amount;

} else {

expenses += transaction.amount;

}

});


const balance = income - expenses;


return {
income: income,
expenses: expenses,
balance: balance
};

}


// ================================
// UPDATE DASHBOARD
// ================================

function updateDashboard() {

const totals = calculateTotals();


document.getElementById("totalIncome").textContent =
formatMoney(totals.income);


document.getElementById("totalExpenses").textContent =
formatMoney(totals.expenses);


document.getElementById("balance").textContent =
formatMoney(totals.balance);


updateRecentTransactions();

updateGoalDisplay();

}


// ================================
// DISPLAY RECENT TRANSACTIONS
// ================================

function updateRecentTransactions() {

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


const recent = transactions.slice(0, 5);


container.innerHTML = recent.map(function(transaction) {

return createTransactionHTML(
transaction,
false
);

}).join("");

}


// ================================
// DISPLAY ALL TRANSACTIONS
// ================================

function updateAllTransactions() {

const container =
document.getElementById("allTransactions");


if (transactions.length === 0) {

container.innerHTML = `
<div class="empty">
No transactions yet.
Add your first transaction above.
</div>
`;

return;
}


container.innerHTML = transactions.map(function(transaction) {

return createTransactionHTML(
transaction,
true
);

}).join("");

}


// ================================
// TRANSACTION HTML
// ================================

function createTransactionHTML(transaction, showDelete) {

const isIncome = transaction.type === "income";

const icon = isIncome ? "📈" : "📉";

const sign = isIncome ? "+" : "-";

const deleteButton = showDelete
? `
<button
class="delete-btn"
onclick="deleteTransaction(${transaction.id})"
>
Delete
</button>
`
: "";


return `
<div class="transaction">

<div class="transaction-left">

<div class="transaction-icon ${transaction.type}">
${icon}
</div>

<div>

<div class="transaction-name">
${escapeHTML(transaction.name)}
</div>

<div class="transaction-details">
${escapeHTML(transaction.category)}
•
${escapeHTML(transaction.date)}
</div>

</div>

</div>


<div class="transaction-right">

<div class="transaction-amount ${transaction.type}">
${sign} ${formatMoney(transaction.amount)}
</div>

${deleteButton}

</div>

</div>
`;

}


// ================================
// SAVINGS GOAL
// ================================

const goalForm = document.getElementById("goalForm");

goalForm.addEventListener("submit", function(event) {

event.preventDefault();


const name =
document.getElementById("goalName").value.trim();


const amount =
parseFloat(document.getElementById("goalAmount").value);


if (!name) {

alert("Please enter a goal name.");

return;
}


if (!amount || amount <= 0) {

alert("Please enter a valid goal amount.");

return;
}


savingsGoal = {

name: name,

amount: amount

};


localStorage.setItem(
"financialSavingsGoal",
JSON.stringify(savingsGoal)
);


updateGoalDisplay();

alert("Savings goal saved!");

});


// ================================
// UPDATE SAVINGS GOAL
// ================================

function updateGoalDisplay() {

const totals = calculateTotals();


const saved = Math.max(
0,
totals.balance
);


let percent = 0;


if (savingsGoal.amount > 0) {

percent =
(saved / savingsGoal.amount) * 100;

}


// Never display more than 100%
percent = Math.min(
100,
Math.max(0, percent)
);


const roundedPercent =
Math.round(percent);


// Goals page
document.getElementById("goalDisplayName").textContent =
savingsGoal.name || "No goal set";


document.getElementById("goalPercent").textContent =
roundedPercent + "%";


document.getElementById("goalSaved").textContent =
formatMoney(saved) + " saved";


document.getElementById("goalTarget").textContent =
"Goal: " + formatMoney(savingsGoal.amount);


document.getElementById("goalProgressBar").style.width =
roundedPercent + "%";


// Dashboard
document.getElementById("dashboardGoalName").textContent =
savingsGoal.name || "Set a savings goal";


document.getElementById("dashboardGoalPercent").textContent =
roundedPercent + "%";


document.getElementById("dashboardSaved").textContent =
formatMoney(saved) + " saved";


document.getElementById("dashboardGoalAmount").textContent =
"Goal: " + formatMoney(savingsGoal.amount);


document.getElementById(
"dashboardProgressBar"
).style.width =
roundedPercent + "%";

}


// ================================
// FORMAT MONEY
// ================================

function formatMoney(amount) {

return new Intl.NumberFormat(
"en-US",
{
style: "currency",
currency: "USD"
}
).format(amount);

}


// ================================
// SECURITY / TEXT CLEANING
// ================================

function escapeHTML(text) {

const div = document.createElement("div");

div.textContent = text;

return div.innerHTML;

}


// ================================
// UPDATE EVERYTHING
// ================================

function updateApp() {

updateDashboard();

updateAllTransactions();

updateGoalDisplay();

}


// ================================
// START APP
// ================================

updateApp();

showPage("dashboard");
