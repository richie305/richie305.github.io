// Initialize data storage
let foodLogs = JSON.parse(localStorage.getItem('foodLogs')) || [];
let bathroomLogs = JSON.parse(localStorage.getItem('bathroomLogs')) || [];
let savedFoodTypes = JSON.parse(localStorage.getItem('savedFoodTypes')) || [];

// DOM Elements
const foodForm = document.getElementById('food-form');
const bathroomForm = document.getElementById('bathroom-form');
const foodLogsContainer = document.getElementById('food-logs');
const bathroomLogsContainer = document.getElementById('bathroom-logs');
const timelineContainer = document.getElementById('timeline');
const exportBtn = document.getElementById('export-btn');
const foodTypesDatalist = document.getElementById('food-types');

// Initialize food types datalist
function updateFoodTypesDatalist() {
    foodTypesDatalist.innerHTML = savedFoodTypes
        .map(type => `<option value="${type}">`)
        .join('');
}
updateFoodTypesDatalist();

// Format timestamp
function formatTimestamp(timestamp) {
    return new Date(timestamp).toLocaleString();
}

// Create log entry element
function createLogEntry(log, type) {
    const entry = document.createElement('div');
    entry.className = 'log-entry';

    if (type === 'food') {
        entry.innerHTML = `
            <div>
                <strong>${log.type}</strong> - ${log.quantity}
            </div>
            <div>${formatTimestamp(log.timestamp)}</div>
        `;
    } else {
        entry.innerHTML = `
            <div>
                <strong>${log.type}</strong> - ${log.location} - ${log.size} - ${log.consistency}
            </div>
            <div>${formatTimestamp(log.timestamp)}</div>
        `;
    }

    return entry;
}

// Update logs display
function updateLogsDisplay() {
    // Update food logs
    foodLogsContainer.innerHTML = '';
    foodLogs.slice().reverse().forEach(log => {
        foodLogsContainer.appendChild(createLogEntry(log, 'food'));
    });

    // Update bathroom logs
    bathroomLogsContainer.innerHTML = '';
    bathroomLogs.slice().reverse().forEach(log => {
        bathroomLogsContainer.appendChild(createLogEntry(log, 'bathroom'));
    });

    // Update timeline
    updateTimeline();
}

// Update timeline
function updateTimeline() {
    const allLogs = [
        ...foodLogs.map(log => ({ ...log, logType: 'food' })),
        ...bathroomLogs.map(log => ({ ...log, logType: 'bathroom' }))
    ].sort((a, b) => b.timestamp - a.timestamp);

    timelineContainer.innerHTML = '';
    allLogs.forEach(log => {
        const entry = document.createElement('div');
        entry.className = 'timeline-entry';

        if (log.logType === 'food') {
            entry.innerHTML = `
                <div><i class="fas fa-bowl-food"></i> Food: ${log.type} - ${log.quantity}</div>
                <div>${formatTimestamp(log.timestamp)}</div>
            `;
        } else {
            entry.innerHTML = `
                <div><i class="fas fa-toilet"></i> Bathroom: ${log.type} - ${log.location} - ${log.size} - ${log.consistency}</div>
                <div>${formatTimestamp(log.timestamp)}</div>
            `;
        }

        timelineContainer.appendChild(entry);
    });
}

// Handle food form submission
foodForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const foodType = document.getElementById('food-type').value;
    const quantity = document.getElementById('food-quantity').value;

    // Save new food type if it doesn't exist
    if (!savedFoodTypes.includes(foodType)) {
        savedFoodTypes.push(foodType);
        localStorage.setItem('savedFoodTypes', JSON.stringify(savedFoodTypes));
        updateFoodTypesDatalist();
    }

    // Add new food log
    foodLogs.push({
        type: foodType,
        quantity: quantity,
        timestamp: Date.now()
    });

    localStorage.setItem('foodLogs', JSON.stringify(foodLogs));
    updateLogsDisplay();
    foodForm.reset();
});

// Handle bathroom form submission
bathroomForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const formData = new FormData(bathroomForm);
    const bathroomLog = {
        location: formData.get('location'),
        type: formData.get('type'),
        size: formData.get('size'),
        consistency: formData.get('consistency'),
        timestamp: Date.now()
    };

    bathroomLogs.push(bathroomLog);
    localStorage.setItem('bathroomLogs', JSON.stringify(bathroomLogs));
    updateLogsDisplay();
    bathroomForm.reset();
});

// Handle export
exportBtn.addEventListener('click', () => {
    const allLogs = [
        ...foodLogs.map(log => ({
            type: 'Food',
            details: `${log.type} - ${log.quantity}`,
            timestamp: formatTimestamp(log.timestamp)
        })),
        ...bathroomLogs.map(log => ({
            type: 'Bathroom',
            details: `${log.type} - ${log.location} - ${log.size} - ${log.consistency}`,
            timestamp: formatTimestamp(log.timestamp)
        }))
    ].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    const csvContent = [
        ['Type', 'Details', 'Timestamp'],
        ...allLogs.map(log => [log.type, log.details, log.timestamp])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `molly-logs-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
});

// Initial display update
updateLogsDisplay();