// --- Supabase Data Functions ---

async function fetchFoodLogs() {
  const { data, error } = await supabase
    .from("food_logs")
    .select("*")
    .order("timestamp", { ascending: false });
  return data || [];
}

async function fetchBathroomLogs() {
  const { data, error } = await supabase
    .from("bathroom_logs")
    .select("*")
    .order("timestamp", { ascending: false });
  return data || [];
}

async function addFoodLog(log) {
  await supabase.from("food_logs").insert([log]);
}

async function addBathroomLog(log) {
  await supabase.from("bathroom_logs").insert([log]);
}

async function updateFoodLog(id, log) {
  await supabase.from("food_logs").update(log).eq("id", id);
}

async function updateBathroomLog(id, log) {
  await supabase.from("bathroom_logs").update(log).eq("id", id);
}

async function deleteFoodLog(id) {
  await supabase.from("food_logs").delete().eq("id", id);
}

async function deleteBathroomLog(id) {
  await supabase.from("bathroom_logs").delete().eq("id", id);
}

// --- App State ---
let foodLogs = [];
let bathroomLogs = [];
let savedFoodTypes = [];

// DOM Elements
const foodForm = document.getElementById("food-form");
const bathroomForm = document.getElementById("bathroom-form");
const foodLogsContainer = document.getElementById("food-logs");
const bathroomLogsContainer = document.getElementById("bathroom-logs");
const timelineContainer = document.getElementById("timeline");
const exportBtn = document.getElementById("export-btn");
const foodTypesDatalist = document.getElementById("food-types");
const editModal = document.getElementById("edit-modal");
const editForm = document.getElementById("edit-form");
const closeModal = document.querySelector(".close-modal");
const deleteEntryBtn = document.getElementById("delete-entry");
const importFileInput = document.getElementById("import-file");
const foodLocationInput = document.getElementById("food-location");
const foodUseLocationBtn = document.getElementById("food-use-location");
const bathroomLocationInput = document.getElementById("bathroom-location");
const bathroomUseLocationBtn = document.getElementById("bathroom-use-location");

// Initialize food types datalist
function updateFoodTypesDatalist() {
  const types = Array.from(new Set(foodLogs.map((log) => log.type)));
  savedFoodTypes = types;
  foodTypesDatalist.innerHTML = types
    .map((type) => `<option value="${type}">`)
    .join("");
}
updateFoodTypesDatalist();

// Format timestamp
function formatTimestamp(timestamp) {
  return new Date(Number(timestamp)).toLocaleString();
}

// Create log entry element
function createLogEntry(log, type) {
  const entry = document.createElement("div");
  entry.className = "log-entry";

  if (type === "food") {
    entry.innerHTML = `
            <div>
                <strong>${log.type}</strong> - ${log.quantity}
                ${log.stolen ? '<span class="stolen-badge">Stolen!</span>' : ""}
                ${log.location ? `<div><small>Location: ${log.location}</small></div>` : ""}
            </div>
            <div>${formatTimestamp(log.timestamp)}</div>
        `;
  } else {
    entry.innerHTML = `
            <div>
                <strong>${log.type}</strong> - ${log.location} - ${log.size} - ${log.consistency}
                ${log.location ? `<div><small>Location: ${log.location}</small></div>` : ""}
            </div>
            <div>${formatTimestamp(log.timestamp)}</div>
        `;
  }

  return entry;
}

// Update logs display
function updateLogsDisplay() {
  // Update food logs
  foodLogsContainer.innerHTML = "";
  foodLogs.forEach((log) => {
    foodLogsContainer.appendChild(createLogEntry(log, "food"));
  });

  // Update bathroom logs
  bathroomLogsContainer.innerHTML = "";
  bathroomLogs.forEach((log) => {
    bathroomLogsContainer.appendChild(createLogEntry(log, "bathroom"));
  });

  // Update timeline
  updateTimeline();
  updateFoodTypesDatalist();
}

