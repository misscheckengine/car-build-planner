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

    const index = builds.findIndex(
        build => build.id === currentBuildId
    );

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
        selector.setAttribute(
            "aria-label",
            "Switch saved car build"
        );

        label.appendChild(selector);
        buildDashboard.prepend(label);

        selector.addEventListener("change", () => {
            loadBuild(selector.value);
        });
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

function formatMoney(amount) {
    return Number(amount).toLocaleString("en-US", {
        style: "currency",
        currency: "USD",
        maximumFractionDigits: 2
    });
}

function updateGarage() {
    if (!currentCar) return;

    const garageName =
        `${currentCar.year} ${currentCar.make} ${currentCar.model}`;

    const garageNameElement =
        document.getElementById("garageCarName");

    const garageSpecsElement =
        document.getElementById("garageCarSpecs");

    const garageVehicleElement =
        document.getElementById("garageVehicle");

    const garageModCountElement =
        document.getElementById("garageModCount");

    const garageInstalledCountElement =
        document.getElementById("garageInstalledCount");

    if (garageNameElement) {
        garageNameElement.textContent = garageName;
    }

    if (garageSpecsElement) {
        garageSpecsElement.textContent =
            `${parts.length} modifications • ` +
            `${formatMoney(currentCar.budget)} build budget`;
    }

    if (garageVehicleElement) {
        garageVehicleElement.textContent = garageName;
    }

    if (garageModCountElement) {
        garageModCountElement.textContent = parts.length;
    }

    if (garageInstalledCountElement) {
        garageInstalledCountElement.textContent =
            parts.filter(part => part.status === "Installed").length;
    }
}

function updateBuildProgress() {
    const planned = parts.filter(
        part => (part.status || "Planned") === "Planned"
    ).length;

    const ordered = parts.filter(
        part => part.status === "Ordered"
    ).length;

    const installed = parts.filter(
        part => part.status === "Installed"
    ).length;

    const plannedElement = document.getElementById("plannedCount");
    const orderedElement = document.getElementById("orderedCount");
    const installedElement = document.getElementById("installedCount");

    if (plannedElement) plannedElement.textContent = planned;
    if (orderedElement) orderedElement.textContent = ordered;
    if (installedElement) installedElement.textContent = installed;
}

