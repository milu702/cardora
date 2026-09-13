import React, { useState, useEffect } from 'react';
import { Activity, Clock, Users, Sparkles, Shield, Cpu, Bot, User } from 'lucide-react';
import apiService from '../../../services/api';

const ACTOR_BADGES = {
  owner: { label: 'OWNER', color: 'bg-blue-100 text-blue-800 border-blue-200' },
  supervisor: { label: 'SUPERVISOR', color: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
  system: { label: 'SYSTEM', color: 'bg-gray-100 text-gray-700 border-gray-200' },
  iot: { label: 'IoT', color: 'bg-purple-100 text-purple-800 border-purple-200' },
  ai: { label: 'AI', color: 'bg-amber-100 text-amber-800 border-amber-200' },
};

const HistoryTab = ({ plantation }) => {
  const p = plantation;
  const [combinedHistory, setCombinedHistory] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (p?._id) {
      const fetchHistory = async () => {
        setLoading(true);
        try {
          const res = await apiService.getPlantationCombinedHistory(p._id);
          if (res && res.success && Array.isArray(res.logs)) {
            setCombinedHistory(res.logs);
          }
        } catch (err) {
          console.error('Error fetching plantation combined history:', err);
        } finally {
          setLoading(false);
        }
      };
      fetchHistory();
    }
  }, [p?._id]);

  const defaultHistory = [
    {
      id: '1',
      actorRole: 'owner',
      actorName: p.ownerName || 'Estate Owner',
      title: 'Plantation Profile Registered',
      category: 'Registration',
      timestamp: p.createdAt ? new Date(p.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' }) : 'Recent',
      details: `Registered ${p.name} (${p.area || 5} Acres, ${p.variety || 'Njallani'} Variety) in ${p.district || 'Idukki, Kerala'}.`,
    },
    {
      id: '2',
      actorRole: 'iot',
      actorName: 'Moisture Sensor Unit',
      title: 'IoT Moisture Sensor Telemetry Sync',
      category: 'Sensor',
      timestamp: 'Today, 08:30 AM',
      details: `Automated moisture check: ${p.soil?.moisture ?? p.moisture ?? 72}%. Drip pulse irrigation system active.`,
    },
    {
      id: '3',
      actorRole: 'supervisor',
      actorName: 'Supervisor Field Team',
      title: 'Supervisor Field Shift Log Entry',
      category: 'Workforce',
      timestamp: 'Yesterday, 04:15 PM',
      details: `${p.workers?.presentToday ?? 8} Workers completed shade tree branch pruning across North Canopy.`,
    },
    {
      id: '4',
      actorRole: 'ai',
      actorName: 'Cardora AI Advisor',
      title: 'Azhukal Disease Risk Analysis',
      category: 'AI Recommendation',
      timestamp: '28 Jul 2026',
      details: 'AI evaluated high humidity levels and recommended targeted Trichoderma harzianum bio-fungicide.',
    },
  ];

  const displayLogs = combinedHistory.length > 0
    ? combinedHistory.map((item) => ({
        id: item._id,
        actorRole: (item.actorRole || 'system').toLowerCase(),
        actorName: item.actorName || 'System',
        title: item.action ? item.action.replace(/_/g, ' ') : 'Plantation Activity',
        category: item.entityType || 'General',
        timestamp: item.createdAt ? new Date(item.createdAt).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Recent',
        details: item.description || '',
      }))
    : defaultHistory;

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex items-center justify-between pb-3 border-b border-[#D7E6D5]">
        <div>
          <h3 className="text-lg font-black text-[#17331F] font-poppins flex items-center gap-2">
            <Clock className="w-5 h-5 text-[#5C8D4E]" />
            Plantation Central Activity Timeline
          </h3>
          <p className="text-xs text-[#4A5568] font-medium">
            Combined historical timeline of actions by Owner, Supervisor, System, IoT, and AI.
          </p>
        </div>

        <span className="text-xs font-bold text-[#1F5E3B] bg-[#DDEFD9] px-3 py-1.5 rounded-full">
          Audit Trail Active 📜
        </span>
      </div>

      {loading ? (
        <div className="py-8 text-center text-gray-400 text-xs font-bold">Loading central timeline...</div>
      ) : (
        /* TIMELINE VIEW */
        <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-[#D7E6D5]">
          {displayLogs.map((log) => {
            const badge = ACTOR_BADGES[log.actorRole] || ACTOR_BADGES.system;
            return (
              <div key={log.id} className="relative flex items-start gap-4 group">
                {/* PIN */}
                <div className="absolute -left-[23px] top-1 w-5 h-5 rounded-full border-2 border-white flex items-center justify-center shadow-md bg-emerald-600">
                  <div className="w-2 h-2 rounded-full bg-white" />
                </div>

                {/* CARD */}
                <div className="flex-1 p-4 rounded-[20px] bg-white border border-[#D7E6D5] shadow-soft hover:border-[#1F5E3B] transition-all space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-0.5 text-[10px] font-black rounded-md border uppercase ${badge.color}`}>
                        {badge.label}
                      </span>
                      <span className="text-xs font-bold text-gray-800">{log.actorName}</span>
                    </div>

                    <span className="text-[10px] font-bold text-gray-400">{log.timestamp}</span>
                  </div>

                  <h4 className="text-xs font-extrabold text-[#17331F]">{log.title}</h4>
                  <p className="text-xs text-[#4A5568] font-medium">{log.details}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default HistoryTab;
