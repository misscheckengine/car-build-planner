
const startButton = document.getElementById("startButton");
const heroSection = document.getElementById("heroSection");
const plannerSection = document.getElementById("plannerSection");

const saveCarButton = document.getElementById("saveCarButton");
const buildDashboard = document.getElementById("buildDashboard");
const addPartButton = document.getElementById("addPartButton");
const partsList = document.getElementById("partsList");

let builds = JSON.parse(localStorage.getItem("carBuilds") || "[]");
let currentBuildId = localStorage.getItem("currentBuildId") || null;
let currentCar = null;
let parts = [];

function saveBuilds() {
    localStorage.setItem("carBuilds", JSON.stringify(builds));
    localStorage.setItem("currentBuildId", currentBuildId || "");
}

function loadBuild(buildId) {
    const build = builds.find(item => item.id === buildId);
    if (!build) return;

    currentBuildId = build.id;
    currentCar = build.car;
    parts = build.parts || [];
    saveBuilds();
    renderBuild();
}

function saveCurrentBuild() {
    if (!currentCar) return;

    const index = builds.findIndex(item => item.id === currentBuildId);
    const savedBuild = {
        id: currentBuildId,
        car: currentCar,
        parts: parts
    };

    if (index >= 0) {
        builds[index] = savedBuild;
    } else {
        builds.push(savedBuild);
    }

    saveBuilds();
    localStorage.setItem("myCar", JSON.stringify(currentCar));
    localStorage.setItem("myParts", JSON.stringify(parts));
}

function renderBuildSelector() {
    let selector = document.getElementById("buildSelector");

    if (!selector) {
        selector = document.createElement("select");
        selector.id = "buildSelector";
        selector.setAttribute("aria-label", "Select a saved car build");

        const label = document.createElement("label");
        label.textContent = "Saved builds ";
        label.appendChild(selector);

        buildDashboard.prepend(label);
        selector.addEventListener("change", () => loadBuild(selector.value));
    }

    selector.innerHTML = "";

    builds.forEach(build => {
        const option = document.createElement("option");
        option.value = build.id;
        option.textContent =
            `${build.car.year} ${build.car.make} ${build.car.model}`;
        option.selected = build.id === currentBuildId;
        selector.appendChild(option);
    });
}

startButton.addEventListener("click", () => {
    heroSection.classList.add("hidden");
    plannerSection.classList.remove("hidden");
});

saveCarButton.addEventListener("click", () => {
    const year = document.getElementById("carYear").value.trim();
    const make = document.getElementById("carMake").value.trim();
    const model = document.getElementById("carModel").value.trim();
    const budget = Number(document.getElementById("buildBudget").value);

    if (!year || !make || !model || !Number.isFinite(budget) || budget <= 0) {
        alert("Please fill out every field with a valid budget.");
        return;
    }

    const existingBuild = builds.find(build =>
        build.id === currentBuildId &&
        build.car.year === year &&
        build.car.make === make &&
        build.car.model === model
    );

    if (existingBuild) {
        currentCar = { year, make, model, budget };
        existingBuild.car = currentCar;
        parts = existingBuild.parts || [];
    } else {
        currentBuildId = String(Date.now());
        currentCar = { year, make, model, budget };
        parts = [];
        builds.push({ id: currentBuildId, car: currentCar, parts });
    }

    saveCurrentBuild();
    buildDashboard.classList.remove("hidden");
    renderBuild();
    alert(`${year} ${make} ${model} saved with a ${formatMoney(budget)} budget.`);
});

addPartButton.addEventListener("click", () => {
    const nameInput = document.getElementById("partName");
    const priceInput = document.getElementById("partPrice");

    const name = nameInput.value.trim();
    const price = Number(priceInput.value);

    if (!currentCar) {
        alert("Save your car before adding parts.");
        return;
    }

    if (!name || !Number.isFinite(price) || price <= 0) {
        alert("Enter a valid part name and price.");
        return;
    }

    parts.push({
        id: String(Date.now()) + Math.random().toString(16).slice(2),
        name,
        price,
        category: "Other",
        stage: "Stage 1",
        status: "Planned"
    });

    saveCurrentBuild();
    nameInput.value = "";
    priceInput.value = "";
    renderBuild();
});