function renderBuild() {
    if (!currentCar) return;

    const totalSpent = parts.reduce(
        (sum, part) => sum + Number(part.price),
        0
    );

    const remaining = currentCar.budget - totalSpent;

    const percentUsed = Math.min(
        100,
        Math.max(0, totalSpent / currentCar.budget * 100)
    );

    document.getElementById("carTitle").textContent =
        `${currentCar.year} ${currentCar.make} ${currentCar.model}`;

    updateGarage();

    document.getElementById("startingBudget").textContent =
        formatMoney(currentCar.budget);

    document.getElementById("moneySpent").textContent =
        formatMoney(totalSpent);

    document.getElementById("remainingBudget").textContent =
        formatMoney(remaining);

    let budgetBar = document.getElementById("budgetProgress");

    if (!budgetBar) {
        budgetBar = document.createElement("progress");
        budgetBar.id = "budgetProgress";
        budgetBar.max = 100;

        document.getElementById("remainingBudget")
            .parentElement.after(budgetBar);
    }

    budgetBar.value = percentUsed;
    budgetBar.setAttribute(
        "aria-label",
        "Percentage of build budget spent"
    );

    renderBuildSelector();

    partsList.innerHTML = "";

    if (parts.length === 0) {
        partsList.innerHTML = "<li>No parts added yet.</li>";
        updateBuildProgress();
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
        info.textContent =
            `${part.category} • ${part.stage} • ${part.status}`;

        details.append(name, info);

        const price = document.createElement("span");
        price.textContent = formatMoney(part.price);

        const controls = document.createElement("div");
        controls.className = "part-controls";

        function makeSelect(values, property, label) {
            const select = document.createElement("select");

            select.setAttribute(
                "aria-label",
                `${label} for ${part.name}`
            );

            values.forEach(value => {
                select.add(new Option(value, value));
            });

            select.value = part[property];

            select.addEventListener("change", () => {
                part[property] = select.value;
                saveCurrentBuild();
                renderBuild();
            });

            return select;
        }

        controls.append(
            makeSelect(
                [
                    "Engine",
                    "Suspension",
                    "Wheels & Tires",
                    "Exhaust",
                    "Interior",
                    "Exterior",
                    "Electrical",
                    "Other"
                ],
                "category",
                "Category"
            ),
            makeSelect(
                ["Stage 1", "Stage 2", "Stage 3", "Cosmetic"],
                "stage",
                "Build stage"
            ),
            makeSelect(
                ["Planned", "Ordered", "Installed"],
                "status",
                "Status"
            )
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

    updateBuildProgress();
}

startButton.addEventListener("click", () => {
    heroSection.classList.add("hidden");
    plannerSection.classList.remove("hidden");
});

saveCarButton.addEventListener("click", () => {
    const year = document.getElementById("carYear").value.trim();
    const make = document.getElementById("carMake").value.trim();
    const model = document.getElementById("carModel").value.trim();
    const budget = Number(
        document.getElementById("buildBudget").value
    );

    if (
        !year ||
        !make ||
        !model ||
        !Number.isFinite(budget) ||
        budget <= 0
    ) {
        alert("Please fill out every field with a valid budget.");
        return;
    }

    currentCar = { year, make, model, budget };
    currentBuildId = String(Date.now());
    parts = [];

    saveCurrentBuild();

    buildDashboard.classList.remove("hidden");
    renderBuild();

    alert(
        `${year} ${make} ${model} saved with a ` +
        `${formatMoney(budget)} budget.`
    );
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

document.getElementById("compareBuildsButton")
    .addEventListener("click", () => {
        const panel = document.getElementById("buildComparison");
        const results =
            document.getElementById("comparisonResults");

        panel.classList.remove("hidden");
        results.innerHTML = "";

        if (builds.length < 2) {
            results.textContent =
                "Save at least two different car builds to compare them.";
            return;
        }

        builds.forEach(build => {
            const total = (build.parts || []).reduce(
                (sum, part) => sum + Number(part.price),
                0
            );

            const card = document.createElement("div");
            card.className = "comparison-item";

            const title = document.createElement("h4");
            title.textContent =
                `${build.car.year} ${build.car.make} ${build.car.model}`;

            const budget = document.createElement("p");
            budget.textContent =
                `Budget: ${formatMoney(build.car.budget)}`;

            const spent = document.createElement("p");
            spent.textContent = `Parts total: ${formatMoney(total)}`;

            const left = document.createElement("p");
            left.textContent =
                `Remaining: ${formatMoney(build.car.budget - total)}`;

            card.append(title, budget, spent, left);
            results.appendChild(card);
        });
    });

document.getElementById("exportBuildButton")
    .addEventListener("click", () => {
        if (!currentCar) {
            alert("Save a car build before exporting.");
            return;
        }

        const total = parts.reduce(
            (sum, part) => sum + Number(part.price),
            0
        );

        const lines = [
            "CAR BUILD PLANNER",
            `${currentCar.year} ${currentCar.make} ${currentCar.model}`,
            `Budget: ${formatMoney(currentCar.budget)}`,
            `Parts total: ${formatMoney(total)}`,
            `Remaining: ${formatMoney(currentCar.budget - total)}`,
            "",
            "PARTS LIST",
            ...parts.map(part =>
                `${part.name} | ${formatMoney(part.price)} | ` +
                `${part.category || "Other"} | ` +
                `${part.stage || "Stage 1"} | ` +
                `${part.status || "Planned"}`
            )
        ];

        const blob = new Blob(
            [lines.join("\n")],
            { type: "text/plain;charset=utf-8" }
        );

        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");

        link.href = url;
        link.download =
            `${currentCar.year}-${currentCar.make}-` +
            `${currentCar.model}-build.txt`;

        link.click();
        URL.revokeObjectURL(url);
    });

function restoreBuilds() {
    if (builds.length === 0) {
        const oldCar = JSON.parse(
            localStorage.getItem("myCar") || "null"
        );

        const oldParts = JSON.parse(
            localStorage.getItem("myParts") || "[]"
        );

        if (oldCar) {
            currentBuildId = String(Date.now());
            currentCar = oldCar;

            parts = oldParts.map(part => ({
                ...part,
                category: part.category || "Other",
                stage: part.stage || "Stage 1",
                status: part.status || "Planned"
            }));

            builds.push({
                id: currentBuildId,
                car: currentCar,
                parts
            });

            saveCurrentBuild();
        }
    } else {
        const savedBuild =
            builds.find(build => build.id === currentBuildId) ||
            builds[0];

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

// ===== VIRTUAL GARAGE PHOTO UPLOAD =====

 // ===== PERSISTENT VIRTUAL GARAGE PHOTO =====

const garagePhotoInput = document.getElementById("garagePhotoInput");
const garageCarImage = document.getElementById("garageCarImage");

let garagePhotoUrl = null;

function openGaragePhotoDB() {
    return new Promise((resolve, reject) => {
        if (!("indexedDB" in window)) {
            reject(new Error("Browser storage is unavailable."));
            return;
        }

        const request = indexedDB.open("CarBuildPlannerGarage", 1);

        request.onupgradeneeded = () => {
            const db = request.result;

            if (!db.objectStoreNames.contains("photos")) {
                db.createObjectStore("photos");
            }
        };

        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}

async function saveGaragePhoto(file) {
    const db = await openGaragePhotoDB();

    return new Promise((resolve, reject) => {
        const transaction = db.transaction("photos", "readwrite");

        transaction.objectStore("photos").put(file, "myCarPhoto");

        transaction.oncomplete = () => {
            db.close();
            resolve();
        };

        transaction.onerror = () => {
            const error = transaction.error;
            db.close();
            reject(error);
        };

        transaction.onabort = () => {
            const error = transaction.error;
            db.close();
            reject(error || new Error("Photo saving was cancelled."));
        };
    });
}

async function loadGaragePhoto() {
    if (!garageCarImage) return;

    try {
        const db = await openGaragePhotoDB();

        const photo = await new Promise((resolve, reject) => {
            const transaction = db.transaction("photos", "readonly");
            const request = transaction.objectStore("photos").get("myCarPhoto");

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });

        db.close();

        if (photo instanceof Blob) {
            if (garagePhotoUrl) {
                URL.revokeObjectURL(garagePhotoUrl);
            }

            garagePhotoUrl = URL.createObjectURL(photo);
            garageCarImage.src = garagePhotoUrl;
            garageCarImage.alt = "Your uploaded car photo";
        }
    } catch (error) {
        console.error("Could not restore the garage photo:", error);
    }
}

if (garagePhotoInput && garageCarImage) {
    garagePhotoInput.addEventListener("change", async () => {
        const file = garagePhotoInput.files?.[0];

        if (!file) return;

        if (!file.type.startsWith("image/")) {
            alert("Please choose an image file.");
            garagePhotoInput.value = "";
            return;
        }

        try {
            await saveGaragePhoto(file);

            if (garagePhotoUrl) {
                URL.revokeObjectURL(garagePhotoUrl);
            }

            garagePhotoUrl = URL.createObjectURL(file);
            garageCarImage.src = garagePhotoUrl;
            garageCarImage.alt = "Your uploaded car photo";
        } catch (error) {
            console.error("Could not save the garage photo:", error);
            alert(
                "The photo could not be saved. Try a smaller image or another browser."
            );
        }
    });

    loadGaragePhoto();
}

/* ===== PERFORMANCE PARTS CATALOG ===== */

const performancePartsCatalog = [
    { name: "Cold Air Intake", category: "Engine", price: 250, description: "Improve airflow to your engine." },
    { name: "Turbo Kit", category: "Engine", price: 1800, description: "Add forced induction to your build." },
    { name: "Intercooler Upgrade", category: "Engine", price: 450, description: "Help cool compressed intake air." },
    { name: "Performance ECU Tune", category: "Engine", price: 500, description: "Optimize engine performance." },
    { name: "Upgraded Fuel Injectors", category: "Engine", price: 350, description: "Support increased fueling needs." },
    { name: "Aluminum Radiator", category: "Engine", price: 300, description: "Upgrade your engine cooling system." },

    { name: "Coilover Kit", category: "Suspension", price: 900, description: "Adjust ride height and handling." },
    { name: "Lowering Springs", category: "Suspension", price: 300, description: "Lower your car's ride height." },
    { name: "Adjustable Control Arms", category: "Suspension", price: 400, description: "Fine-tune suspension geometry." },
    { name: "Sway Bar Kit", category: "Suspension", price: 250, description: "Help reduce body roll." },

    { name: "17-Inch Alloy Wheels", category: "Wheels & Tires", price: 900, description: "Give your build a fresh wheel setup." },
    { name: "Performance Tire Set", category: "Wheels & Tires", price: 700, description: "Upgrade grip and road handling." },
    { name: "Wheel Spacers", category: "Wheels & Tires", price: 120, description: "Adjust wheel fitment and stance." },

    { name: "Cat-Back Exhaust", category: "Exhaust", price: 650, description: "Upgrade exhaust flow and sound." },
    { name: "Performance Header", category: "Exhaust", price: 350, description: "Improve exhaust flow from the engine." },
    { name: "High-Flow Catalytic Converter", category: "Exhaust", price: 300, description: "A performance-oriented catalytic converter." },

    { name: "Bucket Seat", category: "Interior", price: 450, description: "Add support for spirited driving." },
    { name: "Aftermarket Steering Wheel", category: "Interior", price: 220, description: "Personalize your driving position." },
    { name: "Short Shifter", category: "Interior", price: 180, description: "Create a shorter gearshift throw." },

    { name: "Front Lip", category: "Exterior", price: 180, description: "Add a sharper front-end look." },
    { name: "Rear Spoiler", category: "Exterior", price: 250, description: "Give your car a sportier profile." },
    { name: "Side Skirts", category: "Exterior", price: 300, description: "Complete the side profile of your build." },

    { name: "LED Headlight Kit", category: "Electrical", price: 160, description: "Upgrade headlight appearance and visibility." },
    { name: "Performance Ignition Coils", category: "Electrical", price: 180, description: "Refresh or upgrade the ignition system." },
    { name: "Battery Upgrade", category: "Electrical", price: 220, description: "Replace your battery with a suitable upgrade." }
];

const catalogSearch = document.getElementById("catalogSearch");
const catalogCategory = document.getElementById("catalogCategory");
const catalogResults = document.getElementById("catalogResults");

function renderCatalog() {
    if (!catalogResults || !catalogSearch || !catalogCategory) return;

    const searchTerm = catalogSearch.value.trim().toLowerCase();
    const selectedCategory = catalogCategory.value;

    const filteredParts = performancePartsCatalog.filter(part => {
        const matchesSearch =
            part.name.toLowerCase().includes(searchTerm) ||
            part.category.toLowerCase().includes(searchTerm) ||
            part.description.toLowerCase().includes(searchTerm);

        const matchesCategory =
            selectedCategory === "All" ||
            part.category === selectedCategory;

        return matchesSearch && matchesCategory;
    });

    catalogResults.replaceChildren();

    if (filteredParts.length === 0) {
        const emptyMessage = document.createElement("p");
        emptyMessage.textContent = "No parts found. Try another search.";
        catalogResults.appendChild(emptyMessage);
        return;
    }

    filteredParts.forEach(part => {
        const card = document.createElement("article");
        card.className = "catalog-part-card";

        const category = document.createElement("p");
        category.className = "catalog-part-category";
        category.textContent = part.category;

        const name = document.createElement("h4");
        name.textContent = part.name;

        const description = document.createElement("p");
        description.className = "catalog-part-description";
        description.textContent = part.description;

        const price = document.createElement("p");
        price.className = "catalog-part-price";
        price.textContent = "Est. $" + part.price.toLocaleString("en-US");

        const addButton = document.createElement("button");
        addButton.type = "button";
        addButton.className = "catalog-add-button";
        addButton.textContent = "＋ Add to Build";

        addButton.addEventListener("click", () => {
            if (typeof currentCar === "undefined" || !currentCar) {
                alert("Start or load a car build before adding parts.");
                return;
            }

            if (!Array.isArray(parts)) {
                alert("Your parts list is not ready. Please reload the page.");
                return;
            }

            parts.push({
                id: "catalog-" + Date.now() + "-" + Math.random().toString(36).slice(2, 8),
                name: part.name,
                price: part.price,
                category: part.category,
                stage: "Stage 1",
                status: "Planned"
            });

            if (typeof saveCurrentBuild === "function") {
                saveCurrentBuild();
            }

            if (typeof renderBuild === "function") {
                renderBuild();
            } else {
                alert("Part added, but the build display could not refresh. Reload the page to check it.");
            }
        });

        const retailerLinks = document.createElement("div");
        retailerLinks.className = "catalog-retailer-links";
        retailerLinks.setAttribute("aria-label", "Search this part at retailers");

        const retailers = [
            { name: "Summit Racing", domain: "summitracing.com" },
            { name: "JEGS", domain: "jegs.com" },
            { name: "RockAuto", domain: "rockauto.com" }
        ];

        retailers.forEach(retailer => {
            const link = document.createElement("a");
            const searchQuery = "site:" + retailer.domain + " " + part.name + " automotive";
            link.textContent = retailer.name + " ↗";
            link.href = "https://www.google.com/search?q=" + encodeURIComponent(searchQuery);
            link.target = "_blank";
            link.rel = "noopener noreferrer";
            link.className = "catalog-retailer-link";
            link.setAttribute("aria-label", "Search " + part.name + " at " + retailer.name);
            retailerLinks.appendChild(link);
        });

        card.append(category, name, description, price, retailerLinks, addButton);
        catalogResults.appendChild(card);
    });
}

if (catalogSearch && catalogCategory && catalogResults) {
    catalogSearch.addEventListener("input", renderCatalog);
    catalogCategory.addEventListener("change", renderCatalog);
    renderCatalog();
}

