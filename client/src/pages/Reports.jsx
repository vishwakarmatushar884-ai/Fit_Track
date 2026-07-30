import React, { useState, useEffect, useRef } from 'react';
import API from '../services/api';
import { useToast } from '../context/ToastContext';
import LoadingSkeleton from '../components/common/LoadingSkeleton';
import { FileText, Download, Calendar, Flame, Droplets, Dumbbell, Scale, Zap } from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export default function Reports() {
  const { showToast } = useToast();
  const [period, setPeriod] = useState('weekly'); // 'weekly' or 'monthly'
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const reportRef = useRef(null);

  useEffect(() => {
    fetchReport();
  }, [period]);

  const fetchReport = async () => {
    try {
      setLoading(true);
      const res = await API.get(`/reports?period=${period}`);
      setReport(res.data);
    } catch (err) {
      showToast('Error generating report', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Export Report to PDF
  const exportPDF = async () => {
    if (!reportRef.current) return;
    showToast('Generating PDF report...', 'info');
    try {
      const canvas = await html2canvas(reportRef.current, { scale: 2 });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`FitTrack_${period}_Report_${new Date().toISOString().split('T')[0]}.pdf`);
      showToast('PDF Report downloaded!', 'success');
    } catch (err) {
      showToast('PDF Export failed', 'error');
    }
  };

  // Export Daily Breakdown to CSV
  const exportCSV = () => {
    if (!report || !report.dailyBreakdown) return;
    const headers = 'Date,Calories Burned (kcal),Workout Duration (mins),Calories Consumed (kcal),Water Glasses,Weight (kg)\n';
    const rows = report.dailyBreakdown
      .map(d => `"${d.date}",${d.caloriesBurned},${d.workoutDurationMin},${d.caloriesConsumed},${d.waterGlasses},${d.weight || ''}`)
      .join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `FitTrack_${period}_DailyBreakdown_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    showToast('CSV report downloaded!', 'success');
  };

  if (loading) return <LoadingSkeleton className="h-96" />;

  const { summary, dailyBreakdown, startDate, endDate, totalDays } = report || {};

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2.5">
            <FileText className="w-7 h-7 text-emerald-400" /> Automated Fitness & Health Reports
          </h1>
          <p className="text-sm text-slate-400">Comprehensive automated performance summaries with PDF & CSV export</p>
        </div>

        <div className="flex items-center gap-3 self-start sm:self-auto">
          {/* Period Toggle */}
          <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setPeriod('weekly')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold uppercase transition-all ${
                period === 'weekly' ? 'bg-emerald-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Weekly
            </button>
            <button
              onClick={() => setPeriod('monthly')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold uppercase transition-all ${
                period === 'monthly' ? 'bg-emerald-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Monthly
            </button>
          </div>

          <button
            onClick={exportPDF}
            className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-xs rounded-xl shadow flex items-center gap-1.5 transition-all"
          >
            <Download className="w-4 h-4" /> Download PDF
          </button>
          <button
            onClick={exportCSV}
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-semibold text-xs rounded-xl transition-colors"
          >
            CSV Export
          </button>
        </div>
      </div>

      {/* Printable Report Canvas Area */}
      <div ref={reportRef} className="space-y-6 bg-slate-950 p-2 sm:p-4 rounded-3xl">
        {/* Printable Title Banner */}
        <div className="glass-panel p-6 border-emerald-500/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400">
              FitTrack Performance Report
            </span>
            <h2 className="text-xl font-extrabold text-slate-100 mt-0.5">
              {period === 'weekly' ? 'Weekly Fitness & Health Summary' : 'Monthly Fitness & Health Summary'}
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Date Period: <span className="text-slate-200 font-mono">{startDate}</span> to <span className="text-slate-200 font-mono">{endDate}</span> ({totalDays} days)
            </p>
          </div>

          <div className="text-right">
            <div className="text-xs text-slate-400">Generated automatically</div>
            <div className="text-sm font-bold text-emerald-400 font-mono">{new Date().toLocaleDateString()}</div>
          </div>
        </div>

        {/* Aggregated Stat Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="glass-card">
            <span className="text-[11px] font-semibold uppercase text-slate-400">Workout Days</span>
            <div className="text-2xl font-extrabold text-slate-100 mt-1">
              {summary?.workoutDaysCount || 0} <span className="text-xs font-normal text-slate-400">/ {totalDays} days</span>
            </div>
            <p className="text-xs text-slate-400 mt-1">Missed: {summary?.missedDaysCount || 0} days</p>
          </div>

          <div className="glass-card">
            <span className="text-[11px] font-semibold uppercase text-slate-400">Total Calories Burned</span>
            <div className="text-2xl font-extrabold text-orange-400 mt-1">
              🔥 {summary?.totalCaloriesBurned || 0} <span className="text-xs font-normal text-slate-400">kcal</span>
            </div>
            <p className="text-xs text-slate-400 mt-1">Duration: {summary?.totalDurationMinutes || 0} mins</p>
          </div>

          <div className="glass-card">
            <span className="text-[11px] font-semibold uppercase text-slate-400">Avg. Daily Water</span>
            <div className="text-2xl font-extrabold text-sky-400 mt-1">
              💧 {summary?.avgDailyWaterGlasses || 0} <span className="text-xs font-normal text-slate-400">glasses/day</span>
            </div>
            <p className="text-xs text-slate-400 mt-1">Total: {summary?.totalWaterGlasses || 0} glasses</p>
          </div>

          <div className="glass-card">
            <span className="text-[11px] font-semibold uppercase text-slate-400">Weight Difference</span>
            <div className="text-2xl font-extrabold text-emerald-400 mt-1">
              {(summary?.weightDifference || 0) <= 0 ? `${summary?.weightDifference} kg` : `+${summary?.weightDifference} kg`}
            </div>
            <p className="text-xs text-slate-400 mt-1">Max Habit Streak: {summary?.maxHabitStreak || 0} days</p>
          </div>
        </div>

        {/* Daily Breakdown Table */}
        <div className="glass-panel p-6">
          <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider mb-4">Daily Activity Breakdown</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 font-semibold uppercase">
                  <th className="pb-2.5">Date</th>
                  <th className="pb-2.5">Calories Burned</th>
                  <th className="pb-2.5">Workout Time</th>
                  <th className="pb-2.5">Calories Consumed</th>
                  <th className="pb-2.5">Water Intake</th>
                  <th className="pb-2.5">Logged Weight</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {(dailyBreakdown || []).map((day) => (
                  <tr key={day.date} className="hover:bg-slate-800/30">
                    <td className="py-2.5 text-slate-300 font-mono">{day.date}</td>
                    <td className="py-2.5 font-bold text-orange-400">{day.caloriesBurned} kcal</td>
                    <td className="py-2.5 text-slate-300">{day.workoutDurationMin} mins</td>
                    <td className="py-2.5 font-bold text-amber-400">{day.caloriesConsumed} kcal</td>
                    <td className="py-2.5 text-sky-400 font-bold">{day.waterGlasses} glasses</td>
                    <td className="py-2.5 text-emerald-400 font-bold">{day.weight ? `${day.weight} kg` : '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
