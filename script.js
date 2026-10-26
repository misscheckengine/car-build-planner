
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

function saveCurrentBuild() {
    if (!currentCar) return;

    const index = builds.findIndex(build => build.id === currentBuildId);
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

function loadBuild(id) {
    const build = builds.find(item => item.id === id);
    if (!build) return;

    currentBuildId = build.id;
    currentCar = build.car;
    parts = build.parts || [];
    saveBuilds();
    renderBuild();
}

function renderBuildSelector() {
    let selector = document.getElementById("buildSelector");

    if (!selector) {
        const label = document.createElement("label");
        label.textContent = "Switch build: ";

        selector = document.createElement("select");
        selector.id = "buildSelector";
        selector.setAttribute("aria-label", "Switch saved car build");
        label.appendChild(selector);
        buildDashboard.prepend(label);

        selector.addEventListener("change", () => loadBuild(selector.value));
    }

    selector.innerHTML = "";

    builds.forEach(build => {
        const option = document.createElement("option");
        option.value = build.id;
        option.textContent = `${build.car.year} ${build.car.make} ${build.car.model}`;
        option.selected = build.id === currentBuildId;
        selector.appendChild(option);
    });
}

function formatMoney(amount) {
    return Number(amount).toLocaleString("en-US", {
        style: "currency",
        currency: "USD",
        maximumFractionDigits: 2
    });
}

function renderBuild() {
    if (!currentCar) return;

    const totalSpent = parts.reduce((sum, part) => sum + Number(part.price), 0);
    const remaining = currentCar.budget - totalSpent;
    const percentUsed = Math.min(100, Math.max(0, totalSpent / currentCar.budget * 100));

    document.getElementById("carTitle").textContent =
        `${currentCar.year} ${currentCar.make} ${currentCar.model}`;
    
    const garageName = `${currentCar.year} ${currentCar.make} ${currentCar.model}`;
    const garageNameElement = document.getElementById("garageCarName");
    const garageSpecsElement = document.getElementById("garageCarSpecs");
    const garageVehicleElement = document.getElementById("garageVehicle");
    const garageModCountElement = document.getElementById("garageModCount");
    const garageInstalledCountElement = document.getElementById("garageInstalledCount");

    if (garageNameElement) garageNameElement.textContent = garageName;
    if (garageSpecsElement) garageSpecsElement.textContent =
        `${parts.length} modifications • ${formatMoney(currentCar.budget)} build budget`;
    if (garageVehicleElement) garageVehicleElement.textContent =
        `${currentCar.year} ${currentCar.make} ${currentCar.model}`;
    if (garageModCountElement) garageModCountElement.textContent = parts.length;
    if (garageInstalledCountElement) {
        garageInstalledCountElement.textContent =
            parts.filter(part => part.status === "Installed").length;
    }

    document.getElementById("startingBudget").textContent = formatMoney(currentCar.budget);
    document.getElementById("moneySpent").textContent = formatMoney(totalSpent);
    document.getElementById("remainingBudget").textContent = formatMoney(remaining);

    let budgetBar = document.getElementById("budgetProgress");
    if (!budgetBar) {
        budgetBar = document.createElement("progress");
        budgetBar.id = "budgetProgress";
        budgetBar.max = 100;
        document.getElementById("remainingBudget").parentElement.after(budgetBar);
    }
    budgetBar.value = percentUsed;
    budgetBar.setAttribute("aria-label", "Percentage of build budget spent");

    renderBuildSelector();
    partsList.innerHTML = "";

    if (parts.length === 0) {
        partsList.innerHTML = "<li>No parts added yet.</li>";
        return;
    }

    parts.forEach(part => {
        part.category ||= "Other";
        part.stage ||= "Stage 1";
        part.status ||= "Planned";

        const item = document.createElement("li");
        const details = document.createElement("div");
        const name = document.createElement("strong");
        name.textContent = part.name;

        const info = document.createElement("p");
        info.textContent = `${part.category} • ${part.stage} • ${part.status}`;
        details.append(name, info);

        const price = document.createElement("span");
        price.textContent = formatMoney(part.price);

        const controls = document.createElement("div");
        controls.className = "part-controls";

        function makeSelect(values, property, label) {
            const select = document.createElement("select");
            select.setAttribute("aria-label", `${label} for ${part.name}`);

            values.forEach(value => select.add(new Option(value, value)));
            select.value = part[property];

            select.addEventListener("change", () => {
                part[property] = select.value;
                saveCurrentBuild();
                renderBuild();
            });

            return select;
        }

        controls.append(
            makeSelect(["Engine", "Suspension", "Wheels & Tires", "Exhaust", "Interior", "Exterior", "Electrical", "Other"], "category", "Category"),
            makeSelect(["Stage 1", "Stage 2", "Stage 3", "Cosmetic"], "stage", "Build stage"),
            makeSelect(["Planned", "Ordered", "Installed"], "status", "Status")
        );

        const removeButton = document.createElement("button");
        removeButton.type = "button";
        removeButton.className = "remove-part";
        removeButton.textContent = "Remove";
        removeButton.addEventListener("click", () => {
            parts = parts.filter(entry => entry.id !== part.id);
            saveCurrentBuild();
            renderBuild();
        });

        controls.appendChild(removeButton);
        item.append(details, price, controls);
        partsList.appendChild(item);
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

    currentCar = { year, make, model, budget };
    currentBuildId = String(Date.now());
    parts = [];

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
        id: `${Date.now()}-${Math.random()}`,
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

document.getElementById("compareBuildsButton").addEventListener("click", () => {
    const panel = document.getElementById("buildComparison");
    const results = document.getElementById("comparisonResults");

    panel.classList.remove("hidden");
    results.innerHTML = "";

    if (builds.length < 2) {
        results.textContent = "Save at least two different car builds to compare them.";
        return;
    }

    builds.forEach(build => {
        const total = build.parts.reduce((sum, part) => sum + Number(part.price), 0);
        const card = document.createElement("div");
        card.className = "comparison-item";

        const title = document.createElement("h4");
        title.textContent = `${build.car.year} ${build.car.make} ${build.car.model}`;

        const budget = document.createElement("p");
        budget.textContent = `Budget: ${formatMoney(build.car.budget)}`;

        const spent = document.createElement("p");
        spent.textContent = `Parts total: ${formatMoney(total)}`;

        const left = document.createElement("p");
        left.textContent = `Remaining: ${formatMoney(build.car.budget - total)}`;

        card.append(title, budget, spent, left);
        results.appendChild(card);
    });
});

document.getElementById("exportBuildButton").addEventListener("click", () => {
    if (!currentCar) {
        alert("Save a car build before exporting.");
        return;
    }

    const total = parts.reduce((sum, part) => sum + Number(part.price), 0);
    const lines = [
        "CAR BUILD PLANNER",
        `${currentCar.year} ${currentCar.make} ${currentCar.model}`,
        `Budget: ${formatMoney(currentCar.budget)}`,
        `Parts total: ${formatMoney(total)}`,
        `Remaining: ${formatMoney(currentCar.budget - total)}`,
        "",
        "PARTS LIST",
        ...parts.map(part =>
            `${part.name} | ${formatMoney(part.price)} | ${part.category || "Other"} | ${part.stage || "Stage 1"} | ${part.status || "Planned"}`
        )
    ];

    const blob = new Blob([lines.join("\n")], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${currentCar.year}-${currentCar.make}-${currentCar.model}-build.txt`;
    link.click();
    URL.revokeObjectURL(url);
});

function restoreBuilds() {
    
const garagePhotoInput = document.getElementById("garagePhotoInput");
const garageCarImage = document.getElementById("garageCarImage");

if (garagePhotoInput && garageCarImage) {
    garagePhotoInput.addEventListener("change", () => {
        const file = garagePhotoInput.files[0];

        if (!file) return;

        if (!file.type.startsWith("image/")) {
            alert("Please choose an image file.");
            garagePhotoInput.value = "";
            return;
        }

        const reader = new FileReader();

        reader.onload = () => {
            garageCarImage.src = reader.result;
        };

        reader.readAsDataURL(file);
    });
}

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
}

restoreBuilds();

function updateBuildProgress() {
    const planned = parts.filter(part => (part.status || "Planned") === "Planned").length;
    const ordered = parts.filter(part => part.status === "Ordered").length;
    const installed = parts.filter(part => part.status === "Installed").length;

    document.getElementById("plannedCount").textContent = planned;
    document.getElementById("orderedCount").textContent = ordered;
    document.getElementById("installedCount").textContent = installed;
}

const originalRenderBuild = renderBuild;

renderBuild = function () {
    originalRenderBuild();
    updateBuildProgress();
};
