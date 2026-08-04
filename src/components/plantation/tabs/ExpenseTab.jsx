import React, { useState } from 'react';
import { DollarSign, Plus, Layers, Calendar, Trash2, PieChart, TrendingUp } from 'lucide-react';

const ExpenseTab = ({ plantation, onAddExpense }) => {
  const p = plantation;

  const [expenses, setExpenses] = useState(p.expenses || [
    { id: '1', title: 'Bio-Organic Fertilizer Application', amount: 4500, category: 'Fertilizer', date: '2026-07-28', notes: 'Neem cake and compost.' },
    { id: '2', title: 'Weekly Labor Wages', amount: 12000, category: 'Labour', date: '2026-08-01', notes: '8 Workers for weeding and shade pruning.' },
    { id: '3', title: 'Drip Pipe & Sprinkler Nozzle Replacement', amount: 2800, category: 'Equipment', date: '2026-08-03', notes: 'Replaced 4 damaged nozzles.' },
  ]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState({
    title: '',
    amount: '',
    category: 'Labour',
    notes: '',
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.title || !form.amount) return;

    const newExp = {
      id: Date.now().toString(),
      title: form.title,
      amount: Number(form.amount),
      category: form.category,
      date: new Date().toISOString().split('T')[0],
      notes: form.notes,
    };

    setExpenses([newExp, ...expenses]);
    if (onAddExpense) {
      onAddExpense(newExp);
    }
    setForm({ title: '', amount: '', category: 'Labour', notes: '' });
    setIsModalOpen(false);
  };

  const totalExpense = expenses.reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);

  // Categorical Breakdown
  const categoryTotals = expenses.reduce((acc, curr) => {
    const cat = curr.category || 'Miscellaneous';
    acc[cat] = (acc[cat] || 0) + Number(curr.amount);
    return acc;
  }, {});

  const categories = ['Labour', 'Fertilizer', 'Medicine', 'Equipment', 'Transportation', 'Miscellaneous'];

  return (
    <div className="space-y-6">
      
      {/* HEADER & ADD EXPENSE BUTTON */}
      <div className="flex items-center justify-between pb-3 border-b border-[#D7E6D5]">
        <div>
          <h3 className="text-lg font-black text-[#17331F] font-poppins flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-[#5C8D4E]" />
            Plantation Expense Tracker & Financial Analytics
          </h3>
          <p className="text-xs text-[#4A5568] font-medium">
            Monitor plantation operational costs, labor wages, fertilizers, and equipment expenses for {p.name}.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2 rounded-xl bg-[#1F5E3B] text-white text-xs font-extrabold hover:bg-[#17331F] transition-all flex items-center gap-1.5 shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Expense</span>
        </button>
      </div>

      {/* TOTAL COST & CATEGORY CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-[20px] bg-[#17331F] text-white shadow-soft">
          <span className="text-xs font-bold text-[#DDEFD9] block">Total Plantation Expenditure</span>
          <span className="text-3xl font-black font-poppins text-white block mt-1">₹{totalExpense.toLocaleString()}</span>
          <span className="text-[10px] font-bold text-[#C9A227] block mt-1">Across {expenses.length} Expense Records</span>
        </div>

        <div className="p-5 rounded-[20px] bg-white border border-[#D7E6D5] shadow-soft flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-[#4A5568] block">Largest Expense Category</span>
            <span className="text-xl font-black text-[#17331F] block mt-1">
              {Object.keys(categoryTotals).reduce((a, b) => (categoryTotals[a] > categoryTotals[b] ? a : b), 'Labour')}
            </span>
          </div>
          <PieChart className="w-8 h-8 text-[#1F5E3B]" />
        </div>

        <div className="p-5 rounded-[20px] bg-white border border-[#D7E6D5] shadow-soft flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-[#4A5568] block">Monthly Operational Average</span>
            <span className="text-xl font-black text-[#1F5E3B] block mt-1">₹{Math.round(totalExpense / 1.5).toLocaleString()} / Mo</span>
          </div>
          <TrendingUp className="w-8 h-8 text-[#5C8D4E]" />
        </div>
      </div>

      {/* CATEGORY BREAKDOWN PROGRESS BARS */}
      <div className="p-5 rounded-[20px] bg-white border border-[#D7E6D5] shadow-soft space-y-4">
        <h4 className="text-sm font-extrabold text-[#17331F] flex items-center justify-between border-b border-[#D7E6D5] pb-3">
          <span>Expense Breakdown by Category</span>
          <span className="text-xs font-bold text-[#5C8D4E]">Financial Summary</span>
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((cat) => {
            const amt = categoryTotals[cat] || 0;
            const pct = totalExpense > 0 ? Math.round((amt / totalExpense) * 100) : 0;
            return (
              <div key={cat} className="p-3 rounded-xl bg-[#F8FAF7] border border-[#D7E6D5] space-y-1.5">
                <div className="flex items-center justify-between text-xs font-bold text-[#17331F]">
                  <span>{cat}</span>
                  <span>₹{amt.toLocaleString()} ({pct}%)</span>
                </div>
                <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
                  <div className="bg-[#1F5E3B] h-full rounded-full" style={{ width: `${pct}%` }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* EXPENSE RECORDS TABLE */}
      <div className="bg-white rounded-[20px] border border-[#D7E6D5] shadow-soft overflow-hidden">
        <div className="p-4 bg-[#F8FAF7] border-b border-[#D7E6D5] flex items-center justify-between">
          <h4 className="text-sm font-extrabold text-[#17331F]">Recent Plantation Expense Logs</h4>
          <span className="text-xs font-bold text-[#4A5568]">{expenses.length} Logged Items</span>
        </div>

        <div className="divide-y divide-[#D7E6D5]">
          {expenses.map((item) => (
            <div key={item.id} className="p-4 flex items-center justify-between hover:bg-[#F8FAF7] transition-colors">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-[#DDEFD9] text-[#1F5E3B]">
                  <DollarSign className="w-4 h-4" />
                </div>
                <div>
                  <h5 className="text-xs font-extrabold text-[#17331F]">{item.title}</h5>
                  <p className="text-[11px] text-[#4A5568] font-medium">{item.notes || 'No extra notes'}</p>
                </div>
              </div>

              <div className="text-right">
                <span className="text-sm font-black text-[#1F5E3B] block">₹{Number(item.amount).toLocaleString()}</span>
                <span className="text-[10px] font-bold text-gray-500 block">{item.category} • {item.date}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ADD EXPENSE MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-[24px] border border-[#D7E6D5] p-6 w-full max-w-md shadow-2xl space-y-4">
            <h4 className="text-base font-extrabold text-[#17331F]">Add Plantation Expense</h4>
            
            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-[#17331F] mb-1">Expense Title *</label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="e.g. Bio-Fungicide Spray Purchase"
                  className="w-full p-2.5 rounded-xl text-xs border border-[#D7E6D5] bg-[#F8FAF7]"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#17331F] mb-1">Amount (₹) *</label>
                <input
                  type="number"
                  value={form.amount}
                  onChange={(e) => setForm({ ...form, amount: e.target.value })}
                  placeholder="3500"
                  className="w-full p-2.5 rounded-xl text-xs border border-[#D7E6D5] bg-[#F8FAF7]"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#17331F] mb-1">Category</label>
                <select
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className="w-full p-2.5 rounded-xl text-xs font-bold border border-[#D7E6D5] bg-[#F8FAF7]"
                >
                  {categories.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#17331F] mb-1">Notes / Description</label>
                <input
                  type="text"
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  placeholder="e.g. 5 Liters Organic Neem Spray"
                  className="w-full p-2.5 rounded-xl text-xs border border-[#D7E6D5] bg-[#F8FAF7]"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-[#D7E6D5] text-xs font-bold text-[#4A5568]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-[#1F5E3B] text-white text-xs font-bold hover:bg-[#17331F]"
                >
                  Save Expense
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default ExpenseTab;
