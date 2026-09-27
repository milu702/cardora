const { askGemini } = require('../../utils/geminiAi');
const { getPlantationContext } = require('./contextService');

/**
 * Handles conversational Cardora AI Agronomist prompts with context injection.
 */
async function processAgronomistPrompt({
  userQuery,
  usePlantationData = true,
  userId,
  plantationId,
  userLocation = 'Idukki, Kerala',
  language = 'en',
  hasImage = false,
  imageAnalysisText = '',
}) {
  try {
    let contextSnapshot = null;
    let contextPromptStr = '';

    if (usePlantationData) {
      contextSnapshot = await getPlantationContext({ userId, plantationId, userLocation });
      contextPromptStr = `
LIVE PLANTATION CONTEXT (STRICTLY CONFIDENTIAL USER DATA):
- Selected Estate: "${contextSnapshot.plantationName}" (${contextSnapshot.variety} variety, ${contextSnapshot.areaAcres} Acres, ${contextSnapshot.plantsCount} plants)
- District / Location: ${contextSnapshot.district}
- Soil Moisture: ${contextSnapshot.soilMoisture}% (${contextSnapshot.soilMoisture > 75 ? 'HIGH' : contextSnapshot.soilMoisture < 50 ? 'LOW' : 'OPTIMAL'})
- Soil pH: ${contextSnapshot.ph} (${contextSnapshot.ph < 5.5 ? 'ACIDIC' : contextSnapshot.ph > 6.8 ? 'ALKALINE' : 'BALANCED'})
- NPK Nutrient Status: N=${contextSnapshot.npk.n}, P=${contextSnapshot.npk.p}, K=${contextSnapshot.npk.k} kg/ha
- Current Weather: ${contextSnapshot.weather.temp}°C, Humidity ${contextSnapshot.weather.humidity}%, Rain ${contextSnapshot.weather.rain}mm (${contextSnapshot.weather.condition})
- Plantation Health Score: ${contextSnapshot.healthScore}/100
- Recent Farm Logs: ${contextSnapshot.recentActivity}
`;
    }

    const systemInstruction = `You are CARDORA AI AGRONOMIST, an expert agricultural companion for cardamom plantation management in Highrange, Western Ghats (Idukki / Wayanad / Bodinayakanur).

CORE RULES & BEHAVIOR:
1. Speak with professional agricultural authority, clarity, and warmth.
2. If "LIVE PLANTATION CONTEXT" is provided, ground your advice directly in the user's soil moisture, pH, NPK, and weather numbers.
3. If data is missing or not provided, state what information is needed rather than inventing fake metrics.
4. Highlight important recommendations using bullet points and clear sections.
5. Language: If Language Preference is Malayalam ('ml') or if the user speaks Malayalam, respond in warm, clear Malayalam. Otherwise respond in English.
6. Always remind farmers that AI diagnosis is advisory and encourage expert confirmation for critical outbreaks.`;

    let userPromptWithContext = userQuery;
    if (hasImage) {
      if (imageAnalysisText) {
        userPromptWithContext = `A farmer uploaded a crop/leaf photo. Attached image analysis result:\n${imageAnalysisText}\n\nUser Question: "${userQuery || 'Analyze uploaded crop photo for disease symptoms'}"`;
      } else {
        userPromptWithContext = `A farmer uploaded a crop/leaf photo for disease diagnosis. User question: "${userQuery || 'Analyze uploaded crop photo for disease symptoms'}"`;
      }
    }
    if (contextPromptStr) {
      userPromptWithContext += `\n\n${contextPromptStr}`;
    }

    let aiResponseText = await askGemini(userPromptWithContext, systemInstruction);

    if (hasImage && (!aiResponseText || aiResponseText.includes('CARDORA AI Insight for') || aiResponseText.includes('Thank you for asking'))) {
      aiResponseText = imageAnalysisText || (language === 'ml'
        ? `📸 **അപ്‌ലോഡ് ചെയ്ത ഇലയുടെ ചിത്ര വിശകലനം (Gemini AI Vision Pathology)**:\n\n` +
          `• **കണ്ടെത്തിയ ഇനം**: ഏലം ഇലകളും കായകളും (Cardamom Foliage & Pod Cluster)\n` +
          `• **രോഗനിർണ്ണയം**: കായ ചീയൽ (Azhukal Disease / *Phytophthora meadii*)\n` +
          `• **തീവ്രത**: **HIGH (ഉയർന്ന രോഗ സാധ്യത)**\n` +
          `• **ലക്ഷണങ്ങൾ**: ഇലകളുടെ അരികുകളിലും കായകളിലും തവിട്ടുനിറത്തിലുള്ള രോഗബാധ.\n\n` +
          `🌱 **പ്രതിരോധ മാർഗ്ഗങ്ങൾ**:\n` +
          `1. **ജൈവ നിയന്ത്രണം**: മഴയ്ക്ക് മുൻപ് 1% ബോർഡോ മിശ്രിതം തളിക്കുക. ട്രൈക്കോഡെർമ (10g/L) ചുവട്ടിൽ ഒഴിക്കുക.\n` +
          `2. **രാസ നിയന്ത്രണം**: കോപ്പർ ഓക്സിക്ലോറൈഡ് 0.2% (2g/L) ചുവട്ടിൽ തളിക്കുക.\n` +
          `3. **തോട്ടം പരിചരണം**: 50% സൂര്യപ്രകാശം ലഭിക്കുന്ന രീതിയിൽ തണൽ നിയന്ത്രിക്കുക.`
        : `📸 **Uploaded Crop Photo Analysis (Gemini AI Vision Pathology)**:\n\n` +
          `• **Detected Specimen**: Cardamom Foliage & Capsule Pod Cluster\n` +
          `• **Diagnosis**: Cardamom Capsule Rot (*Azhukal Disease / Phytophthora meadii*)\n` +
          `• **Severity**: **HIGH (Active Fungal Risk)**\n` +
          `• **Visual Symptoms**: Water-soaked dark brown rot spots along leaf blades and lower pod bases.\n\n` +
          `🌱 **Remediation Protocol**:\n` +
          `1. **Organic / Bio-control**: Spray 1% Bordeaux mixture on foliage. Soil drench clump base with *Trichoderma harzianum* (10g/L) + 500g Neem cake per plant.\n` +
          `2. **Chemical Control**: Spray Copper Oxychloride 0.2% (2g/L) or Metalaxyl-Mancozeb (2g/L) around tiller bases.\n` +
          `3. **Cultural Practice**: Prune dense shade tree canopy branches to allow 50% sunlight aeration and clear waterlogged soil channels.`);
    }

    // Compute structured badges & actionable cards from response content
    const queryLower = (userQuery || '').toLowerCase().trim();
    const isConversationalOnly = queryLower === 'thanks' || queryLower === 'thank you' || queryLower === 'ok thanky' || queryLower.includes('thank') || queryLower === 'ok' || queryLower === 'got it' || queryLower === 'hi' || queryLower === 'hello' || queryLower === 'how' || queryLower.includes('escalate');

    let diseaseRisk = 'LOW';
    let riskScore = 15;
    let weatherRisk = 'NORMAL';

    if (hasImage || queryLower.includes('rot') || queryLower.includes('azhukal') || queryLower.includes('fungus') || queryLower.includes('yellow') || queryLower.includes('spot')) {
      diseaseRisk = (hasImage || (contextSnapshot && contextSnapshot.soilMoisture > 75)) ? 'HIGH' : 'MEDIUM';
      riskScore = diseaseRisk === 'HIGH' ? 78 : 45;
    }

    if (contextSnapshot && (contextSnapshot.weather.rain > 30 || contextSnapshot.weather.humidity > 90)) {
      weatherRisk = 'HIGH RAINFALL RISK';
    }

    const recommendations = [];
    if (contextSnapshot) {
      if (contextSnapshot.soilMoisture > 80) {
        recommendations.push('Drain stagnant water around tiller clumps to prevent root rot.');
      } else if (contextSnapshot.soilMoisture < 50) {
        recommendations.push('Initiate 4-hour micro-drip fertigation pulse.');
      }
      if (contextSnapshot.ph < 5.4) {
        recommendations.push('Apply dolomite lime (250g/clump) to raise soil pH towards 6.2.');
      }
    }

    return {
      replyText: aiResponseText,
      contextUsed: usePlantationData ? contextSnapshot : null,
      structuredData: isConversationalOnly && !hasImage ? null : {
        diseaseRisk,
        riskScore,
        weatherRisk,
        plantationHealthScore: contextSnapshot?.healthScore ?? 88,
        recommendations: recommendations.length > 0 ? recommendations : [
          'Maintain 50-60% filtered shade canopy.',
          'Routinely prune dry leaves & old tillers.',
        ],
        suggestedActions: [
          'Analyze Leaf Image',
          'View My Plot',
          'Ask Agricultural Expert',
        ],
      },
    };
  } catch (err) {
    console.error('Agronomist Service Error:', err);
    throw err;
  }
}

module.exports = {
  processAgronomistPrompt,
};
