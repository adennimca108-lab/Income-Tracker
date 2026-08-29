// ============================================================
// FINANCIAL TRACKER - SUPABASE VERSION
// ============================================================

// ------------------------------------------------------------
// SUPABASE SETTINGS
// ------------------------------------------------------------

const SUPABASE_URL = "https://stzeslietxwblleglsob.supabase.co";

const SUPABASE_KEY =
"sb_publishable_GO4GdQMXfo61c8cS-oFr-g_Ka4-pRsC";

const TRANSACTIONS_URL =
SUPABASE_URL + "/rest/v1/transactions";

const GOALS_URL =
SUPABASE_URL + "/rest/v1/savings_goals";


// ------------------------------------------------------------
// SUPABASE REQUEST HELPER
// ------------------------------------------------------------

async function supabaseRequest(url, options = {}) {

const response = await fetch(url, {

...options,

headers: {

"apikey": SUPABASE_KEY,

"Authorization": "Bearer " + SUPABASE_KEY,

"Content-Type": "application/json",

"Prefer": options.method === "POST"
? "return=representation"
: options.method === "PATCH"
? "return=representation"
: options.method === "DELETE"
? "return=representation"
: "return=representation",

...(options.headers || {})
}

});


if (!response.ok) {

const errorText = await response.text();

console.error("Supabase error:", errorText);

throw new Error(errorText || "Supabase request failed");
}


const text = await response.text();

if (!text) {
return null;
}


try {

return JSON.parse(text);

} catch {

return text;

}

}


// ============================================================
// APP DATA
// ============================================================

let transactions = [];

let savingsGoal = {
name: "",
amount: 0
};


// ============================================================
// PAGE NAVIGATION
// ============================================================

function showPage(pageName) {

document.querySelectorAll(".page").forEach(function(page) {

page.classList.remove("active-page");

});


const selectedPage =
document.getElementById(pageName);


if (selectedPage) {

selectedPage.classList.add("active-page");

}


document.querySelectorAll(".nav-btn").forEach(function(button) {

button.classList.remove("active");

});


const activeButton =
document.querySelector(
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

const page =
button.getAttribute("data-page");

showPage(page);

});

});


// ============================================================
// LOAD TRANSACTIONS FROM SUPABASE
// ============================================================

async function loadTransactions() {

try {

const data = await supabaseRequest(

TRANSACTIONS_URL +
"?select=*&order=id.desc"

);


if (Array.isArray(data)) {

transactions = data;

} else {

transactions = [];

}


updateApp();

} catch (error) {

console.error(error);

alert(
"Could not load transactions from Supabase.\n\n" +
"Please check your Supabase table and permissions."
);

}

}


// ============================================================
// LOAD SAVINGS GOAL FROM SUPABASE
// ============================================================

async function loadSavingsGoal() {

try {

const data = await supabaseRequest(

GOALS_URL +
"?select=*&order=id.desc&limit=1"

);


if (Array.isArray(data) && data.length > 0) {

savingsGoal = {

name: data[0].name || "",

amount: Number(data[0].amount) || 0

};

} else {

savingsGoal = {
name: "",
amount: 0
};

}


updateGoalDisplay();

} catch (error) {

console.error(error);

// Don't stop the whole application if goals fail.

}

}


// ============================================================
// ADD TRANSACTION
// ============================================================

const transactionForm =
document.getElementById("transactionForm");


if (transactionForm) {

transactionForm.addEventListener(
"submit",
async function(event) {

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


const amount =
parseFloat(
document.getElementById(
"transactionAmount"
).value
);


if (!name) {

alert("Please enter a description.");

return;

}


if (!amount || amount <= 0) {

alert("Please enter a valid amount.");

return;

}


const newTransaction = {

type: type,

name: name,

category: category,

amount: amount,

date: new Date().toLocaleDateString(
"en-US",
{
month: "short",
day: "numeric",
year: "numeric"
}
)

};


try {

const result =
await supabaseRequest(
TRANSACTIONS_URL,
{
method: "POST",
body: JSON.stringify(
newTransaction
)
}
);


if (Array.isArray(result) && result.length > 0) {

transactions.unshift(result[0]);

} else {

await loadTransactions();

}


transactionForm.reset();

updateApp();

alert(
"Transaction added successfully!"
);


showPage("dashboard");


} catch (error) {

console.error(error);

alert(
"Could not add the transaction.\n\n" +
error.message
);

}

}
);

}


