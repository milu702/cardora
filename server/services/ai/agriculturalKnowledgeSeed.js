const AgriculturalKnowledge = require('../../models/AgriculturalKnowledge');

const VERIFIED_KNOWLEDGE_ENTRIES = [
  {
    title: 'Cardamom Capsule Rot (Azhukal Disease)',
    crop: 'Cardamom',
    category: 'Disease',
    condition: 'Capsule Rot (Azhukal Disease)',
    scientificName: 'Phytophthora meadii McRae',
    symptoms: [
      'Water-soaked lesions on lower leaves and leaf sheath',
      'Rotting of capsule pods turning brown to dark black',
      'Foul decaying odor around tiller clump base',
      'Premature shedding of green capsules'
    ],
    causes: [
      'High atmospheric humidity (>85%) combined with continuous monsoon rains',
      'Poor surface soil drainage leading to waterlogging around rhizomes',
      'Over-shading restricting sunlight aeration through canopy'
    ],
    organicTreatment: [
      'Apply 1% Bordeaux mixture spray thoroughly on foliage prior to monsoon onset',
      'Incorporate Trichoderma harzianum (50g per clump) mixed with 1kg Neem cake into root zone',
      'Apply Pseudomonas fluorescens (20g/litre) foliar spray at 15-day intervals'
    ],
    chemicalControl: [
      'Spray Copper Oxychloride 0.2% (2.5g/L) around lower tiller sheath bases',
      'Drench tiller root zone with Metalaxyl-Mancozeb 0.2% (2g/L) at 3 liters per clump'
    ],
    prevention: [
      'Prune dense overhead tree canopy to allow 50% sunlight filtration',
      'Clear surface drainage channels around clump bases to avoid standing water',
      'Remove and burn infected capsules and fallen plant debris outside perimeter'
    ],
    immediateActions: [
      'Remove infected tiller leaves and decaying capsules immediately',
      'Drench clump root zone with Trichoderma or Copper Oxychloride solution'
    ],
    followUpActions: [
      'Inspect clump base weekly during rainy season',
      'Re-apply bio-fungicide after heavy rainfall spells'
    ],
    source: 'ICAR–Indian Institute of Spices Research (IISR Kozhikode)',
    sourceUrl: 'https://spices.res.in/cardamom-disease-management'
  },
  {
    title: 'Cardamom Thrips Damage',
    crop: 'Cardamom',
    category: 'Pest',
    condition: 'Cardamom Thrips Damage',
    scientificName: 'Sciothrips cardamomi Ramk.',
    symptoms: [
      'Silvery streaks and brown scab patches on leaf surfaces and capsule skin',
      'Stunted tiller shoot growth and leaf curling along young margins',
      'Pesticide scab marks causing market value reduction of pods'
    ],
    causes: [
      'Warm temperatures (22°C - 30°C) with dry spells encouraging nymph breeding',
      'Presence of weed host plants around clump margins'
    ],
    organicTreatment: [
      'Spray Neem Seed Kernel Extract (NSKE 5%) or Neem oil (3ml/L) with soap solution twice at 14-day intervals',
      'Spray Beauveria bassiana bio-insecticide (5g/L) during humid evening hours'
    ],
    chemicalControl: [
      'Spray Spinetoram 11.7% SC (0.5ml/L) or Fipronil 5% SC (2ml/L) during early morning tiller flushing',
      'Spray Spinosad 45% SC (0.3ml/L) targeting flowering panicles'
    ],
    prevention: [
      'Install yellow sticky traps (15 traps/acre) to monitor adult thrips population',
      'Clear dry leaf trash and weeds around clump base to destroy nymph harborage'
    ],
    immediateActions: [
      'Install yellow sticky traps immediately',
      'Apply neem-based bio-pesticide on young tiller flushes'
    ],
    followUpActions: [
      'Monitor trap counts every 5 days',
      'Repeat spray if active thrips are observed on flower buds'
    ],
    source: 'Kerala Agricultural University (KAU Thrissur)',
    sourceUrl: 'https://kau.in/crop-protection/cardamom-thrips'
  },
  {
    title: 'Cardamom Clump Rot / Rhizome Wilt',
    crop: 'Cardamom',
    category: 'Disease',
    condition: 'Clump Rot / Rhizome Wilt',
    scientificName: 'Pythium vexans de Bary / Rhizoctonia solani',
    symptoms: [
      'Pale yellowing and wilting of shoot tillers starting from lower foliage',
      'Soft decaying rhizomes emitting foul decay odor when uprooted',
      'Roots become soft and tillers pull out easily from clump socket'
    ],
    causes: [
      'Soil-borne Pythium fungus thriving in poorly drained waterlogged soils',
      'Physical root injury during weeding or harvesting'
    ],
    organicTreatment: [
      'Soil drench clump base with Pseudomonas fluorescens (20g/L) with 2kg Vermicompost',
      'Apply Trichoderma harzianum enriched neem cake around affected clump root zones'
    ],
    chemicalControl: [
      'Drench tiller root zone with Metalaxyl 8% + Mancozeb 64% WP (2.5g/L) at 3-4 liters per clump',
      'Drench with Carbendazim 12% + Mancozeb 63% WP (2g/L)'
    ],
    prevention: [
      'Construct 30cm deep isolation trenches around affected clump patches',
      'Avoid deep soil hoeing near tiller rhizome sockets to prevent root wounding'
    ],
    immediateActions: [
      'Isolate affected clump by digging a shallow drainage trench',
      'Drench root zone with bio-control or systemic fungicide'
    ],
    followUpActions: [
      'Monitor surrounding clumps for yellowing symptoms for 21 days',
      'Ensure field drainage channels remain unobstructed'
    ],
    source: 'Spices Board of India (Ministry of Commerce & Industry)',
    sourceUrl: 'http://www.indianspices.com/cardamom-rhizome-rot'
  },
  {
    title: 'Cardamom Leaf Rust & Cercospora Leaf Spot',
    crop: 'Cardamom',
    category: 'Disease',
    condition: 'Leaf Rust / Leaf Spot',
    scientificName: 'Phaeochorella cardamomi / Cercospora cardamomi',
    symptoms: [
      'Small reddish-brown circular spots with yellow halos on leaf blades',
      'Severe defoliation and premature leaf drying on upper canopy tillers',
      'Reduced photosynthesis leading to smaller capsule pod size'
    ],
    causes: [
      'Fungal spore spread via wind and rain splashes under high atmospheric humidity',
      'Dense unpruned shade tree canopy'
    ],
    organicTreatment: [
      'Spray Copper Hydroxide 77% WP (2g/L) or Garlic-Chilli bio-extract spray every 15 days',
      'Apply Trichoderma viride foliar spray'
    ],
    chemicalControl: [
      'Spray Hexaconazole 5% EC (1ml/L) or Propiconazole 25% EC (1ml/L)',
      'Spray Mancozeb 75% WP (2g/L) thoroughly covering upper and lower leaf surfaces'
    ],
    prevention: [
      'Regulate overhead shade to allow 50% sunlight penetration',
      'Collect and burn severely infected dried leaves'
    ],
    immediateActions: [
      'Prune lower infected leaves',
      'Apply protective Copper Hydroxide or Mancozeb foliar spray'
    ],
    followUpActions: [
      'Re-inspect upper leaf canopy after 10 days',
      'Maintain balanced potassium fertilization for leaf spot resistance'
    ],
    source: 'ICAR–Indian Institute of Spices Research (IISR Kozhikode)',
    sourceUrl: 'https://spices.res.in/cardamom-leaf-diseases'
  },
  {
    title: 'Healthy Cardamom Crop (Optimal Growth)',
    crop: 'Cardamom',
    category: 'Healthy',
    condition: 'Healthy Cardamom Crop',
    scientificName: 'Elettaria cardamomum Maton',
    symptoms: [
      'Vibrant emerald green leaves with healthy chlorophyll pigmentation',
      'Bold 8mm+ green capsule pods developing uniformly along panicles',
      'Zero active fungal lesions, chlorosis, or insect pest infestation observed'
    ],
    causes: [
      'Optimal soil organic content, balanced NPK nutrition, and proper shade management'
    ],
    organicTreatment: [
      'Maintain regular organic maintenance: apply Vermicompost (2kg/clump) and Bio-fertilizers (Azospirillum & PSB)'
    ],
    chemicalControl: [
      'No chemical pesticide treatment required for healthy crops'
    ],
    prevention: [
      'Continue regular pulse micro-drip irrigation (45 mins daily)',
      'Inspect lower tiller clump nodes weekly for early pest detection'
    ],
    immediateActions: [
      'Maintain current irrigation and organic fertigation schedule'
    ],
    followUpActions: [
      'Routine weekly visual inspection of panicles and leaf margins'
    ],
    source: 'Cardora Agronomy Standards & Spices Board Guidelines',
    sourceUrl: 'https://spices.res.in'
  }
];

