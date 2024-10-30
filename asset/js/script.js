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
const modalEditBudgetBtn = document.querySelector(
  "#budget_details .budget__card .icon"
);

const selectSortSpent = document.getElementById("sort_spent");

// Render Budgets Page
function renderBudgets() {
  const budgetData = getExistingData();
  const budgetList = budgetData
    .map((budget) => {
      const totalBudget = accumulateBudget(budget);
      return `<div class="budget__card" data-budgetid="${budget.id}">
        <h2 class="budget__name">${budget.name_budget}</h2>
        <p class="budget__amount">${formatRupiah(totalBudget)}</p>
        <p class="budget__total">Total ${formatRupiah(budget.total)}</p>
      </div>`;
    })
    .concat(`<button class="add__budget__btn">+</button>`)
    .join("");
  budgetsPage.innerHTML = budgetList;
  selectCardBudgetAndAddBudget();
}

function selectCardBudgetAndAddBudget() {
  const budgetCards = document.querySelectorAll("#budgets .budget__card");
  const addBudgetBtn = document.querySelector("#budgets button");

  //Cards to detail Budget
  budgetCards.forEach((card) => {
    card.addEventListener("click", () => {
      const budgetId = card.getAttribute("data-budgetid");
      renderBudgetDetail(budgetId);
      renderSpent(budgetId, selectSortSpent.value);
      budgetsPage.classList.toggle("hidden");
      budgetDetailPage.classList.toggle("hidden");
    });
  });

  // Modal Add Budget
  addBudgetBtn.addEventListener("click", function () {
    openAddModalBudget();
  });
}

// Render Budget Detail Page
function renderBudgetDetail(budgetId) {
  const currentBudget = getBudgetById(budgetId) ?? "";
  const totalAmount = accumulateBudget(currentBudget);
  document
    .querySelector("#budget_details .budget__card")
    .setAttribute("data-budgetid", budgetId);

  document.querySelector("#budget_details .budget__card h2").innerText =
    currentBudget.name_budget;
  document.querySelector(
    "#budget_details .budget__card .budget__amount"
  ).innerText = formatRupiah(totalAmount);
  document.querySelector(
    "#budget_details .budget__card .budget__total"
  ).innerText = "Total " + formatRupiah(currentBudget.total);
}

// Render Spent Budget
function renderSpent(budgetId, sortBy) {
  const pengeluaran = getBudgetById(budgetId)?.pengeluaran ?? [];

  const [index, type] = sortBy.split("|");

  sortSpent(pengeluaran, index, type);

  const listPengeluaran = pengeluaran
    .map((spent) => {
      return `<div class="spent__item" data-spentid="${spent.id}" >
          <div class="spent__item__description">
            <h4>${spent.name_spent}</h4>
            <p>${spent.spent_date}</p>
          </div>
          <div class="spent__item__price">
            <p>${formatRupiah(spent.spent_amount)}</p>
          </div>
       </div>`;
    })
    .join("");

  document.querySelector("#budget_details .spent").innerHTML = listPengeluaran;
  renderBudgets();
  renderBudgetDetail(budgetId);

  const spentItem = document.querySelectorAll(
    "#budget_details .spent .spent__item"
  );
  spentItem.forEach((element) => {
    element.addEventListener("click", () => {
      openEditModalSpentBudget(
        element.getAttribute("data-spentid"),
        pengeluaran
      );
    });
  });
}

document.getElementById("sort_spent").addEventListener("change", (e) => {
  const budgetId = document
    .querySelector("#budget_details .budget__card")
    .getAttribute("data-budgetid");
  renderSpent(budgetId, e.target.value);
});

function sortSpent(spents, indexData, type) {
  let iteration = 0;
  do {
    iteration = 0;
    for (let i = 0; i < spents.length - 1; i++) {
      const leftData =
        indexData == "spent_amount"
          ? +spents[i][indexData]
          : spents[i][indexData];

      const rightData =
        indexData == "spent_amount"
          ? +spents[i + 1][indexData]
          : spents[i + 1][indexData];
      if (
        (type == "asc" && leftData > rightData) ||
        (type == "desc" && leftData < rightData)
      ) {
        [spents[i], spents[i + 1]] = [spents[i + 1], spents[i]];
        iteration++;
      }
    }
  } while (iteration > 0);
  return spents;
}

