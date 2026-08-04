import React from 'react';
import { Activity, Calendar, CheckCircle2, Clock, Droplets, Database, Users, Sparkles } from 'lucide-react';

const HistoryTab = ({ plantation }) => {
  const p = plantation;

  // Timeline events array
  const defaultHistory = [
    {
      id: '1',
      title: 'Plantation Profile Registered',
      category: 'Registration',
      timestamp: p.createdAt ? new Date(p.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' }) : 'Recent',
      details: `Registered ${p.name} (${p.area || 5} Acres, ${p.variety || 'Njallani'} Variety) in ${p.district || 'Idukki, Kerala'}.`,
      icon: SproutIcon,
      color: 'bg-[#DDEFD9] text-[#1F5E3B]',
    },
    {
      id: '2',
      title: 'IoT Moisture Sensor Telemetry Sync',
      category: 'Sensor',
      timestamp: 'Today, 08:30 AM',
      details: `Automated moisture check: ${p.soil?.moisture ?? p.moisture ?? 72}%. Drip pulse irrigation system active.`,
      icon: Droplets,
      color: 'bg-blue-100 text-blue-700',
    },
    {
      id: '3',
      title: 'Supervisor Field Shift Log Entry',
      category: 'Workforce',
      timestamp: 'Yesterday, 04:15 PM',
      details: `${p.workers?.presentToday ?? 8} Workers completed shade tree branch pruning across North Canopy.`,
      icon: Users,
      color: 'bg-[#DDEFD9] text-[#1F5E3B]',
    },
    {
      id: '4',
      title: 'Bio-Organic Fertilizer Applied',
      category: 'Fertilizer',
      timestamp: '28 Jul 2026',
      details: 'Applied compost and neem cake to replenish soil Nitrogen (N) and Organic Carbon.',
      icon: Database,
      color: 'bg-emerald-100 text-emerald-700',
    },
    {
      id: '5',
      title: 'Micro-Climate Weather Alert Evaluated',
      category: 'Weather',
      timestamp: '25 Jul 2026',
      details: `Weather telemetry evaluated for ${p.district || 'Idukki, Kerala'}. Regional suitability confirmed.`,
      icon: Activity,
      color: 'bg-amber-100 text-amber-700',
    },
  ];

  function SproutIcon(props) {
    return <Sparkles {...props} />;
  }

  const logs = (p.history && Array.isArray(p.history) && p.history.length > 0)
    ? p.history.map((item, idx) => ({
        id: item._id || idx.toString(),
        title: item.title || 'Plantation Activity',
        category: item.category || 'General',
        timestamp: item.timestamp ? new Date(item.timestamp).toLocaleDateString([], { month: 'short', day: 'numeric' }) : 'Recent',
        details: item.details || 'Activity logged in CARDORA system.',
        icon: Activity,
        color: 'bg-[#DDEFD9] text-[#1F5E3B]',
      }))
    : defaultHistory;

  return (
    <div className="space-y-6">
      
      {/* HEADER */}
      <div className="flex items-center justify-between pb-3 border-b border-[#D7E6D5]">
        <div>
          <h3 className="text-lg font-black text-[#17331F] font-poppins flex items-center gap-2">
            <Clock className="w-5 h-5 text-[#5C8D4E]" />
            Plantation Timeline & Historical Audit Trail
          </h3>
          <p className="text-xs text-[#4A5568] font-medium">
            Chronological audit log of all soil updates, worker logs, weather alerts, and harvest events.
          </p>
        </div>

        <span className="text-xs font-bold text-[#1F5E3B] bg-[#DDEFD9] px-3 py-1.5 rounded-full">
          Audit Trail Active 📜
        </span>
      </div>

      {/* TIMELINE VIEW */}
      <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-[#D7E6D5]">
        {logs.map((log) => {
          const Icon = log.icon;
          return (
            <div key={log.id} className="relative flex items-start gap-4 group">
              {/* TIMELINE NODE PIN */}
              <div className={`absolute -left-[23px] top-1 w-5 h-5 rounded-full border-2 border-white flex items-center justify-center shadow-md ${log.color}`}>
                <div className="w-2 h-2 rounded-full bg-current" />
              </div>

              {/* TIMELINE ITEM CARD */}
              <div className="flex-1 p-4 rounded-[20px] bg-white border border-[#D7E6D5] shadow-soft hover:border-[#1F5E3B] transition-all">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-[#F8FAF7] border border-[#D7E6D5] text-[#17331F] uppercase">
                    {log.category}
                  </span>
                  <span className="text-[10px] font-bold text-gray-400">{log.timestamp}</span>
                </div>

                <h4 className="text-xs font-extrabold text-[#17331F] mt-1">{log.title}</h4>
                <p className="text-xs text-[#4A5568] font-medium mt-0.5">{log.details}</p>
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
};

export default HistoryTab;
