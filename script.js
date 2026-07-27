const startButton = document.getElementById("startButton");
const heroSection = document.getElementById("heroSection");
const plannerSection = document.getElementById("plannerSection");

const saveCarButton = document.getElementById("saveCarButton");
const buildDashboard = document.getElementById("buildDashboard");

const addPartButton = document.getElementById("addPartButton");
const partsList = document.getElementById("partsList");

let currentCar = null;
let parts = [];

startButton.addEventListener("click", () => {
    heroSection.classList.add("hidden");
    plannerSection.classList.remove("hidden");
});

saveCarButton.addEventListener("click", () => {
    const year = document.getElementById("carYear").value.trim();
    const make = document.getElementById("carMake").value.trim();
    const model = document.getElementById("carModel").value.trim();
    const budget = Number(document.getElementById("buildBudget").value);

    if (!year || !make || !model || budget <= 0) {
        alert("Please fill out every field with a valid budget.");
        return;
    }

    currentCar = {
        year,
        make,
        model,
        budget
    };

    parts = [];

    localStorage.setItem("myCar", JSON.stringify(currentCar));
    localStorage.setItem("myParts", JSON.stringify(parts));

    buildDashboard.classList.remove("hidden");

    renderBuild();

    alert(
        `${year} ${make} ${model} saved with a ${formatMoney(budget)} budget.`
    );
});

addPartButton.addEventListener("click", () => {
    const partNameInput = document.getElementById("partName");
    const partPriceInput = document.getElementById("partPrice");

    const name = partNameInput.value.trim();
    const price = Number(partPriceInput.value);

    if (!currentCar) {
        alert("Save your car before adding parts.");
        return;
    }

    if (!name || price <= 0) {
        alert("Enter a valid part name and price.");
        return;
    }

    parts.push({
        id: Date.now(),
        name,
        price
    });

    localStorage.setItem("myParts", JSON.stringify(parts));

    partNameInput.value = "";
    partPriceInput.value = "";

    renderBuild();
});

function renderBuild() {
    if (!currentCar) {
        return;
    }

    const totalSpent = parts.reduce((total, part) => {
        return total + part.price;
    }, 0);

    const remaining = currentCar.budget - totalSpent;

    document.getElementById("carTitle").textContent =
        `${currentCar.year} ${currentCar.make} ${currentCar.model}`;

    document.getElementById("startingBudget").textContent =
        formatMoney(currentCar.budget);

    document.getElementById("moneySpent").textContent =
        formatMoney(totalSpent);

    document.getElementById("remainingBudget").textContent =
        formatMoney(remaining);

    partsList.innerHTML = "";

    if (parts.length === 0) {
        partsList.innerHTML = "<li>No parts added yet.</li>";
        return;
    }

    parts.forEach((part) => {
        const listItem = document.createElement("li");

        listItem.innerHTML = `
            <span>${part.name}</span>
            <span>
                ${formatMoney(part.price)}
                <button
                    class="remove-part"
                    data-id="${part.id}">
                    Remove
                </button>
            </span>
        `;

        partsList.appendChild(listItem);
    });

    document.querySelectorAll(".remove-part").forEach((button) => {
        button.addEventListener("click", () => {
            const partId = Number(button.dataset.id);

            parts = parts.filter((part) => {
                return part.id !== partId;
            });

            localStorage.setItem("myParts", JSON.stringify(parts));

            renderBuild();
        });
    });
}

function formatMoney(amount) {
    return amount.toLocaleString("en-US", {
        style: "currency",
        currency: "USD",
        maximumFractionDigits: 0
    });
}