// Update timeline
function updateTimeline() {
  const allLogs = [
    ...foodLogs.map((log) => ({ ...log, logType: "food" })),
    ...bathroomLogs.map((log) => ({ ...log, logType: "bathroom" })),
  ].sort((a, b) => b.timestamp - a.timestamp);

  timelineContainer.innerHTML = "";
  allLogs.forEach((log) => {
    const entry = document.createElement("div");
    entry.className = "timeline-entry";

    if (log.logType === "food") {
      entry.innerHTML = `
                <div class="timeline-content">
                    <div><i class="fas fa-bowl-food"></i> Food: ${log.type} - ${log.quantity}</div>
                    <div>${formatTimestamp(log.timestamp)}</div>
                </div>
                <button class="btn btn-edit" data-id="${log.id}" data-type="food">
                    <i class="fas fa-edit"></i>
                </button>
            `;
    } else {
      entry.innerHTML = `
                <div class="timeline-content">
                    <div><i class="fas fa-toilet"></i> Bathroom: ${log.type} - ${log.location} - ${log.size} - ${log.consistency}</div>
                    <div>${formatTimestamp(log.timestamp)}</div>
                </div>
                <button class="btn btn-edit" data-id="${log.id}" data-type="bathroom">
                    <i class="fas fa-edit"></i>
                </button>
            `;
    }

    timelineContainer.appendChild(entry);
  });

  // Add event listeners to edit buttons
  document.querySelectorAll(".btn-edit").forEach((button) => {
    button.addEventListener("click", () =>
      openEditModal(button.dataset.id, button.dataset.type),
    );
  });
}

// Edit functionality
function openEditModal(id, type) {
  const log =
    type === "food"
      ? foodLogs.find((log) => log.id == id)
      : bathroomLogs.find((log) => log.id == id);

  if (!log) return;

  document.getElementById("edit-timestamp").value = log.timestamp;
  document.getElementById("edit-type").value = type;
  document.getElementById("edit-id").value = log.id;
  const editFields = document.getElementById("edit-fields");
  editFields.innerHTML = "";

  if (type === "food") {
    editFields.innerHTML = `
            <div class="form-group">
                <label for="edit-food-type">Food Type:</label>
                <input type="text" id="edit-food-type" value="${log.type}" required>
            </div>
            <div class="form-group">
                <label for="edit-food-quantity">Quantity:</label>
                <input type="text" id="edit-food-quantity" value="${log.quantity}" required>
            </div>
            <div class="form-group">
                <label class="checkbox-label">
                    <input type="checkbox" id="edit-food-stolen" ${log.stolen ? "checked" : ""}>
                    Stolen Food
                </label>
            </div>
            <div class="form-group">
                <label for="edit-food-location">Location:</label>
                <input type="text" id="edit-food-location" value="${log.location || ""}">
            </div>
        `;
  } else {
    editFields.innerHTML = `
            <div class="form-group">
                <label>Location:</label>
                <input type="text" id="edit-bathroom-location" value="${log.location || ""}">
            </div>
            <div class="form-group">
                <label>Type:</label>
                <div class="radio-group">
                    <label><input type="radio" name="edit-type" value="pee" ${log.type === "pee" ? "checked" : ""} required> Pee</label>
                    <label><input type="radio" name="edit-type" value="poop" ${log.type === "poop" ? "checked" : ""} required> Poop</label>
                </div>
            </div>
            <div class="form-group">
                <label>Size:</label>
                <div class="radio-group">
                    <label><input type="radio" name="edit-size" value="big" ${log.size === "big" ? "checked" : ""} required> Big</label>
                    <label><input type="radio" name="edit-size" value="small" ${log.size === "small" ? "checked" : ""} required> Small</label>
                </div>
            </div>
            <div class="form-group">
                <label>Consistency:</label>
                <div class="radio-group">
                    <label><input type="radio" name="edit-consistency" value="normal" ${log.consistency === "normal" ? "checked" : ""} required> Normal</label>
                    <label><input type="radio" name="edit-consistency" value="soft" ${log.consistency === "soft" ? "checked" : ""} required> Soft</label>
                    <label><input type="radio" name="edit-consistency" value="sick" ${log.consistency === "sick" ? "checked" : ""} required> Sick</label>
                </div>
            </div>
        `;
  }

  editModal.style.display = "block";
}

// Close modal when clicking the X
closeModal.addEventListener("click", () => {
  editModal.style.display = "none";
});

// Close modal when clicking outside
window.addEventListener("click", (e) => {
  if (e.target === editModal) {
    editModal.style.display = "none";
  }
});

// Handle edit form submission
editForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const id = document.getElementById("edit-id").value;
  const type = document.getElementById("edit-type").value;

  if (type === "food") {
    const foodType = document.getElementById("edit-food-type").value;
    const quantity = document.getElementById("edit-food-quantity").value;
    const stolen = document.getElementById("edit-food-stolen").checked;
    const location = document.getElementById("edit-food-location").value;

    await updateFoodLog(id, {
      type: foodType,
      quantity: quantity,
      stolen: stolen,
      location: location,
    });
    foodLogs = await fetchFoodLogs();
  } else {
    const location = document.getElementById("edit-bathroom-location").value;
    const formData = new FormData(editForm);
    await updateBathroomLog(id, {
      location: location,
      type: formData.get("edit-type"),
      size: formData.get("edit-size"),
      consistency: formData.get("edit-consistency"),
    });
    bathroomLogs = await fetchBathroomLogs();
  }

  editModal.style.display = "none";
  updateLogsDisplay();
});

