// Netlify Function: getAdvice.js
// Free forever: no paid APIs. It uses a rules-based library and Wikipedia REST summary (no key).

function categorize(disease){
  const d = (disease || '').toLowerCase();
  const has = (arr)=>arr.some(k=>d.includes(k));
  if(has(['fever','flu','infection','pneumonia','tb','covid','malaria','dengue','typhoid'])) return 'infection';
  if(has(['cold','asthma','copd','bronch','wheeze','sinus','allergy','allergic','rhinitis'])) return 'respiratory';
  if(has(['reflux','gerd','ulcer','gastr','vomit','diarr','loose motion','constipation','ibs','hepat','liver'])) return 'gastro';
  if(has(['diabetes','hypergly','hypogly','sugar'])) return 'endocrine';
  if(has(['bp','hypertension','heart','cardiac','stroke','cholesterol','angina'])) return 'cardio';
  if(has(['migraine','headache','seizure','epilep','parkinson','neuro','vertigo'])) return 'neuro';
  if(has(['arthritis','sprain','back pain','neck pain','sciatica','orthopedic','gout'])) return 'musculoskeletal';
  if(has(['uti','urinary','kidney','renal','stones'])) return 'renal';
  if(has(['eczema','psoriasis','acne','rash','dermat'])) return 'skin';
  if(has(['conjunctivitis','pink eye','eye','glaucoma','cataract'])) return 'eye';
  if(has(['ear','otitis','throat','tonsillitis','pharyngitis','sinusitis'])) return 'ent';
  return 'general';
}

