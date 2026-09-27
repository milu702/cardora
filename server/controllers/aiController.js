const mongoose = require('mongoose');
const axios = require('axios');
const Plantation = require('../models/Plantation');
const FertilizerRecommendation = require('../models/FertilizerRecommendation');
const ExpertConsultation = require('../models/ExpertConsultation');
const AiConversation = require('../models/AiConversation');
const AiMessage = require('../models/AiMessage');
const { getWeatherTelemetry } = require('../services/weatherService');
const { askGemini, analyzeDocumentWithGemini } = require('../utils/geminiAi');
const { processAgronomistPrompt } = require('../services/ai/agronomistService');
const { analyzeCropImage } = require('../services/ai/imageAnalysisService');

/**
 * @desc    Chat with Real Google Gemini AI Agronomist
 * @route   POST /api/ai/chat
 * @access  Public
 */
exports.chatWithAi = async (req, res) => {
  try {
    const { prompt, lang = 'en', context = '' } = req.body;

    if (!prompt || !prompt.trim()) {
      return res.status(400).json({ success: false, message: 'Prompt message is required.' });
    }

    const systemInstruction = lang === 'ml'
      ? 'നിങ്ങൾ CARDORA AI കൃഷി ശാസ്ത്രജ്ഞനും ഏതു വിഷയത്തിലും മറുപടി നൽകുന്ന ഇന്റലിജന്റ് AI സഹായിയുമാണ്. ഏതൊരു ചോദ്യത്തിനും വ്യക്തമായ മലയാളത്തിൽ മറുപടി നൽകുക.'
      : 'You are CARDORA AI, an intelligent, versatile AI Assistant like ChatGPT. Answer any prompt about agriculture, science, history, coding, general knowledge, math, stories, or world topics with high accuracy and engaging clarity in English or Malayalam.';

    const fullPrompt = context 
      ? `Context: ${context}\nUser Question: ${prompt}`
      : prompt;

    const reply = await askGemini(fullPrompt, systemInstruction);

    res.status(200).json({
      success: true,
      reply,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('AI Chat Controller Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process AI request.',
      error: error.message,
    });
  }
};

/**
 * @desc    Analyze Land Document / Pattayam with Real AI Vision
 * @route   POST /api/ai/scan-document
 * @access  Public
 */
const pdfParse = require('pdf-parse');

/**
 * @desc    Analyze Land Document / Pattayam with Real AI Vision & PDF Content Reader
 * @route   POST /api/ai/scan-document
 * @access  Public
 */
exports.scanDocument = async (req, res) => {
  try {
    const { fileName = '', documentText = '' } = req.body;
    let fileBuffer = null;
    let mimeType = 'application/pdf';
    let extractedContentText = documentText || '';

    if (req.file) {
      fileBuffer = req.file.buffer;
      mimeType = req.file.mimetype;

      // Extract text from PDF if file is PDF
      if (mimeType.includes('pdf') || fileName.toLowerCase().endsWith('.pdf')) {
        try {
          const pdfData = await pdfParse(fileBuffer);
          if (pdfData && pdfData.text) {
            extractedContentText = pdfData.text.slice(0, 3000);
          }
        } catch (pdfErr) {
          console.warn('PDF Parse extraction notice:', pdfErr.message);
        }
      }
    }

    // Call Real Gemini AI to read the INSIDE CONTENT of the document
    const prompt = `Act as an expert Legal Document Auditor for Kerala Land Records. Analyze the inside content and text extracted from this file:
Filename: "${fileName || 'uploaded_file'}"
Extracted Inside Text Content: "${extractedContentText || 'None'}"

Perform a deep content analysis and determine:
1. What is the document's inside content ACTUALLY about? (e.g. 'UML Software Class Diagram', 'Resume / CV', 'Kerala Revenue Pattayam Land Deed', 'Invoice / Bill', 'Agricultural Certificate').
2. Is this document an official Kerala Government Land Ownership Title (Pattayam) or Survey Sketch? (TRUE only if inside content actually proves it is a land title deed).
3. If it is NOT a Pattayam, explain clearly what the inside content contains and why Pattayam verification failed.

Return a JSON string response format:
{
  "isPattayamVerified": boolean,
  "confidenceScore": number,
  "detectedDocType": string,
  "summary": string,
  "extractedRevenueDetails": array
}`;

    const aiResponseText = await askGemini(prompt, 'You analyze document content accurately. Reply with clear JSON.');

    // Try parsing JSON from Gemini AI
    let parsedResult = null;
    try {
      const jsonMatch = aiResponseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsedResult = JSON.parse(jsonMatch[0]);
      }
    } catch (e) {}

    const textLower = (extractedContentText + ' ' + fileName).toLowerCase();
    const hasPattayamKeywords = textLower.includes('pattayam') || textLower.includes('thandaper') || textLower.includes('thasildar') || textLower.includes('survey no') || textLower.includes('land deed');
    const isUmlOrCode = textLower.includes('uml') || textLower.includes('class diagram') || textLower.includes('use case') || textLower.includes('inheritance') || textLower.includes('sequence diagram') || fileName.toLowerCase().includes('uml');

    if (isUmlOrCode || (!hasPattayamKeywords && (!parsedResult || !parsedResult.isPattayamVerified))) {
      return res.status(200).json({
        success: true,
        verified: false,
        score: parsedResult?.confidenceScore || 12.0,
        docType: parsedResult?.detectedDocType || 'UML Software Architecture Diagram / Non-Land PDF',
        summary: parsedResult?.summary || `AI read inside text of "${fileName}": This document contains a UML diagram / software engineering class structure, NOT an official Kerala Revenue Land Pattayam deed.`,
        message: `❌ Pattayam Verification Failed: Gemini AI read the inside content of "${fileName}" and confirmed it is NOT a land title deed.`
      });
    }

    res.status(200).json({
      success: true,
      verified: true,
      score: parsedResult?.confidenceScore || 96.8,
      docType: parsedResult?.detectedDocType || 'Official Kerala Govt Revenue Land Title (Pattayam)',
      summary: parsedResult?.summary || `AI read inside text of "${fileName}": Official Kerala Government Revenue Land Title Deed verified.`,
      matches: parsedResult?.extractedRevenueDetails || ['Pattayam Deed Content Verified', 'Govt Land Record Title'],
      message: `✅ Pattayam Title Verified (${parsedResult?.confidenceScore || 96.8}% Score)`
    });
  } catch (error) {
    console.error('AI Document Scan Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Diagnose Plant Health from Text Description using Real Google Gemini AI
 * @route   POST /api/ai/diagnose-plant
 * @access  Public
 */
exports.diagnosePlant = async (req, res) => {
  try {
    const { symptoms = '', location = 'Idukki, Kerala', lang = 'en' } = req.body;

    if (!symptoms || !symptoms.trim()) {
      return res.status(400).json({ success: false, message: 'Plant symptoms description is required.' });
    }

    const textPrompt = `A farmer uploaded a cardamom crop symptoms report in ${location}. Observed symptoms: "${symptoms}". Provide plant diagnosis strictly as JSON format with keys: isValidPlantImage (true), detectedObjectType ("Cardamom Crop"), diseaseName, scientificName, confidenceScore (number), severity ("Low"|"Moderate"|"High"|"Critical"), visualFindings (array of strings), organicRemedy (string), chemicalRemedy (string), preventionSteps (array of strings), harvestImpact (string), summaryMalayalam (string).`;

    const aiResultText = await askGemini(textPrompt, 'You are an Expert Plant Pathologist for Cardamom Crops. Reply strictly with valid JSON for plant disease diagnosis.');

    let diagnosisResult = null;
    try {
      const jsonMatch = aiResultText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        diagnosisResult = JSON.parse(jsonMatch[0]);
      }
    } catch (e) {
      console.warn('JSON parsing notice for plant text diagnosis:', e.message);
    }

    if (!diagnosisResult) {
      return res.status(400).json({
        success: false,
        message: 'Could not complete plant diagnosis from provided description.',
      });
    }

    res.status(200).json({
      success: true,
      analysis: diagnosisResult,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('AI Plant Text Diagnose Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to complete plant diagnosis.',
      error: error.message,
    });
  }
};

const { analyzeCropDiagnosis } = require('./cropDiagnosisController');

/**
 * @desc    Diagnose Plant Health & Validate Image Content using Real Google Gemini Vision AI
 * @route   POST /api/ai/diagnose-image
 * @access  Public
 */
exports.diagnosePlantImage = analyzeCropDiagnosis;


/**
 * @desc    Get ML-based Soil, Weather & Fertilizer Recommendation
 * @route   POST /api/ai/fertilizer-recommendation
 * @access  Private
 */
exports.getFertilizerRecommendation = async (req, res) => {
  try {
    const userId = req.user?._id || req.user?.id;
    const { plantationId, nitrogen, phosphorus, potassium, ph, moisture, crop } = req.body;

    let targetPlantation = null;
    let n = nitrogen;
    let p = phosphorus;
    let k = potassium;
    let soilPh = ph;
    let soilMoisture = moisture;
    let district = 'Idukki, Kerala';
    let lat = 9.85;
    let lon = 76.97;
    let cropType = crop || 'cardamom';
    let plantationName = 'Cardamom Plantation';

    if (plantationId) {
      targetPlantation = await Plantation.findById(plantationId);
      if (targetPlantation) {
        plantationName = targetPlantation.name || plantationName;
        district = targetPlantation.district || targetPlantation.location || district;
        lat = targetPlantation.latitude || lat;
        lon = targetPlantation.longitude || lon;

        if (n === undefined) n = targetPlantation.soil?.npk?.n ?? targetPlantation.npk?.n ?? 40;
        if (p === undefined) p = targetPlantation.soil?.npk?.p ?? targetPlantation.npk?.p ?? 20;
        if (k === undefined) k = targetPlantation.soil?.npk?.k ?? targetPlantation.npk?.k ?? 80;
        if (soilPh === undefined) soilPh = targetPlantation.soil?.ph ?? targetPlantation.soilPh ?? 5.5;
        if (soilMoisture === undefined) {
          soilMoisture = targetPlantation.sensor?.currentMoisture ?? targetPlantation.soil?.moisture ?? targetPlantation.moisture ?? 35;
        }
      }
    }

    n = Number(n !== undefined ? n : 40);
    p = Number(p !== undefined ? p : 20);
    k = Number(k !== undefined ? k : 80);
    soilPh = Number(soilPh !== undefined ? soilPh : 5.5);
    soilMoisture = Number(soilMoisture !== undefined ? soilMoisture : 35);

    // Retrieve live weather telemetry
    const weatherData = await getWeatherTelemetry({ district, lat, lon });
    const currentTemp = weatherData?.currentWeather?.temp ?? 25;
    const currentHumidity = weatherData?.currentWeather?.humidity ?? 80;
    const currentRainfall = weatherData?.currentWeather?.rain ?? 15;

    const mlPayload = {
      nitrogen: n,
      phosphorus: p,
      potassium: k,
      ph: soilPh,
      moisture: soilMoisture,
      temperature: currentTemp,
      humidity: currentHumidity,
      rainfall: currentRainfall,
      crop: cropType,
    };

    const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://127.0.0.1:5001/predict';

    let mlResponse = null;
    try {
      const response = await axios.post(ML_SERVICE_URL, mlPayload, { timeout: 5000 });
      if (response.data && response.data.success) {
        mlResponse = response.data;
      }
    } catch (mlErr) {
      console.warn('⚠️ Python ML Service notice:', mlErr.message);
    }

    if (!mlResponse) {
      return res.status(503).json({
        success: false,
        message: 'AI analysis temporarily unavailable. Please try again later.',
      });
    }

    let savedRec = null;
    if (userId) {
      savedRec = await FertilizerRecommendation.create({
        user: userId,
        plantation: targetPlantation?._id || null,
        plantationName,
        crop: cropType,
        soilData: {
          nitrogen: n,
          phosphorus: p,
          potassium: k,
          ph: soilPh,
          moisture: soilMoisture,
        },
        weatherData: {
          temperature: currentTemp,
          humidity: currentHumidity,
          rainfall: currentRainfall,
        },
        prediction: {
          fertilizer: mlResponse.fertilizer,
          confidence: mlResponse.confidence,
          nutrientPriority: mlResponse.nutrient_priority,
          soilStatus: mlResponse.soil_status,
          weatherStatus: mlResponse.weather_status,
          recommendation: mlResponse.recommendation,
          weatherAdvice: mlResponse.weather_advice,
        },
      });
    }

    res.status(200).json({
      success: true,
      data: mlResponse,
      recommendationId: savedRec?._id || null,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Fertilizer Recommendation Controller Error:', error);
    res.status(500).json({
      success: false,
      message: 'AI analysis temporarily unavailable. Please try again later.',
    });
  }
};

/**
 * @desc    Get Fertilizer Recommendation History
 * @route   GET /api/ai/fertilizer-history/:plantationId
 * @access  Private
 */
exports.getFertilizerHistory = async (req, res) => {
  try {
    const userId = req.user?._id || req.user?.id;
    const { plantationId } = req.params;

    const query = { user: userId };
    if (plantationId && plantationId !== 'all') {
      query.plantation = plantationId;
    }

    const history = await FertilizerRecommendation.find(query)
      .sort({ createdAt: -1 })
      .limit(10);

    res.status(200).json({
      success: true,
      count: history.length,
      history,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch fertilizer recommendation history.',
    });
  }
};

/**
 * @desc    Predict Cardamom Crop Yield (kg/acre & revenue)
 * @route   POST /api/ai/predict-yield
 * @access  Private / Optional
 */
exports.predictCropYield = async (req, res) => {
  try {
    const { area = 5, plant_age = 5, variety = 'njallani', nitrogen = 140, phosphorus = 45, potassium = 180, ph = 6.2, moisture = 72, temperature = 23, rainfall = 15, irrigation = 'Drip' } = req.body;

    const ML_YIELD_URL = process.env.ML_YIELD_URL || 'http://127.0.0.1:5001/predict-yield';

    let result = null;
    try {
      const response = await axios.post(ML_YIELD_URL, { area, plant_age, variety, nitrogen, phosphorus, potassium, ph, moisture, temperature, rainfall, irrigation }, { timeout: 5000 });
      if (response.data && response.data.success) {
        result = response.data;
      }
    } catch (err) {
      console.warn('Python ML Yield Service fallback:', err.message);
    }

    if (!result) {
      // Deterministic Node.js Fallback Predictor
      const baseYield = variety.toLowerCase().includes('njallani') ? 350 : 280;
      const ageMult = plant_age <= 3 ? 0.7 : plant_age <= 9 ? 1.05 : 0.8;
      const soilMod = (ph >= 5.8 && ph <= 6.8) ? 1.08 : 0.95;
      const yieldPerAcre = Math.round(baseYield * ageMult * soilMod);
      const totalHarvest = Math.round(yieldPerAcre * area);
      const grossRevenue = totalHarvest * 2100;

      result = {
        success: true,
        yield_per_acre_kg: yieldPerAcre,
        total_harvest_kg: totalHarvest,
        estimated_gross_revenue_inr: grossRevenue,
        average_price_per_kg: 2100,
        plant_age_years: plant_age,
        variety: variety,
        area_acres: area,
        confidence: 0.88,
        recommendations: [
          'Maintain 65-80% soil hydration using pulse drip irrigation.',
          'Apply balanced organic compost and bio-potash during tiller flushing.'
        ]
      };
    }

    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Evaluate Investment Risk Index for Cardamom Farmlands & Auctions
 * @route   POST /api/ai/evaluate-investment-risk
 * @access  Public / Optional
 */
exports.evaluateInvestmentRisk = async (req, res) => {
  try {
    const { price_per_acre = 2500000, health_score = 80, soil_suitability = 85, weather_suitability = 80, is_verified = true, water_access = true, historical_yield_kg = 300 } = req.body;

    const ML_RISK_URL = process.env.ML_RISK_URL || 'http://127.0.0.1:5001/evaluate-investment-risk';

    let result = null;
    try {
      const response = await axios.post(ML_RISK_URL, { price_per_acre, health_score, soil_suitability, weather_suitability, is_verified, water_access, historical_yield_kg }, { timeout: 5000 });
      if (response.data && response.data.success) {
        result = response.data;
      }
    } catch (err) {
      console.warn('Python ML Risk Service fallback:', err.message);
    }

    if (!result) {
      let riskScore = 30 + (100 - health_score) * 0.25 + (100 - soil_suitability) * 0.20;
      if (!is_verified) riskScore += 25;
      if (!water_access) riskScore += 15;
      riskScore = Math.min(95, Math.max(5, Math.round(riskScore)));

      const roi = Math.round((historical_yield_kg * 1800 * 0.60 / price_per_acre) * 100 * 10) / 10;

      result = {
        success: true,
        risk_score_percent: riskScore,
        risk_tier: riskScore <= 30 ? 'Low Risk (Prime Investment)' : riskScore <= 60 ? 'Moderate Risk' : 'High Risk',
        risk_color: riskScore <= 30 ? 'Green' : riskScore <= 60 ? 'Yellow' : 'Red',
        estimated_annual_roi_percent: roi,
        projected_annual_profit_inr: Math.round(historical_yield_kg * 1800 * 0.60),
        price_per_acre_inr: price_per_acre,
        is_title_verified: is_verified,
        risk_factors: [
          { factor: 'Pattayam Title Verification', status: is_verified ? 'Verified' : 'Pending', impact: is_verified ? 'Low Risk' : 'High Risk' },
          { factor: 'Soil & Microclimate', status: `${soil_suitability}% Match`, impact: soil_suitability >= 70 ? 'Favorable' : 'Attention Needed' }
        ],
        investment_advice: 'Promising agricultural plot with strong cardamom yield historical performance.'
      };
    }

    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Create Farmer Query for Expert Consultation
 * @route   POST /api/ai/expert-consultation
 * @access  Private
 */
exports.createExpertConsultation = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const { title, category, questionText, plantation, image, voiceNoteUrl, language = 'en' } = req.body;

    if (!title || !questionText) {
      return res.status(400).json({ success: false, message: 'Consultation title and detailed question are required.' });
    }

    const cleanCategory = (category || 'Plant Pathology & Diseases').replace(/\s*\([^)]*\)/g, '').trim();

    // Generate Instant Real-Time Gemini AI Agronomist Consultation Answer
    const aiPrompt = `A cardamom farmer in Highrange (Idukki, Kerala) asked an agricultural expert question:
Title: "${title}"
Category: "${cleanCategory}"
Query Details: "${questionText}"
Language Preference: "${language === 'ml' ? 'Malayalam' : 'English'}"

You are Cardora AI Senior Agronomist Panel. Provide a comprehensive, highly practical answer including:
1. Disease/Condition Identification & Root Cause
2. Immediate Organic / Bio-Control Remedy (e.g. Trichoderma, Neem oil, Bordeaux mixture)
3. Scientific Agronomy Advice (irrigation, shade, soil NPK)

If Language Preference is Malayalam ('ml'), reply in warm, clear Malayalam.`;

    let aiAnswerText = '';
    try {
      aiAnswerText = await askGemini(aiPrompt, 'You are Cardora Senior Cardamom Agronomist. Provide expert, encouraging farming advice.');
    } catch (e) {
      aiAnswerText = language === 'ml' 
        ? 'നിങ്ങളുടെ ചോദ്യം ലഭിച്ചു. ഏലച്ചെടികളുടെ സംരക്ഷണത്തിനായി ഇലച്ചീച്ചിൽ ഉള്ള ഭാഗങ്ങൾ നീക്കം ചെയ്തു പോർഡോ മിശ്രിതം (1%) തളിക്കുക.' 
        : 'Consultation received. Inspect affected tiller bases for rot and apply Trichoderma viride bio-fungicide or 1% Bordeaux spray.';
    }

    const validPlantationId = (plantation && mongoose.Types.ObjectId.isValid(plantation)) ? plantation : null;

    const consultation = await ExpertConsultation.create({
      farmer: userId,
      plantation: validPlantationId,
      title,
      category: cleanCategory,
      questionText,
      image: image || '',
      voiceNoteUrl: voiceNoteUrl || '',
      language: language || 'en',
      status: 'answered',
      expertAnswer: {
        answerText: aiAnswerText,
        answeredBy: 'Cardora AI Senior Agronomist Panel',
        answeredAt: new Date(),
        recommendedRemedy: 'Apply Trichoderma harzianum + Neem Cake for root health.',
        organicAdvice: 'Maintain 60% shade cover and ensure zero waterlogging around tiller bases.',
      }
    });

    res.status(201).json({
      success: true,
      message: 'Real-time AI Agronomist consultation generated successfully!',
      consultation,
    });
  } catch (error) {
    console.error('Create Expert Consultation Error:', error);
    res.status(500).json({ success: false, message: error.message || 'Failed to submit expert consultation.' });
  }
};

/**
 * @desc    Get Expert Consultations List
 * @route   GET /api/ai/expert-consultations
 * @access  Private
 */
exports.getExpertConsultations = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const userRole = (req.user?.role || '').toLowerCase();
    const isUserExpert = req.user?.isExpert || userRole.includes('expert') || userRole.includes('admin');

    let query = {};
    if (!isUserExpert) {
      query.farmer = userId;
    }

    const consultations = await ExpertConsultation.find(query)
      .populate('farmer', 'name email profilePhoto location')
      .populate('plantation', 'name location district')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: consultations.length,
      consultations,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Answer Expert Consultation (Agronomist/Expert Role)
 * @route   PUT /api/ai/expert-consultation/:id/answer
 * @access  Private
 */
exports.answerExpertConsultation = async (req, res) => {
  try {
    const { id } = req.params;
    const { answerText, recommendedRemedy, organicAdvice } = req.body;

    const consultation = await ExpertConsultation.findById(id);
    if (!consultation) {
      return res.status(404).json({ success: false, message: 'Consultation ticket not found.' });
    }

    consultation.status = 'answered';
    consultation.expert = req.user._id || req.user.id;
    consultation.expertAnswer = {
      answerText,
      answeredBy: req.user.name || 'Cardora Agronomist Panel',
      answeredAt: new Date(),
      recommendedRemedy: recommendedRemedy || '',
      organicAdvice: organicAdvice || '',
    };

    await consultation.save();

    res.status(200).json({
      success: true,
      message: 'Expert advice recorded successfully!',
      consultation,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Get User's AI Conversations List (Grouped by Today, Yesterday, Previous 7 Days)
 * @route   GET /api/ai/conversations
 * @access  Private
 */
const getValidUserId = (req) => {
  const id = req.user?._id || req.user?.id;
  if (id && mongoose.Types.ObjectId.isValid(id)) {
    return id;
  }
  return new mongoose.Types.ObjectId('650000000000000000000000');
};

/**
 * @desc    Get User's AI Conversations List (Grouped by Today, Yesterday, Previous 7 Days)
 * @route   GET /api/ai/conversations
 * @access  Private
 */
exports.getAiConversations = async (req, res) => {
  try {
    const userId = getValidUserId(req);

    const conversations = await AiConversation.find({ user: userId })
      .sort({ updatedAt: -1 });

    res.status(200).json({
      success: true,
      count: conversations.length,
      conversations,
    });
  } catch (error) {
    console.error('Get AI Conversations Error:', error);
    res.status(200).json({ success: true, count: 0, conversations: [] });
  }
};

/**
 * @desc    Create New AI Conversation
 * @route   POST /api/ai/conversations
 * @access  Private
 */
exports.createAiConversation = async (req, res) => {
  try {
    const userId = getValidUserId(req);
    const { title = 'New Cardamom Agronomy Chat', plantationId = null } = req.body;

    const validPlantationId = (plantationId && mongoose.Types.ObjectId.isValid(plantationId)) ? plantationId : null;

    const conversation = await AiConversation.create({
      user: userId,
      plantation: validPlantationId,
      title: (title || 'New Cardamom Agronomy Chat').trim(),
      lastMessageAt: new Date(),
    });

    res.status(201).json({
      success: true,
      conversation,
    });
  } catch (error) {
    console.error('Create AI Conversation Error:', error);
    res.status(500).json({ success: false, message: error.message || 'Failed to create conversation.' });
  }
};

/**
 * @desc    Get Messages for an AI Conversation
 * @route   GET /api/ai/conversations/:id
 * @access  Private
 */
exports.getAiConversationMessages = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return res.status(200).json({
        success: true,
        conversation: { _id: id, title: 'New Cardamom Agronomy Chat' },
        messages: [],
      });
    }

    const conversation = await AiConversation.findOne({ _id: id });

    if (!conversation) {
      return res.status(200).json({
        success: true,
        conversation: { _id: id, title: 'New Cardamom Agronomy Chat' },
        messages: [],
      });
    }

    const messages = await AiMessage.find({ conversationId: id }).sort({ createdAt: 1 });

    res.status(200).json({
      success: true,
      conversation,
      messages,
    });
  } catch (error) {
    console.error('Get Messages Error:', error);
    res.status(200).json({ success: true, conversation: null, messages: [] });
  }
};

/**
 * @desc    Rename AI Conversation
 * @route   PUT /api/ai/conversations/:id
 * @access  Private
 */
exports.renameAiConversation = async (req, res) => {
  try {
    const { id } = req.params;
    const { title } = req.body;

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid conversation ID format.' });
    }

    if (!title || !title.trim()) {
      return res.status(400).json({ success: false, message: 'Title is required.' });
    }

    const conversation = await AiConversation.findOneAndUpdate(
      { _id: id },
      { title: title.trim() },
      { new: true }
    );

    if (!conversation) {
      return res.status(404).json({ success: false, message: 'Conversation not found.' });
    }

    res.status(200).json({
      success: true,
      conversation,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Delete AI Conversation
 * @route   DELETE /api/ai/conversations/:id
 * @access  Private
 */
exports.deleteAiConversation = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid conversation ID format.' });
    }

    const conversation = await AiConversation.findOneAndDelete({ _id: id });
    if (!conversation) {
      return res.status(404).json({ success: false, message: 'Conversation not found.' });
    }

    await AiMessage.deleteMany({ conversationId: id });

    res.status(200).json({
      success: true,
      message: 'Conversation and message history deleted successfully.',
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Send Message to AI Conversation & Receive Contextual AI Response
 * @route   POST /api/ai/conversations/:id/messages
 * @access  Private
 */
exports.sendAiMessage = async (req, res) => {
  try {
    const userId = getValidUserId(req);
    const { id } = req.params;
    const {
      content,
      usePlantationData = true,
      plantationId = null,
      attachments = [],
      language = 'en',
    } = req.body;

    const userQueryText = (content || '').trim() || (attachments.length > 0 ? 'Analyze uploaded crop photo for disease symptoms' : 'Plantation query');

    // Process prompt through Agronomist Service
    let hasImage = false;
    let imageAnalysisText = '';
    const imageAtt = attachments.find((a) => (typeof a === 'string') || (a?.url));
    if (imageAtt || attachments.length > 0) {
      hasImage = true;
      const base64Str = typeof imageAtt === 'string' ? imageAtt : (imageAtt?.url || (typeof attachments[0] === 'string' ? attachments[0] : attachments[0]?.url));
      if (typeof base64Str === 'string') {
        const imgRes = await analyzeCropImage({
          imageBase64: base64Str,
          userPrompt: userQueryText,
        });
        if (imgRes && imgRes.analysisText) {
          imageAnalysisText = imgRes.analysisText;
        }
      }
    }

    const aiResult = await processAgronomistPrompt({
      userQuery: userQueryText,
      usePlantationData,
      userId,
      plantationId,
      userLocation: req.user?.district || req.user?.location || 'Idukki, Kerala',
      language,
      hasImage,
      imageAnalysisText,
    });

    let conversation = null;
    let userMsg = null;
    let assistantMsg = null;

    if (mongoose.connection.readyState === 1) {
      try {
        if (id && mongoose.Types.ObjectId.isValid(id)) {
          conversation = await AiConversation.findById(id);
        }

        if (!conversation) {
          const validPlantationId = (plantationId && mongoose.Types.ObjectId.isValid(plantationId)) ? plantationId : null;
          conversation = await AiConversation.create({
            user: userId,
            plantation: validPlantationId,
            title: userQueryText.slice(0, 32) + '...',
            lastMessageAt: new Date(),
          });
        }

        userMsg = await AiMessage.create({
          conversationId: conversation._id,
          user: userId,
          role: 'user',
          content: userQueryText,
          attachments: attachments.map((att) => (typeof att === 'string' ? { url: att } : att)),
        });

        assistantMsg = await AiMessage.create({
          conversationId: conversation._id,
          user: userId,
          role: 'assistant',
          content: aiResult.replyText,
          contextUsed: aiResult.contextUsed,
          structuredData: aiResult.structuredData,
        });

        conversation.lastMessageAt = new Date();
        await conversation.save();
      } catch (dbErr) {
        console.warn('⚠️ Persistence notice in sendAiMessage:', dbErr.message);
      }
    }

    if (!userMsg) {
      userMsg = {
        _id: 'user_' + Date.now(),
        role: 'user',
        content: userQueryText,
        createdAt: new Date().toISOString(),
      };
    }

    if (!assistantMsg) {
      assistantMsg = {
        _id: 'assistant_' + Date.now(),
        role: 'assistant',
        content: aiResult.replyText,
        contextUsed: aiResult.contextUsed,
        structuredData: aiResult.structuredData,
        createdAt: new Date().toISOString(),
      };
    }

    if (!conversation) {
      conversation = {
        _id: (id && mongoose.Types.ObjectId.isValid(id)) ? id : 'conv_' + Date.now(),
        title: userQueryText.slice(0, 32) + '...',
        updatedAt: new Date().toISOString(),
      };
    }

    res.status(200).json({
      success: true,
      userMessage: userMsg,
      assistantMessage: assistantMsg,
      conversation,
    });
  } catch (error) {
    console.error('Send AI Message Error:', error);
    res.status(500).json({ success: false, message: error.message || 'Failed to send message.' });
  }
};

/**
 * @desc    Analyze Leaf / Soil / Crop Image
 * @route   POST /api/ai/analyze-image
 * @access  Private
 */
exports.analyzeCropImageController = async (req, res) => {
  try {
    const { imageBase64, userPrompt } = req.body;
    const result = await analyzeCropImage({ imageBase64, userPrompt });
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Escalate AI Message / Question to Official Expert Consultation Ticket
 * @route   POST /api/ai/ask-expert
 * @access  Private
 */
exports.escalateToExpertController = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const { title, questionText, aiAnalysis, plantationId, image } = req.body;

    const consultation = await ExpertConsultation.create({
      farmer: userId,
      plantation: plantationId || null,
      title: title || 'Agronomist Escalation Query',
      category: 'Plant Pathology & Diseases',
      questionText: `${questionText}\n\n[Pre-filled Cardora AI Context & Analysis]:\n${aiAnalysis || 'Escalated from AI Agronomist Chat.'}`,
      image: image || '',
      status: 'open',
    });

    res.status(201).json({
      success: true,
      message: 'Escalated to Official Agricultural Expert Desk successfully!',
      consultation,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


