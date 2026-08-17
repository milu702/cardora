import React, { useState, useEffect } from 'react';
import { Sparkles, AlertTriangle, CheckCircle, RefreshCw, Eye, FileText, Download, User } from 'lucide-react';
import { apiService } from '../../services/api';

const AdminPlantationIntelligenceView = ({ onToast }) => {
  const [summary, setSummary] = useState({
    totalAnalyses: 0,
    todayCount: 0,
    highRiskCount: 0,
    healthyCount: 0,
  });
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState(null);

  const fetchAdminOverview = async () => {
    setLoading(true);
    try {
      const res = await apiService.getAdminIntelligenceOverview();
      if (res && res.success) {
        if (res.summary) setSummary(res.summary);
        if (Array.isArray(res.reports)) setReports(res.reports);
      }
    } catch (err) {
      console.error('Error fetching admin intelligence overview:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminOverview();
  }, []);

  return (
    <div className="space-y-6">
      
      {/* HEADER & SUMMARY KPIS */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
        <div>
          <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2 font-poppins">
            🌿 Plantation Intelligence Overview
          </h2>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            System Admin oversight across all submitted live soil & weather decision-support reports
          </p>
        </div>

        <button
          onClick={fetchAdminOverview}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#1F5E3B] text-white font-bold text-xs hover:bg-[#16442b]"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          <span>Refresh Overview</span>
        </button>
      </div>

      {/* KPI CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-xs font-bold text-slate-400 block">Total Intelligence Reports</span>
          <span className="text-2xl font-black text-slate-900 dark:text-white font-poppins">{summary.totalAnalyses}</span>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-xs font-bold text-slate-400 block">Analyzed Today</span>
          <span className="text-2xl font-black text-blue-600 font-poppins">{summary.todayCount}</span>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-xs font-bold text-slate-400 block">High-Risk Plantations</span>
          <span className="text-2xl font-black text-rose-600 font-poppins">{summary.highRiskCount}</span>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-xs font-bold text-slate-400 block">Healthy Plantations</span>
          <span className="text-2xl font-black text-emerald-600 font-poppins">{summary.healthyCount}</span>
        </div>
      </div>

      {/* REPORTS TABLE */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <h3 className="text-base font-extrabold text-slate-900 dark:text-white">Recent Submitted Intelligence Reports</h3>

        {loading ? (
          <div className="py-12 text-center text-slate-400 text-xs font-semibold">Loading Admin Intelligence Overview...</div>
        ) : reports.length === 0 ? (
          <div className="py-12 text-center text-slate-400 text-xs font-semibold">No submitted intelligence reports found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 font-bold uppercase text-[10px] tracking-wider border-b border-slate-200 dark:border-slate-700">
                <tr>
                  <th className="py-3 px-4">Plantation & Owner</th>
                  <th className="py-3 px-4">District</th>
                  <th className="py-3 px-4">Condition Score</th>
                  <th className="py-3 px-4">Risk Level</th>
                  <th className="py-3 px-4">Submitted Date</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {reports.map((rep) => (
                  <tr key={rep._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                    <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">
                      <div>{rep.plantationName}</div>
                      <div className="text-[11px] text-slate-400 font-normal">
                        By: {rep.user?.name || rep.user?.fullName || 'Planter'} ({rep.user?.email})
                      </div>
                    </td>
                    <td className="py-3 px-4 text-slate-600 dark:text-slate-300 font-medium">{rep.district}</td>
                    <td className="py-3 px-4 font-black text-[#1F5E3B] dark:text-emerald-400 text-sm">
                      {rep.conditionScore} / 100
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black ${
                        rep.overallStatus === 'High Risk' || rep.overallStatus === 'Needs Attention'
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-emerald-100 text-[#1F5E3B]'
                      }`}>
                        {rep.overallStatus}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-500">
                      {new Date(rep.submittedAt || rep.createdAt).toLocaleString([], { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => setSelectedReport(rep)}
                        className="px-3 py-1 rounded-lg bg-[#EAF3E8] text-[#1F5E3B] font-bold text-xs hover:bg-[#DDEFD9]"
                      >
                        Inspect Report
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* REPORT INSPECTION MODAL */}
      {selectedReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-2xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4 max-h-[85vh] overflow-y-auto">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-base font-black text-slate-900 dark:text-white">
                🌿 Intelligence Report: {selectedReport.plantationName}
              </h3>
              <button onClick={() => setSelectedReport(null)} className="text-slate-400 font-bold hover:text-slate-700">✕</button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 space-y-1">
                <div><strong>Owner:</strong> {selectedReport.user?.name || selectedReport.user?.fullName} ({selectedReport.user?.email})</div>
                <div><strong>Location:</strong> {selectedReport.district}</div>
                <div><strong>Score:</strong> {selectedReport.conditionScore} / 100 ({selectedReport.overallStatus})</div>
              </div>

              <div>
                <strong>Main Recommended Action:</strong>
                <p className="mt-1 p-2.5 rounded-lg bg-emerald-50 text-[#1F5E3B] font-medium">"{selectedReport.farmerRecommendations?.mainAction}"</p>
              </div>

              <div>
                <strong>Irrigation Decision:</strong>
                <p className="mt-1 text-slate-600">{selectedReport.irrigationDecision?.state} — {selectedReport.irrigationDecision?.explanation}</p>
              </div>

              <div>
                <strong>Detected Risks:</strong>
                <div className="space-y-1.5 mt-1">
                  {(selectedReport.riskMonitor || []).map((r, idx) => (
                    <div key={idx} className="p-2 rounded bg-amber-50 text-amber-900 font-medium">
                      [{r.severity}] {r.riskName}: {r.reason}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 text-right">
              <button onClick={() => setSelectedReport(null)} className="px-4 py-2 rounded-xl bg-slate-200 text-slate-800 font-bold text-xs">
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminPlantationIntelligenceView;
