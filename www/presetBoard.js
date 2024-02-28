// Declare base variables in the outer scope
const cameraUrls = [
    "http://192.168.2.191/cgi-bin/aw_ptz?cmd=",
    "http://192.168.2.192/cgi-bin/aw_ptz?cmd=",
    "http://192.168.2.193/cgi-bin/aw_ptz?cmd=",
    "http://192.168.2.194/cgi-bin/aw_ptz?cmd=",
    "http://192.168.2.195/cgi-bin/aw_ptz?cmd=",
    "http://192.168.2.196/cgi-bin/aw_ptz?cmd=",
];

const csvPath = 'ptz-presets.csv'; // Path to csv file
const offset = document.getElementById('startPreset').value - 1; // Default preset offset value
console.log(offset)

// fileInput observer
const fileInput = document.getElementById("fileInput");
const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
        if (mutation.type === "attributes" && mutation.attributeName === "lastModified") {
            fileInput.click(); // Trigger re-selection
            parseCSVFromUpload()
                .then(parsedData => {
                    console.log(parsedData); // (Optional) Verify data
                    initButtonGrid(parsedData);
                })
                .catch(error => console.error("Error:", error));
        }
    });
});

observer.observe(fileInput, { attributes: true });


// Add event listener for fileInput change
fileInput.addEventListener('change', function () {
    parseCSVFromUpload()
        .then(parsedData => {
            console.log(parsedData); // (Optional) Verify data
            initButtonGrid(parsedData);
        })
        .catch(error => console.error("Error:", error));
});


// Add event listener for offset
document.getElementById('startPreset').addEventListener('change', function () {
    const offset = document.getElementById('startPreset').value - 1; // Default preset offset value
    console.log(offset)
    parseCSVFromUpload()
        .then(parsedData => {
            console.log(parsedData); // (Optional) Verify data
            initButtonGrid(parsedData);
        })
        .catch(error => console.error("Error:", error));
});

// Add event listener to the loadCSVButton
document.getElementById('loadCSVButton').addEventListener('click', () => {
    const offset = document.getElementById('startPreset').value - 1; // Default preset offset value
    console.log(offset);
    parseCSVFromUpload()
        .then(parsedData => {
            console.log(parsedData); // (Optional) Verify data
            initButtonGrid(parsedData);
        })
        .catch(error => console.error("Error:", error));
});


// Add event listener to the checkbox
document.getElementById('storePresetToggle').addEventListener('change', function () {
    const offset = document.getElementById('startPreset').value - 1; // Default preset offset value
    console.log(offset)
    parseCSVFromUpload()
        .then(parsedData => {
            console.log(parsedData); // (Optional) Verify data
            initButtonGrid(parsedData);
        })
        .catch(error => console.error("Error:", error));
});


const buttonGrid = document.getElementById("buttonGrid");
const editContainer = document.getElementById("editContainer");
const saveButton = document.getElementById("saveButton");
const editButton = document.getElementById("editButton");

let grid = null;

// Function to create buttons
function createButtons() {
    buttonGrid.innerHTML = "";
    parsedCSV.forEach(item => {
        const button = document.createElement("button");
        button.textContent = item.text; // Assuming the button text is in an "text" property
        // ... other button configurations
        buttonGrid.appendChild(button);
    });
}

// Edit button click handler
editButton.addEventListener("click", () => {
    if (!grid) {
        // Create DataGridXL once
        grid = new DataGridXL(document.getElementById("grid"), {
            data: parsedCSV,
            // ... other DataGridXL options
        });
    }
    editContainer.style.display = "block";
    buttonGrid.style.display = "none";
});

// Save changes button click handler
saveButton.addEventListener("click", () => {
    parsedCSV = grid.getData();
    grid = null; // Destroy the grid
    editContainer.style.display = "none";
    buttonGrid.style.display = "block";
    initButtonGrid(parsedCSV);
});


function getOffset() {
    const offset = document.getElementById('startPreset').value - 1; // Default preset offset value
    console.log(offset)
    return offset;
}

// Func to read the csv File
async function parseCSVFromFile(filePath) {
    let response = await fetch(filePath);
    let csvString = await response.text();
    const parsedCSV = Papa.parse(csvString).data;
    return parsedCSV;
}

async function parseCSVFromUpload() {
    const file = fileInput.files[0]; // Access the first selected file

    if (!file) {
        throw new Error("Please select a CSV file to upload.");
    }

    const reader = new FileReader();
    try {
        const csvString = await new Promise((resolve, reject) => {
            reader.onload = (event) => resolve(event.target.result);
            reader.onerror = (error) => reject(error);
            reader.readAsText(file);
        });
        //const parsedCSV = await parseCSV(csvString);
        const parsedCSV = Papa.parse(csvString).data;
        return parsedCSV;

    } catch (error) {
        console.error("Error parsing CSV:", error);
        throw error; // Re-throw to handle in the `catch` block of the caller
    }
}

