// Frontend logic: fetch real-time medicine names (serverless) + merge with local details
const form = document.getElementById('search-form');
const queryInput = document.getElementById('query');
const results = document.getElementById('results');
const titleEl = document.getElementById('condition-title');
const tableBody = document.querySelector('#med-table tbody');
const precList = document.getElementById('precautions');
const foodList = document.getElementById('food');
document.getElementById('year').textContent = new Date().getFullYear();

// small helper
const escape = (s='') => s.replace(/[&<>]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;'}[c]));

// cache data.json once
let localDB = {};
fetch('data.json')
  .then(r => r.json())
  .then(db => { localDB = db; })
  .catch(()=>{});

async function fetchServerMedicines(disease){
  try{
    const res = await fetch(`/.netlify/functions/getMedicines?disease=${encodeURIComponent(disease)}`);
    if(!res.ok) throw new Error('serverless error');
    const data = await res.json();
    return data.medicines || [];
  }catch(e){
    console.warn('Falling back to local DB', e);
    return [];
  }
}

function renderCards(extras){
  const {precautions=[], food=[]} = extras || {};
  precList.innerHTML = precautions.map(x => `<li>${escape(x)}</li>`).join('') || '<li>No specific precautions found.</li>';
  foodList.innerHTML = food.map(x => `<li>${escape(x)}</li>`).join('') || '<li>No specific guidance found.</li>';
}

function renderTable(items){
  tableBody.innerHTML = items.map(row => `
    <tr>
      <td>${escape(row.name || row.brand || row.generic || '—')}</td>
      <td>${escape(row.dosage || '—')}</td>
      <td>${escape(row.when || '—')}</td>
      <td>${escape(row.frequency || row.duration || '—')}</td>
      <td>${escape(row.notes || '')}</td>
    </tr>
  `).join('');
}

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const q = queryInput.value.trim().toLowerCase();
  if(!q) return;

  // show UI
  results.hidden = false;
  titleEl.textContent = q.charAt(0).toUpperCase() + q.slice(1);

  // 1) serverless fetch for possible real-time names
  const fromServer = await fetchServerMedicines(q);

  // 2) local curated details
  const local = (localDB[q]?.medicines) || [];

  // merge: ensure uniqueness by name
  const byName = new Map();
  [...local, ...fromServer.map(n => ({ name: n, dosage: '', when: '', frequency: '', notes: 'Auto-suggested (verify with a professional).' }))]
    .forEach(item => {
      const key = (item.name || '').toLowerCase();
      if(!byName.has(key)) byName.set(key, item);
    });
  renderTable([...byName.values()]);
  // If we have local extras, use them; otherwise call free advice generator
  if(localDB[q]?.precautions || localDB[q]?.food){
    renderCards(localDB[q]);
  }else{
    // try localStorage cache first
    const cacheKey = 'advice:' + q;
    let cached = null;
    try{ cached = JSON.parse(localStorage.getItem(cacheKey) || 'null'); }catch{}
    let advice = cached;
    if(!advice){
      try{
        const r = await fetch(`/.netlify/functions/getAdvice?disease=${encodeURIComponent(q)}`);
        advice = r.ok ? await r.json() : null;
        if(advice) localStorage.setItem(cacheKey, JSON.stringify(advice));
      }catch{ advice = null; }
    }
    if(advice){
      renderCards({ precautions: advice.precautions, food: advice.food });
      // add summary & source if available
      const summaryBox = document.createElement('div');
      summaryBox.className = 'card';
      summaryBox.innerHTML = `
        <h3>Overview${advice.source ? ` — <a href="${advice.source.url}" target="_blank" rel="noopener">Source</a>` : ''}</h3>
        <p>${escape(advice.summary || 'General guidance for this category.')}</p>
        <p class="hint">Note: Precautions & food are general for the "${escape(advice.category)}" category.</p>
      `;
      document.querySelector('.extras').appendChild(summaryBox);
    }else{
      renderCards();
    }
  }
});
