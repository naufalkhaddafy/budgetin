const budgetsPage = document.querySelector("#budgets");
renderBudgets();
const budgetDetailPage = document.querySelector("#budget_details");
const backHomeBtn = document.getElementById("back__home");

const modalAddBudget = document.querySelector("#budget_form");
const closeModalAddBudget = document.querySelector(
  "#budget_form .modal__card__header i"
);
const addBudgetSpentBtn = document.querySelector(
  "#budget_details .add__spent__btn"
);
const modalAddSpentBudget = document.querySelector("#budget_spent_form");
const closeModalAddSpentBudget = document.querySelector(
  "#budget_spent_form .modal__card__header i"
);
const notifications = document.getElementById("notifications");

// Render Budgets
function selectCardBudgetAndAddBudget() {
  const budgetCards = document.querySelectorAll("#budgets .budget__card");
  const addBudgetBtn = document.querySelector("#budgets button");
  //Cards to detail Budget
  budgetCards.forEach((card) => {
    card.addEventListener("click", () => {
      const budgetId = card.getAttribute("data-budgetid");
      renderBudgetDetail(budgetId);
      renderSpent(budgetId);
      budgetsPage.classList.toggle("hidden");
      budgetDetailPage.classList.toggle("hidden");
    });
  });

  //Add Budget
  addBudgetBtn.addEventListener("click", function () {
    modalAddBudget.classList.toggle("hidden");
  });
}

function renderBudgets() {
  const budgetData = getExistingData();
  const budgetList = budgetData
    .map((budget) => {
      return `<div class="budget__card" data-budgetid="${budget.id}">
        <h2 class="budget__name">${budget.name_budget}</h2>
        <p class="budget__amount">Rp  ${budget.total}</p>
        <p class="budget__total">Total Rp ${budget.total}</p>
      </div>`;
    })
    .concat(`<button class="add__budget__btn">+</button>`)
    .join("");
  budgetsPage.innerHTML = budgetList;
  selectCardBudgetAndAddBudget();
}

//render Budget Detail
function renderBudgetDetail(budgetId) {
  const currentBudget = getBudgetById(budgetId);
  document
    .querySelector("#budget_details .budget__card")
    .setAttribute("data-budgetid", budgetId);

  document.querySelector("#budget_details .budget__card h2").innerText =
    currentBudget.name_budget;
  document.querySelector(
    "#budget_details .budget__card .budget__amount"
  ).innerText = "Rp " + currentBudget.total;
  document.querySelector(
    "#budget_details .budget__card .budget__total"
  ).innerText = "Total Rp " + currentBudget.total;
}

//render Spent
function renderSpent(budgetId) {
  const pengeluaran = getBudgetById(budgetId).pengeluaran ?? [];
  const listPengeluaran = pengeluaran
    .map((spent) => {
      return `<div class="spent__item">
          <div class="spent__item__description">
            <h4>${spent.name_spent}</h4>
            <p>${spent.spent_date}</p>
          </div>
          <div class="spent__item__price">
            <p>Rp. ${spent.spent_amount}</p>
          </div>
        </div>`;
    })
    .join("");

  document.querySelector("#budget_details .spent").innerHTML = listPengeluaran;
}

// Back to Home
backHomeBtn.addEventListener("click", function () {
  budgetsPage.classList.toggle("hidden");
  budgetDetailPage.classList.toggle("hidden");
});

// Close Modal Add Budget
closeModalAddBudget.addEventListener("click", () => {
  closeModalBudget();
});

function closeModalBudget() {
  modalAddBudget.classList.toggle("hidden");
}

//Add Spent Budget
addBudgetSpentBtn.addEventListener("click", function () {
  modalAddSpentBudget.classList.toggle("hidden");
});

//Close Spent Budget
closeModalAddSpentBudget.addEventListener("click", function () {
  closeModalSpentBudget();
});

function closeModalSpentBudget() {
  modalAddSpentBudget.classList.toggle("hidden");
}

function getFormValue(formData) {
  return Object.fromEntries(formData.entries());
}

function getExistingData() {
  return JSON.parse(localStorage.getItem("budgets")) ?? [];
}

function getBudgetById(id) {
  const budgets = getExistingData();
  return budgets.filter((budget) => budget.id == id)[0];
}

// Submit Form budget
function addBudget(newData) {
  const existingData = getExistingData();
  existingData.push(newData);
  localStorage.setItem("budgets", JSON.stringify(existingData));
}

function generateId() {
  return new Date().getTime();
}

document.querySelector("#budget_form form").addEventListener("submit", (e) => {
  e.preventDefault();
  const formValues = getFormValue(new FormData(e.target));
  const dataWithId = { id: generateId(), ...formValues };
  addBudget(dataWithId);
  closeModalBudget();
  resetInput();
  popUpNotification(`✔ Budget ${formValues.name_budget} berhasil disimpan!`);
  renderBudgets();
});

function resetInput() {
  document.querySelectorAll("form input").forEach((input) => {
    input.value = "";
  });
}

// Add Spent Budget

function addSpentBudget(data) {
  const budgetId = document
    .querySelector("#budget_details .budget__card")
    .getAttribute("data-budgetid");

  const currentBudget = getBudgetById(budgetId);
  const currentSpent = currentBudget.pengeluaran ?? [];
  const budgetWithSpent = {
    ...currentBudget,
    pengeluaran: [...currentSpent, data],
  };

  const budgets = getExistingData();

  const updatedBudgets = budgets.map((budget) => {
    if (budget.id == budgetId) {
      return budgetWithSpent;
    } else {
      return budget;
    }
  });
  localStorage.setItem("budgets", JSON.stringify(updatedBudgets));
  renderSpent(budgetId);
}
document
  .querySelector("#budget_spent_form form")
  .addEventListener("submit", (e) => {
    e.preventDefault();
    const data = getFormValue(new FormData(e.target));
    addSpentBudget(data);
    closeModalSpentBudget();
    popUpNotification(`✔ Pengeluaran ${data.name_spent} berhasil ditambahkan`);
    resetInput();
  });

// Notification
function popUpNotification(message) {
  const newNotification = document.createElement("div");
  newNotification.innerText = message;
  newNotification.classList.add("notification");
  notifications.appendChild(newNotification);
  setTimeout(() => {
    newNotification.classList.add("out");
    setTimeout(() => {
      notifications.removeChild(newNotification);
    }, 500);
  }, 4000);
}
