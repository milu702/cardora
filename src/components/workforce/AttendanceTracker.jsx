import React, { useState, useEffect } from 'react';
import { CheckCircle2, Clock, Calendar, Save, Send, UserCheck, AlertCircle, Download } from 'lucide-react';
import apiService from '../../services/api';

const AttendanceTracker = ({ plantationId, workers = [], onAttendanceSaved, showToast }) => {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [attendanceData, setAttendanceData] = useState({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [sendSms, setSendSms] = useState(true);

  // Initialize or fetch attendance for selected date
  useEffect(() => {
    const loadAttendanceForDate = async () => {
      if (!plantationId || !selectedDate) return;
      setLoading(true);
      try {
        const res = await apiService.getSupervisorAttendanceByDate(plantationId, selectedDate);
        const initialMap = {};

        // Seed workers into map
        workers.forEach((w) => {
          initialMap[w._id] = {
            workerId: w._id,
            customId: w.workerId,
            name: w.fullName,
            status: 'Present', // Default
            overtimeHours: 0,
            workType: w.workType || 'Capsule Harvesting',
            remarks: '',
          };
        });

        // Merge saved database records if available
        if (res.success && res.records && res.records.length > 0) {
          res.records.forEach((rec) => {
            const wId = rec.worker?._id || rec.worker;
            if (initialMap[wId]) {
              initialMap[wId] = {
                ...initialMap[wId],
                status: rec.status,
                overtimeHours: rec.overtimeHours || 0,
                workType: rec.workType || initialMap[wId].workType,
                remarks: rec.remarks || '',
              };
            }
          });
        }

        setAttendanceData(initialMap);
      } catch (err) {
        console.error('Error loading attendance:', err);
      } finally {
        setLoading(false);
      }
    };

    loadAttendanceForDate();
  }, [plantationId, selectedDate, workers]);

  // ONE-CLICK "Mark All Present"
  const handleMarkAllPresent = () => {
    setAttendanceData((prev) => {
      const updated = { ...prev };
      Object.keys(updated).forEach((id) => {
        updated[id] = { ...updated[id], status: 'Present' };
      });
      return updated;
    });
    if (showToast) showToast('🟢 Marked all workers as Present');
  };

  // Status Change for specific worker
  const handleStatusChange = (workerId, newStatus) => {
    setAttendanceData((prev) => ({
      ...prev,
      [workerId]: {
        ...prev[workerId],
        status: newStatus,
      },
    }));
  };

  // Overtime hours change
  const handleOvertimeChange = (workerId, hours) => {
    setAttendanceData((prev) => ({
      ...prev,
      [workerId]: {
        ...prev[workerId],
        overtimeHours: Math.max(0, Number(hours) || 0),
      },
    }));
  };

  // Remarks change
  const handleRemarksChange = (workerId, text) => {
    setAttendanceData((prev) => ({
      ...prev,
      [workerId]: {
        ...prev[workerId],
        remarks: text,
      },
    }));
  };

  // Save Attendance
  const handleSaveAttendance = async () => {
    setSaving(true);
    try {
      const attendanceList = Object.values(attendanceData).map((item) => ({
        workerId: item.workerId,
        status: item.status,
        overtimeHours: item.overtimeHours,
        workType: item.workType,
        remarks: item.remarks,
      }));

      const res = await apiService.markBulkSupervisorAttendance({
        plantationId,
        date: selectedDate,
        attendanceList,
        sendSms,
      });

      if (res.success) {
        if (showToast) showToast(`🎉 Attendance saved for ${selectedDate}`);
        if (onAttendanceSaved) onAttendanceSaved();
      } else {
        if (showToast) showToast(`❌ Error: ${res.message}`);
      }
    } catch (err) {
      if (showToast) showToast(`❌ Error saving attendance: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-white dark:bg-[#1E293B] rounded-3xl p-6 shadow-xl border border-emerald-100 dark:border-gray-800 space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-gray-100 dark:border-gray-800">
        <div>
          <h2 className="text-xl font-black text-[#17331F] dark:text-white flex items-center gap-2">
            <UserCheck className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
            Today's Attendance Register
          </h2>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Quickly mark attendance for all plantation workers on duty
          </p>
        </div>

        {/* Date Selector & Action Controls */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center space-x-2 bg-gray-50 dark:bg-gray-800 px-3 py-2 rounded-2xl border border-gray-200 dark:border-gray-700">
            <Calendar className="w-4 h-4 text-emerald-600" />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="bg-transparent text-xs font-bold text-gray-800 dark:text-white focus:outline-none"
            />
          </div>

          {/* Download CSV Report Button */}
          <button
            onClick={async () => {
              try {
                let records = [];
                let estateName = 'Cardora Plantation Estate';

                const res = await apiService.exportPlantationAttendance(plantationId);
                if (res && res.success && Array.isArray(res.records)) {
                  records = res.records;
                  if (res.plantationName) estateName = res.plantationName;
                }

                if (records.length === 0 && workers.length > 0) {
                  const todayDate = selectedDate || new Date().toISOString().split('T')[0];
                  records = workers.map((w) => ({
                    date: todayDate,
                    worker: w,
                    workerId: w.workerId,
                    plantationName: estateName,
                    status: 'Present',
                    workType: w.workType || 'Harvesting',
                    overtimeHours: 0,
                    overtimeAmount: 0,
                    markedBy: 'Supervisor',
                    createdAt: new Date(),
                    _id: w._id,
                  }));
                }

                if (records.length === 0) {
                  if (showToast) showToast('⚠️ No attendance or worker records to export.');
                  return;
                }

                const headers = ['Date', 'Plantation Name', 'Worker ID', 'Worker Name', 'Work Type', 'Status', 'Daily Wage (INR)', 'Overtime Hours', 'Overtime Amount (INR)', 'Marked By'];
                const rows = records.map((r) => {
                  const w = r.worker || {};
                  return [
                    `"${r.date || ''}"`,
                    `"${r.plantationName || estateName}"`,
                    `"${r.workerId || w.workerId || ''}"`,
                    `"${w.fullName || 'Worker'}"`,
                    `"${r.workType || w.workType || 'Harvesting'}"`,
                    `"${r.status || 'Present'}"`,
                    w.dailyWage || 700,
                    r.overtimeHours || 0,
                    r.overtimeAmount || 0,
                    `"${r.markedBy || 'Supervisor'}"`,
                  ].join(',');
                });

                const csvString = '\uFEFF' + [headers.join(','), ...rows].join('\n');
                const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
                const url = URL.createObjectURL(blob);

                const link = document.createElement('a');
                link.href = url;
                link.setAttribute('download', `Cardora_Attendance_${plantationId || 'report'}.csv`);
                document.body.appendChild(link);
                link.click();

                setTimeout(() => {
                  document.body.removeChild(link);
                  URL.revokeObjectURL(url);
                }, 500);

                if (showToast) showToast('📥 Attendance CSV report downloaded successfully!');
              } catch (err) {
                if (showToast) showToast(`❌ Download failed: ${err.message}`);
              }
            }}
            className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-2xl text-xs font-black shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Export CSV</span>
          </button>

          {/* Mark All Present Quick Button */}
          <button
            onClick={handleMarkAllPresent}
            className="px-4 py-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 rounded-2xl text-xs font-black border border-emerald-500/30 transition-all flex items-center gap-1.5"
          >
            <CheckCircle2 className="w-4 h-4" />
            Mark All Present
          </button>
        </div>
      </div>

      {/* Worker Attendance Cards / List */}
      {loading ? (
        <div className="py-12 text-center text-gray-400 text-sm">Loading attendance register...</div>
      ) : workers.length === 0 ? (
        <div className="py-12 text-center bg-gray-50 dark:bg-gray-800/50 rounded-2xl">
          <AlertCircle className="w-8 h-8 text-amber-500 mx-auto mb-2" />
          <p className="text-sm font-bold text-gray-700 dark:text-gray-300">No workers registered in this plantation yet.</p>
          <p className="text-xs text-gray-500 mt-1">Add workers first using the "Add Worker" button.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {workers.map((worker) => {
            const data = attendanceData[worker._id] || { status: 'Present', overtimeHours: 0, remarks: '' };
            const status = data.status;

            return (
              <div
                key={worker._id}
                className="p-4 bg-gray-50 dark:bg-gray-800/60 rounded-2xl border border-gray-100 dark:border-gray-700/60 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-emerald-500/30 transition-all"
              >
                {/* Left: Worker Info */}
                <div className="flex items-center space-x-3 min-w-[200px]">
                  <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-emerald-500 to-green-700 text-white font-bold flex items-center justify-center text-sm shadow-md">
                    {worker.photo ? (
                      <img src={worker.photo} alt={worker.fullName} className="w-full h-full rounded-2xl object-cover" />
                    ) : (
                      worker.fullName.slice(0, 2).toUpperCase()
                    )}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-1.5">
                      {worker.fullName}
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 rounded-md">
                        {worker.workerId}
                      </span>
                    </h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {worker.workType || 'Capsule Harvesting'} • ₹{worker.dailyWage || 700}/day
                    </p>
                  </div>
                </div>

                {/* Center: Status Buttons */}
                <div className="flex items-center space-x-2">
                  {/* Present */}
                  <button
                    onClick={() => handleStatusChange(worker._id, 'Present')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-1 ${
                      status === 'Present'
                        ? 'bg-emerald-600 text-white shadow-md shadow-emerald-500/30 ring-2 ring-emerald-500'
                        : 'bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-600 hover:bg-emerald-50'
                    }`}
                  >
                    <span>🟢</span>
                    <span>Present</span>
                  </button>

                  {/* Half Day */}
                  <button
                    onClick={() => handleStatusChange(worker._id, 'Half Day')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-1 ${
                      status === 'Half Day'
                        ? 'bg-amber-500 text-white shadow-md shadow-amber-500/30 ring-2 ring-amber-400'
                        : 'bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-600 hover:bg-amber-50'
                    }`}
                  >
                    <span>🟡</span>
                    <span>Half Day</span>
                  </button>

                  {/* Absent */}
                  <button
                    onClick={() => handleStatusChange(worker._id, 'Absent')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-1 ${
                      status === 'Absent'
                        ? 'bg-red-600 text-white shadow-md shadow-red-500/30 ring-2 ring-red-400'
                        : 'bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-600 hover:bg-red-50'
                    }`}
                  >
                    <span>🔴</span>
                    <span>Absent</span>
                  </button>

                  {/* Leave */}
                  <button
                    onClick={() => handleStatusChange(worker._id, 'Leave')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-1 ${
                      status === 'Leave'
                        ? 'bg-blue-600 text-white shadow-md shadow-blue-500/30 ring-2 ring-blue-400'
                        : 'bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-600 hover:bg-blue-50'
                    }`}
                  >
                    <span>🔵</span>
                    <span>Leave</span>
                  </button>
                </div>

                {/* Right: Overtime & Remarks Inputs */}
                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-1.5 bg-white dark:bg-gray-700 px-3 py-1.5 rounded-xl border border-gray-200 dark:border-gray-600">
                    <Clock className="w-3.5 h-3.5 text-gray-400" />
                    <span className="text-xs text-gray-500">OT:</span>
                    <input
                      type="number"
                      min="0"
                      max="12"
                      value={data.overtimeHours || ''}
                      onChange={(e) => handleOvertimeChange(worker._id, e.target.value)}
                      placeholder="0 hrs"
                      className="w-12 text-xs font-bold text-gray-800 dark:text-white bg-transparent focus:outline-none text-center"
                    />
                  </div>

                  <input
                    type="text"
                    placeholder="Remarks..."
                    value={data.remarks || ''}
                    onChange={(e) => handleRemarksChange(worker._id, e.target.value)}
                    className="px-3 py-1.5 text-xs bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-800 dark:text-white focus:outline-none w-32 md:w-40"
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Bottom Footer Actions */}
      <div className="pt-4 border-t border-gray-100 dark:border-gray-800 flex flex-col md:flex-row items-center justify-between gap-4">
        <label className="flex items-center space-x-2 text-xs text-gray-600 dark:text-gray-400 cursor-pointer">
          <input
            type="checkbox"
            checked={sendSms}
            onChange={(e) => setSendSms(e.target.checked)}
            className="w-4 h-4 rounded text-emerald-600 border-gray-300 focus:ring-emerald-500"
          />
          <Send className="w-3.5 h-3.5 text-emerald-600" />
          <span>Send Attendance SMS to Workers upon saving</span>
        </label>

        <button
          onClick={handleSaveAttendance}
          disabled={saving || workers.length === 0}
          className="w-full md:w-auto px-8 py-3 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white rounded-2xl text-sm font-black shadow-lg shadow-emerald-500/20 disabled:opacity-50 transition-all flex items-center justify-center space-x-2"
        >
          <Save className="w-4 h-4" />
          <span>{saving ? 'Saving Attendance...' : 'Save Attendance Register'}</span>
        </button>
      </div>
    </div>
  );
};

export default AttendanceTracker;
