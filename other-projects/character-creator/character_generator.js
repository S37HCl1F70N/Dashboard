let state = {
  dataPool: {},
  genres: []
};

async function loadAllData() {
  const files = [
    'fnames', 'lnames', 'genders', 'agegroups', 'races',
    'traits', 'occupations', 'backgrounds', 'sizes',
    'tech_levels', 'magic_affinity', 'class_types', 'genres'
  ];

  for (let key of files) {
    const res = await fetch(`json/${key}.json`);
    state.dataPool[key] = await res.json();
  }

  state.genres = state.dataPool.genres;
  populateGenresDropdown(state.genres);
}

function populateGenresDropdown(genres) {
  const genreSelect = document.getElementById("genre-select");
  genreSelect.innerHTML = "";

  genres.forEach(genre => {
    const option = document.createElement("option");
    option.value = genre.id;
    option.textContent = genre.label;
    genreSelect.appendChild(option);
  });
}

function getFiltered(data, field, allowedId) {
  return data.filter(entry => {
    const ids = (entry[field] || "").toString().split(',').map(x => x.trim());
    return ids.includes(allowedId.toString());
  });
}

function getRandomFrom(array) {
  return array[Math.floor(Math.random() * array.length)];
}

function generateCharacter() {
  const genreId = document.getElementById("genre-select").value;
  if (!genreId) {
    alert("Please select a genre.");
    return;
  }

  const genders = state.dataPool.genders;
  const gender = getRandomFrom(genders);

  const fnames = state.dataPool.fnames.filter(n => n.gender === gender.id && n.genre.includes(genreId));
  const lnames = getFiltered(state.dataPool.lnames, "genre", genreId);
  const races = getFiltered(state.dataPool.races, "genre", genreId);
  const traits = getFiltered(state.dataPool.traits, "genre", genreId);
  const occupations = getFiltered(state.dataPool.occupations, "genre", genreId);
  const backgrounds = getFiltered(state.dataPool.backgrounds, "genre", genreId);
  const agegroups = state.dataPool.agegroups;

  const agegroup = getRandomFrom(agegroups);
  const race = getRandomFrom(races);
  const occupation = getRandomFrom(occupations);
  const background = getRandomFrom(backgrounds);
  const firstName = getRandomFrom(fnames);
  const lastName = getRandomFrom(lnames);
  const selectedTraits = Array.from({ length: 3 }, () => getRandomFrom(traits));

  if (!firstName || !lastName) {
    alert("No valid names found for this genre and gender. Please check your fnames/lnames.json.");
    return;
  }

  const display = document.getElementById("character-display");
  display.innerHTML = `
    <h2>${firstName.name} ${lastName.name}</h2>
    <p><strong>Gender:</strong> ${gender.label}</p>
    <p><strong>Age Group:</strong> ${agegroup.label} (${agegroup.min_age}–${agegroup.max_age})</p>
    <p><strong>Race:</strong> ${race?.name || "Unknown"}</p>
    <p><strong>Occupation:</strong> ${occupation?.name || "None"}</p>
    <p><strong>Background:</strong> ${background?.label || "None"}</p>
    <p><strong>Traits:</strong> ${selectedTraits.map(t => t?.label || "???").join(", ")}</p>
    <p><strong>Genre:</strong> ${state.genres.find(g => g.id == genreId)?.label || "Unknown"}</p>
  `;
}

window.onload = async () => {
  await loadAllData();

  const button = document.getElementById("generate-character");
  if (button) {
    button.onclick = generateCharacter;
  } else {
    console.error("⚠️ Button with ID 'generate-character' not found.");
  }
};
