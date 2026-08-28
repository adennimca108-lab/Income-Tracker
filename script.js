/* =====================================================
FINANCIAL TRACKER
JAVASCRIPT
===================================================== */


/* =====================================================
APPLICATION DATA
===================================================== */

const defaultData = {

transactions: [],

goal: {

name: "",

target: 0

}

};


/* =====================================================
LOAD DATA FROM BROWSER
===================================================== */

function loadData() {

try {

const saved =
localStorage.getItem(
"financialTrackerData"
);


if (!saved) {

return {
...defaultData
};

}


return JSON.parse(saved);

}

catch (error) {

console.error(
"Could not load data:",
error
);

return {
...defaultData
};

}

}


let data = loadData();



/* =====================================================
SAVE DATA
===================================================== */

function saveData() {

localStorage.setItem(

"financialTrackerData",

JSON.stringify(data)

);

}



/* =====================================================
FORMAT MONEY
===================================================== */

function money(number) {

return new Intl.NumberFormat(
"en-US",
{
style: "currency",
currency: "USD"
}
).format(number);

}



/* =====================================================
GET TODAY
===================================================== */

function getToday() {

const date =
new Date();


return (

date.getFullYear()
+ "-"
+ String(
date.getMonth() + 1
).padStart(2, "0")
+ "-"
+ String(
date.getDate()
).padStart(2, "0")

);

}



/* =====================================================
PAGE NAVIGATION
===================================================== */

function showPage(pageId) {


/*
Hide every page
*/

document
.querySelectorAll(".page")
.forEach(page => {

page.classList.remove(
"active"
);

});


/*
Show selected page
*/

const page =
document.getElementById(
pageId
);


if (page) {

page.classList.add(
"active"
);

}


/*
Update navigation
*/

document
.querySelectorAll(".nav-button")
.forEach(button => {

button.classList.toggle(

"active",

button.dataset.page ===
pageId

);

});


window.scrollTo({

top: 0,

behavior: "smooth"

});

}



/* =====================================================
NAVIGATION BUTTONS
===================================================== */

document
.querySelectorAll(".nav-button")
.forEach(button => {

button.addEventListener(
"click",
() => {

showPage(
button.dataset.page
);

}
);

});



/* =====================================================
PAGE LINK BUTTONS
===================================================== */

document
.querySelectorAll("[data-page-link]")
.forEach(button => {

button.addEventListener(
"click",
() => {

showPage(
button.dataset.pageLink
);

}
);

});



/* =====================================================
CALCULATE FINANCES
===================================================== */

function calculateFinances() {

let income = 0;

let expenses = 0;


data.transactions.forEach(
transaction => {

if (
transaction.type ===
"income"
) {

income +=
transaction.amount;

}

else {

expenses +=
transaction.amount;

}

}
);


const balance =
income - expenses;


/*
For this version,
saved money is positive balance.
*/

const saved =
Math.max(
0,
balance
);


return {

income,

expenses,

balance,

saved

};

}



/* =====================================================
UPDATE SUMMARY CARDS
===================================================== */

function updateSummary() {

const finances =
calculateFinances();


document
.getElementById(
"totalBalance"
)
.textContent =
money(finances.balance);


document
.getElementById(
"totalIncome"
)
.textContent =
money(finances.income);


document
.getElementById(
"totalExpenses"
)
.textContent =
money(finances.expenses);


document
.getElementById(
"totalSaved"
)
.textContent =
money(finances.saved);

}



/* =====================================================
RENDER TRANSACTIONS
===================================================== */

