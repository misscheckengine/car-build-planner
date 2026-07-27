const startButton = document.getElementById("startButton");
const heroSection = document.getElementById("heroSection");
const plannerSection = document.getElementById("plannerSection");

startButton.addEventListener("click", () => {
heroSection.classList.add("hidden");
plannerSection.classList.remove("hidden");
});

const saveCarButton = document.getElementById("saveCarButton");

saveCarButton.addEventListener("click", () => {

const year = document.getElementById("carYear").value;
const make = document.getElementById("carMake").value;
const model = document.getElementById("carModel").value;
const budget = document.getElementById("buildBudget").value;

const car = {
year,
make,
model,
budget
};

localStorage.setItem("myCar", JSON.stringify(car));

alert("🚗 Your build has been saved!");
});
