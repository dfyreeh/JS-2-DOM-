// Функція збереження
function saveToStorage() {
  localStorage.setItem("garage", JSON.stringify(cars));
}

// Завантаження машин або ініціалізація
let cars = JSON.parse(localStorage.getItem("garage"));
if (!cars || cars.length === 0) {
  cars = [
    {
      name: "BMW",
      model: "X5",
      year: 2020,
      price: 45000,
      mileage: 30000,
      inGarage: true,
    },
    {
      name: "Audi",
      model: "A6",
      year: 2019,
      price: 40000,
      mileage: 25000,
      inGarage: true,
    },
    {
      name: "Toyota",
      model: "Camry",
      year: 2018,
      price: 25000,
      mileage: 40000,
      inGarage: true,
    },
  ];
  saveToStorage(); // Записуємо у localStorage одразу
}

// DOM
const carTableBody = document.querySelector("#car-table tbody");
const carForm = document.getElementById("car-form");
const searchInput = document.getElementById("search");
const sortSelect = document.getElementById("sort-select");
const filterSelect = document.getElementById("filter-select");

// Встановимо фільтр за замовчуванням у "all"
filterSelect.value = "all";

// Фільтруємо машини
function filterCars(carsArray) {
  let filtered = [...carsArray];

  // Фільтр по гаражу
  const filterVal = filterSelect.value;
  if (filterVal === "in") filtered = filtered.filter((c) => c.inGarage);
  else if (filterVal === "out") filtered = filtered.filter((c) => !c.inGarage);

  // Пошук
  const searchVal = searchInput.value.trim().toLowerCase();
  if (searchVal) {
    filtered = filtered.filter(
      (c) =>
        c.name.toLowerCase().includes(searchVal) ||
        c.model.toLowerCase().includes(searchVal)
    );
  }

  // Сортування
  const sortVal = sortSelect.value;
  if (sortVal === "price-asc") filtered.sort((a, b) => a.price - b.price);
  else if (sortVal === "year-desc") filtered.sort((a, b) => b.year - a.year);
  else if (sortVal === "mileage-asc")
    filtered.sort((a, b) => a.mileage - b.mileage);

  return filtered;
}

// Рендер таблиці
function renderCars() {
  carTableBody.innerHTML = "";
  const visibleCars = filterCars(cars);

  if (visibleCars.length === 0) {
    carTableBody.innerHTML = `<tr><td colspan="7" style="text-align:center; padding:1rem; color:#999;">Автомобілі не знайдені</td></tr>`;
    return;
  }

  visibleCars.forEach((car, index) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${car.name}</td>
      <td>${car.model}</td>
      <td>${car.year}</td>
      <td>$${car.price.toLocaleString()}</td>
      <td class="mileage-cell" data-index="${index}">
        <span class="mileage-editable">${car.mileage.toLocaleString()}</span> км
      </td>
      <td><input type="checkbox" class="toggle-garage" data-index="${index}" ${
      car.inGarage ? "checked" : ""
    }></td>
      <td class="actions">
        <button data-index="${index}" class="delete-btn" aria-label="Видалити ${
      car.name
    } ${car.model}">🗑️</button>
      </td>
    `;
    carTableBody.appendChild(tr);
  });

  // Події для чекбоксів "В гаражі"
  document.querySelectorAll(".toggle-garage").forEach((cb) => {
    cb.addEventListener("change", (e) => {
      const i = parseInt(e.target.dataset.index);
      const visibleCars = filterCars(cars);
      const car = visibleCars[i];
      const globalIndex = cars.findIndex((c) => c === car);
      if (globalIndex >= 0) {
        cars[globalIndex].inGarage = e.target.checked;
        saveToStorage();
      }
    });
  });

  // Події для видалення авто
  document.querySelectorAll(".delete-btn").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const i = parseInt(e.target.dataset.index);
      const visibleCars = filterCars(cars);
      const car = visibleCars[i];
      const globalIndex = cars.findIndex((c) => c === car);
      if (globalIndex >= 0) {
        cars.splice(globalIndex, 1);
        saveToStorage();
        renderCars();
      }
    });
  });

  // Інлайн редагування пробігу
  document.querySelectorAll(".mileage-editable").forEach((span) => {
    span.addEventListener("click", (e) => {
      const td = e.target.parentElement;
      const i = parseInt(td.dataset.index);
      const visibleCars = filterCars(cars);
      const car = visibleCars[i];
      const globalIndex = cars.findIndex((c) => c === car);
      if (globalIndex < 0) return;

      const input = document.createElement("input");
      input.type = "number";
      input.min = "0";
      input.value = cars[globalIndex].mileage;
      input.className = "mileage-input";

      td.innerHTML = "";
      td.appendChild(input);
      input.focus();

      function saveMileage() {
        let val = parseInt(input.value);
        if (isNaN(val) || val < 0) val = cars[globalIndex].mileage;
        cars[globalIndex].mileage = val;
        saveToStorage();
        renderCars();
      }

      input.addEventListener("blur", saveMileage);
      input.addEventListener("keydown", (ev) => {
        if (ev.key === "Enter") input.blur();
        else if (ev.key === "Escape") renderCars();
      });
    });
  });
}

// Додавання нового авто
carForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const newCar = {
    name: carForm.name.value.trim(),
    model: carForm.model.value.trim(),
    year: parseInt(carForm.year.value),
    price: parseFloat(carForm.price.value),
    mileage: parseInt(carForm.mileage.value),
    inGarage: carForm.inGarage.checked,
  };
  cars.push(newCar);
  saveToStorage();
  renderCars();
  carForm.reset();
});

// Події фільтрів та пошуку
searchInput.addEventListener("input", renderCars);
sortSelect.addEventListener("change", renderCars);
filterSelect.addEventListener("change", renderCars);

// Перший рендер
renderCars();