function renderTransactions(
transactions =
data.transactions
) {

const container =
document.getElementById(
"transactionList"
);


if (
transactions.length === 0
) {

container.innerHTML = `

<p class="empty-message">

No transactions found.

</p>

`;

return;

}


/*
Sort newest first
*/

const sorted =
[...transactions].sort(
(a, b) =>
new Date(b.date)
-
new Date(a.date)
);


container.innerHTML =

sorted
.map(transaction => {

const isIncome =
transaction.type ===
"income";


return `

<div
class="transaction-item">

<div
class="transaction-icon
${transaction.type}">

${
isIncome
? "📈"
: "📉"
}

</div>


<div
class="transaction-info">

<strong>
${escapeHTML(
transaction.description
)}
</strong>

<small>

${transaction.category}

•
${formatDate(
transaction.date
)}

</small>

</div>


<div
class="transaction-amount
${transaction.type}">

${
isIncome
? "+"
: "-"
}

${money(
transaction.amount
)}

</div>


<button
class="delete-button"
data-delete-id="${transaction.id}"
title="Delete">

🗑️

</button>

</div>

`;

})
.join("");


/*
Add delete events
*/

container
.querySelectorAll(
"[data-delete-id]"
)
.forEach(button => {

button.addEventListener(
"click",
() => {

deleteTransaction(
button.dataset.deleteId
);

}
);

});

}



/* =====================================================
RECENT TRANSACTIONS
===================================================== */

function renderRecentTransactions() {

const container =
document.getElementById(
"recentTransactions"
);


if (
data.transactions.length === 0
) {

container.innerHTML = `

<p class="empty-message">

No transactions yet.
Add your first transaction.

</p>

`;

return;

}


const recent =
[...data.transactions]

.sort(
(a, b) =>
new Date(b.date)
-
new Date(a.date)
)

.slice(
0,
5
);


container.innerHTML =

recent
.map(transaction => {

const isIncome =
transaction.type ===
"income";


return `

<div
class="transaction-item">

<div
class="transaction-icon
${transaction.type}">

${
isIncome
? "📈"
: "📉"
}

</div>


<div
class="transaction-info">

<strong>

${escapeHTML(
transaction.description
)}

</strong>

<small>

${transaction.category}
•
${formatDate(
transaction.date
)}

</small>

</div>


<div
class="transaction-amount
${transaction.type}">

${
isIncome
? "+"
: "-"
}

${money(
transaction.amount
)}

</div>

</div>

`;

})
.join("");

}



/* =====================================================
ADD TRANSACTION MODAL
===================================================== */

const modal =
document.getElementById(
"transactionModal"
);


function openTransactionModal() {

modal.classList.remove(
"hidden"
);


/*
Set today's date
*/

document
.getElementById(
"transactionDate"
)
.value =
getToday();


/*
Reset form
*/

document
.getElementById(
"transactionForm"
)
.reset();


document
.getElementById(
"transactionDate"
)
.value =
getToday();


/*
Default type = income
*/

setTransactionType(
"income"
);

}



/* =====================================================
CLOSE MODAL
===================================================== */

function closeTransactionModal() {

modal.classList.add(
"hidden"
);

}


document
.getElementById(
"closeTransactionModal"
)
.addEventListener(
"click",
closeTransactionModal
);



/* =====================================================
OPEN MODAL BUTTONS
===================================================== */

document
.getElementById(
"dashboardAddButton"
)
.addEventListener(
"click",
openTransactionModal
);


document
.getElementById(
"transactionAddButton"
)
.addEventListener(
"click",
openTransactionModal
);



/* =====================================================
CLOSE MODAL WHEN CLICKING OUTSIDE
===================================================== */

modal.addEventListener(
"click",
event => {

if (
event.target === modal
) {

closeTransactionModal();

}

}
);



/* =====================================================
TRANSACTION TYPE
===================================================== */

function setTransactionType(
type
) {

document
.getElementById(
"transactionType"
)
.value =
type;


document
.querySelectorAll(
".type-button"
)
.forEach(button => {

button.classList.toggle(

"selected",

button.dataset.type ===
type

);

});


/*
Change category options
based on income/expense.
*/

updateCategoryOptions(
type
);

}



/* =====================================================
TYPE BUTTON EVENTS
===================================================== */

document
.querySelectorAll(
".type-button"
)
.forEach(button => {

button.addEventListener(
"click",
() => {

setTransactionType(
button.dataset.type
);

}
);

});



/* =====================================================
CATEGORY OPTIONS
===================================================== */

