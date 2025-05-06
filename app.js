/**
 * @fileoverview Main application file for Molly's Tracker. Handles food and bathroom tracking,
 * favorites management, and data persistence using Supabase.
 */

// --- Supabase Data Functions ---

/**
 * Fetches all food logs from Supabase, ordered by timestamp in descending order.
 * @async
 * @returns {Promise<Array>} Array of food log objects
 */
async function fetchFoodLogs() {
  const { data, error } = await supabase
    .from("food_logs")
    .select("*")
    .order("timestamp", { ascending: false });
  return data || [];
}

/**
 * Fetches all bathroom logs from Supabase, ordered by timestamp in descending order.
 * @async
 * @returns {Promise<Array>} Array of bathroom log objects
 */
async function fetchBathroomLogs() {
  const { data, error } = await supabase
    .from("bathroom_logs")
    .select("*")
    .order("timestamp", { ascending: false });
  return data || [];
}

/**
 * Adds a new food log to Supabase.
 * @async
 * @param {Object} log - The food log object to add
 * @param {string} log.type - Type of food
 * @param {string} log.quantity - Quantity of food
 * @param {boolean} log.stolen - Whether the food was stolen
 * @param {string} [log.location] - Location where food was given
 * @param {number} log.timestamp - Timestamp of the log
 * @returns {Promise<void>}
 */
async function addFoodLog(log) {
  await supabase.from("food_logs").insert([log]);
}

/**
 * Adds a new bathroom log to Supabase.
 * @async
 * @param {Object} log - The bathroom log object to add
 * @param {string} log.type - Type of bathroom activity ('pee' or 'poop')
 * @param {string} log.location - Location of activity ('inside' or 'outside')
 * @param {string} log.size - Size of activity ('big' or 'small')
 * @param {string} log.consistency - Consistency of activity ('normal', 'soft', or 'sick')
 * @param {number} log.timestamp - Timestamp of the log
 * @returns {Promise<void>}
 */
async function addBathroomLog(log) {
  await supabase.from("bathroom_logs").insert([log]);
}

/**
 * Updates an existing food log in Supabase.
 * @async
 * @param {number} id - ID of the food log to update
 * @param {Object} log - Updated food log object
 * @returns {Promise<void>}
 */
async function updateFoodLog(id, log) {
  await supabase.from("food_logs").update(log).eq("id", id);
}

/**
 * Updates an existing bathroom log in Supabase.
 * @async
 * @param {number} id - ID of the bathroom log to update
 * @param {Object} log - Updated bathroom log object
 * @returns {Promise<void>}
 */
async function updateBathroomLog(id, log) {
  await supabase.from("bathroom_logs").update(log).eq("id", id);
}

/**
 * Deletes a food log from Supabase.
 * @async
 * @param {number} id - ID of the food log to delete
 * @returns {Promise<void>}
 */
async function deleteFoodLog(id) {
  await supabase.from("food_logs").delete().eq("id", id);
}

/**
 * Deletes a bathroom log from Supabase.
 * @async
 * @param {number} id - ID of the bathroom log to delete
 * @returns {Promise<void>}
 */
async function deleteBathroomLog(id) {
  await supabase.from("bathroom_logs").delete().eq("id", id);
}

/**
 * Fetches all favorites from Supabase.
 * @async
 * @returns {Promise<Array>} Array of favorite objects
 */
async function fetchFavorites() {
  console.log("Fetching favorites...");
  const { data, error } = await supabase
    .from("favorites")
    .select("*")
    .order("id", { ascending: true });

  if (error) {
    console.error("Error fetching favorites:", error);
    return [];
  }

  console.log("Favorites fetched successfully:", data);
  return data || [];
}

/**
 * Updates an existing favorite in Supabase.
 * @async
 * @param {number} id - ID of the favorite to update
 * @param {Object} fav - Updated favorite object
 * @returns {Promise<Object>} Updated favorite data
 * @throws {Error} If the update operation fails
 */
async function updateFavorite(id, fav) {
  console.log("Updating favorite:", { id, favorite: fav });
  const { data, error } = await supabase
    .from("favorites")
    .update(fav)
    .eq("id", id);

  if (error) {
    console.error("Error updating favorite:", error);
    throw error;
  }

  console.log("Favorite updated successfully:", data);
  return data;
}

/**
 * Adds a new favorite to Supabase.
 * @async
 * @param {Object} fav - The favorite object to add
 * @param {string} fav.name - Name of the favorite
 * @param {string} [fav.type] - Type of activity
 * @param {string} [fav.location] - Location of activity
 * @param {string} [fav.size] - Size of activity
 * @param {string} [fav.consistency] - Consistency of activity
 * @returns {Promise<Object>} Added favorite data
 * @throws {Error} If the insert operation fails
 */