// ============================================================
// DELETE ONE TRANSACTION
// ============================================================
//
// IMPORTANT:
// This deletes ONLY the transaction whose ID is clicked.
// It does NOT delete all transactions.
// ============================================================

async function deleteTransaction(id) {

console.log("Deleting transaction ID:", id);


const transaction =
transactions.find(function(item) {

return String(item.id) === String(id);

});


if (!transaction) {

alert("Transaction not found.");

return;

}


const confirmed =
confirm(
'Delete "' +
transaction.name +
'" for ' +
formatMoney(
Number(transaction.amount)
) +
"?"
);


if (!confirmed) {

return;

}


try {

// IMPORTANT:
//
// The ?id=eq.ID part means:
// DELETE ONLY WHERE id equals this ID.
//
// It does NOT delete the whole table.

await supabaseRequest(

TRANSACTIONS_URL +
"?id=eq." +
encodeURIComponent(id),

{
method: "DELETE"
}

);


// Remove the same transaction from our local array.

transactions =
transactions.filter(function(item) {

return String(item.id) !== String(id);

});


updateApp();


alert("Transaction deleted.");


} catch (error) {

console.error(error);

alert(
"Could not delete this transaction.\n\n" +
error.message
);

}

}


// Make the function available to your HTML onclick buttons.

window.deleteTransaction = deleteTransaction;


// ============================================================
// CLEAR ALL TRANSACTIONS
// ============================================================
//
// This is the ONLY button that deletes everything.
// ============================================================

const clearAllBtn =
document.getElementById("clearAllBtn");


