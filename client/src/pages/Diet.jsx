import React, { useState, useEffect } from 'react';
import API from '../services/api';
import { useToast } from '../context/ToastContext';
import ConfirmationModal from '../components/common/ConfirmationModal';
import LoadingSkeleton from '../components/common/LoadingSkeleton';
import {
  UtensilsCrossed,
  Plus,
  Trash2,
  Edit3,
  Calendar,
  Flame,
  PieChart as PieIcon,
  ChevronRight,
  X
} from 'lucide-react';

const MEAL_TYPES = ['Breakfast', 'Lunch', 'Dinner', 'Snacks', 'Pre Workout', 'Post Workout', 'Supplements'];

export default function Diet() {
  const { showToast } = useToast();
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [dietData, setDietData] = useState({ items: [], summary: { totalCalories: 0, totalProtein: 0, totalCarbs: 0, totalFat: 0 } });
  const [loading, setLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [deleteTargetId, setDeleteTargetId] = useState(null);

  // Form Inputs
  const [mealType, setMealType] = useState('Breakfast');
  const [foodName, setFoodName] = useState('');
  const [quantity, setQuantity] = useState('1 serving');
  const [calories, setCalories] = useState('');
  const [protein, setProtein] = useState('');
  const [carbs, setCarbs] = useState('');
  const [fat, setFat] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    fetchDietNotes();
  }, [selectedDate]);

  const fetchDietNotes = async () => {
    try {
      setLoading(true);
      const res = await API.get(`/diet?date=${selectedDate}`);
      setDietData(res.data || { items: [], summary: { totalCalories: 0, totalProtein: 0, totalCarbs: 0, totalFat: 0 } });
    } catch (err) {
      showToast('Error loading diet notes', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreateModal = (type = 'Breakfast') => {
    setEditingItem(null);
    setMealType(type);
    setFoodName('');
    setQuantity('1 serving');
    setCalories('');
    setProtein('');
    setCarbs('');
    setFat('');
    setNotes('');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (item) => {
    setEditingItem(item);
    setMealType(item.mealType);
    setFoodName(item.foodName);
    setQuantity(item.quantity);
    setCalories(item.calories);
    setProtein(item.protein);
    setCarbs(item.carbs);
    setFat(item.fat);
    setNotes(item.notes || '');
    setIsModalOpen(true);
  };

  const handleSaveItem = async (e) => {
    e.preventDefault();
    if (!foodName.trim()) {
      showToast('Food name is required', 'error');
      return;
    }

    try {
      const payload = {
        mealType,
        foodName,
        quantity,
        calories: calories ? parseFloat(calories) : 0,
        protein: protein ? parseFloat(protein) : 0,
        carbs: carbs ? parseFloat(carbs) : 0,
        fat: fat ? parseFloat(fat) : 0,
        notes,
        date: selectedDate
      };

      if (editingItem) {
        await API.put(`/diet/${editingItem.id}`, payload);
        showToast('Meal record updated', 'success');
      } else {
        await API.post('/diet', payload);
        showToast('Meal logged successfully', 'success');
      }

      setIsModalOpen(false);
      fetchDietNotes();
    } catch (err) {
      showToast('Error saving meal record', 'error');
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTargetId) return;
    try {
      await API.delete(`/diet/${deleteTargetId}`);
      showToast('Meal entry deleted', 'success');
      setDeleteTargetId(null);
      fetchDietNotes();
    } catch (err) {
      showToast('Failed to delete meal entry', 'error');
    }
  };

  const itemsByMealType = MEAL_TYPES.reduce((acc, type) => {
    acc[type] = (dietData.items || []).filter(item => item.mealType === type);
    return acc;
  }, {});

  const { summary } = dietData;

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header & Date Picker */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2.5">
            <UtensilsCrossed className="w-7 h-7 text-amber-400" /> Diet & Nutrition Notes
          </h1>
          <p className="text-sm text-slate-400">Track daily meal logs, macronutrients (Protein, Carbs, Fat) and calories</p>
        </div>

        <div className="flex items-center gap-3 self-start sm:self-auto">
          <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-200 text-xs">
            <Calendar className="w-4 h-4 text-emerald-400" />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="bg-transparent text-slate-100 focus:outline-none cursor-pointer"
            />
          </div>
          <button
            onClick={() => handleOpenCreateModal()}
            className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-xs rounded-xl shadow-lg shadow-emerald-500/20 flex items-center gap-1.5 transition-all"
          >
            <Plus className="w-4 h-4" /> Add Food Item
          </button>
        </div>
      </div>

      {/* Macronutrient Summary Cards Bar */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-card">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Total Calories</span>
          <div className="text-2xl font-extrabold text-amber-400 mt-1">
            {summary.totalCalories} <span className="text-xs text-slate-400 font-normal">kcal</span>
          </div>
        </div>

        <div className="glass-card">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Protein Intake</span>
          <div className="text-2xl font-extrabold text-emerald-400 mt-1">
            {summary.totalProtein} <span className="text-xs text-slate-400 font-normal">g</span>
          </div>
        </div>

        <div className="glass-card">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Carbohydrates</span>
          <div className="text-2xl font-extrabold text-sky-400 mt-1">
            {summary.totalCarbs} <span className="text-xs text-slate-400 font-normal">g</span>
          </div>
        </div>

        <div className="glass-card">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Fats Intake</span>
          <div className="text-2xl font-extrabold text-purple-400 mt-1">
            {summary.totalFat} <span className="text-xs text-slate-400 font-normal">g</span>
          </div>
        </div>
      </div>

      {/* Categorized Meal Sections */}
      {loading ? (
        <div className="space-y-4">
          <LoadingSkeleton className="h-28" />
          <LoadingSkeleton className="h-28" />
          <LoadingSkeleton className="h-28" />
        </div>
      ) : (
        <div className="space-y-6">
          {MEAL_TYPES.map((type) => {
            const items = itemsByMealType[type] || [];
            const typeCalories = items.reduce((acc, i) => acc + i.calories, 0);

            return (
              <div key={type} className="glass-panel p-5">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
                  <div className="flex items-center gap-3">
                    <h3 className="text-base font-bold text-slate-100">{type}</h3>
                    <span className="px-2.5 py-0.5 rounded-full bg-slate-800 text-amber-400 text-xs font-semibold">
                      {typeCalories} kcal
                    </span>
                  </div>
                  <button
                    onClick={() => handleOpenCreateModal(type)}
                    className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add to {type}
                  </button>
                </div>

                {items.length === 0 ? (
                  <p className="text-xs text-slate-500 italic py-2">No food items logged under {type}.</p>
                ) : (
                  <div className="divide-y divide-slate-800/60">
                    {items.map((item) => (
                      <div key={item.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 group">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-slate-200 text-sm">{item.foodName}</span>
                            <span className="text-xs text-slate-400">({item.quantity})</span>
                          </div>
                          {item.notes && <p className="text-xs text-slate-500 mt-0.5">{item.notes}</p>}
                        </div>

                        <div className="flex items-center gap-4 text-xs">
                          <div className="flex items-center gap-3 text-slate-400">
                            <span className="text-amber-400 font-semibold">{item.calories} kcal</span>
                            <span>P: <strong className="text-emerald-400">{item.protein}g</strong></span>
                            <span>C: <strong className="text-sky-400">{item.carbs}g</strong></span>
                            <span>F: <strong className="text-purple-400">{item.fat}g</strong></span>
                          </div>

                          <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => handleOpenEditModal(item)}
                              className="p-1 text-slate-500 hover:text-emerald-400 rounded"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => setDeleteTargetId(item.id)}
                              className="p-1 text-slate-500 hover:text-rose-400 rounded"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Modal Form for Food Item */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-lg font-bold text-slate-100">
                {editingItem ? 'Edit Meal Item' : 'Log Food Item'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="p-1.5 text-slate-400 hover:text-white rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveItem} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-300 mb-1">Meal Section</label>
                  <select
                    value={mealType}
                    onChange={(e) => setMealType(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-slate-100 focus:outline-none"
                  >
                    {MEAL_TYPES.map(t => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-300 mb-1">Quantity</label>
                  <input
                    type="text"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    placeholder="e.g. 250g / 1 bowl"
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-slate-100 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-300 mb-1">Food Name</label>
                <input
                  type="text"
                  required
                  value={foodName}
                  onChange={(e) => setFoodName(e.target.value)}
                  placeholder="e.g. Grilled Chicken Breast"
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-slate-100 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-4 gap-2 text-xs">
                <div>
                  <span className="text-[10px] text-slate-400">Calories (kcal)</span>
                  <input
                    type="number"
                    value={calories}
                    onChange={(e) => setCalories(e.target.value)}
                    className="w-full px-2 py-1.5 bg-slate-800 border border-slate-700 rounded text-center text-slate-100"
                  />
                </div>
                <div>
                  <span className="text-[10px] text-slate-400">Protein (g)</span>
                  <input
                    type="number"
                    value={protein}
                    onChange={(e) => setProtein(e.target.value)}
                    className="w-full px-2 py-1.5 bg-slate-800 border border-slate-700 rounded text-center text-slate-100"
                  />
                </div>
                <div>
                  <span className="text-[10px] text-slate-400">Carbs (g)</span>
                  <input
                    type="number"
                    value={carbs}
                    onChange={(e) => setCarbs(e.target.value)}
                    className="w-full px-2 py-1.5 bg-slate-800 border border-slate-700 rounded text-center text-slate-100"
                  />
                </div>
                <div>
                  <span className="text-[10px] text-slate-400">Fat (g)</span>
                  <input
                    type="number"
                    value={fat}
                    onChange={(e) => setFat(e.target.value)}
                    className="w-full px-2 py-1.5 bg-slate-800 border border-slate-700 rounded text-center text-slate-100"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-300 mb-1">Notes (Optional)</label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Cooked with olive oil"
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-slate-100 focus:outline-none"
                />
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-800 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-bold text-xs rounded-xl"
                >
                  Save Food Item
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={Boolean(deleteTargetId)}
        title="Delete Food Item"
        message="Are you sure you want to remove this item from your diet log?"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTargetId(null)}
      />
    </div>
  );
}