async function addFavorite(fav) {
  console.log("Adding new favorite:", fav);
  const { data, error } = await supabase.from("favorites").insert([fav]);

  if (error) {
    console.error("Error adding favorite:", error);
    throw error;
  }

  console.log("Favorite added successfully:", data);
  return data;
}

/**
 * Deletes a favorite from Supabase.
 * @async
 * @param {number} id - ID of the favorite to delete
 * @returns {Promise<Object>} Deleted favorite data
 * @throws {Error} If the delete operation fails
 */
async function deleteFavorite(id) {
  console.log("Deleting favorite with id:", id);
  const { data, error } = await supabase
    .from("favorites")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("Error deleting favorite:", error);
    throw error;
  }

  console.log("Favorite deleted successfully:", data);
  return data;
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
    console.log("Edit favorites button clicked");
    favoritesModal.style.display = "block";
    renderFavoritesForm();
  });

  closeFavoritesModal.addEventListener("click", () => {
    console.log("Closing favorites modal");
    favoritesModal.style.display = "none";
  });

  document.getElementById("add-favorite-btn").addEventListener("click", () => {
    console.log("Add favorite button clicked");
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
    console.log("Favorites form submitted");

    const inputs = favoritesFields.querySelectorAll("input[type='text']");
    const newFavorites = Array.from(inputs).map((input) => ({
      name: input.value.trim(),
      label: input.value.trim(),
      type: "pee",
      location: "outside",
      size: "small",
      consistency: "normal"
    }));

    console.log("New favorites to save:", newFavorites);

    try {
      // Delete all existing favorites
      console.log("Deleting existing favorites...");
      for (const favorite of favorites) {
        await deleteFavorite(favorite.id);
      }

      // Add new favorites
      console.log("Adding new favorites...");
      for (const favorite of newFavorites) {
        if (favorite.name) {
          await addFavorite(favorite);
        }
      }

      await loadFavorites();
      renderFavorites();
      favoritesModal.style.display = "none";
      console.log("Favorites updated successfully");
    } catch (error) {
      console.error("Error updating favorites:", error);
      alert("Failed to update favorites. Please try again.");
    }
  });

  // Add event delegation for remove favorite buttons
  favoritesFields.addEventListener("click", (e) => {
    if (e.target.closest(".remove-favorite")) {
      console.log("Remove favorite button clicked");
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

  const timelineContainer = document.getElementById("timeline");
  if (!timelineContainer) return;
  
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

/**
 * Initializes the application by loading logs and setting up the UI.
 * @async
 */
async function initializeLogs() {
  foodLogs = await fetchFoodLogs();
  bathroomLogs = await fetchBathroomLogs();
  if (typeof window !== "undefined" && !window.isTestEnvironment) {
    updateLogsDisplay();
  }
}

initializeLogs();

/**
 * Loads favorites from Supabase and renders them.
 * @async
 */
async function loadFavorites() {
  console.log("Loading favorites...");
  try {
    favorites = await fetchFavorites();
    console.log("Favorites loaded:", favorites);
    renderFavorites();
  } catch (error) {
    console.error("Error loading favorites:", error);
  }
}

/**
 * Renders the favorites list in the UI.
 */
function renderFavorites() {
  console.log("Rendering favorites...");
  const list = document.getElementById("favorites-list");
  if (!list) {
    console.warn("Favorites list element not found");
    return;
  }

  list.innerHTML = "";
  console.log("Rendering", favorites.length, "favorites");

  favorites.forEach((fav, idx) => {
    console.log("Rendering favorite:", fav);
    const btn = document.createElement("button");
    btn.className = "favorite-btn";
    btn.innerHTML = `<i class="fas fa-star"></i> ${fav.label}`;
    btn.onclick = () => {
      console.log("Favorite clicked:", fav);
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

/**
 * Renders the favorites form in the edit modal.
 */
function renderFavoritesForm() {
  console.log("Rendering favorites form...");
  const favoritesFields = document.getElementById("favorites-fields");
  if (!favoritesFields) {
    console.warn("Favorites fields element not found");
    return;
  }

  favoritesFields.innerHTML = "";
  console.log("Rendering form for", favorites.length, "favorites");

  favorites.forEach((favorite) => {
    console.log("Rendering form field for favorite:", favorite);
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

/**
 * Capitalizes the first letter of a string.
 * @param {string} str - String to capitalize
 * @returns {string} Capitalized string, or empty string if input is null/undefined
 */
function capitalize(str) {
  if (!str) return "";
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// Export functions for testing
if (typeof exports !== 'undefined') {
  Object.assign(exports, {
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
  });
}
