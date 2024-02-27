// Define maximum number of slots
const maxSlots = 999;

// Define the Scenes array containing scene data
const Scenes = [
    { id: 1, camera: '1', preset: '01' },
    { id: 2, camera: '2', preset: '02' },
    { id: 3, camera: '3', preset: '03' },
];

// Function to generate slot items
function generateSlots() {
    const slotContainer = document.getElementById('slotContainer');
    slotContainer.innerHTML = ''; // Clear existing content

    for (let i = 0; i < maxSlots; i++) {
        const slotItem = document.createElement('div');
        slotItem.classList.add('slotItem');
        slotItem.textContent = `Slot ${padSlotIndex(i + 1)}: Cam${Scenes[i].camera} Preset${Scenes[i].preset}`; // Pad slot index with zeros
        slotItem.dataset.slotIndex = i; // Store slot index as a data attribute

        // Add click event listener to handle slot selection
        slotItem.addEventListener('click', () => {
            const selectedSlotIndex = parseInt(slotItem.dataset.slotIndex);
            // Call function to handle slot selection
            handleSlotSelection(selectedSlotIndex);
        });

        // Append slot item to the slot container
        slotContainer.appendChild(slotItem);
    }

    // Highlight the initially active slot
    handleSlotSelection(0);
}

// Function to call a scene based on its ID
function callScene(sceneId) {
    const scene = Scenes.find(scene => scene.id === sceneId);
    if (scene) {
        const cameraUrl = `http://192.168.2.19${scene.camera}/cgi-bin/aw_ptz?cmd=%23R${scene.preset}&res=1`;
        console.log(`Calling scene ${sceneId}: Camera ${scene.camera}, Preset ${scene.preset}`);
        fetch(cameraUrl);
    } else {
        console.error(`Scene ${sceneId} not found`);
    }
}

// Function to handle slot selection
function handleSlotSelection(slotIndex) {
    // Highlight the selected slot and remove highlight from other slots
    const slotItems = document.querySelectorAll('.slotItem');
    slotItems.forEach(slotItem => {
        slotItem.classList.remove('active');
    });
    slotItems[slotIndex].classList.add('active');

    // Get the ID of the selected slot
    const selectedSceneId = slotIndex + 1; // Assuming scene IDs start from 1

    // Check if the storeSceneToggle checkbox is checked
    const storeSceneToggle = document.getElementById('storeSceneToggle');
    if (!storeSceneToggle.checked) {
        // If checkbox is not checked, call the scene corresponding to the selected slot
        callScene(selectedSceneId);
    }
}

// Event listener for the storeSceneToggle checkbox
document.getElementById('storeSceneToggle').addEventListener('change', () => {
    // Handle slot selection when the checkbox state changes
    const selectedSlotIndex = getSelectedSlotIndex();
    handleSlotSelection(selectedSlotIndex);
});

// Function to pad slot index with zeros
function padSlotIndex(slotIndex) {
    return slotIndex.toString().padStart(3, '0');
}

// Function to navigate to the previous slot
document.getElementById('prevSlotButton').addEventListener('click', () => {
    const selectedSlotIndex = getSelectedSlotIndex();
    if (selectedSlotIndex > 0) {
        handleSlotSelection(selectedSlotIndex - 1); // Call handleSlotSelection with the previous slot index
    }
});

// Function to navigate to the next slot
document.getElementById('nextSlotButton').addEventListener('click', () => {
    const selectedSlotIndex = getSelectedSlotIndex();
    if (selectedSlotIndex < maxSlots - 1) {
        handleSlotSelection(selectedSlotIndex + 1); // Call handleSlotSelection with the next slot index
    }
});

// Function to get the index of the currently selected slot
function getSelectedSlotIndex() {
    const activeSlotItem = document.querySelector('.slotItem.active');
    if (activeSlotItem) {
        return parseInt(activeSlotItem.dataset.slotIndex);
    }
    return 0; // Return 0 if no slot is selected
}

// Generate initial slot items
generateSlots();