async function seedKnowledgeBase() {
  try {
    const count = await AgriculturalKnowledge.countDocuments();
    if (count === 0) {
      await AgriculturalKnowledge.insertMany(VERIFIED_KNOWLEDGE_ENTRIES);
      console.log('✅ Seeded Cardora Agricultural Knowledge Base with verified ICAR-IISR entries.');
    }
  } catch (err) {
    console.warn('Notice seeding Agricultural Knowledge Base:', err.message);
  }
}

async function findVerifiedKnowledge(conditionName = '') {
  try {
    await seedKnowledgeBase();
    if (!conditionName) return null;

    const term = conditionName.toLowerCase();
    
    // Attempt exact or regex match
    let match = await AgriculturalKnowledge.findOne({
      $or: [
        { condition: { $regex: new RegExp(term, 'i') } },
        { title: { $regex: new RegExp(term, 'i') } },
        { category: { $regex: new RegExp(term, 'i') } }
      ]
    });

    if (!match) {
      if (term.includes('rot') || term.includes('azhukal')) {
        match = await AgriculturalKnowledge.findOne({ condition: 'Capsule Rot (Azhukal Disease)' });
      } else if (term.includes('thrip')) {
        match = await AgriculturalKnowledge.findOne({ condition: 'Cardamom Thrips Damage' });
      } else if (term.includes('wilt') || term.includes('rhizome') || term.includes('clump')) {
        match = await AgriculturalKnowledge.findOne({ condition: 'Clump Rot / Rhizome Wilt' });
      } else if (term.includes('spot') || term.includes('rust')) {
        match = await AgriculturalKnowledge.findOne({ condition: 'Leaf Rust / Leaf Spot' });
      } else if (term.includes('healthy') || term.includes('normal')) {
        match = await AgriculturalKnowledge.findOne({ condition: 'Healthy Cardamom Crop' });
      }
    }

    return match;
  } catch (err) {
    console.warn('Error querying Agricultural Knowledge Base:', err.message);
    return null;
  }
}

module.exports = {
  seedKnowledgeBase,
  findVerifiedKnowledge,
  VERIFIED_KNOWLEDGE_ENTRIES,
};
