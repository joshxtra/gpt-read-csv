// Declare base variables in the outer scope
const cameraUrls = [
    "http://192.168.2.191/cgi-bin/aw_ptz?cmd=",
    "http://192.168.2.192/cgi-bin/aw_ptz?cmd=",
    "http://192.168.2.193/cgi-bin/aw_ptz?cmd=",
    "http://192.168.2.194/cgi-bin/aw_ptz?cmd=",
    "http://192.168.2.195/cgi-bin/aw_ptz?cmd=",
    "http://192.168.2.196/cgi-bin/aw_ptz?cmd=",
];

const csvPath = 'presets/ptz-presets.csv'; // Path to csv file
let offset = document.getElementById('presetRange').value - 1; // Default preset offset value
console.log(offset)
let parsedCSV = [];

// fileInput observer
const fileInput = document.getElementById("fileInput");
const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
        if (mutation.type === "attributes" && mutation.attributeName === "lastModified") {
            fileInput.click(); // Trigger re-selection
            parseCSVFromUpload()
                .then(parsedCSV => {
                    console.log(parsedCSV); // (Optional) Verify data
                    initButtonGrid(parsedCSV, offset);
                })
                .catch(error => console.error("Error:", error));
        }
    });
});

observer.observe(fileInput, { attributes: true });


/* // Add event listener for fileInput change
fileInput.addEventListener('change', function () {
    parseCSVFromUpload()
        .then(parsedCSV => {
            console.log(parsedCSV); // (Optional) Verify data
            initButtonGrid(parsedCSV, offset);
        })
        .catch(error => console.error("Error:", error));
}); */

// Event listener for file input
fileInput.addEventListener('change', (event) => {
    const file = event.target.files[0];
    if (file) {
        Papa.parse(file, {
            complete: function(results) {
                parsedCSV = results.data; // Store the parsed CSV data in the variable
                initButtonGrid(parsedCSV, offset); // Create buttons from the CSV data
            }
        });
    }
});


// Add event listener to the save-checkbox
document.getElementById('storePresetToggle').addEventListener('change', function () {
    confirmationMessage.style.display = 'none';
    initButtonGrid(parsedCSV);
});

// Add event listener to the save-checkbox
document.getElementById('storePresetToggle').addEventListener('change', function () {
    initButtonGrid(parsedCSV);
});


// Add event listener for offset
document.getElementById('presetRange').addEventListener('change', function () {
    initButtonGrid(parsedCSV);
});

// Add event listener to the range-checkbox
document.getElementById('displayRangeToggle').addEventListener('change', function () {
    initButtonGrid(parsedCSV);
});

// Add event listener to the displayRange
document.getElementById('displayRange').addEventListener('change', function () {
    initButtonGrid(parsedCSV, offset);
});

// Add event listener to the displayRange
document.getElementById('showConfirmationToggle').addEventListener('change', function () {
    initButtonGrid(parsedCSV, offset);
});

// Add event listener to the displayRange
document.getElementById('renderCamNumbersToggle').addEventListener('change', function () {
    initButtonGrid(parsedCSV, offset);
});


/* // Add event listener to the loadCSVButton
document.getElementById('loadCSVButton').addEventListener('click', () => {
    const offset = document.getElementById('presetRange').value - 1; // Default preset offset value
    console.log(offset);
    parseCSVFromUpload()
        .then(parsedCSV => {
            console.log(parsedCSV); // (Optional) Verify data
            parsedCSV = parsedCSV;
            initButtonGrid(parsedCSV, offset);
        })
        .catch(error => console.error("Error:", error));
}); */


