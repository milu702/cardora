import React, { useState, useEffect } from 'react';
import { X, Star, Award, MessageSquare, Save, AlertCircle } from 'lucide-react';
import apiService from '../../services/api';

const StarRatingModal = ({ isOpen, onClose, worker, plantationId, onRatingSaved, showToast }) => {
  const [ratings, setRatings] = useState({
    workQuality: 5,
    punctuality: 5,
    teamwork: 5,
    productivity: 5,
  });
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [history, setHistory] = useState([]);

  useEffect(() => {
    const loadRatingHistory = async () => {
      if (!isOpen || !worker) return;
      try {
        const res = await apiService.getSupervisorWorkerRatings(worker._id);
        if (res.success && res.ratings) {
          setHistory(res.ratings);
        }
      } catch (err) {
        console.error('Error fetching rating history:', err);
      }
    };

    loadRatingHistory();
  }, [isOpen, worker]);

  if (!isOpen || !worker) return null;

  const handleCategoryRating = (category, value) => {
    setRatings((prev) => ({
      ...prev,
      [category]: value,
    }));
  };

  const overallRating = (
    (ratings.workQuality + ratings.punctuality + ratings.teamwork + ratings.productivity) /
    4
  ).toFixed(1);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const payload = {
        workerId: worker._id,
        plantationId,
        workQuality: ratings.workQuality,
        punctuality: ratings.punctuality,
        teamwork: ratings.teamwork,
        productivity: ratings.productivity,
        comment,
      };

      const res = await apiService.submitSupervisorWorkerRating(payload);
      if (res.success) {
        if (showToast) showToast(`⭐ Rating saved! Overall: ${overallRating}/5`);
        if (onRatingSaved) onRatingSaved();
        onClose();
      } else {
        setError(res.message || 'Failed to save rating');
      }
    } catch (err) {
      setError(err.message || 'Error saving rating');
    } finally {
      setLoading(false);
    }
  };

  const renderStars = (category, currentVal) => (
    <div className="flex items-center space-x-1.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => handleCategoryRating(category, star)}
          className="p-1 hover:scale-125 transition-transform text-amber-400 focus:outline-none"
        >
          <Star
            className={`w-6 h-6 ${
              star <= currentVal
                ? 'fill-amber-400 text-amber-400 drop-shadow-sm'
                : 'text-gray-300 dark:text-gray-600'
            }`}
          />
        </button>
      ))}
      <span className="text-xs font-bold text-gray-700 dark:text-gray-300 ml-2">{currentVal}/5</span>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white dark:bg-[#1E293B] w-full max-w-lg rounded-3xl shadow-2xl border border-emerald-100 dark:border-gray-800 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-5 bg-gradient-to-r from-[#17331F] to-[#2C5E3B] text-white flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-amber-500/20 rounded-xl border border-amber-400/30">
              <Award className="w-6 h-6 text-amber-300" />
            </div>
            <div>
              <h3 className="text-xl font-bold">Worker Performance Rating</h3>
              <p className="text-xs text-emerald-200/80">
                {worker.fullName} ({worker.workerId})
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-white/10 text-white/80 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-6 flex-1">
          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-600 dark:text-red-400 text-sm flex items-center space-x-2">
              <AlertCircle className="w-4 h-4" />
              <span>{error}</span>
            </div>
          )}

          {/* Overall Rating Display Banner */}
          <div className="p-4 bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-amber-500/10 rounded-2xl border border-amber-500/20 flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-amber-700 dark:text-amber-300 uppercase tracking-wider">
                Calculated Overall Score
              </span>
              <div className="text-2xl font-black text-amber-600 dark:text-amber-400 flex items-center gap-2 mt-0.5">
                <span>{overallRating} / 5.0</span>
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star
                      key={s}
                      className={`w-4 h-4 ${
                        s <= Math.round(overallRating)
                          ? 'fill-amber-400 text-amber-400'
                          : 'text-gray-300 dark:text-gray-600'
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>
            <div className="text-right">
              <span className="text-xs text-gray-500 dark:text-gray-400">Current Average</span>
              <p className="text-sm font-bold text-gray-900 dark:text-white">
                ★ {worker.rating || 4.5} / 5
              </p>
            </div>
          </div>

          {/* 4 Rating Categories */}
          <div className="space-y-4 bg-gray-50 dark:bg-gray-800/60 p-4 rounded-2xl border border-gray-100 dark:border-gray-700/60">
            {/* Work Quality */}
            <div className="flex items-center justify-between pb-3 border-b border-gray-200/60 dark:border-gray-700/60">
              <div>
                <h4 className="text-xs font-bold text-gray-900 dark:text-white">Work Quality</h4>
                <p className="text-[11px] text-gray-500">Care in capsule picking & sorting</p>
              </div>
              {renderStars('workQuality', ratings.workQuality)}
            </div>

            {/* Punctuality */}
            <div className="flex items-center justify-between pb-3 border-b border-gray-200/60 dark:border-gray-700/60">
              <div>
                <h4 className="text-xs font-bold text-gray-900 dark:text-white">Punctuality</h4>
                <p className="text-[11px] text-gray-500">On-time arrival & shift discipline</p>
              </div>
              {renderStars('punctuality', ratings.punctuality)}
            </div>

            {/* Teamwork */}
            <div className="flex items-center justify-between pb-3 border-b border-gray-200/60 dark:border-gray-700/60">
              <div>
                <h4 className="text-xs font-bold text-gray-900 dark:text-white">Teamwork</h4>
                <p className="text-[11px] text-gray-500">Cooperation with fellow workers</p>
              </div>
              {renderStars('teamwork', ratings.teamwork)}
            </div>

            {/* Productivity */}
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold text-gray-900 dark:text-white">Productivity</h4>
                <p className="text-[11px] text-gray-500">Daily harvest yield & speed</p>
              </div>
              {renderStars('productivity', ratings.productivity)}
            </div>
          </div>

          {/* Supervisor Comments */}
          <div>
            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5 flex items-center gap-1.5">
              <MessageSquare className="w-4 h-4 text-emerald-600" />
              <span>Supervisor Remarks / Feedback (Optional)</span>
            </label>
            <textarea
              rows="3"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="e.g. Excellent harvest quality today, careful handling of delicate capsules."
              className="w-full p-3 text-xs bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none"
            />
          </div>

          {/* Previous Ratings History Log */}
          {history.length > 0 && (
            <div className="pt-2">
              <h4 className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-2">
                Recent Rating History ({history.length})
              </h4>
              <div className="space-y-2 max-h-36 overflow-y-auto">
                {history.slice(0, 3).map((h, i) => (
                  <div
                    key={i}
                    className="p-2.5 bg-gray-50 dark:bg-gray-800 rounded-xl text-xs flex items-center justify-between"
                  >
                    <div>
                      <span className="font-bold text-gray-900 dark:text-white">{h.date}</span>
                      <p className="text-[10px] text-gray-500">{h.comment || 'No comment'}</p>
                    </div>
                    <span className="font-black text-amber-500 text-xs">★ {h.overallRating}/5</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Modal Actions */}
          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-100 dark:border-gray-800">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl text-sm font-semibold text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 shadow-lg shadow-amber-500/20 disabled:opacity-50 transition-all flex items-center space-x-2"
            >
              <Save className="w-4 h-4" />
              <span>{loading ? 'Saving...' : 'Submit Rating'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default StarRatingModal;
