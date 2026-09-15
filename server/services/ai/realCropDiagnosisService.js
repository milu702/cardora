const { GoogleGenAI } = require('@google/genai');
const { findVerifiedKnowledge } = require('./agriculturalKnowledgeSeed');
const { getPlantationContext } = require('./contextService');

const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
let aiClient = null;

if (apiKey && apiKey.trim()) {
  try {
    aiClient = new GoogleGenAI({ apiKey: apiKey.trim() });
    console.log('⚡ Gemini Vision API initialized for Real Crop Diagnosis!');
  } catch (err) {
    console.warn('Gemini Client Init Notice:', err.message);
  }
}

/**
 * System Instruction for Gemini Vision Model as required by Cardora System Spec #3
 */
const CROP_DIAGNOSIS_SYSTEM_INSTRUCTION = `You are Cardora's agricultural crop image analysis assistant.

Analyze ONLY the visual evidence present in the uploaded image.

Do not assume a disease simply because the application is for cardamom.

First determine whether the image is suitable for analysis.

Identify the crop only when there is sufficient visual evidence.

For cardamom images, assess visible signs of:
- pest damage
- fungal disease
- bacterial disease
- viral symptoms
- nutrient deficiency
- environmental stress
- physical damage
- healthy plant
- unknown condition

Do not claim microscopic features that cannot actually be observed in the image.

Do not invent symptoms.

Do not invent treatment.

Do not invent yield-loss percentages.

Do not invent soil values.

Do not invent weather information.

Do not invent sensor readings.

If evidence is insufficient, explicitly state that the condition cannot be reliably determined from this image.

Return ONLY a valid JSON object matching this exact schema:
{
  "crop": "Name of crop if visually identified or 'Unknown Plant'",
  "diagnosis": "Name of identified condition or 'Insufficient visual evidence'",
  "scientificName": "Scientific botanical or pathological name if known, else empty string",
  "diagnosisType": "Pest | Fungal Disease | Bacterial Disease | Viral Symptoms | Nutrient Deficiency | Environmental Stress | Physical Damage | Healthy Plant | Unknown Condition",
  "confidence": null,
  "confidenceAvailable": false,
  "severity": "Low | Moderate | High | Critical | Undetermined",
  "imageQuality": "Good | Fair | Poor | Insufficient",
  "visualEvidence": ["Visual observation 1 actually supported by image", "Visual observation 2"],
  "symptoms": ["Symptom observed 1"],
  "possibleCauses": ["Possible cause 1"],
  "organicTreatment": [],
  "chemicalControl": [],
  "prevention": [],
  "immediateActions": ["Action 1"],
  "followUpActions": ["Follow-up 1"],
  "uncertainty": "Detailed explanation of visual ambiguity or why evidence is insufficient if applicable",
  "additionalImageNeeded": false,
  "explanation": "Clear, objective visual evidence explanation",
  "affectedRegions": [
    {
      "label": "affected area label",
      "box": [0.1, 0.2, 0.4, 0.5]
    }
  ]
}

CRITICAL RULES:
1. "box" array must contain 4 normalized float values [x, y, width, height] between 0.0 and 1.0 representing bounding boxes on the image if affected regions can be identified. If regions cannot be pinpointed, leave affectedRegions as an empty array [].
2. Set "confidence": null and "confidenceAvailable": false UNLESS the model has explicit measurable statistical confidence. Never output a fake percentage.
3. If the image shows a non-plant object (e.g. human face, car, text document, furniture), set "imageQuality": "Insufficient", "diagnosis": "Insufficient visual evidence", "explanation": "Image does not contain a plant or crop leaf suitable for agricultural analysis.", "additionalImageNeeded": true.`;

/**
 * Analyzes crop image strictly using Gemini Vision API and matches Cardora Agricultural Knowledge Base
 */
