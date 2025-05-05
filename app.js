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

async function fetchFavorites() {
  const { data, error } = await supabase
    .from("favorites")
    .select("*")
    .order("id", { ascending: true });
  return data || [];
}

async function updateFavorite(id, fav) {
  await supabase.from("favorites").update(fav).eq("id", id);
}

async function addFavorite(fav) {
  await supabase.from("favorites").insert([fav]);
}

async function deleteFavorite(id) {
  await supabase.from("favorites").delete().eq("id", id);
}

// --- App State ---
let foodLogs = [];
let bathroomLogs = [];
let savedFoodTypes = [];
let favorites = [];

// Load from localStorage if you want persistence (optional)
// favorites = JSON.parse(localStorage.getItem('favorites')) || favorites;

// Only initialize DOM-dependent code if we're in a browser environment and not in a test environment
if (
  typeof window !== "undefined" &&
  !window.isTestEnvironment &&
  document.readyState !== "loading"
) {
  initializeDOMHandlers();
} else if (typeof window !== "undefined" && !window.isTestEnvironment) {
  document.addEventListener("DOMContentLoaded", initializeDOMHandlers);
}

// Move all DOM initialization into a single function
function initializeDOMHandlers() {
  // Initialize DOM elements
  const foodForm = document.getElementById("food-form");
  if (!foodForm) return; // Guard clause for test environment

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
  const bathroomUseLocationBtn = document.getElementById(
    "bathroom-use-location",
  );
  const editFavoritesBtn = document.getElementById("edit-favorites-btn");
  const favoritesModal = document.getElementById("favorites-modal");
  const closeFavoritesModal = document.getElementById("close-favorites-modal");
  const favoritesForm = document.getElementById("favorites-form");
  const favoritesFields = document.getElementById("favorites-fields");

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

  // Handle location buttons
  foodUseLocationBtn.addEventListener("click", () =>
    getLocationAndFill(foodLocationInput),
  );
  bathroomUseLocationBtn.addEventListener("click", () =>
    getLocationAndFill(bathroomLocationInput),
  );

  // Handle favorites
  editFavoritesBtn.addEventListener("click", () => {
    favoritesModal.style.display = "block";
    renderFavoritesForm();
  });

  closeFavoritesModal.addEventListener("click", () => {
    favoritesModal.style.display = "none";
  });

  document.getElementById("add-favorite-btn").addEventListener("click", () => {
    const favoriteField = document.createElement("div");
    favoriteField.className = "favorite-field";
    favoriteField.innerHTML = `
      <input type="text" placeholder="Favorite name" required>
      <button type="button" class="btn btn-delete remove-favorite">
        <i class="fas fa-trash"></i>
      </button>
    `;
    favoritesFields.appendChild(favoriteField);
  });

  favoritesForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const inputs = favoritesFields.querySelectorAll("input[type='text']");
    const newFavorites = Array.from(inputs).map((input) => ({
      name: input.value.trim(),
    }));

    // Delete all existing favorites
    for (const favorite of favorites) {
      await deleteFavorite(favorite.id);
    }

    // Add new favorites
    for (const favorite of newFavorites) {
      if (favorite.name) {
        await addFavorite(favorite);
      }
    }

    await loadFavorites();
    renderFavorites();
    favoritesModal.style.display = "none";
  });

  // Add event delegation for remove favorite buttons
  favoritesFields.addEventListener("click", (e) => {
    if (e.target.closest(".remove-favorite")) {
      e.target.closest(".favorite-field").remove();
    }
  });

  // Initial display update
  updateLogsDisplay();
}

// Initialize food types datalist
function updateFoodTypesDatalist() {
  const foodTypesDatalist = document.getElementById("food-types");
  if (!foodTypesDatalist) return; // Guard clause for test environment
  const types = Array.from(new Set(foodLogs.map((log) => log.type)));
  savedFoodTypes = types;
  foodTypesDatalist.innerHTML = types
    .map((type) => `<option value="${type}">`)
    .join("");
}

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
                <strong>Food: ${capitalize(log.type)} - ${capitalize(log.quantity)}</strong>
                ${log.stolen ? '<span class="stolen-badge">Stolen!</span>' : ""}
                ${log.location ? `<div><small>Location: ${capitalize(log.location)}</small></div>` : ""}
            </div>
            <div>${formatTimestamp(log.timestamp)}</div>
        `;
  } else {
    entry.innerHTML = `
            <div>
                <strong>Bathroom: ${capitalize(log.type)} - ${capitalize(log.location)} - ${capitalize(log.size)} - ${capitalize(log.consistency)}</strong>
            </div>
            <div>${formatTimestamp(log.timestamp)}</div>
        `;
  }

  return entry;
}

// Update logs display
function updateLogsDisplay() {
  if (typeof window === "undefined" || window.isTestEnvironment) return;

  const foodLogsContainer = document.getElementById("food-logs");
  const bathroomLogsContainer = document.getElementById("bathroom-logs");
  const timelineContainer = document.getElementById("timeline");

  if (!foodLogsContainer || !bathroomLogsContainer || !timelineContainer)
    return;

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
                    <div><i class="fas fa-toilet"></i> Bathroom: ${capitalize(log.type)} - ${capitalize(log.location)} - ${capitalize(log.size)} - ${capitalize(log.consistency)}</div>
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

// --- Initial load ---

async function initializeLogs() {
  foodLogs = await fetchFoodLogs();
  bathroomLogs = await fetchBathroomLogs();
  if (typeof window !== "undefined" && !window.isTestEnvironment) {
    updateLogsDisplay();
  }
}

initializeLogs();

async function loadFavorites() {
  favorites = await fetchFavorites();
  renderFavorites();
}

function renderFavorites() {
  const list = document.getElementById("favorites-list");
  list.innerHTML = "";
  favorites.forEach((fav, idx) => {
    const btn = document.createElement("button");
    btn.className = "favorite-btn";
    btn.innerHTML = `<i class="fas fa-star"></i> ${fav.label}`;
    btn.onclick = () => {
      // Fill bathroom form with favorite config
      document.querySelector(
        `#bathroom-form input[name="type"][value="${fav.type}"]`,
      ).checked = true;
      document.querySelector(
        `#bathroom-form input[name="location"][value="${fav.location}"]`,
      ).checked = true;
      document.querySelector(
        `#bathroom-form input[name="size"][value="${fav.size}"]`,
      ).checked = true;
      document.querySelector(
        `#bathroom-form input[name="consistency"][value="${fav.consistency}"]`,
      ).checked = true;
    };
    list.appendChild(btn);
  });
}

function renderFavoritesForm() {
  favoritesFields.innerHTML = "";
  favorites.forEach((favorite) => {
    const favoriteField = document.createElement("div");
    favoriteField.className = "favorite-field";
    favoriteField.innerHTML = `
      <input type="text" value="${favorite.name}" required>
      <button type="button" class="btn btn-delete remove-favorite">
        <i class="fas fa-trash"></i>
      </button>
    `;
    favoritesFields.appendChild(favoriteField);
  });
}

function capitalize(str) {
  if (!str) return "";
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// Export functions for testing
export {
  fetchFoodLogs,
  fetchBathroomLogs,
  addFoodLog,
  addBathroomLog,
  updateFoodLog,
  updateBathroomLog,
  deleteFoodLog,
  deleteBathroomLog,
  fetchFavorites,
  addFavorite,
  updateFavorite,
  deleteFavorite,
  formatTimestamp,
  capitalize,
};