function updateCategoryOptions(
type
) {

const select =
document.getElementById(
"category"
);


if (
type === "income"
) {

select.innerHTML = `

<option value="Salary">
Salary
</option>

<option value="Business">
Business
</option>

<option value="Freelance">
Freelance
</option>

<option value="Investment">
Investment
</option>

<option value="Gift">
Gift
</option>

<option value="Other">
Other
</option>

`;

}

else {

select.innerHTML = `

<option value="Food">
Food
</option>

<option value="Housing">
Housing
</option>

<option value="Transportation">
Transportation
</option>

<option value="Shopping">
Shopping
</option>

<option value="Entertainment">
Entertainment
</option>

<option value="Bills">
Bills
</option>

<option value="Health">
Health
</option>

<option value="Other">
Other
</option>

`;

}

}



/* =====================================================
ADD TRANSACTION
===================================================== */

document
.getElementById(
"transactionForm"
)
.addEventListener(
"submit",
event => {

event.preventDefault();


const type =
document
.getElementById(
"transactionType"
)
.value;


const amount =
Number(
document
.getElementById(
"amount"
)
.value
);


const description =
document
.getElementById(
"description"
)
.value
.trim();


const category =
document
.getElementById(
"category"
)
.value;


const date =
document
.getElementById(
"transactionDate"
)
.value;


/*
Validate
*/

if (
amount <= 0 ||
!description ||
!date
) {

showToast(
"Please complete all fields."
);

return;

}


/*
Create transaction
*/

const transaction = {

id:
Date.now().toString(),

type,

amount,

description,

category,

date

};


/*
Add to beginning
*/

data.transactions.unshift(
transaction
);


/*
Save
*/

saveData();


/*
Close modal
*/

closeTransactionModal();


/*
Update application
*/

updateEverything();


/*
Notification
*/

showToast(

type === "income"

? "Income added! 📈"

: "Expense added! 📉"

);


/*
Reset form
*/

document
.getElementById(
"transactionForm"
)
.reset();


setTransactionType(
"income"
);

}
);



/* =====================================================
DELETE TRANSACTION
===================================================== */

function deleteTransaction(
id
) {

const confirmed =
confirm(
"Delete this transaction?"
);


if (!confirmed) {

return;

}


data.transactions =
data.transactions.filter(
transaction =>
transaction.id !== id
);


saveData();


updateEverything();


showToast(
"Transaction deleted."
);

}



/* =====================================================
SEARCH + FILTER
===================================================== */

function filterTransactions() {

const search =
document
.getElementById(
"searchInput"
)
.value
.toLowerCase()
.trim();


const type =
document
.getElementById(
"typeFilter"
)
.value;


const category =
document
.getElementById(
"categoryFilter"
)
.value;


const filtered =
data.transactions.filter(
transaction => {


const matchesSearch =

transaction.description
.toLowerCase()
.includes(search)

||

transaction.category
.toLowerCase()
.includes(search);


const matchesType =

type === "all"

||

transaction.type ===
type;


const matchesCategory =

category === "all"

||

transaction.category ===
category;


return (

matchesSearch &&
matchesType &&
matchesCategory

);

}
);


renderTransactions(
filtered
);

}



/* =====================================================
FILTER EVENTS
===================================================== */

document
.getElementById(
"searchInput"
)
.addEventListener(
"input",
filterTransactions
);


document
.getElementById(
"typeFilter"
)
.addEventListener(
"change",
filterTransactions
);


document
.getElementById(
"categoryFilter"
)
.addEventListener(
"change",
filterTransactions
);



/* =====================================================
CATEGORY SPENDING CHART
===================================================== */

function renderCategoryChart() {

const container =
document.getElementById(
"categoryChart"
);


const expenses =
data.transactions.filter(
transaction =>
transaction.type ===
"expense"
);


if (
expenses.length === 0
) {

container.innerHTML = `

<p class="empty-message">

Add expenses to see
your spending.

</p>

`;

return;

}


/*
Group expenses
by category.
*/

const categories = {};


expenses.forEach(
transaction => {

if (
!categories[
transaction.category
]
) {

categories[
transaction.category
] = 0;

}


categories[
transaction.category
] +=
transaction.amount;

}
);


const sorted =
Object.entries(
categories
).sort(
(a, b) =>
b[1] - a[1]
);


const highest =
sorted[0][1];


container.innerHTML =

sorted
.map(
([category, amount]) => {

const percentage =
(
amount /
highest
) * 100;


return `

<div
class="category-row">

<div
class="category-name">

${category}

</div>


<div
class="category-track">

<div
class="category-fill"
style="
width:
${percentage}%
">
</div>

</div>


<div
class="category-amount">

${money(
amount
)}

</div>

</div>

`;

}
)
.join("");

}



