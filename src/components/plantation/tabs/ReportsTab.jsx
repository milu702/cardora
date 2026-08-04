import React from 'react';
import { FileText, Download, Printer, ShieldCheck, CheckCircle2, Leaf, Database, CloudSun, Users, DollarSign } from 'lucide-react';

const ReportsTab = ({ plantation }) => {
  const p = plantation;

  const handlePrintReport = (reportType) => {
    window.print();
  };

  const reportsList = [
    {
      id: 'rep_plantation',
      name: 'Comprehensive Plantation Executive Summary',
      type: 'Plantation Report',
      icon: Leaf,
      date: new Date().toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' }),
      description: `Complete overview of ${p.name} (${p.area} Acres, ${p.variety} Variety, Altitude ${p.altitude || 950}m).`,
    },
    {
      id: 'rep_health',
      name: 'Plantation Crop Health & Disease Risk Audit',
      type: 'Health Report',
      icon: ShieldCheck,
      date: new Date().toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' }),
      description: `Health Score: ${p.healthScore ?? 92}%. Fungal infection mitigation & tiller vigor diagnostics.`,
    },
    {
      id: 'rep_soil',
      name: 'Soil Chemistry & NPK Nutrient Telemetry Report',
      type: 'Soil Report',
      icon: Database,
      date: new Date().toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' }),
      description: `Soil pH (${p.soil?.ph || 6.2}), Organic Carbon (${p.soil?.organicCarbon || 1.8}%), and NPK nutrient balance logs.`,
    },
    {
      id: 'rep_weather',
      name: 'High-Altitude Micro-Climate Weather Telemetry Log',
      type: 'Weather Report',
      icon: CloudSun,
      date: new Date().toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' }),
      description: `Historical weather telemetry, rainfall probabilities, and regional suitability ratings for ${p.district || 'Idukki, Kerala'}.`,
    },
    {
      id: 'rep_expense',
      name: 'Plantation Financial & Operational Expense Statement',
      type: 'Expense Report',
      icon: DollarSign,
      date: new Date().toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' }),
      description: `Itemized breakdown of labor wages, fertilizer purchases, equipment, and maintenance costs.`,
    },
    {
      id: 'rep_worker',
      name: 'Workforce Attendance & Supervisor Task Audit Log',
      type: 'Worker Report',
      icon: Users,
      date: new Date().toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' }),
      description: `Daily labor attendance records, shift hours, assigned tasks, and supervisor field remarks.`,
    },
  ];

  return (
    <div className="space-y-6">
      
      {/* HEADER */}
      <div className="flex items-center justify-between pb-3 border-b border-[#D7E6D5]">
        <div>
          <h3 className="text-lg font-black text-[#17331F] font-poppins flex items-center gap-2">
            <FileText className="w-5 h-5 text-[#5C8D4E]" />
            Plantation Intelligence Reports & Documentation Export
          </h3>
          <p className="text-xs text-[#4A5568] font-medium">
            Generate and export official PDF/Print reports for agronomists, bank loans, and plantation audits.
          </p>
        </div>

        <button
          onClick={() => handlePrintReport('All Reports')}
          className="px-4 py-2 rounded-xl bg-[#1F5E3B] text-white text-xs font-bold hover:bg-[#17331F] transition-all flex items-center gap-1.5 shadow-sm"
        >
          <Printer className="w-4 h-4" />
          <span>Print All Reports</span>
        </button>
      </div>

      {/* REPORTS LIST GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {reportsList.map((rep) => {
          const Icon = rep.icon;
          return (
            <div key={rep.id} className="p-5 rounded-[20px] bg-white border border-[#D7E6D5] shadow-soft flex flex-col justify-between space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-extrabold text-[#1F5E3B] bg-[#DDEFD9] px-2.5 py-1 rounded-full uppercase">
                    {rep.type}
                  </span>
                  <span className="text-[10px] font-bold text-gray-400">{rep.date}</span>
                </div>

                <h4 className="text-sm font-extrabold text-[#17331F] flex items-center gap-2">
                  <Icon className="w-4 h-4 text-[#5C8D4E] flex-shrink-0" />
                  <span>{rep.name}</span>
                </h4>
                <p className="text-xs text-[#4A5568] font-medium leading-relaxed">{rep.description}</p>
              </div>

              <div className="pt-3 border-t border-[#D7E6D5] flex items-center justify-between">
                <span className="text-[11px] font-bold text-[#5C8D4E] flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#1F5E3B]" />
                  Verified Cardora Record
                </span>

                <button
                  onClick={() => handlePrintReport(rep.name)}
                  className="px-3.5 py-1.5 rounded-xl border border-[#D7E6D5] text-[#1F5E3B] text-xs font-bold hover:bg-[#DDEFD9]/50 flex items-center gap-1"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Export PDF</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
};

export default ReportsTab;
