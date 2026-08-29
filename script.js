// ============================================================
// FINANCIAL TRACKER - SUPABASE VERSION
// ============================================================

const SUPABASE_URL =
"https://stzeslietxwblleglsob.supabase.co";

const SUPABASE_KEY =
"sb_publishable_GO4GdQMXfo61c8cS-oFr-g_Ka4-pRsC";


// ============================================================
// SUPABASE CLIENT
// ============================================================

const supabaseClient =
window.supabase.createClient(
SUPABASE_URL,
SUPABASE_KEY
);


// ============================================================
// REST URLS
// ============================================================

const TRANSACTIONS_URL =
SUPABASE_URL + "/rest/v1/transactions";

const GOALS_URL =
SUPABASE_URL + "/rest/v1/savings_goals";


// ============================================================
// APP DATA
// ============================================================

let transactions = [];

let savingsGoal = {
name: "",
amount: 0
};


// ============================================================
// GET CURRENT USER
// ============================================================

async function getCurrentUser() {

const {
data,
error
} = await supabaseClient.auth.getUser();

if (error) {

console.error(
"Could not get current user:",
error
);

return null;
}

return data.user;
}


// ============================================================
// GET AUTH HEADERS
// ============================================================

async function getAuthHeaders() {

const {
data,
error
} = await supabaseClient.auth.getSession();

if (error) {

throw error;
}

const session =
data.session;

if (!session) {

throw new Error(
"You are not logged in. Please log in before using the Financial Tracker."
);
}

return {

"apikey":
SUPABASE_KEY,

"Authorization":
"Bearer " + session.access_token,

"Content-Type":
"application/json",

"Accept":
"application/json",

"Prefer":
"return=representation"

};
}


// ============================================================
// SUPABASE REQUEST
// ============================================================

async function supabaseRequest(
url,
options = {}
) {

const headers =
await getAuthHeaders();


const response =
await fetch(
url,
{

...options,

headers: {

...headers,

...(options.headers || {})

}

}
);


if (!response.ok) {

const errorText =
await response.text();

console.error(
"Supabase error:",
response.status,
errorText
);

throw new Error(
errorText ||
"Supabase request failed."
);

}


const text =
await response.text();


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
// START AFTER HTML IS LOADED
// ============================================================

document.addEventListener(
"DOMContentLoaded",
function () {

console.log(
"Financial Tracker JavaScript loaded."
);

setupNavigation();

setupTransactionForm();

setupClearAllButton();

setupGoalForm();

updateApp();

showPage("dashboard");

startApp();

}
);


// ============================================================
// NAVIGATION
// ============================================================

function setupNavigation() {

const buttons =
document.querySelectorAll(
".nav-btn"
);


console.log(
"Navigation buttons found:",
buttons.length
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


console.log(
"Opening page:",
page
);


showPage(page);

}
);

}
);

}


// ============================================================
// SHOW PAGE
// ============================================================

