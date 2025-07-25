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

  const failed = [];
  for (let key of files) {
    try {
      const res = await fetch(`json/${key}.json`);
      if (!res.ok) {
        console.warn(`⚠️ Missing file: json/${key}.json`);
        failed.push(key);
        continue;
      }
      state.dataPool[key] = await res.json();
    } catch (err) {
      console.warn(`⚠️ Problem loading json/${key}.json:`, err);
      failed.push(key);
    }
  }

  state.genres = state.dataPool.genres || [];
  populateGenresDropdown(state.genres);

  if (failed.length > 0) {
    alert(
      `Some data files failed to load: ${failed.join(', ')}. ` +
      `Character generation may be incomplete.`
    );
  }
}

function populateGenresDropdown(genres) {
  const genreSelect = document.getElementById("genre-select");
  genreSelect.innerHTML = "";

  genres.forEach(genre => {
    const option = document.createElement("option");
    option.value = genre.id;
    option.textContent = genre.name;
    genreSelect.appendChild(option);
  });
}

function getFiltered(data, field, allowedId) {
  return data.filter(entry => {
    const ids = (entry[field] || "").toString().split(',').map(x => x.trim());
    return ids.includes(allowedId.toString());
  });
}

function getRandomFrom(array, weightProp) {
  if (!Array.isArray(array) || array.length === 0) return undefined;

  if (weightProp) {
    const weights = array.map(item => parseFloat(item[weightProp]) || 0);
    const totalWeight = weights.reduce((sum, w) => sum + w, 0);

    if (totalWeight > 0) {
      let rand = Math.random() * totalWeight;
      for (let i = 0; i < array.length; i++) {
        rand -= weights[i];
        if (rand <= 0) {
          return array[i];
        }
      }
    }
  }

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

  const fnames = state.dataPool.fnames.filter(n => n.gender_id === gender.id && n.genre_ids.toString().split("," ).includes(genreId.toString()));
  const lnames = getFiltered(state.dataPool.lnames, "genre_ids", genreId);
  const races = getFiltered(state.dataPool.races, "genre_ids", genreId);
  const traits = getFiltered(state.dataPool.traits, "genre_ids", genreId);
  const occupations = getFiltered(state.dataPool.occupations, "genre_ids", genreId);
  const backgrounds = getFiltered(state.dataPool.backgrounds, "genre_ids", genreId);
  const agegroups = state.dataPool.agegroups;

  const agegroup = getRandomFrom(agegroups);
  const race = getRandomFrom(races, 'weight');
  const occupation = getRandomFrom(occupations);
  const background = getRandomFrom(backgrounds);
  const firstName = getRandomFrom(fnames, 'weight');
  const lastName = getRandomFrom(lnames, 'weight');
  const selectedTraits = Array.from({ length: 3 }, () => getRandomFrom(traits, 'weight'));

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
    <p><strong>Background:</strong> ${background?.name || "None"}</p>
    <p><strong>Traits:</strong> ${selectedTraits.map(t => t?.name || "???").join(", ")}</p>
    <p><strong>Genre:</strong> ${state.genres.find(g => g.id == genreId)?.name || "Unknown"}</p>
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