if (clearAllBtn) {

clearAllBtn.addEventListener(
"click",
async function() {

if (transactions.length === 0) {

alert(
"There are no transactions to clear."
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


try {

// Delete all rows.
//
// The neq filter makes the request valid
// while matching every existing ID.

await supabaseRequest(

TRANSACTIONS_URL +
"?id=neq.0",

{
method: "DELETE"
}

);


transactions = [];


updateApp();


alert(
"All transactions have been deleted."
);


} catch (error) {

console.error(error);

alert(
"Could not clear all transactions.\n\n" +
error.message
);

}

}
);

}


// ============================================================
// CALCULATE TOTALS
// ============================================================

function calculateTotals() {

let income = 0;

let expenses = 0;


transactions.forEach(function(transaction) {

const amount =
Number(transaction.amount) || 0;


if (transaction.type === "income") {

income += amount;

} else {

expenses += amount;

}

});


const balance =
income - expenses;


return {

income: income,

expenses: expenses,

balance: balance

};

}


// ============================================================
// UPDATE DASHBOARD
// ============================================================

function updateDashboard() {

const totals =
calculateTotals();


const totalIncome =
document.getElementById("totalIncome");


const totalExpenses =
document.getElementById("totalExpenses");


const balance =
document.getElementById("balance");


if (totalIncome) {

totalIncome.textContent =
formatMoney(totals.income);

}


if (totalExpenses) {

totalExpenses.textContent =
formatMoney(totals.expenses);

}


if (balance) {

balance.textContent =
formatMoney(totals.balance);

}


updateRecentTransactions();

updateGoalDisplay();

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
recent.map(function(transaction) {

return createTransactionHTML(
transaction,
false
);

}).join("");

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


if (transactions.length === 0) {

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
transactions.map(function(transaction) {

return createTransactionHTML(
transaction,
true
);

}).join("");

}


// ============================================================
// CREATE TRANSACTION HTML
// ============================================================

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


const deleteButton =
showDelete
? `

<button
class="delete-btn"
onclick="deleteTransaction('${String(
transaction.id
).replace(/'/g, "\\'")}')"
type="button"
>
Delete
</button>

`
: "";


return `

<div class="transaction">

<div class="transaction-left">

<div class="transaction-icon ${escapeHTML(
transaction.type
)}">

${icon}

</div>


<div>

<div class="transaction-name">

${escapeHTML(
transaction.name || ""
)}

</div>


<div class="transaction-details">

${escapeHTML(
transaction.category || ""
)}

•

${escapeHTML(
transaction.date || ""
)}

</div>

</div>

</div>


<div class="transaction-right">

<div class="transaction-amount ${escapeHTML(
transaction.type
)}">

${sign}

${formatMoney(
Number(transaction.amount) || 0
)}

</div>


${deleteButton}

</div>

</div>

`;

}


// ============================================================
// SAVINGS GOAL
// ============================================================

const goalForm =
document.getElementById("goalForm");


if (goalForm) {

goalForm.addEventListener(
"submit",
async function(event) {

event.preventDefault();


const name =
document.getElementById(
"goalName"
).value.trim();


const amount =
parseFloat(
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


if (!amount || amount <= 0) {

alert(
"Please enter a valid goal amount."
);

return;

}


try {

// Remove old goal first.
//
// This application is designed to have
// one active savings goal.

await supabaseRequest(

GOALS_URL +
"?id=neq.0",

{
method: "DELETE"
}

);


const newGoal = {

name: name,

amount: amount

};


const result =
await supabaseRequest(
GOALS_URL,
{
method: "POST",
body: JSON.stringify(
newGoal
)
}
);


if (
Array.isArray(result) &&
result.length > 0
) {

savingsGoal = {

name:
result[0].name || "",

amount:
Number(
result[0].amount
) || 0

};

} else {

savingsGoal =
newGoal;

}


updateGoalDisplay();


alert(
"Savings goal saved!"
);


} catch (error) {

console.error(error);

alert(
"Could not save the savings goal.\n\n" +
error.message
);

}

}
);

}


// ============================================================
// UPDATE SAVINGS GOAL DISPLAY
// ============================================================

function updateGoalDisplay() {

const totals =
calculateTotals();


const saved =
Math.max(
0,
totals.balance
);


let percent = 0;


if (savingsGoal.amount > 0) {

percent =
(saved / savingsGoal.amount) * 100;

}


percent =
Math.min(
100,
Math.max(0, percent)
);


const roundedPercent =
Math.round(percent);


// --------------------------------------------------------
// Goals page
// --------------------------------------------------------

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


const goalProgressBar =
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
roundedPercent + "%";

}


if (goalSaved) {

goalSaved.textContent =
formatMoney(saved) +
" saved";

}


if (goalTarget) {

goalTarget.textContent =
"Goal: " +
formatMoney(
savingsGoal.amount
);

}


if (goalProgressBar) {

goalProgressBar.style.width =
roundedPercent + "%";

}


// --------------------------------------------------------
// Dashboard
// --------------------------------------------------------

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


const dashboardProgressBar =
document.getElementById(
"dashboardProgressBar"
);


if (dashboardGoalName) {

dashboardGoalName.textContent =
savingsGoal.name ||
"Set a savings goal";

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


if (dashboardGoalAmount) {

dashboardGoalAmount.textContent =
"Goal: " +
formatMoney(
savingsGoal.amount
);

}


if (dashboardProgressBar) {

dashboardProgressBar.style.width =
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
// SECURITY / TEXT CLEANING
// ============================================================

function escapeHTML(text) {

const div =
document.createElement("div");


div.textContent =
text == null ? "" : String(text);


return div.innerHTML;

}


// ============================================================
// UPDATE EVERYTHING
// ============================================================

function updateApp() {

updateDashboard();

updateAllTransactions();

updateGoalDisplay();

}


// ============================================================
// START APPLICATION
// ============================================================

async function startApp() {

// Show dashboard immediately.

updateApp();

showPage("dashboard");


// Then load the real data from Supabase.

await loadTransactions();

await loadSavingsGoal();

updateApp();

}


// Start

startApp();