/* =====================================================
SAVINGS GOAL
===================================================== */

function calculateGoalProgress() {

if (
!data.goal ||
!data.goal.target ||
data.goal.target <= 0
) {

return 0;

}


const finances =
calculateFinances();


return Math.min(

100,

Math.round(

(
finances.saved /
data.goal.target
) * 100

)

);

}



/* =====================================================
UPDATE GOAL
===================================================== */

function updateGoalDisplay() {

const percentage =
calculateGoalProgress();


const saved =
calculateFinances().saved;


const target =
Number(
data.goal.target || 0
);


/*
Dashboard goal
*/

document
.getElementById(
"goalPercentage"
)
.textContent =
percentage + "%";


document
.getElementById(
"dashboardGoalName"
)
.textContent =

data.goal.name

? data.goal.name

: "No savings goal yet.";


document
.getElementById(
"dashboardGoalSaved"
)
.textContent =

money(saved)
+ " saved";


document
.getElementById(
"dashboardGoalTarget"
)
.textContent =

"Goal: "
+ money(target);


document
.getElementById(
"dashboardGoalBar"
)
.style.width =
percentage + "%";


/*
Goal page
*/

document
.getElementById(
"goalDisplayName"
)
.textContent =

data.goal.name

? data.goal.name

: "No Goal";


document
.getElementById(
"goalDisplaySaved"
)
.textContent =
money(saved);


document
.getElementById(
"goalDisplayTarget"
)
.textContent =

"of "
+ money(target);


document
.getElementById(
"goalDisplayBar"
)
.style.width =
percentage + "%";


document
.getElementById(
"goalDisplayPercentage"
)
.textContent =

percentage
+ "% Complete";

}



/* =====================================================
SAVE GOAL FORM
===================================================== */

document
.getElementById(
"goalForm"
)
.addEventListener(
"submit",
event => {

event.preventDefault();


const name =
document
.getElementById(
"goalName"
)
.value
.trim();


const target =
Number(
document
.getElementById(
"goalAmount"
)
.value
);


if (
!name ||
target <= 0
) {

showToast(
"Enter a valid goal."
);

return;

}


data.goal = {

name,

target

};


saveData();


updateEverything();


showToast(
"Savings goal saved! 🎯"
);

}
);



/* =====================================================
GOAL BUTTON FROM DASHBOARD
===================================================== */

document
.getElementById(
"dashboardGoalButton"
)
.addEventListener(
"click",
() => {

showPage(
"goals"
);

}
);



/* =====================================================
ESCAPE HTML
===================================================== */

function escapeHTML(
value
) {

return String(value)

.replace(
/&/g,
"&amp;"
)

.replace(
/</g,
"&lt;"
)

.replace(
/>/g,
"&gt;"
)

.replace(
/"/g,
"&quot;"
)

.replace(
/'/g,
"&#039;"
);

}



/* =====================================================
FORMAT DATE
===================================================== */

function formatDate(
dateString
) {

if (!dateString) {

return "";

}


const date =
new Date(
dateString + "T00:00:00"
);


return date.toLocaleDateString(
"en-US",
{
month: "short",
day: "numeric",
year: "numeric"
}
);

}



/* =====================================================
TOAST
===================================================== */

function showToast(
message
) {

const toast =
document.getElementById(
"toast"
);


toast.textContent =
message;


toast.classList.add(
"show"
);


clearTimeout(
window.toastTimer
);


window.toastTimer =

setTimeout(
() => {

toast.classList.remove(
"show"
);

},
2500
);

}



/* =====================================================
UPDATE EVERYTHING
===================================================== */

function updateEverything() {

updateSummary();

renderTransactions();

renderRecentTransactions();

renderCategoryChart();

updateGoalDisplay();

}



/* =====================================================
START APPLICATION
===================================================== */

updateEverything();