// Back to Home Page / Budgets Page
function backHome() {
  budgetsPage.classList.toggle("hidden");
  budgetDetailPage.classList.toggle("hidden");
  budgetsPage.style.animation = "slideLeft 500ms ease-in-out normal";
}
backHomeBtn.addEventListener("click", function () {
  backHome();
});

// Modal Add Budget
function openAddModalBudget() {
  document.querySelector("#budget_form .modal__card__header h4").innerHTML =
    "Tambah Budget";
  document
    .querySelector("#budget_details .budget__card")
    .setAttribute("data-budgetid", null);
  document
    .querySelector("#budget_form .modal__footer button.danger")
    .classList.add("hidden");
  resetInput();
  modalAddBudget.classList.toggle("hidden");
}

function openEditModalBudget() {
  const budgetId = document
    .querySelector("#budget_details .budget__card")
    .getAttribute("data-budgetid");

  document.querySelector("#budget_form .modal__card__header h4").innerHTML =
    "Edit Budget";
  const btnDeleteBudget = document.querySelector(
    "#budget_form .modal__footer button.danger"
  );
  btnDeleteBudget.classList.remove("hidden");
  btnDeleteBudget.onclick = () => deleteBudget(budgetId);

  const currentBudget = getBudgetById(budgetId);
  document.getElementById("name_budget").value = currentBudget.name_budget;
  document.getElementById("total").value = currentBudget.total;
  modalAddBudget.classList.toggle("hidden");
}

modalEditBudgetBtn.addEventListener("click", () => {
  openEditModalBudget();
});

// Close Modal Add Budget
closeModalAddBudget.addEventListener("click", () => {
  closeModalBudget();
});

function closeModalBudget() {
  modalAddBudget.classList.toggle("hidden");
}

// Open Modal Add Spent Budget

function openAddModalSpentBudget() {
  document.querySelector(
    "#budget_spent_form .modal__card__header h4"
  ).innerHTML = "Tambah Pengeluaran";
  document
    .querySelector("#budget_spent_form .modal__footer button.danger")
    .classList.add("hidden");
  resetInput();
  modalAddSpentBudget.classList.toggle("hidden");
}

function openEditModalSpentBudget(spentId, pengeluaran) {
  document.querySelector(
    "#budget_spent_form .modal__card__header h4"
  ).innerHTML = "Edit Pengeluaran";
  const btnDeleteBudget = document.querySelector(
    "#budget_spent_form .modal__footer button.danger"
  );
  btnDeleteBudget.classList.remove("hidden");
  btnDeleteBudget.onclick = () => deleteSpentBudget(spentId);

  const currentSpent = pengeluaran.filter((spent) => spent.id == spentId)[0];
  document.getElementById("id_spent").value = spentId;
  document.getElementById("name_spent").value = currentSpent.name_spent;
  document.getElementById("spent_date").value = currentSpent.spent_date;
  document.getElementById("spent_amount").value = currentSpent.spent_amount;
  modalAddSpentBudget.classList.toggle("hidden");
}

addBudgetSpentBtn.addEventListener("click", function () {
  openAddModalSpentBudget();
});

//Close Spent Budget
closeModalAddSpentBudget.addEventListener("click", function () {
  closeModalSpentBudget();
});

function closeModalSpentBudget() {
  modalAddSpentBudget.classList.toggle("hidden");
}

// Reset Form in Modal
function resetInput() {
  document.querySelectorAll("form input").forEach((input) => {
    input.value = "";
  });
}

// Form Data to Object value
function getFormValue(formData) {
  return Object.fromEntries(formData.entries());
}

// get data from Local Storage
function getExistingData() {
  return JSON.parse(localStorage.getItem("budgets")) ?? [];
}

// get budget data from Local Storage
function getBudgetById(id) {
  const budgets = getExistingData();
  return budgets.filter((budget) => budget.id == id)[0];
}

function generateId() {
  return new Date().getTime();
}

function saveToLocal(existingData) {
  localStorage.setItem("budgets", JSON.stringify(existingData));
}

// Submit Form budget
function addBudget(newData) {
  const existingData = getExistingData();
  const dataWithId = { id: generateId(), ...newData };
  existingData.push(dataWithId);
  saveToLocal(existingData);
}

function updateBudget(id, data) {
  const existingData = getExistingData();
  const updateBudget = existingData?.map((budget) => {
    if (budget.id == id) {
      return { id: id, ...data, pengeluaran: budget.pengeluaran };
    }
    return budget;
  });
  saveToLocal(updateBudget);
}