function renderBuild() {
    if (!currentCar) return;

    const totalSpent = parts.reduce((total, part) => total + part.price, 0);
    const remaining = currentCar.budget - totalSpent;

    document.getElementById("carTitle").textContent =
        `${currentCar.year} ${currentCar.make} ${currentCar.model}`;
    document.getElementById("startingBudget").textContent = formatMoney(currentCar.budget);
    document.getElementById("moneySpent").textContent = formatMoney(totalSpent);
    document.getElementById("remainingBudget").textContent = formatMoney(remaining);

    renderBuildSelector();
    partsList.innerHTML = "";

    if (parts.length === 0) {
        partsList.innerHTML = "<li>No parts added yet.</li>";
        return;
    }

    parts.forEach(part => {
        const item = document.createElement("li");

        const details = document.createElement("div");
        const name = document.createElement("strong");
        name.textContent = part.name;
        const info = document.createElement("p");
        info.textContent =
            `${part.category || "Other"} • ${part.stage || "Stage 1"} • ${part.status || "Planned"}`;
        details.append(name, info);

        const price = document.createElement("span");
        price.textContent = formatMoney(part.price);

        const controls = document.createElement("div");
        controls.className = "part-controls";

        const category = document.createElement("select");
        ["Engine", "Suspension", "Wheels & Tires", "Exhaust", "Interior", "Exterior", "Electrical", "Other"]
            .forEach(value => category.add(new Option(value, value)));
        category.value = part.category || "Other";
        category.setAttribute("aria-label", `Category for ${part.name}`);
        category.addEventListener("change", () => {
            part.category = category.value;
            saveCurrentBuild();
            renderBuild();
        });

        const stage = document.createElement("select");
        ["Stage 1", "Stage 2", "Stage 3", "Cosmetic"].forEach(value =>
            stage.add(new Option(value, value))
        );
        stage.value = part.stage || "Stage 1";
        stage.setAttribute("aria-label", `Build stage for ${part.name}`);
        stage.addEventListener("change", () => {
            part.stage = stage.value;
            saveCurrentBuild();
            renderBuild();
        });

        const status = document.createElement("select");
        ["Planned", "Ordered", "Installed"].forEach(value =>
            status.add(new Option(value, value))
        );
        status.value = part.status || "Planned";
        status.setAttribute("aria-label", `Installation status for ${part.name}`);
        status.addEventListener("change", () => {
            part.status = status.value;
            saveCurrentBuild();
            renderBuild();
        });

        const remove = document.createElement("button");
        remove.type = "button";
        remove.className = "remove-part";
        remove.textContent = "Remove";
        remove.addEventListener("click", () => {
            parts = parts.filter(entry => entry.id !== part.id);
            saveCurrentBuild();
            renderBuild();
        });

        controls.append(category, stage, status, remove);
        item.append(details, price, controls);
        partsList.appendChild(item);
    });
}

function formatMoney(amount) {
    return amount.toLocaleString("en-US", {
        style: "currency",
        currency: "USD",
        maximumFractionDigits: 2
    });
}

// Restore saved builds from the new storage or the previous planner.
if (builds.length === 0) {
    const oldCar = JSON.parse(localStorage.getItem("myCar") || "null");
    const oldParts = JSON.parse(localStorage.getItem("myParts") || "[]");

    if (oldCar) {
        currentBuildId = String(Date.now());
        currentCar = oldCar;
        parts = oldParts.map(part => ({
            ...part,
            category: part.category || "Other",
            stage: part.stage || "Stage 1",
            status: part.status || "Planned"
        }));
        builds.push({ id: currentBuildId, car: currentCar, parts });
        saveCurrentBuild();
    }
} else {
    const savedBuild = builds.find(build => build.id === currentBuildId) || builds[0];
    currentBuildId = savedBuild.id;
    currentCar = savedBuild.car;
    parts = savedBuild.parts || [];
}

if (currentCar) {
    buildDashboard.classList.remove("hidden");
    renderBuild();
}
