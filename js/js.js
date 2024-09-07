const PUE = 1.125; // Average PUE for Microsoft Azure data centers
let carbonIntensity = 403; // Carbon intensity in gCO2/kWh
let complexityFactor = 1; // Default complexity factor

// Function to update carbon intensity
function updateCarbonIntensity(newIntensity) {
    carbonIntensity = newIntensity; // Update carbon intensity
}

// Function to format hours into days and years
function formatHoursToDays(hours) {
    const days = Math.floor(hours / 24);
    const years = Math.floor(days / 365);
    const remainingDays = days % 365;

    return years > 0 
        ? `${years} år og ${remainingDays} dage` 
        : `${days} dage`;
}

// Function to format numbers to Danish format
function formatNumber(num) {
    return new Intl.NumberFormat('da-DK').format(num);
}

// Event listener for complexity buttons
document.querySelectorAll('.complexity-button').forEach(button => {
    button.addEventListener('click', function() {
        complexityFactor = parseFloat(this.getAttribute('data-complexity'));
        document.querySelectorAll('.complexity-button').forEach(btn => btn.classList.remove('active'));
        this.classList.add('active');
        calculateCO2(); // Recalculate CO2 with the new complexity
    });
});

// Main function to calculate CO2 emissions
async function calculateCO2() {
    const monthlyUsage = document.getElementById('monthlyUsage').value;
    const model = document.getElementById('modelSelect').value;
    const generationType = document.getElementById('generationTypeSelect').value;
    const months = document.getElementById('monthRange').value;

    // Check if carbon intensity is set
    if (carbonIntensity === 0) {
        document.getElementById('result').innerText = 'Carbon intensitet er ikke sat. Opdater venligst carbon intensitet.';
        return;
    }

    // Energy usage per prompt based on selected model and generation type
    let kWhPerUse = generationType === 'image' 
        ? 2.907 
        : (model === '4' ? 0.04845 : 0.0004845);

    // Adjust energy usage with complexity factor
    const totalKWhPerMonth = monthlyUsage * kWhPerUse * PUE * complexityFactor;
    const totalCO2 = (totalKWhPerMonth * carbonIntensity) / 1000; // Convert to kg CO2
    const totalCO2ForMonths = totalCO2 * months;

    // Calculate mobile charges
    const kWhPerCharge = 0.015; // kWh per mobile charge
    const chargesForMonths = (totalKWhPerMonth / kWhPerCharge) * months;

    // Calculate annual water usage
    const waterUsagePerPrompt = 0.5 / 25; // Water usage per prompt
    const yearlyWaterUsage = monthlyUsage * waterUsagePerPrompt * 12;
    const waterUsageForMonths = (yearlyWaterUsage / 12) * months;

    // Calculate hours a bulb can light
    const wattage = 7; // Wattage of the bulb
    const totalKWh = totalKWhPerMonth * months;
    const hoursLight = totalKWh / (wattage / 1000); // Convert watt to kWh

    // Calculate Google searches
    const kWhPerSearch = 0.0003; // Energy per Google search
    const googleSearches = (yearlyWaterUsage / kWhPerSearch) * (months / 12);

    // Update results
    document.getElementById('result').innerHTML = `Din CO2-udledning er <span class="bold">${totalCO2ForMonths.toFixed(2)} kg CO2</span> for ${months} måned${months > 1 ? 'er' : ''}.`;
    document.getElementById('yearlyResult').innerHTML = `Din CO2-udledning er <span class="bold">${(totalCO2 * 12).toFixed(2)} kg CO2</span> om året.`;
    document.getElementById('chargeResult').innerHTML = `Dette svarer til <span class="bold">${formatNumber(chargesForMonths.toFixed(0))}</span> mobilopladninger for ${months} måned${months > 1 ? 'er' : ''}.`;
    document.getElementById('waterUsageResult').innerHTML = `Vandforbrug til nedkølning af datacentre for ${months} måned${months > 1 ? 'er' : ''}: <span class="bold">${waterUsageForMonths.toFixed(2)} liter</span>.`;
    document.getElementById('lightUsageResult').innerHTML = `Pæren kan lyse i <span class="bold">${formatHoursToDays(hoursLight)}</span> baseret på dit AI-forbrug.`;
    document.getElementById('searchResult').innerHTML = `Dette svarer til <span class="bold">${formatNumber(googleSearches.toFixed(0))}</span> Google-søgninger for ${months} måned${months > 1 ? 'er' : ''} 🔍.`;

    // Show result boxes
    document.querySelectorAll('.result-box').forEach(box => {
        box.style.display = 'block';
    });
}

// Listen for input events on the monthly usage field
document.getElementById('monthlyUsage').addEventListener('input', function() {
    const maxLength = 15; // Set the desired maximum length
    if (this.value.length > maxLength) {
        this.value = this.value.slice(0, maxLength); // Trim input to maximum length
    }
    calculateCO2(); // Call calculation function
});

// Update month value when slider changes
document.getElementById('monthRange').addEventListener('input', function() {
    const monthValue = document.getElementById('monthValue');
    monthValue.innerText = `${this.value} måned${this.value > 1 ? 'er' : ''}`;
    calculateCO2(); // Call calculation function
});

// Listen for changes in model and generation type
document.getElementById('modelSelect').addEventListener('change', calculateCO2);
document.getElementById('generationTypeSelect').addEventListener('change', calculateCO2);

// Example of updating carbon intensity
updateCarbonIntensity(403); // Set carbon intensity to 403 gCO2/kWh