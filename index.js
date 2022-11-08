//set width of results and info divs to the same as the input form width
window.onload = () => {
    document.querySelector("#resultsContainer").style.width = window.getComputedStyle(document.querySelector("#inputsContainer")).getPropertyValue("width");
    document.querySelector("#infoContainer").style.width = window.getComputedStyle(document.querySelector("#inputsContainer")).getPropertyValue("width");
    document.querySelector("#resultsWeightTable").style.width = window.getComputedStyle(document.querySelector("#inputsContainer")).getPropertyValue("width");
    document.querySelector("#errorStatsChangeNeeded").style.width = window.getComputedStyle(document.querySelector("#inputsContainer")).getPropertyValue("width");
};

const KILOGRAMS_PER_POUND = 0.4536;
const CENTIMETERS_PER_INCH = 2.54;
const CM2_PER_M2 = 10000;

const MIN_CAL_FEMALE = 1200;
const MIN_CAL_MALE = 1500;

const MALE_CAL_MODIFIER = 5;
const FEMALE_CAL_MODIFIER = -161;

let days;
let weekOutWeight;
let totalDaysForCalLoss;
let startingWeight;
let weightClass;
let minWeightLossPerWeekNum;
let isPossible;
let lbsPerWeek;
let calData;
let myTDEE;


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

    myTDEE = TDEE
    return TDEE;
}

