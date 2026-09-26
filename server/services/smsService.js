/**
 * Modular SMS Notification Service for Cardora Supervisor-Worker Module
 */

const axios = require('axios');
const SMSLog = require('../models/SMSLog');

// Default SMS Settings
let smsSettings = {
  attendanceSMS: true,
  wageSMS: true,
  paymentSMS: true,
  workAssignmentSMS: true,
};

/**
 * Get current SMS Settings
 */
const getSmsSettings = () => smsSettings;

/**
 * Update SMS Settings
 */
const updateSmsSettings = (newSettings) => {
  smsSettings = { ...smsSettings, ...newSettings };
  return smsSettings;
};

/**
 * Send SMS Notification
 * @param {Object} payload { workerId, workerObj, phone, type, data, supervisorId }
 */
const sendSmsNotification = async ({ workerId, workerObj, phone, type, data = {}, supervisorId = null }) => {
  try {
    const targetPhone = phone || workerObj?.phone;
    if (!targetPhone) {
      console.warn(`[SMS Service] Warning: No mobile number provided for Worker ID ${workerId}`);
      return { success: false, message: 'Worker mobile number missing' };
    }

    const workerName = workerObj?.fullName || data.workerName || 'Worker';
    let message = data.message || '';
    let isTypeEnabled = true;

    if (!message) {
      switch (type) {
        case 'Attendance':
          isTypeEnabled = smsSettings.attendanceSMS;
          message = `Hello ${workerName}, your attendance for ${data.date || 'Today'} has been marked as ${data.status || 'Present'}. Daily wage: ₹${data.dailyWage || 700}. – Cardora`;
          break;

        case 'Wage':
          isTypeEnabled = smsSettings.wageSMS;
          message = `Hello ${workerName}, your wage for ${data.month || 'this month'} is ₹${data.totalWage || 0}. Paid: ₹${data.paidAmount || 0}. Pending: ₹${data.pendingAmount || 0}. – Cardora`;
          break;

        case 'Payment':
          isTypeEnabled = smsSettings.paymentSMS;
          message = `Hello ${workerName}, ₹${data.amount || 0} has been recorded as your wage payment on ${data.date || new Date().toLocaleDateString()}. – Cardora`;
          break;

        case 'WorkAssignment':
          isTypeEnabled = smsSettings.workAssignmentSMS;
          message = `Hello ${workerName}, you have been assigned ${data.workType || 'Field Work'} at ${data.plantationName || 'Cardora Plantation'} on ${data.date || 'Today'}. – Cardora`;
          break;

        default:
          message = `Hello ${workerName}, notification from Cardora Plantation Management. – Cardora`;
          break;
      }
    }

    if (!isTypeEnabled) {
      return {
        success: false,
        message: `SMS notifications for category '${type}' are currently turned OFF in settings.`,
      };
    }

    // Modular Provider Execution (Twilio / Fast2SMS / Console Fallback)
    const provider = process.env.SMS_PROVIDER || 'CONSOLE';
    let status = 'Sent';

    if (provider === 'TWILIO' && process.env.TWILIO_ACCOUNT_SID) {
      try {
        const accountSid = process.env.TWILIO_ACCOUNT_SID;
        const authToken = process.env.TWILIO_AUTH_TOKEN;
        const fromPhone = process.env.TWILIO_PHONE_NUMBER || '+18005550199';
        const auth = Buffer.from(`${accountSid}:${authToken}`).toString('base64');
        const formattedTarget = targetPhone.startsWith('+') ? targetPhone : `+91${targetPhone.replace(/[^0-9]/g, '').slice(-10)}`;

        const params = new URLSearchParams();
        params.append('To', formattedTarget);
        params.append('From', fromPhone);
        params.append('Body', message);

        await axios.post(
          `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
          params.toString(),
          {
            headers: {
              'Authorization': `Basic ${auth}`,
              'Content-Type': 'application/x-www-form-urlencoded',
            },
            timeout: 5000,
          }
        );
        console.log(`[Twilio SMS Sent] to ${formattedTarget}`);
        status = 'Sent';
      } catch (twErr) {
        console.error('[Twilio Error]:', twErr.response?.data || twErr.message);
        status = 'Twilio_Failed';
      }
    } else if (provider === 'FAST2SMS' && process.env.FAST2SMS_API_KEY) {
      try {
        const cleanNum = targetPhone.replace(/[^0-9]/g, '').slice(-10);
        await axios.post(
          'https://www.fast2sms.com/dev/bulkV2',
          {
            route: 'v3',
            sender_id: 'TXTIND',
            message,
            language: 'english',
            flash: 0,
            numbers: cleanNum,
          },
          {
            headers: {
              authorization: process.env.FAST2SMS_API_KEY,
            },
            timeout: 5000,
          }
        );
        console.log(`[Fast2SMS Sent] to ${cleanNum}`);
        status = 'Sent';
      } catch (fErr) {
        console.error('[Fast2SMS Error]:', fErr.response?.data || fErr.message);
        status = 'Fast2SMS_Failed';
      }
    } else {
      // Console Simulation Mode (Default)
      console.log(`📱 [SMS SIMULATION] To: ${targetPhone} | Text: "${message}"`);
      status = 'Simulated';
    }

    // Save SMS dispatch log
    const logEntry = await SMSLog.create({
      worker: workerObj?._id || data.workerMongoId,
      workerId: workerId || workerObj?.workerId || 'WRK-UNKNOWN',
      supervisor: supervisorId,
      phone: targetPhone,
      type,
      message,
      status,
      sentAt: new Date(),
    });

    return {
      success: true,
      status,
      log: logEntry,
      messageSent: message,
    };
  } catch (error) {
    console.error('[SMS Service Error]:', error);
    return { success: false, message: error.message };
  }
};

module.exports = {
  sendSmsNotification,
  getSmsSettings,
  updateSmsSettings,
};
