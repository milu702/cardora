import React, { useState } from 'react';
import { Users, CheckCircle, Clock, Edit3, UserCheck, AlertCircle, MessageSquare } from 'lucide-react';


const WorkersTab = ({ plantation, onUpdateWorkers }) => {
  const p = plantation;

  const [isEditing, setIsEditing] = useState(false);
  const [workerForm, setWorkerForm] = useState({
    presentToday: p.workers?.presentToday ?? 8,
    totalWorkers: p.workers?.totalWorkers ?? 10,
    workingHours: p.workers?.workingHours ?? 8,
    taskAssigned: p.workers?.taskAssigned || 'Shade Tree Pruning & Drip Line Flushing',
    tasksCompleted: p.workers?.tasksCompleted ?? 4,
    tasksPending: p.workers?.tasksPending ?? 1,
    workProgress: p.workers?.workProgress ?? 80,
    supervisorRemarks: p.workers?.supervisorRemarks || 'All morning tasks completed smoothly across Plot A & B.',
  });

  const handleSave = (e) => {
    e.preventDefault();
    onUpdateWorkers({
      workers: {
        presentToday: Number(workerForm.presentToday),
        totalWorkers: Number(workerForm.totalWorkers),
        workingHours: Number(workerForm.workingHours),
        taskAssigned: workerForm.taskAssigned,
        tasksCompleted: Number(workerForm.tasksCompleted),
        tasksPending: Number(workerForm.tasksPending),
        workProgress: Number(workerForm.workProgress),
        supervisorRemarks: workerForm.supervisorRemarks,
      }
    });
    setIsEditing(false);
  };

  const present = workerForm.presentToday;
  const total = workerForm.totalWorkers;
  const absent = Math.max(0, total - present);
  const progress = workerForm.workProgress;

  return (
    <div className="space-y-6">
      
      {/* HEADER & SUPERVISOR UPDATE ACTION */}
      <div className="flex items-center justify-between pb-3 border-b border-[#D7E6D5]">
        <div>
          <h3 className="text-lg font-black text-[#17331F] font-poppins flex items-center gap-2">
            <Users className="w-5 h-5 text-[#5C8D4E]" />
            Plantation Workforce & Supervisor Task Management
          </h3>
          <p className="text-xs text-[#4A5568] font-medium">
            Daily attendance, task assignment, and work progress telemetry for {p.name}.
          </p>
        </div>

        <button
          onClick={() => setIsEditing(!isEditing)}
          className="px-3.5 py-1.5 rounded-xl bg-[#1F5E3B] text-white text-xs font-bold hover:bg-[#17331F] transition-all flex items-center gap-1.5 shadow-sm"
        >
          <Edit3 className="w-3.5 h-3.5" />
          <span>{isEditing ? 'Cancel Edit' : 'Supervisor Log Entry'}</span>
        </button>
      </div>

      {/* SUPERVISOR LOG EDIT FORM */}
      {isEditing && (
        <form onSubmit={handleSave} className="p-5 rounded-2xl bg-[#DDEFD9]/40 border border-[#5C8D4E]/50 space-y-4">
          <h4 className="text-xs font-extrabold text-[#1F5E3B] uppercase tracking-wider">Supervisor Shift Log Update</h4>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-[#17331F] mb-1">Present Workers Today</label>
              <input
                type="number"
                value={workerForm.presentToday}
                onChange={(e) => setWorkerForm({ ...workerForm, presentToday: e.target.value })}
                className="w-full p-2 rounded-xl text-xs border border-[#D7E6D5] bg-white font-bold"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-[#17331F] mb-1">Total Assigned Crew</label>
              <input
                type="number"
                value={workerForm.totalWorkers}
                onChange={(e) => setWorkerForm({ ...workerForm, totalWorkers: e.target.value })}
                className="w-full p-2 rounded-xl text-xs border border-[#D7E6D5] bg-white font-bold"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-[#17331F] mb-1">Work Progress (%)</label>
              <input
                type="number"
                value={workerForm.workProgress}
                onChange={(e) => setWorkerForm({ ...workerForm, workProgress: e.target.value })}
                className="w-full p-2 rounded-xl text-xs border border-[#D7E6D5] bg-white font-bold"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-[#17331F] mb-1">Working Hours Shift</label>
              <input
                type="number"
                value={workerForm.workingHours}
                onChange={(e) => setWorkerForm({ ...workerForm, workingHours: e.target.value })}
                className="w-full p-2 rounded-xl text-xs border border-[#D7E6D5] bg-white font-bold"
              />
            </div>
            <div className="col-span-2 sm:col-span-4">
              <label className="block text-[11px] font-bold text-[#17331F] mb-1">Assigned Plantation Task</label>
              <input
                type="text"
                value={workerForm.taskAssigned}
                onChange={(e) => setWorkerForm({ ...workerForm, taskAssigned: e.target.value })}
                className="w-full p-2 rounded-xl text-xs border border-[#D7E6D5] bg-white font-medium"
              />
            </div>
            <div className="col-span-2 sm:col-span-4">
              <label className="block text-[11px] font-bold text-[#17331F] mb-1">Supervisor Remarks</label>
              <input
                type="text"
                value={workerForm.supervisorRemarks}
                onChange={(e) => setWorkerForm({ ...workerForm, supervisorRemarks: e.target.value })}
                className="w-full p-2 rounded-xl text-xs border border-[#D7E6D5] bg-white font-medium"
              />
            </div>
            <div className="col-span-2 sm:col-span-4 flex justify-end">
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-[#1F5E3B] text-white text-xs font-bold hover:bg-[#17331F]"
              >
                Save Supervisor Entry
              </button>
            </div>
          </div>
        </form>
      )}

      {/* SUMMARY WORKFORCE METRICS */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        
        <div className="p-4 rounded-2xl bg-white border border-[#D7E6D5] shadow-soft">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-bold text-[#4A5568]">Present Workers</span>
            <UserCheck className="w-4 h-4 text-[#1F5E3B]" />
          </div>
          <span className="text-2xl font-black text-[#17331F] font-poppins">{present}</span>
          <span className="text-[10px] font-bold text-[#5C8D4E] block mt-0.5">Out of {total} Total Crew</span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-[#D7E6D5] shadow-soft">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-bold text-[#4A5568]">Absent Workers</span>
            <AlertCircle className="w-4 h-4 text-amber-500" />
          </div>
          <span className="text-2xl font-black text-amber-600 font-poppins">{absent}</span>
          <span className="text-[10px] font-bold text-gray-500 block mt-0.5">On Leave / Off-shift</span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-[#D7E6D5] shadow-soft">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-bold text-[#4A5568]">Completed Tasks</span>
            <CheckCircle className="w-4 h-4 text-[#5C8D4E]" />
          </div>
          <span className="text-2xl font-black text-[#1F5E3B] font-poppins">{workerForm.tasksCompleted}</span>
          <span className="text-[10px] font-bold text-[#5C8D4E] block mt-0.5">{workerForm.tasksPending} Tasks Pending</span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-[#D7E6D5] shadow-soft">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-bold text-[#4A5568]">Shift Progress</span>
            <Clock className="w-4 h-4 text-[#1F5E3B]" />
          </div>
          <span className="text-2xl font-black text-[#17331F] font-poppins">{progress}%</span>
          <div className="w-full bg-gray-200 h-1.5 rounded-full mt-1.5 overflow-hidden">
            <div className="bg-[#1F5E3B] h-full rounded-full" style={{ width: `${progress}%` }} />
          </div>
        </div>

      </div>

      {/* TASK ASSIGNMENT & SUPERVISOR REMARKS CARD */}
      <div className="p-5 rounded-[20px] bg-white border border-[#D7E6D5] shadow-soft space-y-4">
        <h4 className="text-sm font-extrabold text-[#17331F] flex items-center gap-2 border-b border-[#D7E6D5] pb-3">
          <MessageSquare className="w-4 h-4 text-[#5C8D4E]" />
          Today's Task Assignment & Supervisor Log
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 rounded-xl bg-[#F8FAF7] border border-[#D7E6D5] space-y-2">
            <span className="text-xs font-bold text-[#4A5568] block uppercase">Assigned Task Overview</span>
            <p className="text-sm font-black text-[#17331F]">{workerForm.taskAssigned}</p>
            <span className="text-xs font-semibold text-[#5C8D4E] block">Shift Hours: {workerForm.workingHours} Hours / Day</span>
          </div>

          <div className="p-4 rounded-xl bg-[#F8FAF7] border border-[#D7E6D5] space-y-2">
            <span className="text-xs font-bold text-[#4A5568] block uppercase">Supervisor Field Remarks</span>
            <p className="text-xs font-bold text-[#17331F] italic">"{workerForm.supervisorRemarks}"</p>
            <span className="text-[10px] font-bold text-gray-500 block">Logged by Estate Supervisor</span>
          </div>
        </div>
      </div>

    </div>
  );
};

export default WorkersTab;