// Handle delete entry
deleteEntryBtn.addEventListener("click", async () => {
  const id = document.getElementById("edit-id").value;
  const type = document.getElementById("edit-type").value;

  if (type === "food") {
    await deleteFoodLog(id);
    foodLogs = await fetchFoodLogs();
  } else {
    await deleteBathroomLog(id);
    bathroomLogs = await fetchBathroomLogs();
  }

  editModal.style.display = "none";
  updateLogsDisplay();
});

// Handle food form submission
foodForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const foodType = document.getElementById("food-type").value;
  const quantity = document.getElementById("food-quantity").value;
  const stolen = document.getElementById("food-stolen").checked;
  const location = foodLocationInput.value;

  const log = {
    type: foodType,
    quantity: quantity,
    stolen: stolen,
    location: location,
    timestamp: Date.now(),
  };

  await addFoodLog(log);
  foodLogs = await fetchFoodLogs();
  updateLogsDisplay();
  foodForm.reset();
});

// Handle bathroom form submission
bathroomForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const formData = new FormData(bathroomForm);
  const location = bathroomLocationInput.value;

  const log = {
    location: location,
    type: formData.get("type"),
    size: formData.get("size"),
    consistency: formData.get("consistency"),
    timestamp: Date.now(),
  };

  await addBathroomLog(log);
  bathroomLogs = await fetchBathroomLogs();
  updateLogsDisplay();
  bathroomForm.reset();
});

// Handle export
exportBtn.addEventListener("click", () => {
  const format = document.getElementById("export-format").value;
  const allLogs = [
    ...foodLogs.map((log) => ({
      type: "Food",
      details: `${log.type} - ${log.quantity}`,
      timestamp: formatTimestamp(log.timestamp),
      rawData: log,
    })),
    ...bathroomLogs.map((log) => ({
      type: "Bathroom",
      details: `${log.type} - ${log.location} - ${log.size} - ${log.consistency}`,
      timestamp: formatTimestamp(log.timestamp),
      rawData: log,
    })),
  ].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

  let content, mimeType, extension;

  if (format === "csv") {
    content = [
      ["Type", "Details", "Timestamp"],
      ...allLogs.map((log) => [log.type, log.details, log.timestamp]),
    ]
      .map((row) => row.join(","))
      .join("\n");
    mimeType = "text/csv;charset=utf-8;";
    extension = "csv";
  } else {
    content = JSON.stringify(
      {
        foodLogs: foodLogs,
        bathroomLogs: bathroomLogs,
        exportDate: new Date().toISOString(),
      },
      null,
      2,
    );
    mimeType = "application/json";
    extension = "json";
  }

  const blob = new Blob([content], { type: mimeType });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `molly-logs-${new Date().toISOString().split("T")[0]}.${extension}`;
  link.click();
});

// Handle import
importFileInput.addEventListener("change", async (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = async function (event) {
    try {
      let importedData;
      if (file.name.endsWith(".json")) {
        importedData = JSON.parse(event.target.result);
        if (importedData.foodLogs && importedData.bathroomLogs) {
          // Clear and re-insert logs
          for (const log of importedData.foodLogs) await addFoodLog(log);
          for (const log of importedData.bathroomLogs)
            await addBathroomLog(log);
          foodLogs = await fetchFoodLogs();
          bathroomLogs = await fetchBathroomLogs();
        } else {
          alert("Invalid JSON format.");
          return;
        }
      } else {
        alert("Only JSON import is supported with Supabase.");
        return;
      }
      updateLogsDisplay();
      alert("Logs imported successfully!");
    } catch (err) {
      alert("Failed to import logs: " + err.message);
    }
  };
  reader.readAsText(file);
});

function getLocationAndFill(input) {
  if (!navigator.geolocation) {
    alert("Geolocation is not supported by your browser.");
    return;
  }
  input.value = "Getting location...";
  navigator.geolocation.getCurrentPosition(
    (position) => {
      const { latitude, longitude } = position.coords;
      input.value = `${latitude.toFixed(5)}, ${longitude.toFixed(5)}`;
    },
    (err) => {
      input.value = "";
      alert("Unable to retrieve your location.");
    },
  );
}

foodUseLocationBtn.addEventListener("click", () =>
  getLocationAndFill(foodLocationInput),
);
bathroomUseLocationBtn.addEventListener("click", () =>
  getLocationAndFill(bathroomLocationInput),
);

// Initial display update
updateLogsDisplay();

// --- Initial load ---

async function initializeLogs() {
  foodLogs = await fetchFoodLogs();
  bathroomLogs = await fetchBathroomLogs();
  updateLogsDisplay();
}

initializeLogs();
