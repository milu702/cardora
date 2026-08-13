import React, { useState, useEffect } from 'react';
import { IndianRupee, Plus, CreditCard, Send, RefreshCw } from 'lucide-react';
import apiService from '../../services/api';

const WagePaymentManager = ({ plantationId, workers = [], showToast }) => {
  const [selectedWorker, setSelectedWorker] = useState(null);
  const [wageData, setWageData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [payForm, setPayForm] = useState({
    amount: '',
    paymentMethod: 'Cash',
    type: 'Salary',
    transactionId: '',
    remarks: '',
    sendSms: true,
  });
  const [submittingPayment, setSubmittingPayment] = useState(false);

  useEffect(() => {
    if (workers.length > 0 && !selectedWorker) {
      setSelectedWorker(workers[0]);
    }
  }, [workers, selectedWorker]);

  useEffect(() => {
    const loadWorkerWageDetails = async (workerId) => {
      setLoading(true);
      try {
        const res = await apiService.getSupervisorWorkerWageDetails(workerId);
        if (res.success) {
          setWageData(res);
        }
      } catch (err) {
        console.error('Error fetching wage details:', err);
      } finally {
        setLoading(false);
      }
    };

    if (selectedWorker) {
      loadWorkerWageDetails(selectedWorker._id);
    }
  }, [selectedWorker]);

  const loadWorkerWageDetails = async (workerId) => {
    setLoading(true);
    try {
      const res = await apiService.getSupervisorWorkerWageDetails(workerId);
      if (res.success) {
        setWageData(res);
      }
    } catch (err) {
      console.error('Error fetching wage details:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRecordPayment = async (e) => {
    e.preventDefault();
    if (!payForm.amount || Number(payForm.amount) <= 0) {
      if (showToast) showToast('⚠️ Please enter a valid payment amount');
      return;
    }

    setSubmittingPayment(true);
    try {
      const payload = {
        workerId: selectedWorker._id,
        plantationId,
        amount: Number(payForm.amount),
        paymentMethod: payForm.paymentMethod,
        type: payForm.type,
        transactionId: payForm.transactionId,
        remarks: payForm.remarks,
        sendSms: payForm.sendSms,
      };

      const res = await apiService.recordSupervisorWorkerPayment(payload);
      if (res.success) {
        if (showToast) showToast(`💵 Recorded payment of ₹${payForm.amount}`);
        setShowPaymentModal(false);
        setPayForm({
          amount: '',
          paymentMethod: 'Cash',
          type: 'Salary',
          transactionId: '',
          remarks: '',
          sendSms: true,
        });
        loadWorkerWageDetails(selectedWorker._id);
      } else {
        if (showToast) showToast(`❌ ${res.message}`);
      }
    } catch (err) {
      if (showToast) showToast(`❌ Error: ${err.message}`);
    } finally {
      setSubmittingPayment(false);
    }
  };

  const summary = wageData?.summary || {};

  return (
    <div className="space-y-6">
      {/* Top Banner / Worker Selection Selector */}
      <div className="bg-white dark:bg-[#1E293B] p-6 rounded-3xl shadow-xl border border-emerald-100 dark:border-gray-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-[#17331F] dark:text-white flex items-center gap-2">
            <IndianRupee className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
            Automated Wage & Payment Ledger
          </h2>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Wages are automatically computed from attendance records, overtime, advances & bonuses
          </p>
        </div>

        {/* Worker Selector */}
        <div className="flex items-center space-x-3">
          <label className="text-xs font-bold text-gray-700 dark:text-gray-300">Select Worker:</label>
          <select
            value={selectedWorker?._id || ''}
            onChange={(e) => {
              const w = workers.find((item) => item._id === e.target.value);
              setSelectedWorker(w);
            }}
            className="px-4 py-2 text-xs font-bold bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none"
          >
            {workers.map((w) => (
              <option key={w._id} value={w._id}>
                {w.fullName} ({w.workerId}) - ₹{w.dailyWage}/day
              </option>
            ))}
          </select>
          <button
            onClick={() => selectedWorker && loadWorkerWageDetails(selectedWorker._id)}
            className="p-2 bg-gray-100 dark:bg-gray-700 rounded-xl hover:bg-gray-200 text-gray-700 dark:text-gray-200 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {loading ? (
        <div className="py-12 text-center text-gray-400 text-sm">Calculating wage metrics...</div>
      ) : !wageData ? (
        <div className="py-12 text-center text-gray-500">Select a worker to view wage breakdown</div>
      ) : (
        <>
          {/* Wage KPI Metric Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {/* Total Earned */}
            <div className="p-5 bg-gradient-to-br from-emerald-500/10 to-emerald-500/5 rounded-3xl border border-emerald-500/20">
              <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">
                Gross Earned
              </span>
              <p className="text-2xl font-black text-emerald-800 dark:text-emerald-300 mt-1">
                ₹{(summary.totalEarned || 0).toLocaleString()}
              </p>
              <p className="text-[11px] text-gray-500 mt-1">
                {summary.presentDays || 0} Full | {summary.halfDays || 0} Half Days
              </p>
            </div>

            {/* Overtime & Bonuses */}
            <div className="p-5 bg-gradient-to-br from-blue-500/10 to-blue-500/5 rounded-3xl border border-blue-500/20">
              <span className="text-xs font-bold text-blue-700 dark:text-blue-400 uppercase tracking-wider">
                Overtime & Bonus
              </span>
              <p className="text-2xl font-black text-blue-800 dark:text-blue-300 mt-1">
                ₹{((summary.totalOvertimeAmount || 0) + (summary.bonusesTotal || 0)).toLocaleString()}
              </p>
              <p className="text-[11px] text-gray-500 mt-1">
                {summary.totalOvertimeHours || 0} Overtime Hrs
              </p>
            </div>

            {/* Total Paid */}
            <div className="p-5 bg-gradient-to-br from-green-500/10 to-green-500/5 rounded-3xl border border-green-500/20">
              <span className="text-xs font-bold text-green-700 dark:text-green-400 uppercase tracking-wider">
                Amount Paid
              </span>
              <p className="text-2xl font-black text-green-800 dark:text-green-300 mt-1">
                ₹{(summary.totalPaidAmount || 0).toLocaleString()}
              </p>
              <p className="text-[11px] text-gray-500 mt-1">Cleared payouts</p>
            </div>

            {/* Pending Balance */}
            <div className="p-5 bg-gradient-to-br from-amber-500/10 to-amber-500/5 rounded-3xl border border-amber-500/20">
              <span className="text-xs font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wider">
                Pending Balance
              </span>
              <p className="text-2xl font-black text-amber-800 dark:text-amber-300 mt-1">
                ₹{(summary.pendingAmount || 0).toLocaleString()}
              </p>
              <p className="text-[11px] text-gray-500 mt-1">Outstanding liability</p>
            </div>
          </div>

          {/* Detailed Itemized Formula Breakdown Card */}
          <div className="bg-white dark:bg-[#1E293B] p-6 rounded-3xl shadow-xl border border-emerald-100 dark:border-gray-800 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-gray-900 dark:text-white">
                Itemized Wage Calculation Breakdown
              </h3>
              <button
                onClick={() => setShowPaymentModal(true)}
                className="px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white rounded-2xl text-xs font-bold shadow-lg shadow-emerald-500/20 flex items-center space-x-2 transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>Record Payment / Advance</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-gray-50 dark:bg-gray-800/60 rounded-2xl space-y-2.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Full Days ({summary.presentDays || 0} × ₹{selectedWorker?.dailyWage}):</span>
                  <span className="font-bold text-gray-900 dark:text-white">₹{summary.fullDayEarnings || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Half Days ({summary.halfDays || 0} × ₹{(selectedWorker?.dailyWage || 700) / 2}):</span>
                  <span className="font-bold text-gray-900 dark:text-white">₹{summary.halfDayEarnings || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Overtime Earnings ({summary.totalOvertimeHours || 0} hrs):</span>
                  <span className="font-bold text-blue-600 dark:text-blue-400">+₹{summary.totalOvertimeAmount || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Bonuses:</span>
                  <span className="font-bold text-green-600 dark:text-green-400">+₹{summary.bonusesTotal || 0}</span>
                </div>
              </div>

              <div className="p-4 bg-gray-50 dark:bg-gray-800/60 rounded-2xl space-y-2.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Advances Deducted:</span>
                  <span className="font-bold text-red-600 dark:text-red-400">-₹{summary.advancesTotal || 0}</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-gray-200 dark:border-gray-700">
                  <span className="font-bold text-gray-800 dark:text-gray-200">Net Calculated Wage:</span>
                  <span className="font-black text-emerald-600 dark:text-emerald-400 text-sm">₹{summary.finalWage || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Total Payments Cleared:</span>
                  <span className="font-bold text-green-600 dark:text-green-400">₹{summary.totalPaidAmount || 0}</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-gray-200 dark:border-gray-700">
                  <span className="font-bold text-amber-600 dark:text-amber-400">Current Pending Amount:</span>
                  <span className="font-black text-amber-600 dark:text-amber-400 text-sm">₹{summary.pendingAmount || 0}</span>
                </div>
              </div>
            </div>

            {/* Payment History List */}
            <div className="pt-4">
              <h4 className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-3">
                Payment Transactions History ({wageData.payments?.length || 0})
              </h4>
              {!wageData.payments || wageData.payments.length === 0 ? (
                <p className="text-xs text-gray-400 italic">No payment records logged yet.</p>
              ) : (
                <div className="space-y-2">
                  {wageData.payments.map((pay, i) => (
                    <div
                      key={i}
                      className="p-3 bg-gray-50 dark:bg-gray-800/80 rounded-2xl flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-emerald-500/10 text-emerald-600 rounded-xl">
                          <CreditCard className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="font-bold text-gray-900 dark:text-white">
                            {pay.type || pay.paymentType || 'Salary'} via {pay.paymentMethod || 'Cash'}
                          </p>
                          <p className="text-[10px] text-gray-500">
                            {new Date(pay.paymentDate).toLocaleDateString()} {pay.transactionId ? `• Txn: ${pay.transactionId}` : ''}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="font-black text-emerald-600 dark:text-emerald-400">₹{pay.amount}</span>
                        <span className="block text-[10px] text-gray-400">{pay.status || 'Paid'}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {/* Record Payment Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white dark:bg-[#1E293B] w-full max-w-md rounded-3xl shadow-2xl border border-emerald-100 dark:border-gray-800 overflow-hidden">
            <div className="px-6 py-5 bg-gradient-to-r from-[#17331F] to-[#2C5E3B] text-white flex items-center justify-between">
              <h3 className="text-lg font-bold">Record Worker Payment</h3>
              <button onClick={() => setShowPaymentModal(false)} className="text-white/80 hover:text-white">
                ✕
              </button>
            </div>

            <form onSubmit={handleRecordPayment} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                  Payment Amount (₹) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  value={payForm.amount}
                  onChange={(e) => setPayForm({ ...payForm, amount: e.target.value })}
                  placeholder={`Pending balance: ₹${summary.pendingAmount || 0}`}
                  className="w-full px-4 py-2.5 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">Type</label>
                  <select
                    value={payForm.type}
                    onChange={(e) => setPayForm({ ...payForm, type: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white"
                  >
                    <option value="Salary">Salary / Daily Wage</option>
                    <option value="Advance">Advance Payout</option>
                    <option value="Bonus">Bonus Reward</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">Payment Method</label>
                  <select
                    value={payForm.paymentMethod}
                    onChange={(e) => setPayForm({ ...payForm, paymentMethod: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white"
                  >
                    <option value="Cash">Cash</option>
                    <option value="UPI">UPI Transfer</option>
                    <option value="Bank Transfer">Bank Transfer</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                  Transaction / Ref Number (Optional)
                </label>
                <input
                  type="text"
                  value={payForm.transactionId}
                  onChange={(e) => setPayForm({ ...payForm, transactionId: e.target.value })}
                  placeholder="e.g. UPI-9847120938"
                  className="w-full px-4 py-2 text-xs bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">Remarks</label>
                <input
                  type="text"
                  value={payForm.remarks}
                  onChange={(e) => setPayForm({ ...payForm, remarks: e.target.value })}
                  placeholder="e.g. Weekly harvest wage settlement"
                  className="w-full px-4 py-2 text-xs bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white"
                />
              </div>

              <label className="flex items-center space-x-2 text-xs text-gray-700 dark:text-gray-300 cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={payForm.sendSms}
                  onChange={(e) => setPayForm({ ...payForm, sendSms: e.target.checked })}
                  className="w-4 h-4 rounded text-emerald-600 border-gray-300"
                />
                <Send className="w-3.5 h-3.5 text-emerald-600" />
                <span>Send SMS Receipt to worker mobile number</span>
              </label>

              <div className="flex justify-end space-x-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowPaymentModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingPayment}
                  className="px-6 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 shadow-md"
                >
                  {submittingPayment ? 'Recording...' : 'Confirm Payment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default WagePaymentManager;
