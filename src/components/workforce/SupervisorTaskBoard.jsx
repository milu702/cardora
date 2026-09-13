import React, { useState, useEffect, useCallback } from 'react';
import {
  CheckSquare,
  Clock,
  AlertCircle,
  Plus,
  CheckCircle,
  Play,
  Send,
  Calendar,
  User,
  ShieldCheck,
} from 'lucide-react';
import apiService from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const SupervisorTaskBoard = ({ plantationId, showToast }) => {
  const { user } = useAuth();
  const isSupervisor = (user?.role || '').toLowerCase() === 'supervisor';

  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);

  // Task Modal State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [taskForm, setTaskForm] = useState({
    title: '',
    description: '',
    priority: 'High',
    deadline: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    requiredWorkersCount: 5,
    dailyWage: 850,
  });

  // Progress Update Modal State
  const [showProgressModal, setShowProgressModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [progressText, setProgressText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const loadTasks = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiService.getTasks();
      if (res && res.success && Array.isArray(res.tasks)) {
        setTasks(res.tasks);
      }
    } catch (err) {
      console.error('Error loading tasks:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  const handleCreateTask = async (e) => {
    e.preventDefault();
    if (!taskForm.title.trim() || !taskForm.description.trim()) {
      if (showToast) showToast('Please enter task title and description.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await apiService.createTask({
        ...taskForm,
        plantationId,
      });

      if (res && res.success) {
        if (showToast) showToast('🎉 Task assigned to supervisor!');
        setShowCreateModal(false);
        setTaskForm({
          title: '',
          description: '',
          priority: 'High',
          deadline: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          requiredWorkersCount: 5,
          dailyWage: 850,
        });
        loadTasks();
      } else {
        if (showToast) showToast(`❌ ${res?.message || 'Failed to create task'}`);
      }
    } catch (err) {
      if (showToast) showToast(`❌ Error: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateStatus = async (taskId, newStatus, text = '') => {
    try {
      const res = await apiService.updateTaskStatus(taskId, newStatus, text);
      if (res && res.success) {
        if (showToast) showToast(`🎉 Task state updated to ${newStatus.replace('_', ' ')}`);
        setShowProgressModal(false);
        loadTasks();
      } else {
        if (showToast) showToast(`❌ ${res?.message || 'Failed to update task status'}`);
      }
    } catch (err) {
      if (showToast) showToast(`❌ Error: ${err.message}`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-[#17331F] p-6 rounded-3xl text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-emerald-400 font-bold text-xs uppercase tracking-wider flex items-center gap-1.5">
            <CheckSquare className="w-4 h-4" />
            <span>Task Management System</span>
          </span>
          <h1 className="text-2xl font-black mt-1">Assigned Tasks & Execution Progress</h1>
          <p className="text-xs text-emerald-200/80 mt-1">
            Owner-assigned field tasks, priority tracking, state transitions, and real progress updates
          </p>
        </div>

        {!isSupervisor && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-white rounded-2xl text-xs font-bold shadow-lg shadow-emerald-500/30 flex items-center space-x-2 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>+ Assign New Task</span>
          </button>
        )}
      </div>

      {/* Tasks List */}
      <div className="bg-white dark:bg-[#1E293B] p-6 rounded-3xl shadow-xl border border-emerald-100 dark:border-gray-800 space-y-4">
        <h2 className="text-base font-black text-gray-900 dark:text-white flex items-center gap-2">
          <CheckSquare className="w-5 h-5 text-emerald-600" />
          Active Plantation Tasks ({tasks.length})
        </h2>

        {loading ? (
          <div className="py-8 text-center text-gray-400 text-sm">Loading tasks...</div>
        ) : tasks.length === 0 ? (
          <div className="py-12 text-center text-gray-500 space-y-3">
            <p className="text-sm font-bold">No tasks assigned.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {tasks.map((task) => {
              const statusColor =
                task.status === 'completed'
                  ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                  : task.status === 'in_progress'
                  ? 'bg-blue-100 text-blue-800 border-blue-300'
                  : 'bg-amber-100 text-amber-800 border-amber-300';

              return (
                <div
                  key={task._id}
                  className="p-5 bg-gray-50 dark:bg-gray-800/60 rounded-3xl border border-gray-100 dark:border-gray-700/60 flex flex-col justify-between space-y-4"
                >
                  <div>
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="px-2 py-0.5 bg-red-100 text-red-800 text-[10px] font-black rounded-md uppercase">
                          Priority: {task.priority}
                        </span>
                        <h3 className="text-base font-black text-gray-900 dark:text-white mt-1.5">{task.title}</h3>
                      </div>

                      <span className={`px-2.5 py-1 text-[10px] font-black rounded-full border uppercase ${statusColor}`}>
                        {task.status.replace('_', ' ')}
                      </span>
                    </div>

                    <p className="text-xs text-gray-600 dark:text-gray-300 mt-2 line-clamp-2">{task.description}</p>

                    <div className="mt-4 flex items-center justify-between text-xs text-gray-500 font-medium">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-emerald-600" />
                        Due: {new Date(task.deadline).toLocaleDateString()}
                      </span>
                      <span>Workers: {task.requiredWorkersCount || 5}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="pt-3 border-t border-gray-200 dark:border-gray-700 flex flex-wrap items-center justify-between gap-2 text-xs font-bold">
                    {task.status === 'pending' && (
                      <button
                        onClick={() => handleUpdateStatus(task._id, 'in_progress', 'Accepted & Started Task')}
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl flex items-center gap-1.5"
                      >
                        <Play className="w-3.5 h-3.5" />
                        <span>Accept & Start Task</span>
                      </button>
                    )}

                    {task.status === 'in_progress' && (
                      <>
                        <button
                          onClick={() => {
                            setSelectedTask(task);
                            setShowProgressModal(true);
                          }}
                          className="px-3 py-1.5 bg-blue-50 text-blue-700 rounded-xl hover:bg-blue-100 flex items-center gap-1"
                        >
                          <Send className="w-3.5 h-3.5" />
                          <span>Add Progress</span>
                        </button>

                        <button
                          onClick={() => handleUpdateStatus(task._id, 'completed', 'Completed Task Successfully')}
                          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl flex items-center gap-1.5"
                        >
                          <CheckCircle className="w-3.5 h-3.5" />
                          <span>Mark Completed</span>
                        </button>
                      </>
                    )}

                    {task.status === 'completed' && (
                      <span className="text-emerald-700 font-black flex items-center gap-1 text-xs">
                        <CheckCircle className="w-4 h-4" />
                        Completed & Verified
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Create Task Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white dark:bg-[#1E293B] w-full max-w-lg rounded-3xl shadow-2xl border border-emerald-100 overflow-hidden">
            <div className="px-6 py-5 bg-[#17331F] text-white flex items-center justify-between">
              <h3 className="text-lg font-bold">Assign New Task</h3>
              <button onClick={() => setShowCreateModal(false)} className="text-white/80 hover:text-white">
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateTask} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">Task Title *</label>
                <input
                  type="text"
                  required
                  value={taskForm.title}
                  onChange={(e) => setTaskForm((prev) => ({ ...prev, title: e.target.value }))}
                  placeholder="e.g. Fertilizer Application — Block A"
                  className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">Task Description *</label>
                <textarea
                  rows="3"
                  required
                  value={taskForm.description}
                  onChange={(e) => setTaskForm((prev) => ({ ...prev, description: e.target.value }))}
                  placeholder="Detailed instructions for the supervisor..."
                  className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white outline-none"
                ></textarea>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">Priority</label>
                  <select
                    value={taskForm.priority}
                    onChange={(e) => setTaskForm((prev) => ({ ...prev, priority: e.target.value }))}
                    className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl font-bold"
                  >
                    <option value="Low">Low Priority</option>
                    <option value="Medium">Medium Priority</option>
                    <option value="High">High Priority</option>
                    <option value="Urgent">Urgent Priority</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">Due Date *</label>
                  <input
                    type="date"
                    required
                    value={taskForm.deadline}
                    onChange={(e) => setTaskForm((prev) => ({ ...prev, deadline: e.target.value }))}
                    className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl font-bold"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-xl font-bold text-gray-600 hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2 rounded-xl font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-md"
                >
                  {submitting ? 'Assigning...' : 'Assign Task'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Progress Update Modal */}
      {showProgressModal && selectedTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white dark:bg-[#1E293B] w-full max-w-md rounded-3xl shadow-2xl border border-emerald-100 overflow-hidden">
            <div className="px-6 py-5 bg-[#17331F] text-white flex items-center justify-between">
              <h3 className="text-base font-bold">Add Task Progress Update</h3>
              <button onClick={() => setShowProgressModal(false)} className="text-white/80 hover:text-white">
                ✕
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <p className="font-bold text-gray-700">Updating progress for: {selectedTask.title}</p>
              <textarea
                rows="3"
                value={progressText}
                onChange={(e) => setProgressText(e.target.value)}
                placeholder="Enter progress notes (e.g., 50% completed, North Block done)..."
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none"
              ></textarea>

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowProgressModal(false)}
                  className="px-4 py-2 rounded-xl font-bold text-gray-600 hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => handleUpdateStatus(selectedTask._id, 'in_progress', progressText)}
                  className="px-6 py-2 rounded-xl font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-md"
                >
                  Submit Update
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SupervisorTaskBoard;
