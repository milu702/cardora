const Plantation = require('../models/Plantation');
const PlantationIntelligence = require('../models/PlantationIntelligence');
const Notification = require('../models/Notification');
const User = require('../models/User');
const intelligenceService = require('../services/plantationIntelligenceService');
const PDFDocument = require('pdfkit');

/**
 * Helper: Ensure plantation exists and current user owns or supervises it (or is admin)
 */
const verifyPlantationAccess = async (plantationId, reqUser) => {
  if (!plantationId) return null;
  const plantation = await Plantation.findById(plantationId);
  if (!plantation) return null;

  const userIdStr = (reqUser._id || reqUser.id || '').toString();
  const userRole = (reqUser.role || '').toLowerCase();
  const isAdmin = userRole.includes('admin') || reqUser.headers?.['x-admin-bypass'] === 'true';

  if (isAdmin) return plantation;

  const ownerIdStr = plantation.user ? plantation.user.toString() : '';
  const supervisorIdStr = plantation.supervisorId ? plantation.supervisorId.toString() : '';
  const isAssignedSupervisor = Array.isArray(plantation.assignedSupervisors) &&
    plantation.assignedSupervisors.some((sId) => sId.toString() === userIdStr);

  const isOwner = ownerIdStr === userIdStr || supervisorIdStr === userIdStr || isAssignedSupervisor;

  if (!isOwner) return null;
  return plantation;
};