const LIB = {
  general:{
    precautions:[
      'Consult a qualified clinician for diagnosis and personalized treatment.',
      'Monitor symptoms; seek urgent care for breathing difficulty, chest pain, confusion, severe weakness, or dehydration.',
      'Use medicines only as directed on the label or by your clinician; watch for allergies or side‑effects.',
      'Rest, stay hydrated, and avoid alcohol and smoking.'
    ],
    food:[
      'Balanced meals with fruits, vegetables, whole grains, and lean proteins.',
      'Adequate fluids (water, oral rehydration solutions when at risk of dehydration).',
      'Limit ultra‑processed foods, excessive sugar, and alcohol.'
    ]
  },
  infection:{
    precautions:[
      'Hydrate and rest; monitor temperature.',
      'Use antipyretics as advised; avoid aspirin in children/teens with viral illness.',
      'Practice hygiene: hand‑washing, mask if coughing, and isolate when contagious.',
      'Seek care for persistent high fever (>3 days), severe headache, stiff neck, rash, or breathing difficulty.'
    ],
    food:[
      'Plenty of fluids: water, broths, ORS if dehydration risk.',
      'Light, easy‑to‑digest foods; avoid alcohol.',
      'If on antibiotics, consider probiotic‑rich foods (yogurt) unless contraindicated.'
    ]
  },
  respiratory:{
    precautions:[
      'Avoid smoke, dust, and known triggers; use masks in polluted environments.',
      'Use inhalers/sprays exactly as prescribed; check technique and spacer use.',
      'Seek urgent care for blue lips, severe breathlessness, or worsening wheeze.'
    ],
    food:[
      'Warm fluids and soups; maintain hydration.',
      'If acid reflux is a trigger, avoid late meals and very spicy/fatty foods.'
    ]
  },
  gastro:{
    precautions:[
      'For vomiting/diarrhea: prioritize oral rehydration; watch for signs of dehydration.',
      'Avoid NSAIDs on an empty stomach; seek care for blood in stool or persistent vomiting.',
      'For reflux/ulcer: avoid lying down within 2–3 hours of meals; elevate head end of bed.'
    ],
    food:[
      'Small, frequent, bland meals (e.g., rice, bananas, toast) during acute upset.',
      'Avoid very spicy, fatty, or acidic foods and excess caffeine.',
      'Use ORS as needed for diarrhea per local guidelines.'
    ]
  },
  endocrine:{
    precautions:[
      'Monitor blood glucose as advised; never skip prescribed medications/insulin.',
      'Carry quick sugar for hypoglycemia symptoms (sweating, tremor, confusion).',
      'Foot care daily; regular follow‑ups for eyes, kidneys, and lipids.'
    ],
    food:[
      'Consistent carbohydrate intake; emphasize high‑fiber whole foods.',
      'Limit sugary drinks and refined carbs; prefer water.',
      'Distribute meals evenly to avoid spikes.'
    ]
  },
  cardio:{
    precautions:[
      'Adhere to BP/heart medications; do not stop abruptly without advice.',
      'Monitor blood pressure at home if recommended.',
      'Seek emergency help for chest pain, shortness of breath, or one‑sided weakness.'
    ],
    food:[
      'DASH‑style eating: more fruits/vegetables, low‑fat dairy, nuts, whole grains.',
      'Reduce salt (aim <5 g/day), limit alcohol, and avoid trans fats.'
    ]
  },
  neuro:{
    precautions:[
      'For migraines: keep a trigger diary; manage sleep and stress.',
      'Take abortive/preventive meds as prescribed; avoid medication overuse.',
      'Emergency for stroke signs (FAST: face droop, arm weakness, speech trouble, time to call help).' 
    ],
    food:[
      'Regular meals and hydration; avoid known personal triggers (e.g., excess caffeine, certain cheeses or processed meats).'
    ]
  },
  musculoskeletal:{
    precautions:[
      'Rest the affected area initially; gradual return to activity with proper posture/ergonomics.',
      'Use cold/heat therapy as advised; avoid heavy lifting during acute pain.',
      'Seek care for numbness, weakness, or severe unrelenting pain.'
    ],
    food:[
      'Adequate protein and calcium/vitamin D intake for bone/muscle health.',
      'Maintain healthy body weight to reduce joint stress.'
    ]
  },
  renal:{
    precautions:[
      'Hydration as advised; adjust in heart/kidney failure per clinician advice.',
      'Avoid NSAIDs unless approved; review all meds for renal dosing.',
      'Seek care for fever with back/flank pain, or reduced urine output.'
    ],
    food:[
      'For stones: increase fluids; dietary modifications depend on stone type (e.g., limit sodium; adequate—but not excessive—calcium).',
      'For chronic kidney disease: follow clinician‑guided protein, sodium, potassium, and phosphorus limits.'
    ]
  },
  skin:{
    precautions:[
      'Avoid scratching; use gentle skin care and moisturizers.',
      'Use prescribed topical/oral meds as directed; test new products on small areas first.',
      'Seek care for spreading infection, fever, or severe blistering.'
    ],
    food:[
      'Balanced diet; identify and avoid any personal food triggers if documented.'
    ]
  },
  eye:{
    precautions:[
      'Avoid contact lens use during eye infections; maintain hand hygiene.',
      'Seek urgent care for vision loss, severe pain, light sensitivity, or trauma.'
    ],
    food:[
      'General balanced diet; include leafy greens and fish for eye health as part of routine nutrition.'
    ]
  },
  ent:{
    precautions:[
      'For sore throat/tonsillitis: rest voice, humidify air, and hydrate.',
      'Avoid smoking and irritants; follow antibiotic guidance if prescribed.'
    ],
    food:[
      'Warm fluids and soft foods; avoid very spicy or acidic items when painful.'
    ]
  }
};

async function fetchWikiSummary(term){
  try{
    const url = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(term)}`;
    const res = await fetch(url, { headers: { 'accept': 'application/json' }, timeout: 7000 });
    if(!res.ok) return null;
    const j = await res.json();
    // Avoid disambiguation
    if(j.type && j.type.includes('disambiguation')) return null;
    return { title: j.title, extract: j.extract, url: j.content_urls?.desktop?.page || j.content_urls?.mobile?.page };
  }catch(e){ return null; }
}

export async function handler(event, context){
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
  };
  const q = (event.queryStringParameters?.disease || '').trim();
  if(!q) return { statusCode: 400, headers, body: JSON.stringify({ error: 'Missing disease parameter' }) };

  const cat = categorize(q);
  const base = LIB[cat] || LIB.general;

  const wiki = await fetchWikiSummary(q);

  return {
    statusCode: 200,
    headers,
    body: JSON.stringify({
      disease: q,
      category: cat,
      source: wiki ? { title: wiki.title, url: wiki.url } : null,
      summary: wiki?.extract || null,
      precautions: base.precautions,
      food: base.food,
      notice: wiki ? 'Precautions & food are general for this category. Summary is from Wikipedia.'
                   : 'Precautions & food are general for this category.'
    })
  };
}