function getOffset() {
    const offset = document.getElementById('presetRange').value - 1; // Default preset offset value
    console.log('getOffset: ' + offset)
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

// Function to create button elements from the data-array
function initButtonGrid(data) {

    // Clear the buttonGrid before creating new buttons  
    const buttonGrid = document.getElementById('buttonGrid');
    buttonGrid.innerHTML = '';

    // Get states of save-checkboxes if saving or recalling presets
    const storePresets = document.getElementById('storePresetToggle').checked;
    const showConfirmation = document.getElementById('showConfirmationToggle').checked;

    // Get state of range-checkbox
    var showOnlyX = document.getElementById('displayRangeToggle').checked;

    // Change background color of the page to white for both cases
    if (storePresets && !showConfirmation){
        document.body.classList.add('blinking-background');
    } else {
        document.body.classList.remove('blinking-background');
    };

    // determine user settings
    let offset = getOffset();
    let displayRange = parseInt(document.getElementById('displayRange').value);
    let startPreset = offset - 49;
    let endPreset = startPreset + displayRange;
    let renderCameraNumbers = document.getElementById('renderCamNumbersToggle').checked;
    console.log('startPreset: ' + startPreset);
    console.log('endPreset: ' + endPreset);    
    console.log('displayRange: ' + displayRange);

    // Iterate over each row starting from the second row (skipping the header row)
    for (var i = startPreset; i < (showOnlyX ? endPreset : data.length); i++) {
        let presetNum = data[i][0]; // Get the preset number from the first column
        // Iterate over each camera's preset data
        for (var j = 1; j < data[i].length; j++) {
            let cameraNum = j; // Get the camera number
            let presetName = data[i][j]; // Get the preset name

            const cameraUrl = cameraUrls[cameraNum - 1] + (storePresets ? '%23M' : '%23R') + ((presetNum < 10) ? '0' + (presetNum - 1) : (presetNum - 1)) + '&res=1';
            const button = document.createElement('button');
            //button.textContent = (presetNum < 10) ? '0' + presetNum + ' ' + presetName.trim() : presetNum + ' ' + presetName.trim();
            button.classList.add('cam' + (cameraNum)); // Add "cam" and "preset" prefix to button class
            button.classList.add('preset' + presetNum);
            button.classList.add('camButton');
/*          const buttonNumText = document.createElement('p');
            buttonNumText.classList.add('buttonNumText');
            buttonNumText.innerHTML = cameraNum + '<br>' + presetNum; */
            if (renderCameraNumbers) {
                button.innerHTML = '<div class="buttonNumbers"><p class="cameraNumText">' + cameraNum + '</p><p class="presetNumText">' + presetNum + '</p></div>';
            } else {
                button.innerHTML = '<div class="buttonNumbers"><p class="presetNumText">' + presetNum + '</p></div>';
            };
            const presetNameText = document.createElement('p');
            presetNameText.textContent = presetName.trim();
            presetNameText.classList.add('presetNameText');


            // Button EventListener
            button.addEventListener('click', () => {
                const responseData = handleButtonClicking(presetNum, cameraNum, cameraUrl, storePresets, showConfirmation);
                handleButtonHighlighting(presetNum, cameraNum, responseData);
            });

            // Append the button directly to the buttonGrid
            buttonGrid.appendChild(button);
            //button.appendChild(buttonNumText);
            button.appendChild(presetNameText);
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
function handleButtonClicking(presetNum, cameraNum, cameraUrl, storePresets, showConfirmation) {
    if (storePresets) {
        const confirmed = (showConfirmation ? confirm('Möchtest du das Preset ' + presetNum + ' der Kamera ' + (cameraNum) + ' wirklich speichern?') : true);
        if (!confirmed) {
            return false; // Prevents default behavior (opening link in new tab)
        } else {
            console.log('test');
        }
        fetchDataFake(cameraUrl, function (response) {
            console.log('Received text data:', response);
        });
        confirmationMessage = document.getElementById('confirmationMessage');
        confirmationMessage.innerHTML = (cameraNum) + ' - ' + (presetNum) + ' gespeichert';
        confirmationMessage.style.display = 'block';
        return responseData;
    }

    //fetch(cameraUrl); // Sends a GET request to the specified URL
    fetchDataFake(cameraUrl, function (response) {
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

function fetchDataFake(url, callback) {
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




parseCSVFromFile(csvPath)
    .then(parsedData => {
        console.log(parsedData); // (Optional) Verify data
        parsedCSV = parsedData; // Store parsed data
    })
    .catch(error => console.error("Error:", error));



// INIT
function INIT() {
    parseCSVFromFile(csvPath)
        .then(parsedData => {
            console.log(parsedData); // (Optional) Verify data

            initButtonGrid(parsedData, getOffset());
        })
        .catch(error => console.error("Error:", error));
};