// character_generator.js
const XLSX = require("xlsx");
const path = require("path");
const fs = require("fs");

const state = {
  dataPool: {},
  genres: [],
};

function populateGenresDropdown(genres) {
  const select = document.getElementById("genre-select");
  select.innerHTML = "";
  genres.forEach((genre, index) => {
    const option = document.createElement("option");
    option.value = index;
    option.textContent = genre.name || genre;
    select.appendChild(option);
  });
}

async function loadAllData() {
  const workbookPath = path.join(__dirname, "excel", "character_generation_schema.xlsx");

  if (!fs.existsSync(workbookPath)) {
    alert("Excel file not found.");
    return;
  }

  const workbook = XLSX.readFile(workbookPath);

  const sheetNames = [
    "fnames", "lnames", "genders", "agegroups", "races",
    "traits", "occupations", "backgrounds", "sizes",
    "tech_levels", "magic_affinity", "class_types", "genres"
  ];

  const failed = [];

  sheetNames.forEach(name => {
    try {
      const sheet = workbook.Sheets[name];
      if (!sheet) {
        console.warn(`⚠️ Sheet missing: ${name}`);
        failed.push(name);
        return;
      }

      const json = XLSX.utils.sheet_to_json(sheet);
      state.dataPool[name] = json;
    } catch (err) {
      console.warn(`⚠️ Problem loading sheet: ${name}`, err);
      failed.push(name);
    }
  });

  state.genres = state.dataPool.genres || [];
  populateGenresDropdown(state.genres);

  if (failed.length > 0) {
    alert(
      `Some sheets failed to load: ${failed.join(', ')}. ` +
      `Character generation may be incomplete.`
    );
  }
}

function generateCharacter() {
  const genreIndex = document.getElementById("genre-select").value;
  const genre = state.genres[genreIndex];
  if (!genre) {
    alert("Please select a genre.");
    return;
  }

  const pick = (listName) => {
    const list = state.dataPool[listName];
    if (!list || list.length === 0) return "N/A";
    return list[Math.floor(Math.random() * list.length)].name || "Unknown";
  };

  const result = {
    FirstName: pick("fnames"),
    LastName: pick("lnames"),
    Gender: pick("genders"),
    AgeGroup: pick("agegroups"),
    Race: pick("races"),
    Trait: pick("traits"),
    Occupation: pick("occupations"),
    Background: pick("backgrounds"),
    Size: pick("sizes"),
    TechLevel: pick("tech_levels"),
    MagicAffinity: pick("magic_affinity"),
    ClassType: pick("class_types"),
    Genre: genre.name || genre
  };

  const output = document.getElementById("character-output");
  output.innerHTML = Object.entries(result).map(
    ([key, val]) => `<div><strong>${key}:</strong> ${val}</div>`
  ).join("");
}

// Attach events
document.getElementById("generate-btn").addEventListener("click", generateCharacter);

// Initialize
document.addEventListener("DOMContentLoaded", loadAllData);
