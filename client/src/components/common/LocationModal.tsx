import React, { useState } from 'react';
import { MapPin, X, Check, Search } from 'lucide-react';
import { useLocation, POPULAR_LOCALITIES } from '../../context/LocationContext';

export const LocationModal: React.FC = () => {
  const { currentLocality, setLocality, isPickerOpen, setIsPickerOpen } = useLocation();
  const [customPincode, setCustomPincode] = useState('');
  const [customArea, setCustomArea] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  if (!isPickerOpen) return null;

  const filteredLocalities = POPULAR_LOCALITIES.filter(
    (l) =>
      l.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.pincode.includes(searchTerm)
  );

  const handleApplyCustom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customArea.trim() || !customPincode.trim()) return;
    setLocality({
      name: customArea.trim(),
      pincode: customPincode.trim(),
      city: 'Pune',
    });
    setIsPickerOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="glass-panel-elevated w-full max-w-md rounded-2xl p-6 relative text-stone-800 shadow-2xl">
        <button
          onClick={() => setIsPickerOpen(false)}
          className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-stone-100/60 text-stone-500 hover:text-stone-800 transition"
          aria-label="Close"
        >
          <X size={20} />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="p-2.5 rounded-xl bg-emerald-100 text-emerald-700">
            <MapPin size={24} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-stone-900">Select Delivery Locality</h3>
            <p className="text-xs text-stone-500">Discover shops and get fastest delivery in your area</p>
          </div>
        </div>

        {/* Search */}
        <div className="relative mb-4">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
          <input
            type="text"
            placeholder="Search neighborhood or PIN code..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="glass-input w-full pl-9 pr-3 py-2 text-sm rounded-xl"
          />
        </div>

        {/* Popular List */}
        <div className="space-y-2 max-h-52 overflow-y-auto pr-1 mb-5">
          <div className="text-xs font-semibold text-stone-400 uppercase tracking-wider px-1">
            Nearby Localities
          </div>
          {filteredLocalities.map((loc) => {
            const isSelected = currentLocality.pincode === loc.pincode;
            return (
              <button
                key={loc.pincode}
                onClick={() => {
                  setLocality(loc);
                  setIsPickerOpen(false);
                }}
                className={`w-full flex items-center justify-between p-3 rounded-xl text-left transition ${
                  isSelected
                    ? 'bg-emerald-600 text-white shadow-md'
                    : 'glass-pill hover:bg-white text-stone-700'
                }`}
              >
                <div>
                  <div className="font-semibold text-sm">{loc.name}</div>
                  <div className={`text-xs ${isSelected ? 'text-emerald-100' : 'text-stone-400'}`}>
                    {loc.city} • PIN {loc.pincode}
                  </div>
                </div>
                {isSelected && <Check size={18} className="text-white" />}
              </button>
            );
          })}
        </div>

        {/* Custom Input */}
        <form onSubmit={handleApplyCustom} className="border-t border-stone-200/60 pt-4">
          <div className="text-xs font-semibold text-stone-600 mb-2">Or Enter Custom PIN code</div>
          <div className="grid grid-cols-2 gap-2 mb-3">
            <input
              type="text"
              placeholder="Area / Colony"
              value={customArea}
              onChange={(e) => setCustomArea(e.target.value)}
              className="glass-input text-xs px-3 py-2 rounded-lg"
            />
            <input
              type="text"
              placeholder="6-digit PIN"
              maxLength={6}
              value={customPincode}
              onChange={(e) => setCustomPincode(e.target.value)}
              className="glass-input text-xs px-3 py-2 rounded-lg"
            />
          </div>
          <button
            type="submit"
            disabled={!customArea || !customPincode}
            className="w-full py-2 px-4 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 transition shadow"
          >
            Update Location
          </button>
        </form>
      </div>
    </div>
  );
};