// Func to parse info from csv to an Array
function parseCSV(csvString) {
    // Split the CSV string into rows
    var rows = csvString.split('\n');

    // Initialize an array to hold the rows
    var parsedCSV = [];

    // Iterate over each row
    rows.forEach(function (row) {
        // Split the row into individual values
        var values = row.split(',');

        // Push the row's values to the data array
        parsedCSV.push(values);
    });

    return parsedCSV;
}

// Function to create button elements from the data-array
function initButtonGrid(data, offset) {
    4

    const buttonGrid = document.getElementById('buttonGrid');
    buttonGrid.innerHTML = '';

    // Get state of checkbox if saving or recalling presets
    const storePresets = document.getElementById('storePresetToggle').checked;

    // Change background color of the page to white for both cases
    document.body.style.backgroundColor = 'white';

    // Iterate over each row starting from the second row (skipping the header row)
    for (var i = 1; i < data.length; i++) {
        let presetNum = data[i][0]; // Get the preset number from the first column
        // Iterate over each camera's preset data
        for (var j = 1; j < data[i].length; j++) {
            let cameraNum = j; // Get the camera number
            let presetName = data[i][j]; // Get the preset name

            const cameraUrl = cameraUrls[cameraNum - 1] + (storePresets ? '%23M' : '%23R') + ((presetNum < 10) ? '0' + (presetNum - 1) : (presetNum - 1)) + '&res=1';
            const button = document.createElement('button');
            button.textContent = (presetNum < 10) ? '0' + presetNum + ' ' + presetName.trim() : presetNum + ' ' + presetName.trim();
            button.classList.add('cam' + (cameraNum)); // Add "cam" and "preset" prefix to button class
            button.classList.add('preset' + presetNum);
            button.classList.add('camButton');

            // Button EventListener
            button.addEventListener('click', () => {
                const responseData = handleButtonClicking(presetNum, cameraNum, cameraUrl, storePresets);
                handleButtonHighlighting(presetNum, cameraNum, responseData);
            });

            // Append the button directly to the buttonGrid
            buttonGrid.appendChild(button);
        };
    };
};


async function fetchData(url) {
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const data = await response.text(); // Assuming the response is JSON data, use response.text() for plain text
        return data;
    } catch (error) {
        console.error('Error fetching data:', error);
        return null; // Return null or handle error as needed
    }
}


// Function to handle Button Clicking (sending correct command and returning response)
function handleButtonClicking(presetNum, cameraNum, cameraUrl, storePresets) {
    if (storePresets) {
        const confirmed = confirm('Möchtest du das Preset ' + presetNum + ' der Kamera ' + (cameraNum) + ' wirklich speichern?');
        if (!confirmed) {
            return false; // Prevents default behavior (opening link in new tab)
        } else {
            console.log('test');
        }
        (async () => {
            const responseData = await fetchData(cameraUrl);
            console.log('Response data:', responseData);
        })();
        return responseData;
    }
    //(async () => {
    //    const responseData = await fetchData(cameraUrl);
    //    console.log('Response data:', responseData); 
    //})();
    //fetch(cameraUrl); // Sends a GET request to the specified URL
    fetchDataJson(cameraUrl, function (response) {
        console.log('Received text data:', response);
    });
}


// Highlight the selected Button and remove highlight from other Buttons
function handleButtonHighlighting(presetNum, cameraNum, responseData) {
    const camButtons = document.querySelectorAll('.cam' + cameraNum);
    camButtons.forEach(camButton => {
        camButton.classList.remove('cam' + cameraNum + 'ActivePreset');
    });
    const activeButton = document.getElementsByClassName('cam' + cameraNum + ' preset' + presetNum)
    activeButton[0].classList.add('cam' + cameraNum + 'ActivePreset');

    return false; // Prevents default behavior (opening link in new tab)
}

function fetchDataJson(url, callback) {
    const callbackName = 'jsonpCallback_' + Math.round(100000 * Math.random());
    const script = document.createElement('script');

    window[callbackName] = function (responseText) {
        // Invoke the provided callback function with the received plain text data
        callback(responseText);

        // Clean up
        document.body.removeChild(script);
        delete window[callbackName];
    };

    script.src = url;
    document.body.appendChild(script);
}






// INIT
function INIT() {
    parseCSVFromFile(csvPath)
        .then(parsedData => {
            console.log(parsedData); // (Optional) Verify data
            initButtonGrid(parsedData);
        })
        .catch(error => console.error("Error:", error));
};