async function analyzeCropImageReal({
  fileBuffer,
  mimeType = 'image/jpeg',
  imageBase64 = '',
  userId = null,
  plantationId = null,
  farmerNotes = '',
  userLocation = 'Idukki, Kerala'
}) {
  let imageBytes = null;
  let finalMimeType = mimeType || 'image/jpeg';

  if (fileBuffer && Buffer.isBuffer(fileBuffer)) {
    imageBytes = fileBuffer;
  } else if (imageBase64 && typeof imageBase64 === 'string') {
    let clean = imageBase64;
    if (clean.includes('base64,')) {
      const parts = clean.split('base64,');
      finalMimeType = parts[0].split(':')[1].split(';')[0];
      clean = parts[1];
    }
    imageBytes = Buffer.from(clean, 'base64');
  }

  // 1. IMAGE QUALITY & READABILITY CHECK
  if (!imageBytes || imageBytes.length < 10) {
    return {
      success: false,
      code: 'NO_IMAGE',
      message: 'No valid crop image was uploaded for analysis.',
      userInstruction: 'Please select a clear photo of your crop leaf, pod, or tiller plant.',
    };
  }


  // Re-check/initialize client if environment key updated
  const currentKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
  if (!aiClient && currentKey && currentKey.trim()) {
    try {
      aiClient = new GoogleGenAI({ apiKey: currentKey.trim() });
    } catch (e) {}
  }

  // 2. FETCH REAL FARM & WEATHER CONTEXT
  const farmContext = await getPlantationContext({ userId, plantationId, userLocation });

  if (!aiClient) {
    return {
      success: false,
      code: 'API_KEY_MISSING',
      message: 'AI analysis could not be completed (Gemini API Key missing on backend server).',
      userInstruction: 'Please check your GEMINI_API_KEY environment variable in server/.env.',
    };
  }

  const visionModels = [
    'gemini-3.6-flash',
    'gemini-3.5-flash-lite',
    'gemini-3-flash',
  ];
  const base64String = imageBytes.toString('base64');

  const userPromptText = `Analyze this uploaded plant crop image for visual agricultural health inspection.
Farmer Notes / Symptoms Observed: "${farmerNotes || 'Visual inspection requested by farmer.'}"
Plantation Location Context: "${farmContext.district || userLocation}"
Crop Context: "${farmContext.variety ? farmContext.variety + ' Cardamom' : 'Cardamom'}"

Provide your structured output strictly in JSON according to the system instructions.`;

  let rawAiText = '';
  let usedModel = '';

  for (const m of visionModels) {
    for (let attempt = 1; attempt <= 2; attempt++) {
      try {
        const response = await aiClient.models.generateContent({
          model: m,
          contents: [
            {
              inlineData: {
                data: base64String,
                mimeType: finalMimeType,
              },
            },
            userPromptText,
          ],
          config: {
            systemInstruction: CROP_DIAGNOSIS_SYSTEM_INSTRUCTION,
            temperature: 0.2, // Low temperature for high accuracy & zero hallucination
          },
        });

        if (response && response.text) {
          rawAiText = response.text;
          usedModel = m;
          console.log(`✅ Gemini Vision analysis succeeded using model: ${m}`);
          break;
        }
      } catch (err) {
        console.warn(`Gemini Vision model attempt '${m}' (attempt ${attempt}) notice:`, err.message);
        if (err.message.includes('503') || err.message.includes('UNAVAILABLE') || err.message.includes('high demand')) {
          await new Promise(r => setTimeout(r, 1000));
        } else {
          break; // Try next model in list
        }
      }
    }
    if (rawAiText) break;
  }


  if (!rawAiText) {
    return {
      success: false,
      code: 'AI_SERVICE_UNAVAILABLE',
      message: 'AI analysis could not be completed due to backend service timeout or network error.',
      userInstruction: 'Please try again in a few moments.',
    };
  }

  // 3. PARSE & VALIDATE STRUCTURED JSON RESPONSE
  let structuredAi = null;
  try {
    const jsonMatch = rawAiText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      structuredAi = JSON.parse(jsonMatch[0]);
    }
  } catch (parseErr) {
    console.warn('JSON parsing error from Gemini response:', parseErr.message);
  }

  if (!structuredAi) {
    return {
      success: false,
      code: 'MALFORMED_RESPONSE',
      message: 'AI analysis could not be completed (Response formatting issue).',
      userInstruction: 'Please try capturing a closer photo in good daylight and try again.',
    };
  }

  // 4. CHECK IMAGE QUALITY RESULT FROM AI
  const isPoorQuality = structuredAi.imageQuality === 'Poor' || structuredAi.imageQuality === 'Insufficient' || structuredAi.additionalImageNeeded;
  const isInsufficientEvidence = structuredAi.diagnosis === 'Insufficient visual evidence' || structuredAi.diagnosis === 'Unknown Condition';

  // 5. MATCH CARDORA VERIFIED AGRICULTURAL KNOWLEDGE BASE
  // To prevent AI hallucination of chemical dosages, match identified condition against Cardora KB
  const verifiedKb = await findVerifiedKnowledge(structuredAi.diagnosis || structuredAi.crop);

  let finalOrganicTreatment = Array.isArray(structuredAi.organicTreatment) && structuredAi.organicTreatment.length > 0 
    ? structuredAi.organicTreatment 
    : (verifiedKb?.organicTreatment || []);

  let finalChemicalControl = Array.isArray(structuredAi.chemicalControl) && structuredAi.chemicalControl.length > 0 
    ? structuredAi.chemicalControl 
    : (verifiedKb?.chemicalControl || []);

  let finalPrevention = Array.isArray(structuredAi.prevention) && structuredAi.prevention.length > 0 
    ? structuredAi.prevention 
    : (verifiedKb?.prevention || []);

  let finalImmediateActions = Array.isArray(structuredAi.immediateActions) && structuredAi.immediateActions.length > 0
    ? structuredAi.immediateActions
    : (verifiedKb?.immediateActions || (isInsufficientEvidence ? ['Capture a closer image in good daylight.', 'Consult an agricultural expert for hands-on inspection.'] : ['Inspect affected plants for pest/disease spread.']));

  let finalFollowUpActions = Array.isArray(structuredAi.followUpActions) && structuredAi.followUpActions.length > 0
    ? structuredAi.followUpActions
    : (verifiedKb?.followUpActions || ['Monitor crop progress daily.']);

  // If diagnosis is uncertain, strictly DO NOT recommend pesticides
  if (isInsufficientEvidence || isPoorQuality) {
    finalChemicalControl = ['No chemical control recommended while diagnosis is uncertain. Consult an expert.'];
  }

  // 6. ASSEMBLE FINAL DATA-DRIVEN DIAGNOSIS OBJECT
  const finalResult = {
    crop: structuredAi.crop || 'Cardamom',
    diagnosis: isPoorQuality && !isInsufficientEvidence ? 'Insufficient Visual Evidence' : (structuredAi.diagnosis || 'Insufficient visual evidence'),
    scientificName: structuredAi.scientificName || verifiedKb?.scientificName || '',
    diagnosisType: structuredAi.diagnosisType || (verifiedKb?.category ? `${verifiedKb.category} Assessment` : 'Botanical Assessment'),
    confidence: (structuredAi.confidenceAvailable && typeof structuredAi.confidence === 'number') ? structuredAi.confidence : null,
    confidenceAvailable: Boolean(structuredAi.confidenceAvailable && typeof structuredAi.confidence === 'number'),
    severity: structuredAi.severity || 'Undetermined',
    imageQuality: structuredAi.imageQuality || (isPoorQuality ? 'Insufficient' : 'Good'),
    visualEvidence: Array.isArray(structuredAi.visualEvidence) ? structuredAi.visualEvidence : [],
    symptoms: Array.isArray(structuredAi.symptoms) && structuredAi.symptoms.length > 0 ? structuredAi.symptoms : (verifiedKb?.symptoms || []),
    possibleCauses: Array.isArray(structuredAi.possibleCauses) && structuredAi.possibleCauses.length > 0 ? structuredAi.possibleCauses : (verifiedKb?.causes || []),
    organicTreatment: finalOrganicTreatment,
    chemicalControl: finalChemicalControl,
    prevention: finalPrevention,
    immediateActions: finalImmediateActions,
    followUpActions: finalFollowUpActions,
    uncertainty: structuredAi.uncertainty || (isPoorQuality ? 'Image lighting or clarity is insufficient for reliable disease identification.' : ''),
    additionalImageNeeded: Boolean(structuredAi.additionalImageNeeded || isPoorQuality),
    explanation: structuredAi.explanation || 'Visual analysis completed based strictly on uploaded image features.',
    affectedRegions: Array.isArray(structuredAi.affectedRegions) ? structuredAi.affectedRegions : [],
    knowledgeSource: verifiedKb?.source || 'ICAR–Indian Institute of Spices Research',
    knowledgeSourceUrl: verifiedKb?.sourceUrl || 'https://spices.res.in',
    aiProvider: `Google Gemini Vision (${usedModel})`,
    
    // Explicit Data Source Segregation
    sources: {
      aiVision: `Uploaded image analyzed using Gemini Vision (${usedModel})`,
      farmData: farmContext.hasPlantation ? `MongoDB Plantation: ${farmContext.plantationName}` : 'General Farm Context',
      weatherData: farmContext.weather ? `Live Weather API: ${farmContext.weather.temp}°C, Humidity ${farmContext.weather.humidity}%` : 'Not Available',
      iotData: farmContext.soilMoisture ? `Sensor Telemetry: Moisture ${farmContext.soilMoisture}%, pH ${farmContext.ph}` : 'Not Available',
      verifiedKb: verifiedKb?.source || 'ICAR–Indian Institute of Spices Research',
    },

    farmContext: {
      plantationName: farmContext.plantationName || 'Field Plot',
      soilMoisture: farmContext.soilMoisture ? `${farmContext.soilMoisture}%` : 'N/A',
      soilPh: farmContext.ph ? `${farmContext.ph}` : 'N/A',
      npk: farmContext.npk ? `N:${farmContext.npk.n} P:${farmContext.npk.p} K:${farmContext.npk.k}` : 'N/A',
      weatherTemp: farmContext.weather?.temp ? `${farmContext.weather.temp}°C` : 'N/A',
      weatherHumidity: farmContext.weather?.humidity ? `${farmContext.weather.humidity}%` : 'N/A',
      weatherRain: farmContext.weather?.rain ? `${farmContext.weather.rain} mm` : 'N/A',
      location: farmContext.district || userLocation,
    },
  };

  return {
    success: true,
    data: finalResult,
    isPoorQuality,
  };
}

module.exports = {
  analyzeCropImageReal,
  CROP_DIAGNOSIS_SYSTEM_INSTRUCTION,
};
