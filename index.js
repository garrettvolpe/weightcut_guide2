//set width of results and info divs to the same as the input form width
window.onload = () => {
    document.querySelector("#resultsContainer").style.width = window.getComputedStyle(document.querySelector("#inputsContainer")).getPropertyValue("width");
    document.querySelector("#infoContainer").style.width = window.getComputedStyle(document.querySelector("#inputsContainer")).getPropertyValue("width");
    document.querySelector("#resultsWeightTable").style.width = window.getComputedStyle(document.querySelector("#inputsContainer")).getPropertyValue("width");
};

const KILOGRAMS_PER_POUND = 0.4536;
const CENTIMETERS_PER_INCH = 2.54;
const CM2_PER_M2 = 10000;

const MIN_CAL_FEMALE = 1200;
const MIN_CAL_MALE = 1500;

const MALE_CAL_MODIFIER = 5;
const FEMALE_CAL_MODIFIER = -161;

let days;


function validateFormInputs(inputs) {
    inputs.age = parseInt(document.querySelector("#age").value);
    inputs.weight = parseInt(document.querySelector("#weight").value);
    inputs.feet = parseInt(document.querySelector("#heightFeet").value)
    inputs.inch = parseInt(document.querySelector("#heightInch").value)
    inputs.height = (inputs.feet * 12) + inputs.inch
    inputs.startDate = document.getElementById('userSelectedStartDate').value;
    inputs.weighInDate = document.getElementById('userWeighInDate').value;
    inputs.weightClass = document.getElementById('weightClass').value;

    inputs.bodyFatPercent = parseInt(document.querySelector("#bodyFatPercent").value);
    inputs.bodyFatEntered = true;


    if (isNaN(inputs.bodyFatPercent) || inputs.bodyFatPercent === "" || inputs.bodyFatPercent < 0 || inputs.bodyFatPercent > 90) {
        alert("Please enter a valid body fat percentage!");
        return false;
    }

    if (isNaN(inputs.age) || inputs.age === "" || inputs.age < 0) {
        alert("Please enter a valid age!");
        return false;
    }

    if (isNaN(inputs.weight) || inputs.weight === "" || inputs.weight < 0) {
        alert("Please enter a valid weight!");
        return false;
    }

    if (isNaN(inputs.height) || inputs.height === "" || inputs.height < 0) {
        alert("Please enter a valid height!");
        return false;
    }

    if (inputs.startDate === "") {
        alert("Please enter a Start Date!");
        return false;
    }

    if (inputs.weighInDate === "") {
        alert("Please enter a Weigh in Date!");
        return false;
    }

    // getting values of dropdowns
    const gender = document.querySelector("#gender");
    const weightUnit = document.querySelector("#weightUnit");
    const activityLevel = document.querySelector("#activityLevel");

    inputs.gender = gender.options[gender.selectedIndex].value;
    inputs.weightUnit = weightUnit.options[weightUnit.selectedIndex].value;
    inputs.activityLevel = activityLevel.options[activityLevel.selectedIndex].value;

    return true;
}



function calculateTDEEnoBF(gender, age, weight, weightUnit, height, activityMultiplier) {
    // Mifflin St. Jeor
    // Mifflin = (10.m + 6.25h - 5.0a) + s
    // m is mass in kg, h is height in cm, a is age in years, s is +5 for males and -151 for females

    const safeMinCalories = (gender === "M") ? MIN_CAL_MALE : MIN_CAL_FEMALE;
    const genderModifier = (gender === "M") ? MALE_CAL_MODIFIER : FEMALE_CAL_MODIFIER;

    if (weightUnit === "LBS") {
        weight *= KILOGRAMS_PER_POUND;
    }

    height *= CENTIMETERS_PER_INCH;

    const BMR = (10 * weight) + (6.25 * height) - (5.0 * age) + genderModifier;

    // if tdee is under safe min calories, then set tdee to safe min calories
    const TDEE = Math.max(safeMinCalories, Math.round(BMR * activityMultiplier));

    return TDEE;
}



function calculateTDEEwithBF(gender, weight, weightUnit, bodyFatPercent, activityMultiplier) {
    // Katch-McArdle
    // Katch = 370 + (21.6 * LBM)
    // where LBM is lean body mass 

    const safeMinCalories = (gender === "M") ? MIN_CAL_MALE : MIN_CAL_FEMALE;

    if (weightUnit === "LBS") {
        weight *= KILOGRAMS_PER_POUND;
    }

    const LBM = (100 - bodyFatPercent) * 0.01 * weight;
    const BMR = (21.6 * LBM) + 370;

    const TDEE = Math.round(BMR * activityMultiplier);

    return TDEE;
}



