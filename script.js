const startButton = document.getElementById("startButton");
const heroSection = document.getElementById("heroSection");
const plannerSection = document.getElementById("plannerSection");
const saveCarButton = document.getElementById("saveCarButton");

startButton.addEventListener("click", () => {
heroSection.classList.add("hidden");
plannerSection.classList.remove("hidden");
});

saveCarButton.addEventListener("click", () => {
const year = document.getElementById("carYear").value;
const make = document.getElementById("carMake").value;
const model = document.getElementById("carModel").value;
const budget = document.getElementById("buildBudget").value;

if (!year || !make || !model || !budget) {
alert("Please complete every field.");
return;
}

alert(
`${year} ${make} ${model} saved with a $${Number(budget).toLocaleString()} budget.`
);
});