function assignGlobalVar(targetWeight, weight) {
    weightClass = targetWeight
    startingWeight = weight;
    let weekOutNum = Math.round((weightClass * 1.0625) * 2) / 2;
    weekOutWeight = weekOutNum
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
    let myReturn = (muscleStored + liverStored).toFixed(2)
    return (muscleStored + liverStored).toFixed(2);
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

function createBaseTable() {
    let maindiv = document.querySelector('#resultsWeightTable');
    let table = document.createElement('table');
    let tr = document.createElement('tr');
    let th1 = document.createElement('th');
    let th2 = document.createElement('th');
    let th3 = document.createElement('th');
    let th4 = document.createElement('th');
    let th5 = document.createElement('th');
    let th6 = document.createElement('th');
    th1.innerHTML = "Date";
    th2.innerHTML = "Expected Weight";
    th3.innerHTML = "Notes";
    th4.innerHTML = "Water";
    th5.innerHTML = "Carbs";
    th6.innerHTML = "Salt";
    tr.appendChild(th1);
    tr.appendChild(th2);
    tr.appendChild(th3);
    tr.appendChild(th4);
    tr.appendChild(th5);
    tr.appendChild(th6);
    table.appendChild(tr);
    table.classList.add("mainWeightTable", "table", "table-dark", "table-bordered")
    maindiv.append(table);

}

function renderTableRow(date, expectedWeight) {
    let tr = document.createElement('tr');
    let tableDate = document.createElement('td');
    let weightOnDay = document.createElement('td');
    let noteData = document.createElement('td');
    let carbData = document.createElement('td');
    let saltData = document.createElement('td');
    let waterData = document.createElement('td');
    let table = document.querySelector(".mainWeightTable")
    tableDate.innerText = date
    noteData.classList.add("noteData")
    carbData.classList.add("carbData")
    saltData.classList.add("saltData")
    waterData.classList.add("waterData")
    weightOnDay.innerText = expectedWeight
    weightOnDay.classList.add("weightData")
    tr.appendChild(tableDate)
    tr.appendChild(weightOnDay)
    tr.appendChild(noteData)
    tr.appendChild(waterData)
    tr.appendChild(carbData)
    tr.appendChild(saltData)
    table.appendChild(tr)
}

function printDatesForTable(startDate) {
    for (let i = 0; i < days + 1; i++) {
        let tempDate = new Date(startDate)
        tempDate.setDate(tempDate.getDate() + 1)
        tempDate.setDate(tempDate.getDate() + i)
        let dt = tempDate
        dt = (dt.getMonth() + 1) + "/" + dt.getDate()
        renderTableRow(dt, "0")
    }
}

function weightLossFromCal(startWeight) {
    let tds = document.querySelectorAll('.weightData')
    let startDelim = 0
    for (let weightNum of tds) {
        weightNum.innerText = roundNearestHalf(startWeight - startDelim)
        startDelim += caloricWeightLossNeededPerDay();
    }
}

function wipeTable() {
    let maindiv = document.querySelector('#resultsWeightTable')
    maindiv.innerHTML = ''
}

function addInfo(weight, weightClass) {
    weightLossFromCal(weight)
    weekOfWeighIn(weightClass)
    waterInfo();
    carbInfo();
    addCalorieInfo();
    saltInfo();
    notesForWeekOf();

}

function weekOfWeighIn(targetWeight) {
    let tds = document.querySelectorAll('.weightData')
    let weightRemaining = (parseInt(weekOutWeight) - (parseInt(targetWeight) + 6.5)) / 3
    let threeDayOut = parseInt(targetWeight) + 6.5
    tds[tds.length - 7].innerText = weekOutWeight
    tds[tds.length - 6].innerText = roundNearestHalf(parseInt(threeDayOut) + weightRemaining * 3)
    tds[tds.length - 5].innerText = roundNearestHalf(parseInt(threeDayOut) + weightRemaining * 2)
    tds[tds.length - 4].innerText = roundNearestHalf(parseInt(threeDayOut) + weightRemaining)
    tds[tds.length - 3].innerText = threeDayOut
    tds[tds.length - 2].innerText = parseInt(targetWeight) + 4.5
    tds[tds.length - 1].innerText = parseInt(targetWeight) + 3
}

function notesForWeekOf() {
    let tds = document.querySelectorAll('.noteData')
    tds[tds.length - 10].innerText = "Reduce carbs to under 20 grams per day"
    tds[tds.length - 7].innerText = "Hyper hydration process starts!"
    tds[tds.length - 5].innerText = "Reduce carbs to under 10 grams per day"
    tds[tds.length - 1].innerText = "Morning sauna or bath for the last 2-3 pounds"
}

function waterInfo() {
    let tds = document.querySelectorAll('.waterData')
    for (let td of tds) {
        td.innerText = "1 Gal"
    }
    tds[tds.length - 7].innerHTML = "2 Gal"
    tds[tds.length - 6].innerText = "2 Gal"
    tds[tds.length - 5].innerText = "2 Gal"
    tds[tds.length - 4].innerText = "1 Gal"
    tds[tds.length - 3].innerText = ".5 Gal"
    tds[tds.length - 2].innerText = ".25 Gal"
    tds[tds.length - 1].innerText = "0 Gal"
}

function carbInfo() {
    let tds = document.querySelectorAll('.carbData')
    for (let td of tds) {
        td.innerText = "Normal"
    }
    tds[tds.length - 10].innerText = "> 20G"
    tds[tds.length - 9].innerText = "> 20G"
    tds[tds.length - 8].innerText = "> 20G"
    tds[tds.length - 7].innerText = "> 20G"
    tds[tds.length - 6].innerText = "> 20G"
    tds[tds.length - 5].innerText = "> 10G"
    tds[tds.length - 4].innerText = "> 10G"
    tds[tds.length - 3].innerText = "0G"
    tds[tds.length - 2].innerText = "0G"
    tds[tds.length - 1].innerText = "0G"
}

function saltInfo() {
    let tds = document.querySelectorAll('.saltData')
    for (let td of tds) {
        td.innerText = "Normal"
    }

    tds[tds.length - 8].innerText = "Normal/High"
    tds[tds.length - 7].innerText = "High"
    tds[tds.length - 6].innerText = "High"
    tds[tds.length - 5].innerText = "Normal/High"
    tds[tds.length - 4].innerText = "Normal"
    tds[tds.length - 3].innerText = "None"
    tds[tds.length - 2].innerText = "None"
    tds[tds.length - 1].innerText = "None"
}


function addCalorieInfo() {
    if (minWeightLossPerWeekNum < 2 && minWeightLossPerWeekNum > 1.5) {
        calData = (myTDEE - 1000)
    }
    if (minWeightLossPerWeekNum < 1.5 && minWeightLossPerWeekNum > 1) {
        calData = (myTDEE - 750)
    }
    if (minWeightLossPerWeekNum < 1 && minWeightLossPerWeekNum > .5) {
        calData = (myTDEE - 500)
    }
    if (minWeightLossPerWeekNum < .5 && minWeightLossPerWeekNum > .1) {
        calData = (myTDEE - 250)
    }
    if (minWeightLossPerWeekNum < 0) {
        calData = myTDEE
    }
    let tds = document.querySelectorAll('.noteData')
    for (let td of tds) {
        td.innerText = `Total daily calories: ${calData}`
    }


}

function caloricWeightLossNeededPerDay() {
    let tds = document.querySelectorAll('.weightData')
    totalDaysForCalLoss = (tds.length - 7)
    totalAmountToLose = startingWeight - weekOutWeight
    minWeightLossPerWeek = totalAmountToLose / (totalDaysForCalLoss / 7)
    minWeightLossPerWeekNum = minWeightLossPerWeek
    if ((minWeightLossPerWeekNum) > 2) {
        // console.log("suggested to move up weight class or increase time until comp")
        isPossible = false
        return parseFloat(minWeightLossPerWeek / 7)
    }
    else if (minWeightLossPerWeekNum < 2) {
        isPossible = true
        return parseFloat(minWeightLossPerWeekNum / 7)
    }
}

function printOutput(TDEE, carbWeight, gender, startDate, weighInDate) {
    safeMinCalories = (gender === "M") ? MIN_CAL_MALE : MIN_CAL_FEMALE;

    let infoHTML =
        `<strong>${getDaysUntilWeighIn(startDate, weighInDate)}</strong>
        <br>
        Can lose an additional <strong>${carbWeight} pounds</strong> after eliminating carbs!
        <br>`;

    let resultsHTML =
        `Your Total Daily Caloric Expendature (maintenance) is <strong> ${Math.max(TDEE, safeMinCalories)}</strong> calories per day.
        <br>
        To lose 2 lbs / week, eat <strong> ${Math.max(TDEE - 1000, safeMinCalories)}</strong> calories per day.<br>
        To lose 1.5 lbs / week, eat <strong> ${Math.max(TDEE - 750, safeMinCalories)}</strong> calories per day<br>
        To lose 1 lbs / week, eat <strong> ${Math.max(TDEE - 500, safeMinCalories)}</strong> calories per day.<br>`;

    let errorStats = `<h3>Cannot provide a table for you as it is strongly recommend to go up a weight class or increase the time until competition.</h3>`



    const safeMinCaloriesRegex = new RegExp(safeMinCalories, "g");
    document.querySelector("#resultsContainer").innerHTML = resultsHTML.replace(safeMinCaloriesRegex, `<abbr title = '${((gender === "M") ? "Men" : "Women")} are not advised to consume less than ${safeMinCalories} calories per day.'> ${safeMinCalories}</abbr>`);
    document.querySelector("#infoContainer").innerHTML = infoHTML.replace(safeMinCaloriesRegex, `< abbr title = '${((gender === "M") ? "Men" : "Women")} are not advised to consume less than ${safeMinCalories} calories per day.' > ${safeMinCalories}</abbr > `);

    document.querySelector("#errorStatsChangeNeeded").innerHTML = errorStats;

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

        assignGlobalVar(inputs.weightClass, inputs.weight);

        const TDEE = (inputs.bodyFatEntered) ? calculateTDEEwithBF(inputs.gender, inputs.weight, inputs.weightUnit, inputs.bodyFatPercent, inputs.activityLevel) : calculateTDEEnoBF(inputs.gender, inputs.age, inputs.weight, inputs.weightUnit, inputs.height, inputs.heightUnit, inputs.activityLevel);

        const carbWeight = carbStored(inputs.weight, inputs.bodyFatPercent);

        wipeTable();

        printOutput(TDEE, carbWeight, inputs.gender, inputs.startDate, inputs.weighInDate);

        createBaseTable();

        printDatesForTable(inputs.startDate)

        addInfo(inputs.weight, inputs.weightClass);

        if (isPossible) {
            document.querySelector("#errorStatsChangeNeeded").style.visibility = "collapse";

        }
        else {
            console.log(isPossible)
            document.querySelector("#resultsWeightTable").style.visibility = "collapse";
            document.querySelector("#errorStatsChangeNeeded").style.visibility = "visible";
        }
    }
}


document.querySelector("#submitBtn").addEventListener("click", formSubmit);
