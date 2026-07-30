import React, { useState, useEffect } from 'react';
import API from '../services/api';
import { useToast } from '../context/ToastContext';
import ConfirmationModal from '../components/common/ConfirmationModal';
import LoadingSkeleton from '../components/common/LoadingSkeleton';
import { Camera, Upload, Trash2, Calendar, Eye, X } from 'lucide-react';

export default function Photos() {
  const { showToast } = useToast();
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedView, setSelectedView] = useState('All'); // All, Front, Side, Back

  // Upload modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [viewType, setViewType] = useState('Front');
  const [photoDate, setPhotoDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');
  const [file, setFile] = useState(null);

  // Comparison State
  const [comparePhotos, setComparePhotos] = useState([]); // Array of max 2 selected photos for comparison

  const [deleteId, setDeleteId] = useState(null);

  useEffect(() => {
    fetchPhotos();
  }, [selectedView]);

  const fetchPhotos = async () => {
    try {
      setLoading(true);
      const res = await API.get(`/photos?viewType=${selectedView}`);
      setPhotos(res.data || []);
    } catch (err) {
      showToast('Error loading progress photos', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleUploadPhoto = async (e) => {
    e.preventDefault();
    if (!file) {
      showToast('Please select an image file', 'error');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('photo', file);
      formData.append('viewType', viewType);
      formData.append('date', photoDate);
      formData.append('notes', notes);

      await API.post('/photos', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      showToast('Progress photo uploaded successfully!', 'success');
      setIsModalOpen(false);
      setFile(null);
      setNotes('');
      fetchPhotos();
    } catch (err) {
      showToast('Failed to upload image', 'error');
    }
  };

  const toggleCompare = (photo) => {
    if (comparePhotos.find(p => p.id === photo.id)) {
      setComparePhotos(comparePhotos.filter(p => p.id !== photo.id));
    } else {
      if (comparePhotos.length >= 2) {
        setComparePhotos([comparePhotos[1], photo]);
      } else {
        setComparePhotos([...comparePhotos, photo]);
      }
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteId) return;
    try {
      await API.delete(`/photos/${deleteId}`);
      showToast('Progress photo deleted', 'success');
      setDeleteId(null);
      fetchPhotos();
    } catch (err) {
      showToast('Failed to delete photo', 'error');
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2.5">
            <Camera className="w-7 h-7 text-emerald-400" /> Progress Photos Gallery
          </h1>
          <p className="text-sm text-slate-400">Track body transformation timeline (Front, Side, Back) with side-by-side comparison</p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-sm rounded-xl shadow-lg shadow-emerald-500/20 flex items-center gap-2 self-start sm:self-auto transition-all"
        >
          <Upload className="w-4 h-4" /> Upload Progress Photo
        </button>
      </div>

      {/* Filter Views & Comparison Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-1.5 bg-slate-900 p-1.5 rounded-xl border border-slate-800 self-start">
          {['All', 'Front', 'Side', 'Back'].map((v) => (
            <button
              key={v}
              onClick={() => setSelectedView(v)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                selectedView === v
                  ? 'bg-emerald-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {v} View
            </button>
          ))}
        </div>

        {comparePhotos.length > 0 && (
          <div className="flex items-center gap-3 text-xs font-semibold text-emerald-400 bg-emerald-500/10 px-4 py-2 rounded-xl border border-emerald-500/30">
            <span>Comparing {comparePhotos.length} of 2 Photos</span>
            <button
              onClick={() => setComparePhotos([])}
              className="text-slate-400 hover:text-white underline ml-2"
            >
              Clear Comparison
            </button>
          </div>
        )}
      </div>

      {/* Side-by-side Comparison View (If 2 selected) */}
      {comparePhotos.length === 2 && (
        <div className="glass-panel p-6 border-emerald-500/50 space-y-4">
          <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
            <Eye className="w-5 h-5 text-emerald-400" /> Side-by-Side Comparison
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {comparePhotos.map((photo, idx) => (
              <div key={photo.id} className="space-y-2">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span className="font-bold text-slate-200">{idx === 0 ? 'Before / Earlier' : 'After / Recent'}</span>
                  <span>{photo.date} ({photo.viewType})</span>
                </div>
                <div className="h-72 rounded-2xl overflow-hidden border border-slate-700/60 bg-slate-950 flex items-center justify-center">
                  <img src={photo.imageUrl} alt="Progress" className="w-full h-full object-cover" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Photo Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <LoadingSkeleton className="h-64" />
          <LoadingSkeleton className="h-64" />
          <LoadingSkeleton className="h-64" />
        </div>
      ) : photos.length === 0 ? (
        <div className="glass-panel p-12 text-center text-slate-400">
          <Camera className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <p className="font-semibold text-slate-300">No progress photos uploaded yet</p>
          <p className="text-xs text-slate-500 mt-1">Upload weekly front/side/back photos to track your transformation!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {photos.map((photo) => {
            const isComparing = Boolean(comparePhotos.find(p => p.id === photo.id));

            return (
              <div
                key={photo.id}
                className={`glass-panel overflow-hidden group transition-all ${
                  isComparing ? 'border-2 border-emerald-500 shadow-xl shadow-emerald-500/20' : ''
                }`}
              >
                <div className="h-64 relative overflow-hidden bg-slate-950 flex items-center justify-center">
                  <img
                    src={photo.imageUrl}
                    alt={photo.viewType}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <span className="absolute top-3 left-3 px-2.5 py-1 rounded-lg bg-slate-900/80 backdrop-blur-md text-emerald-400 text-xs font-bold border border-slate-700">
                    {photo.viewType} View
                  </span>

                  <button
                    onClick={() => setDeleteId(photo.id)}
                    className="absolute top-3 right-3 p-2 rounded-xl bg-slate-900/80 hover:bg-rose-600 text-slate-300 hover:text-white transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="p-4 flex items-center justify-between">
                  <div>
                    <span className="text-xs text-slate-400 font-mono">{photo.date}</span>
                    {photo.notes && <p className="text-xs text-slate-300 line-clamp-1">{photo.notes}</p>}
                  </div>

                  <button
                    onClick={() => toggleCompare(photo)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                      isComparing
                        ? 'bg-emerald-500 text-slate-950 font-bold'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    {isComparing ? 'Selected ✓' : 'Compare'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Upload Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-slate-100">Upload Progress Photo</h3>
            <form onSubmit={handleUploadPhoto} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-300 mb-1">Image File</label>
                <input
                  type="file"
                  accept="image/*"
                  required
                  onChange={(e) => setFile(e.target.files[0])}
                  className="w-full text-xs text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-emerald-500/20 file:text-emerald-400 hover:file:bg-emerald-500/30"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-300 mb-1">View Angle</label>
                  <select
                    value={viewType}
                    onChange={(e) => setViewType(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-slate-100 focus:outline-none"
                  >
                    <option value="Front">Front View</option>
                    <option value="Side">Side View</option>
                    <option value="Back">Back View</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-300 mb-1">Date</label>
                  <input
                    type="date"
                    required
                    value={photoDate}
                    onChange={(e) => setPhotoDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-slate-100 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-300 mb-1">Notes (Optional)</label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Week 4 conditioning photo"
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
                  className="px-5 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-bold text-xs rounded-xl shadow"
                >
                  Upload Photo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={Boolean(deleteId)}
        title="Delete Progress Photo"
        message="Are you sure you want to delete this photo?"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
}