function showPage(pageName) {

console.log(
"showPage:",
pageName
);


const pages =
document.querySelectorAll(
".page"
);


pages.forEach(
function (page) {

page.classList.remove(
"active-page"
);

}
);


const selectedPage =
document.getElementById(
pageName
);


if (selectedPage) {

selectedPage.classList.add(
"active-page"
);

} else {

console.warn(
"Page not found:",
pageName
);

}


const buttons =
document.querySelectorAll(
".nav-btn"
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
'.nav-btn[data-page="' +
pageName +
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


// ============================================================
// LOAD TRANSACTIONS
// ============================================================

async function loadTransactions() {

console.log(
"Loading transactions..."
);


try {

const data =
await supabaseRequest(
TRANSACTIONS_URL +
"?select=*&order=id.desc"
);


console.log(
"Transactions received:",
data
);


if (Array.isArray(data)) {

transactions = data;

} else {

transactions = [];

}


updateApp();

} catch (error) {

console.error(
"Transaction loading error:",
error
);


transactions = [];

updateApp();


if (
error.message.includes(
"not logged in"
)
) {

alert(
"Please log in before loading your transactions."
);

} else {

alert(
"Could not load transactions from Supabase.\n\n" +
error.message
);

}

}

}


// ============================================================
// LOAD SAVINGS GOAL
// ============================================================

async function loadSavingsGoal() {

console.log(
"Loading savings goal..."
);


try {

const data =
await supabaseRequest(
GOALS_URL +
"?select=*&order=id.desc&limit=1"
);


console.log(
"Savings goal received:",
data
);


if (
Array.isArray(data) &&
data.length > 0
) {

savingsGoal = {

name:
data[0].name || "",

amount:
Number(
data[0].amount
) || 0

};

} else {

savingsGoal = {

name: "",

amount: 0

};

}


updateGoalDisplay();

} catch (error) {

console.error(
"Goal loading error:",
error
);

}

}


// ============================================================
// TRANSACTION FORM
// ============================================================

function setupTransactionForm() {

const form =
document.getElementById(
"transactionForm"
);


console.log(
"Transaction form:",
form
);


if (!form) {

console.warn(
"transactionForm was not found."
);

return;

}


form.addEventListener(
"submit",
async function (event) {

event.preventDefault();


const typeElement =
document.getElementById(
"transactionType"
);


const nameElement =
document.getElementById(
"transactionName"
);


const categoryElement =
document.getElementById(
"transactionCategory"
);


const amountElement =
document.getElementById(
"transactionAmount"
);


if (
!typeElement ||
!nameElement ||
!categoryElement ||
!amountElement
) {

alert(
"One or more transaction form fields are missing from the HTML."
);

console.error({

typeElement,
nameElement,
categoryElement,
amountElement

});

return;

}


const type =
typeElement.value;


const name =
nameElement.value.trim();


const category =
categoryElement.value;


const amount =
parseFloat(
amountElement.value
);


if (!name) {

alert(
"Please enter a description."
);

return;

}


if (
isNaN(amount) ||
amount <= 0
) {

alert(
"Please enter a valid amount."
);

return;

}


// ====================================================
// GET LOGGED-IN USER
// ====================================================

const user =
await getCurrentUser();


if (!user) {

alert(
"You are not logged in.\n\nPlease log in before adding a transaction."
);

return;

}


console.log(
"Current user:",
user.id
);


// ====================================================
// CREATE TRANSACTION
// ====================================================

const newTransaction = {

user_id:
user.id,

type:
type,

name:
name,

category:
category,

amount:
amount,

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


console.log(
"Adding transaction:",
newTransaction
);


try {

const result =
await supabaseRequest(
TRANSACTIONS_URL,
{

method:
"POST",

body:
JSON.stringify(
newTransaction
)

}
);


console.log(
"Transaction added:",
result
);


if (
Array.isArray(result) &&
result.length > 0
) {

transactions.unshift(
result[0]
);

} else {

await loadTransactions();

}


form.reset();


updateApp();


alert(
"Transaction added successfully!"
);


showPage(
"dashboard"
);


} catch (error) {

console.error(
"Add transaction error:",
error
);


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

async function deleteTransaction(id) {

console.log(
"Deleting transaction:",
id
);


const transaction =
transactions.find(
function (item) {

return String(
item.id
) ===
String(id);

}
);


if (!transaction) {

alert(
"Transaction not found."
);

return;

}


const confirmed =
confirm(
'Delete "' +
transaction.name +
'" for ' +
formatMoney(
Number(
transaction.amount
)
) +
"?"
);


if (!confirmed) {

return;

}


try {

await supabaseRequest(

TRANSACTIONS_URL +
"?id=eq." +
encodeURIComponent(id),

{

method:
"DELETE"

}

);


transactions =
transactions.filter(
function (item) {

return String(
item.id
) !==
String(id);

}
);


updateApp();


alert(
"Transaction deleted."
);


} catch (error) {

console.error(
"Delete error:",
error
);


alert(
"Could not delete this transaction.\n\n" +
error.message
);

}

}


// ============================================================
// MAKE AVAILABLE TO HTML ONCLICK
// ============================================================

window.deleteTransaction =
deleteTransaction;


// ============================================================
// CLEAR ALL TRANSACTIONS
// ============================================================

function setupClearAllButton() {

const button =
document.getElementById(
"clearAllBtn"
);


console.log(
"Clear button:",
button
);


if (!button) {

return;

}


button.addEventListener(
"click",
async function () {

if (
transactions.length === 0
) {

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

const user =
await getCurrentUser();


if (!user) {

alert(
"You are not logged in."
);

return;

}


await supabaseRequest(

TRANSACTIONS_URL +
"?user_id=eq." +
encodeURIComponent(
user.id
),

{

method:
"DELETE"

}

);


transactions = [];


updateApp();


alert(
"All your transactions have been deleted."
);


} catch (error) {

console.error(
"Clear all error:",
error
);


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

income:
income,

expenses:
expenses,

balance:
income - expenses

};

}


// ============================================================
// UPDATE DASHBOARD
// ============================================================

function updateDashboard() {

const totals =
calculateTotals();


const totalIncome =
document.getElementById(
"totalIncome"
);


const totalExpenses =
document.getElementById(
"totalExpenses"
);


const balance =
document.getElementById(
"balance"
);


if (totalIncome) {

totalIncome.textContent =
formatMoney(
totals.income
);

}


if (totalExpenses) {

totalExpenses.textContent =
formatMoney(
totals.expenses
);

}


if (balance) {

balance.textContent =
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

console.warn(
"recentTransactions element not found."
);

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
transactions.slice(
0,
5
);


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

console.warn(
"allTransactions element not found."
);

return;

}


console.log(
"Updating all transactions:",
transactions.length
);


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
String(
transaction.type
).toLowerCase() ===
"income";


const icon =
isIncome
? "📈"
: "📉";


const sign =
isIncome
? "+"
: "-";


let deleteButton = "";


if (showDelete) {

const safeId =
String(
transaction.id
).replace(
/'/g,
"\\'"
);


deleteButton = `

<button
class="delete-btn"
type="button"
onclick="deleteTransaction('${safeId}')"
>
Delete
</button>

`;

}


return `

<div class="transaction">

<div class="transaction-left">

<div class="transaction-icon ${
isIncome
? "income"
: "expense"
}">

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

<div class="transaction-amount ${
isIncome
? "income"
: "expense"
}">

${sign}

${formatMoney(
Number(
transaction.amount
) || 0
)}

</div>


${deleteButton}

</div>

</div>

`;

}


// ============================================================
// SAVINGS GOAL FORM
// ============================================================

function setupGoalForm() {

const form =
document.getElementById(
"goalForm"
);


console.log(
"Goal form:",
form
);


if (!form) {

return;

}


form.addEventListener(
"submit",
async function (event) {

event.preventDefault();


const nameElement =
document.getElementById(
"goalName"
);


const amountElement =
document.getElementById(
"goalAmount"
);


if (
!nameElement ||
!amountElement
) {

alert(
"Savings goal fields are missing from the HTML."
);

return;

}


const name =
nameElement.value.trim();


const amount =
parseFloat(
amountElement.value
);


if (!name) {

alert(
"Please enter a goal name."
);

return;

}


if (
isNaN(amount) ||
amount <= 0
) {

alert(
"Please enter a valid goal amount."
);

return;

}


try {

const user =
await getCurrentUser();


if (!user) {

alert(
"You are not logged in."
);

return;

}


// ====================================================
// DELETE ONLY THIS USER'S OLD GOALS
// ====================================================

await supabaseRequest(

GOALS_URL +
"?user_id=eq." +
encodeURIComponent(
user.id
),

{

method:
"DELETE"

}

);


// ====================================================
// CREATE NEW GOAL
// ====================================================

const newGoal = {

user_id:
user.id,

name:
name,

amount:
amount

};


const result =
await supabaseRequest(

GOALS_URL,

{

method:
"POST",

body:
JSON.stringify(
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

console.error(
"Goal save error:",
error
);


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
Math.round(
percent
);


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
roundedPercent +
"%";

}


if (goalSaved) {

goalSaved.textContent =
formatMoney(
saved
) +
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
roundedPercent +
"%";

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
roundedPercent +
"%";

}


if (dashboardSaved) {

dashboardSaved.textContent =
formatMoney(
saved
) +
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
roundedPercent +
"%";

}

}


// ============================================================
// FORMAT MONEY
// ============================================================

function formatMoney(amount) {

return new Intl.NumberFormat(
"en-US",
{

style:
"currency",

currency:
"USD"

}
).format(
Number(amount) || 0
);

}


// ============================================================
// ESCAPE HTML
// ============================================================

function escapeHTML(text) {

const div =
document.createElement(
"div"
);


div.textContent =
text == null
? ""
: String(text);


return div.innerHTML;

}


// ============================================================
// UPDATE EVERYTHING
// ============================================================

function updateApp() {

console.log(
"Updating application..."
);


updateDashboard();

updateAllTransactions();

updateGoalDisplay();

}


// ============================================================
// START APPLICATION
// ============================================================

async function startApp() {

console.log(
"Starting Financial Tracker..."
);


showPage(
"dashboard"
);


const user =
await getCurrentUser();


if (!user) {

console.warn(
"No authenticated Supabase user."
);

return;

}


console.log(
"Logged in user:",
user.id
);


await loadTransactions();

await loadSavingsGoal();


updateApp();


console.log(
"Financial Tracker ready."
);

}