function deleteBudget(budgetId) {
  const existingData = getExistingData();
  const confirmed = confirm("Apakah ingin mengahapus data bugdet?");
  if (confirmed) {
    const deleteBudget = existingData.filter((budget) => budget.id != budgetId);
    saveToLocal(deleteBudget);
    renderSpent(budgetId, selectSortSpent.value);
    popUpNotification(`✔ Budget berhasil dihapus`);
    backHome();
    closeModalBudget();
  } else {
    closeModalBudget();
  }
}

document.querySelector("#budget_form form").addEventListener("submit", (e) => {
  e.preventDefault();
  const formValues = getFormValue(new FormData(e.target));

  const budgetId = document
    .querySelector("#budget_details .budget__card")
    .getAttribute("data-budgetid");
  if (budgetId !== "null") {
    updateBudget(budgetId, formValues);
    renderBudgetDetail(budgetId);
  } else {
    addBudget(formValues);
  }
  closeModalBudget();
  resetInput();
  popUpNotification(`✔ Budget ${formValues.name_budget} berhasil disimpan!`);
  renderSpent(budgetId, selectSortSpent.value);
});

// Add Spent Budget
function addSpentBudget(data) {
  const budgetId = document
    .querySelector("#budget_details .budget__card")
    .getAttribute("data-budgetid");

  const currentBudget = getBudgetById(budgetId);
  const currentSpent = currentBudget.pengeluaran ?? [];
  const budgetWithSpent = {
    ...currentBudget,
    pengeluaran: [...currentSpent, { id: generateId(), ...data }],
  };

  const budgets = getExistingData();

  const updatedBudgets = budgets.map((budget) => {
    if (budget.id == budgetId) {
      return budgetWithSpent;
    } else {
      return budget;
    }
  });
  saveToLocal(updatedBudgets);
  renderSpent(budgetId, selectSortSpent.value);
}

function updateSpentBudget(id, dataForm) {
  const budgetId = document
    .querySelector("#budget_details .budget__card")
    .getAttribute("data-budgetid");
  const data = getExistingData();
  const updateSpentBudget = data.map((budget) => {
    if (budget.id == budgetId) {
      const pengeluaran = budget?.pengeluaran?.map((spent) => {
        if (spent.id == id) {
          return { ...dataForm, id: spent.id };
        }
        return spent;
      });
      return {
        ...budget,
        pengeluaran,
      };
    }
    return budget;
  });
  saveToLocal(updateSpentBudget);
  renderSpent(budgetId, selectSortSpent.value);
}
function deleteSpentBudget(id) {
  const budgetId = document
    .querySelector("#budget_details .budget__card")
    .getAttribute("data-budgetid");
  const data = getExistingData();
  const confirmed = confirm("Apakah anda ingin menghapus pengeluaran");
  if (confirmed) {
    const deleteSpent = data.map((budget) => {
      if (budget.id == budgetId) {
        return {
          ...budget,
          pengeluaran: budget?.pengeluaran?.filter((spent) => spent.id != id),
        };
      }
      return budget;
    });
    saveToLocal(deleteSpent);
    renderSpent(budgetId, selectSortSpent.value);
    popUpNotification("✔ Pengeluaran berhasil dihapus");
    closeModalSpentBudget();
  } else {
    closeModalSpentBudget();
  }
}

document
  .querySelector("#budget_spent_form form")
  .addEventListener("submit", (e) => {
    e.preventDefault();
    const data = getFormValue(new FormData(e.target));
    const spentId = document.getElementById("id_spent").value ?? null;
    if (spentId) {
      updateSpentBudget(spentId, data);
    } else {
      addSpentBudget(data);
    }
    closeModalSpentBudget();
    popUpNotification(`✔ Pengeluaran ${data.name_spent} berhasil disimpan`);
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

// Menjumlahkan Pengeluaran
function accumulateBudget(budgets) {
  if (!budgets || !budgets.pengeluaran) {
    return +budgets?.total || 0;
  }
  const totalSpent = budgets.pengeluaran.reduce(
    (accumulator, item) => accumulator + +item.spent_amount,
    0
  );
  return +budgets.total - totalSpent;
}

// Budget to Rupiah
function formatRupiah(number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(number);
}
