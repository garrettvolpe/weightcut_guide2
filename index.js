
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

let dayOfWeightCut = .0195;

function validateFormInputs(inputs) {
    inputs.age = parseInt(document.querySelector("#age").value);
    inputs.weight = parseInt(document.querySelector("#weight").value);
    inputs.feet = parseInt(document.querySelector("#heightFeet").value)
    inputs.inch = parseInt(document.querySelector("#heightInch").value)
    inputs.height = (inputs.feet * 12) + inputs.inch
    inputs.startDate = document.getElementById('userSelectedStartDate').value;
    inputs.weighInDate = document.getElementById('userWeighInDate').value;
    inputs.weightClass = document.getElementById('weightClass').value;
    inputs.carbSelection = document.getElementById('carbs').value;
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
    const activityLevel = document.querySelector("#activityLevel");

    inputs.gender = gender.options[gender.selectedIndex].value;
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

function calculateTDEEwithBF(gender, weight, bodyFatPercent, activityMultiplier) {
    // Katch-McArdle
    // Katch = 370 + (21.6 * LBM)
    // where LBM is lean body mass 

    const safeMinCalories = (gender === "M") ? MIN_CAL_MALE : MIN_CAL_FEMALE;


    weight *= KILOGRAMS_PER_POUND;

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
    console.log("test1")
    bodyfat = parseFloat(bodyfat / 100)
    let liverStored = 0.77
    let muscleStored;
    let bodyfatMultiple = 1 - bodyfat
    let leanBodyMass = parseInt(weight) * bodyfatMultiple
    console.log("test2")
    if (parseFloat(bodyfat) > .15) {
        console.log("test3")
        muscleStored = (leanBodyMass * .015)
    }
    else if (parseFloat(bodyfat) <= .15) {
        console.log("test4")
        muscleStored = (leanBodyMass * .02)
    }
    console.log("test5")
    let myReturn = (muscleStored + liverStored).toFixed(2)
    console.log("test6")
    return (muscleStored + liverStored).toFixed(2);
}

function getDaysUntilWeighIn(start, end) {
    let date1 = new Date(start);
    let date2 = new Date(end);
    let diffDays = parseInt((date2 - date1) / (1000 * 60 * 60 * 24), 10);
    days = diffDays;
    return `${diffDays} days away<br> or <br>${parseFloat(diffDays / 7).toFixed(1)} weeks out.`;
}

function roundNearestHalf(num) {
    return Math.round(num * 2) / 2;
}

function createBaseTable() {
    let maindiv = document.querySelector('#resultsWeightTable');
    let tableButton = document.createElement('button')
    let table = document.createElement('table');
    let tr = document.createElement('tr');
    let th1 = document.createElement('th');
    let th2 = document.createElement('th');
    let th3 = document.createElement('th');
    let th4 = document.createElement('th');
    let th5 = document.createElement('th');
    let th6 = document.createElement('th');
    let th7 = document.createElement('th');
    tableButton.id = "tableButton"
    tableButton.innerText = "Clear Table"
    th1.innerHTML = "Date";
    th2.innerHTML = "Expected Weight";
    th3.innerHTML = "Calories";
    th4.innerHTML = "Water";
    th5.innerHTML = "Carbs";
    th6.innerHTML = "Salt";
    th7.innerHTML = "Notes";
    tr.appendChild(th1);
    tr.appendChild(th2);
    tr.appendChild(th3);
    tr.appendChild(th4);
    tr.appendChild(th5);
    tr.appendChild(th6);
    tr.appendChild(th7);
    table.appendChild(tr);
    table.classList.add("mainWeightTable", "table", "table-dark", "table-bordered")
    maindiv.append(tableButton)
    maindiv.append(table);
    document.getElementById("tableButton").addEventListener('click', () => {
        wipeTable()
    })
}

function renderTableRow(date, expectedWeight) {
    let tr = document.createElement('tr');
    let tableDate = document.createElement('td');
    let weightOnDay = document.createElement('td');
    let noteData = document.createElement('td');
    let carbData = document.createElement('td');
    let saltData = document.createElement('td');
    let waterData = document.createElement('td');
    let calorieData = document.createElement('td');
    let table = document.querySelector(".mainWeightTable")
    tableDate.innerText = date
    noteData.classList.add("noteData")
    calorieData.classList.add("calData")
    carbData.classList.add("carbData")
    saltData.classList.add("saltData")
    waterData.classList.add("waterData")
    weightOnDay.innerText = expectedWeight
    weightOnDay.classList.add("weightData")
    tr.appendChild(tableDate)
    tr.appendChild(weightOnDay)
    tr.appendChild(calorieData)
    tr.appendChild(waterData)
    tr.appendChild(carbData)
    tr.appendChild(saltData)
    tr.appendChild(noteData)
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


function addInfo(weight, weightClass, gender, bodyFatPercent, activityLevel) {
    weightLossFromCal(weight)
    weekOfWeighIn(weightClass)
    waterInfo();
    carbInfo();
    addCalorieInfo(gender, bodyFatPercent, activityLevel);
    saltInfo();
    notesForWeekOf();
    document.querySelector("#infoContainer").innerHTML += `<h5>You are expected to lose <strong> ${(caloricWeightLossNeededPerDay() * 7).toFixed(1)}</strong> pounds per week!</h5>`

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
    tds[tds.length - 2].innerText = "Can do an evening sauna or bath session if over expected weight"
    tds[tds.length - 1].innerText = "Morning sauna or bath for the last 2-3 pounds"
}

function waterInfo() {
    let tds = document.querySelectorAll('.waterData')
    for (let td of tds) {
        if (weightClass >= 145) {
            td.innerText = "1 Gal"
        }
        else {
            td.innerText = ".75 Gal"
        }
    }
    if (weightClass >= 145) {
        tds[tds.length - 7].innerHTML = "2 Gal"
        tds[tds.length - 6].innerText = "2 Gal"
        tds[tds.length - 5].innerText = "2 Gal"
        tds[tds.length - 4].innerText = "1 Gal"
        tds[tds.length - 3].innerText = ".5 Gal"
        tds[tds.length - 2].innerText = ".25 Gal"
        tds[tds.length - 1].innerText = "No Water"
    }
    else {
        tds[tds.length - 7].innerHTML = "1.5 Gal"
        tds[tds.length - 6].innerText = "1.5 Gal"
        tds[tds.length - 5].innerText = "1.5 Gal"
        tds[tds.length - 4].innerText = ".75 Gal"
        tds[tds.length - 3].innerText = ".4 Gal"
        tds[tds.length - 2].innerText = ".15 Gal"
        tds[tds.length - 1].innerText = "No Water"
    }
}

function carbInfo() {
    let tds = document.querySelectorAll('.carbData')
    for (let td of tds) {
        td.innerText = "Normal"
    }
    tds[tds.length - 10].innerText = "< 20G"
    tds[tds.length - 9].innerText = "< 20G"
    tds[tds.length - 8].innerText = "< 20G"
    tds[tds.length - 7].innerText = "< 20G"
    tds[tds.length - 6].innerText = "< 20G"
    tds[tds.length - 5].innerText = "< 10G"
    tds[tds.length - 4].innerText = "< 10G"
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

function addCalorieInfo(gender, bodyFatPercent, activityLevel) {
    let calLoss;
    if (minWeightLossPerWeekNum < 2 && minWeightLossPerWeekNum > 1.5) {
        calLoss = 1000
    }
    if (minWeightLossPerWeekNum < 1.5 && minWeightLossPerWeekNum > 1) {
        calLoss = 750
    }
    if (minWeightLossPerWeekNum < 1 && minWeightLossPerWeekNum > .5) {
        calLoss = 500
    }
    if (minWeightLossPerWeekNum < .5 && minWeightLossPerWeekNum > .1) {
        calLoss = 250
    }
    if (minWeightLossPerWeekNum < 0) {
        calLoss = 0
    }
    let tds = document.querySelectorAll('.calData')
    tds.forEach(function (td, i) {
        let currentWieghts = document.querySelectorAll('.weightData')
        let currentWeight = currentWieghts[i].innerText
        let newTDEE = calculateTDEEwithBF(gender, currentWeight, bodyFatPercent, activityLevel)
        let calRequirement = newTDEE - calLoss
        td.innerText = `${calRequirement}`
    })


}

function caloricWeightLossNeededPerDay() {
    let tds = document.querySelectorAll('.weightData')
    totalDaysForCalLoss = (tds.length - 7)
    totalAmountToLose = startingWeight - weekOutWeight
    minWeightLossPerWeek = totalAmountToLose / (totalDaysForCalLoss / 7)

    minWeightLossPerWeekNum = minWeightLossPerWeek
    if ((minWeightLossPerWeekNum) > 2) {
        isPossible = false
        return parseFloat(minWeightLossPerWeek / 7)
    }
    else if (minWeightLossPerWeekNum < 2 && minWeightLossPerWeekNum > 1.5) {
        if (startingWeight > 200) {
            isPossible = true
            return parseFloat(minWeightLossPerWeekNum / 7)
        }
        else {
            isPossible = false
            return parseFloat(minWeightLossPerWeekNum / 7)
        }

    }
    else if (minWeightLossPerWeek <= 1.5) {

        isPossible = true
        console.log(parseFloat(minWeightLossPerWeek / 7))
        return parseFloat(minWeightLossPerWeekNum / 7)
    }
}


function printOutput(TDEE, carbWeight, gender, startDate, weighInDate, carbSelection) {
    safeMinCalories = (gender === "M") ? MIN_CAL_MALE : MIN_CAL_FEMALE;

    let infoHTML;
    if (carbSelection === 'yes') {

        infoHTML =
            `<h4><strong>${getDaysUntilWeighIn(startDate, weighInDate)}</strong></h4>
        <br>
        <h6>Can lose an additional <strong>${carbWeight} pounds</strong> after eliminating carbs!</h6>`;
    }
    else {
        infoHTML =
            `<h4><strong>${getDaysUntilWeighIn(startDate, weighInDate)}</strong></h4>
        <br>`
    }
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

        const TDEE = (inputs.bodyFatEntered) ? calculateTDEEwithBF(inputs.gender, inputs.weight, inputs.bodyFatPercent, inputs.activityLevel) : calculateTDEEnoBF(inputs.gender, inputs.age, inputs.weight, inputs.weightUnit, inputs.height, inputs.heightUnit, inputs.activityLevel);

        const carbWeight = carbStored(inputs.weight, inputs.bodyFatPercent);

        wipeTable();

        printOutput(TDEE, carbWeight, inputs.gender, inputs.startDate, inputs.weighInDate, inputs.carbSelection);

        createBaseTable();


        printDatesForTable(inputs.startDate)

        addInfo(inputs.weight, inputs.weightClass, inputs.gender, inputs.bodyFatPercent, inputs.activityLevel);

        if (isPossible) {
            document.querySelector("#errorStatsChangeNeeded").style.visibility = "collapse";

        }
        else {
            document.querySelector("#resultsWeightTable").style.visibility = "collapse";
            document.querySelector("#errorStatsChangeNeeded").style.visibility = "visible";
        }
    }
}

try {
    document.querySelector("#submitBtn").addEventListener("click", formSubmit);
}
catch {

}

try {
    document.querySelector("#faq3Button").addEventListener("click", () => {
        currentWeightFAQ3 = parseInt(document.querySelector("#currentWeightFAQ3").value);
        weightClassFAQ3 = parseInt(document.querySelector("#weightClassFAQ3").value);
        weekOutWeightFAQ3 = Math.round((weightClassFAQ3 * 1.0625) * 2) / 2;
        amountOfWeeksFAQ3 = (currentWeightFAQ3 - weekOutWeightFAQ3) + 1
        if (amountOfWeeksFAQ3 > 12) {
            document.querySelector('.faqQuestion3').innerHTML = `
    <div style="text-align: center" class="alert alert-warning">Dieting for more than 12 weeks at a time is <strong>not recommended</strong>. It is encouraged to take 1-2 weeks off dieting every 12 weeks to ensure healthy hormone levels. </div>
    <h5 style="text-align: center">You will need to diet for a minimum of <strong> ${amountOfWeeksFAQ3}</strong> weeks to be able to make the <strong> ${weightClassFAQ3} </strong> weight class. This is assuming you can lose 1 lbs per week (500 cal deficit)</h5>`
        }
        else {
            document.querySelector('.faqQuestion3').innerHTML = `
        <h5 style="text-align: center">You will need to diet for a minimum of <strong> ${amountOfWeeksFAQ3}</strong> weeks to be able to make the <strong> ${weightClassFAQ3} </strong> weight class. This is assuming you can lose 1 lbs per week (500 cal deficit)</h5>`
        }


    });
}
catch {

}