function carbStored(weight, bodyfat) {
    bodyfat = parseFloat(bodyfat / 100)
    let liverStored = 0.77
    let muscleStored;
    let bodyfatMultiple = 1 - bodyfat
    let leanBodyMass = parseInt(weight) * bodyfatMultiple
    if (parseFloat(bodyfat) > .15) {
        muscleStored = (leanBodyMass * .015)
    }
    else if (parseFloat(bodyfat) < .15) {
        muscleStored = (leanBodyMass * .02)
    }
    return (muscleStored + liverStored).toFixed(2)
}

function getDaysUntilWeighIn(start, end) {
    let date1 = new Date(start);
    let date2 = new Date(end);
    let diffDays = parseInt((date2 - date1) / (1000 * 60 * 60 * 24), 10);
    days = diffDays;
    return `Days away : ${diffDays}`;
}

function roundNearestHalf(num) {
    return Math.round(num * 2) / 2;
}

function renderTableRow(date, expectedWeight) {
    let tr = document.createElement('tr');
    let tableDate = document.createElement('td');
    let weightOnDay = document.createElement('td');
    let table = document.querySelector("#mainTable")
    tableDate.innerText = date
    weightOnDay.innerText = expectedWeight
    weightOnDay.classList.add("weightData")
    tr.appendChild(tableDate)
    tr.appendChild(weightOnDay)
    table.appendChild(tr)
}

function testRenderRow() {
    let maindiv = document.querySelector('#resultsWeightTable');
    let table = document.createElement('table');
    let tr = document.createElement('tr');
    let tableDate = document.createElement('td');
    let weightOnDay = document.createElement('td');
    tableDate.innerHTML = "test date"
    tr.appendChild(tableDate)
    table.appendChild(tr)
    maindiv.append(table)
}

function getDateRange() {
    for (let i = 0; i < days + 1; i++) {
        let tempDate = new Date(inputs.startDate)
        tempDate.setDate(tempDate.getDate() + i)
        let dt = tempDate
        dt = (dt.getMonth() + 1) + "/" + dt.getDate()
        renderTableRow(dt, "0")
    }
}


function printOutput(TDEE, carbWeight, gender, startDate, weighInDate) {
    safeMinCalories = (gender === "M") ? MIN_CAL_MALE : MIN_CAL_FEMALE;

    let infoHTML =
        `<strong>${getDaysUntilWeighIn(startDate, weighInDate)}</strong>
        <br>
        You will be able to lose an additional <strong>${carbWeight} pounds</strong> after eliminating carbs!
        <br>`;

    let resultsHTML =
        `Your Total Daily Caloric Expendature (maintaince) is <strong> ${Math.max(TDEE, safeMinCalories)}</strong> calories per day.
        <br>
        To lose 2 lbs / week, eat <strong> ${Math.max(TDEE - 1000, safeMinCalories)}</strong> calories per day.<br>
        To lose 1.5 lbs / week, eat <strong> ${Math.max(TDEE - 750, safeMinCalories)}</strong> calories per day<br>
        To lose 1 lbs / week, eat <strong> ${Math.max(TDEE - 500, safeMinCalories)}</strong> calories per day.<br>`;





    const safeMinCaloriesRegex = new RegExp(safeMinCalories, "g");
    document.querySelector("#resultsContainer").innerHTML = resultsHTML.replace(safeMinCaloriesRegex, `<abbr title = '${((gender === "M") ? "Men" : "Women")} are not advised to consume less than ${safeMinCalories} calories per day.'> ${safeMinCalories}</abbr>`);
    document.querySelector("#infoContainer").innerHTML = infoHTML.replace(safeMinCaloriesRegex, `< abbr title = '${((gender === "M") ? "Men" : "Women")} are not advised to consume less than ${safeMinCalories} calories per day.' > ${safeMinCalories}</abbr > `);

    // document.querySelector("#resultsWeightTable").innerHTML = weightTableHTML;

    document.querySelector("#resultsContainer").style.visibility = "visible";
    document.querySelector("#infoContainer").style.visibility = "visible";
    document.querySelector("#resultsWeightTable").style.visibility = "visible";
}


function formSubmit() {
    const inputs = {
        age: -1,

        weight: -1,
        weightUnit: "LBS",

        height: -1,
        heightUnit: "IN",

        bodyFatEntered: false,
        bodyFatPercent: -1,

        gender: "M",
        activityLevel: -1,
    };


    if (!validateFormInputs(inputs)) {
        return;
    }
    else {
        const TDEE = (inputs.bodyFatEntered) ? calculateTDEEwithBF(inputs.gender, inputs.weight, inputs.weightUnit, inputs.bodyFatPercent, inputs.activityLevel) : calculateTDEEnoBF(inputs.gender, inputs.age, inputs.weight, inputs.weightUnit, inputs.height, inputs.heightUnit, inputs.activityLevel);

        const carbWeight = carbStored(inputs.weight, inputs.bodyFatPercent);

        printOutput(TDEE, carbWeight, inputs.gender, inputs.startDate, inputs.weighInDate);

        testRenderRow();
    }
}


document.querySelector("#submitBtn").addEventListener("click", formSubmit);