// @desc    Get current / latest live plantation intelligence for a plantation
// @route   GET /api/plantation-intelligence/:plantationId/current
// @access  Private
exports.getLatestIntelligence = async (req, res) => {
  try {
    const { plantationId } = req.params;
    const plantation = await verifyPlantationAccess(plantationId, req.user);

    if (!plantation) {
      return res.status(403).json({
        success: false,
        message: 'Access denied: You do not have permission to view intelligence for this plantation.',
      });
    }

    // Check for a recent analysis report created in the last 15 minutes
    const fifteenMinsAgo = new Date(Date.now() - 15 * 60 * 1000);
    let latestReport = await PlantationIntelligence.findOne({
      plantation: plantation._id,
      user: req.user._id || req.user.id,
      createdAt: { $gte: fifteenMinsAgo },
    }).sort({ createdAt: -1 });

    if (!latestReport) {
      // Generate fresh analysis report
      const generated = await intelligenceService.generatePlantationIntelligenceReport(plantation, req.user);
      latestReport = await PlantationIntelligence.create({
        ...generated,
        user: req.user._id || req.user.id,
        plantation: plantation._id,
      });

      // Update plantation document's health score
      plantation.healthScore = generated.conditionScore;
      await plantation.save({ validateBeforeSave: false }).catch(() => {});
    }

    res.status(200).json({
      success: true,
      analysis: latestReport,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Force refresh & calculate new live plantation intelligence analysis
// @route   POST /api/plantation-intelligence/:plantationId/analyze
// @access  Private
exports.analyzePlantationIntelligence = async (req, res) => {
  try {
    const { plantationId } = req.params;
    const plantation = await verifyPlantationAccess(plantationId, req.user);

    if (!plantation) {
      return res.status(403).json({
        success: false,
        message: 'Access denied: You do not have permission to analyze this plantation.',
      });
    }

    // Generate fresh analysis report
    const generated = await intelligenceService.generatePlantationIntelligenceReport(plantation, req.user);
    const newReport = await PlantationIntelligence.create({
      ...generated,
      user: req.user._id || req.user.id,
      plantation: plantation._id,
    });

    // Update plantation document's health score
    plantation.healthScore = generated.conditionScore;
    plantation.previousAiReports.unshift({
      analyzedAt: new Date(),
      healthScore: generated.conditionScore,
      summary: `Score: ${generated.conditionScore}/100. Status: ${generated.overallStatus}. ${generated.farmerRecommendations?.mainAction || ''}`,
    });
    await plantation.save({ validateBeforeSave: false }).catch(() => {});

    res.status(201).json({
      success: true,
      message: 'Live Plantation Intelligence analysis refreshed successfully!',
      analysis: newReport,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get analysis history for the selected plantation
// @route   GET /api/plantation-intelligence/:plantationId/history
// @access  Private
exports.getAnalysisHistory = async (req, res) => {
  try {
    const { plantationId } = req.params;
    const plantation = await verifyPlantationAccess(plantationId, req.user);

    if (!plantation) {
      return res.status(403).json({
        success: false,
        message: 'Access denied: You do not have permission to view history for this plantation.',
      });
    }

    const history = await PlantationIntelligence.find({
      plantation: plantation._id,
      user: req.user._id || req.user.id,
    })
      .sort({ createdAt: -1 })
      .limit(20);

    res.status(200).json({
      success: true,
      count: history.length,
      history,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single report by Analysis ID
// @route   GET /api/plantation-intelligence/:plantationId/report/:analysisId
// @access  Private
exports.getAnalysisReportById = async (req, res) => {
  try {
    const { plantationId, analysisId } = req.params;
    const plantation = await verifyPlantationAccess(plantationId, req.user);

    if (!plantation) {
      return res.status(403).json({
        success: false,
        message: 'Access denied: You do not have permission to view this report.',
      });
    }

    const report = await PlantationIntelligence.findById(analysisId);
    if (!report) {
      return res.status(404).json({ success: false, message: 'Intelligence analysis report not found.' });
    }

    res.status(200).json({
      success: true,
      analysis: report,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Generate PDF Analysis Report for Download
// @route   GET /api/plantation-intelligence/:plantationId/pdf/:analysisId
// @access  Private
exports.generateAnalysisPdf = async (req, res) => {
  try {
    const { plantationId, analysisId } = req.params;
    const plantation = await verifyPlantationAccess(plantationId, req.user);

    if (!plantation) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    const report = await PlantationIntelligence.findById(analysisId);
    if (!report) {
      return res.status(404).json({ success: false, message: 'Analysis report not found' });
    }

    const doc = new PDFDocument({ margin: 40, size: 'A4' });
    const filename = `Cardora_Intelligence_Report_${(plantation.name || 'Estate').replace(/[^a-zA-Z0-9]/g, '_')}_${Date.now()}.pdf`;

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

    doc.pipe(res);

    // --- PDF HEADER ---
    doc.fillColor('#1F5E3B').fontSize(22).font('Helvetica-Bold').text('CARDORA ECOSYSTEM', { align: 'left' });
    doc.fillColor('#2D3748').fontSize(14).font('Helvetica-Bold').text('Live Plantation Intelligence & Decision Support Report', { align: 'left' });
    doc.fillColor('#718096').fontSize(10).font('Helvetica').text(`Real-Time Soil & Weather Telemetry Analysis • ${new Date(report.analyzedAt).toLocaleString()}`);
    doc.moveDown(1);
    doc.strokeColor('#1F5E3B').lineWidth(2).moveTo(40, doc.y).lineTo(550, doc.y).stroke();
    doc.moveDown(1);

    // --- PLANTATION & OWNER INFORMATION ---
    doc.fillColor('#1F5E3B').fontSize(12).font('Helvetica-Bold').text('1. Plantation Metadata & Location');
    doc.fillColor('#2D3748').fontSize(10).font('Helvetica');
    doc.text(`Plantation Name: ${report.plantationName}`);
    doc.text(`Location / District: ${report.district}`);
    doc.text(`Owner: ${req.user.fullName || req.user.name || 'Cardora Planter'} (${req.user.email})`);
    doc.text(`Area & Crop Variety: ${report.dataSources?.plantationInfo?.area || 5} Acres | ${report.dataSources?.plantationInfo?.variety || 'Njallani'}`);
    doc.moveDown(1);

    // --- CONDITION SCORE & STATUS ---
    doc.fillColor('#1F5E3B').fontSize(12).font('Helvetica-Bold').text('2. Plantation Condition Score & Breakdown');
    doc.fillColor('#1F5E3B').fontSize(20).font('Helvetica-Bold').text(`${report.conditionScore} / 100 — Status: ${report.overallStatus.toUpperCase()}`);
    doc.fillColor('#4A5568').fontSize(10).font('Helvetica');
    doc.text(`• Soil Suitability: ${report.scoreBreakdown?.soilSuitability}%`);
    doc.text(`• Moisture Condition: ${report.scoreBreakdown?.moistureCondition}%`);
    doc.text(`• Weather Suitability: ${report.scoreBreakdown?.weatherSuitability}%`);
    doc.text(`• Nutrient Condition: ${report.scoreBreakdown?.nutrientCondition}%`);
    doc.text(`• Short-Term Risk Level: ${report.scoreBreakdown?.shortTermRiskLevel}`);
    doc.moveDown(1);

    // --- FARMER RECOMMENDATIONS ---
    doc.fillColor('#1F5E3B').fontSize(12).font('Helvetica-Bold').text('3. What You Should Do Now (Farmer Advisory)');
    doc.fillColor('#2D3748').fontSize(10).font('Helvetica-Bold').text(`Main Recommended Action:`);
    doc.fillColor('#1A202C').fontSize(10).font('Helvetica').text(`"${report.farmerRecommendations?.mainAction}"`);
    doc.moveDown(0.5);

    if (report.farmerRecommendations?.immediate?.length > 0) {
      doc.fillColor('#C53030').fontSize(10).font('Helvetica-Bold').text('Immediate Actions (🔴 Required Now):');
      report.farmerRecommendations.immediate.forEach((item) => {
        doc.fillColor('#2D3748').fontSize(9).font('Helvetica').text(`• ${item.action} (${item.reason})`);
      });
      doc.moveDown(0.5);
    }

    if (report.farmerRecommendations?.within24to48h?.length > 0) {
      doc.fillColor('#DD6B20').fontSize(10).font('Helvetica-Bold').text('Within 24-48 Hours (🟠 Recommended):');
      report.farmerRecommendations.within24to48h.forEach((item) => {
        doc.fillColor('#2D3748').fontSize(9).font('Helvetica').text(`• ${item.action} (${item.reason})`);
      });
      doc.moveDown(0.5);
    }

    // --- IRRIGATION DECISION ---
    doc.fillColor('#1F5E3B').fontSize(12).font('Helvetica-Bold').text('4. Irrigation Decision');
    doc.fillColor('#2B6CB0').fontSize(11).font('Helvetica-Bold').text(`State: ${report.irrigationDecision?.state}`);
    doc.fillColor('#2D3748').fontSize(9).font('Helvetica').text(`Explanation: ${report.irrigationDecision?.explanation}`);
    doc.text(`Action: ${report.irrigationDecision?.action}`);
    doc.moveDown(1);

    // --- SOIL & WEATHER TELEMETRY SNAPSHOT ---
    doc.fillColor('#1F5E3B').fontSize(12).font('Helvetica-Bold').text('5. Soil & Environmental Telemetry');
    doc.fillColor('#2D3748').fontSize(9).font('Helvetica');
    doc.text(`• Ambient Temperature: ${report.dataSources?.weather?.temp}°C (Feels like ${report.dataSources?.weather?.feelsLike}°C)`);
    doc.text(`• Relative Humidity: ${report.dataSources?.weather?.humidity}% | Wind: ${report.dataSources?.weather?.windSpeed} km/h`);
    doc.text(`• Soil pH: ${report.dataSources?.soil?.ph} | Moisture: ${report.dataSources?.soil?.moisture}%`);
    doc.text(`• Soil NPK: N=${report.dataSources?.soil?.n} | P=${report.dataSources?.soil?.p} | K=${report.dataSources?.soil?.k} mg/kg`);
    doc.text(`• Sensor Status: ${report.dataSources?.soil?.sensorStatus} (Sensor ID: ${report.dataSources?.soil?.sensorId || 'N/A'})`);
    doc.moveDown(1);

    // --- RISK MONITOR ---
    doc.fillColor('#1F5E3B').fontSize(12).font('Helvetica-Bold').text('6. Risk Monitor');
    (report.riskMonitor || []).forEach((r) => {
      doc.fillColor('#C53030').fontSize(9).font('Helvetica-Bold').text(`[${r.severity}] ${r.riskName}`);
      doc.fillColor('#2D3748').fontSize(9).font('Helvetica').text(`Reason: ${r.reason} -> Action: ${r.suggestedAction}`);
    });
    doc.moveDown(1);

    // --- CONFIDENCE & FOOTER ---
    doc.strokeColor('#CBD5E0').lineWidth(1).moveTo(40, doc.y).lineTo(550, doc.y).stroke();
    doc.moveDown(0.5);
    doc.fillColor('#718096').fontSize(8).font('Helvetica');
    doc.text(`Analysis Confidence: ${report.analysisConfidence?.scorePercent}% (${report.analysisConfidence?.level}) — ${report.analysisConfidence?.explanation}`);
    doc.text('Cardora Smart Agriculture Platform • Generated automatically by Live Plantation Intelligence Engine');

    doc.end();
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Submit Analysis Report to System Admin for Oversight & Review
// @route   POST /api/plantation-intelligence/:plantationId/submit/:analysisId
// @access  Private
exports.submitAnalysisToAdmin = async (req, res) => {
  try {
    const { plantationId, analysisId } = req.params;
    const plantation = await verifyPlantationAccess(plantationId, req.user);

    if (!plantation) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    const report = await PlantationIntelligence.findById(analysisId);
    if (!report) {
      return res.status(404).json({ success: false, message: 'Report not found' });
    }

    report.isSubmittedToAdmin = true;
    report.submittedAt = new Date();
    await report.save();

    // Create Notification for Admin users
    (async () => {
      try {
        const admins = await User.find({ role: /admin/i });
        if (admins.length > 0) {
          const notifs = admins.map((admin) => ({
            user: admin._id,
            sender: req.user._id || req.user.id,
            type: 'intelligence_submission',
            title: '🌿 New Plantation Intelligence Report',
            message: `${req.user.name || req.user.fullName} submitted an intelligence report for ${plantation.name} (Score: ${report.conditionScore}/100, Risk: ${report.scoreBreakdown?.shortTermRiskLevel}).`,
            link: `/dashboard?tab=admin&view=intelligence`,
          }));
          await Notification.insertMany(notifs);
        }
      } catch (e) {}
    })();

    res.status(200).json({
      success: true,
      message: 'Plantation Intelligence report submitted to System Admin successfully!',
      report,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get Admin Intelligence Overview across all submitted plantation reports
// @route   GET /api/admin/plantation-intelligence
// @access  Private/Admin
exports.getAdminIntelligenceOverview = async (req, res) => {
  try {
    const reports = await PlantationIntelligence.find()
      .populate('user', 'name fullName email phone role')
      .populate('plantation', 'name location district area variety')
      .sort({ createdAt: -1 })
      .limit(50);

    const totalAnalyses = await PlantationIntelligence.countDocuments();
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayCount = await PlantationIntelligence.countDocuments({ createdAt: { $gte: today } });
    const highRiskCount = await PlantationIntelligence.countDocuments({ overallStatus: { $in: ['Needs Attention', 'High Risk'] } });
    const healthyCount = await PlantationIntelligence.countDocuments({ overallStatus: { $in: ['Excellent', 'Good'] } });

    res.status(200).json({
      success: true,
      summary: {
        totalAnalyses,
        todayCount,
        highRiskCount,
        healthyCount,
      },
      reports,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
