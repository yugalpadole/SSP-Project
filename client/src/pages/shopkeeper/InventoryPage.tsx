import React, { useState, useEffect } from 'react';
import {
  Boxes,
  AlertTriangle,
  CheckCircle,
  Plus,
  Minus,
  RefreshCw,
  Search,
  Filter,
  Layers,
  ArrowUpRight
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const InventoryPage: React.FC = () => {
  const { shop } = useAuth();
  const shopId = shop?.id;

  const [inventory, setInventory] = useState<any[]>([]);
  const [filterStatus, setFilterStatus] = useState<'all' | 'low_stock' | 'out_of_stock' | 'in_stock'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  const fetchInventory = async () => {
    if (!shopId) return;
    try {
      setIsLoading(true);
      const res = await fetch(`/api/shopkeeper/inventory?shopId=${shopId}`, {
        headers: { 'x-shop-id': String(shopId) },
      });
      const data = await res.json();
      setInventory(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (shopId) {
      fetchInventory();
    }
  }, [shopId]);

  const handleUpdateStock = async (productId: number, newStock: number) => {
    if (newStock < 0) return;
    setUpdatingId(productId);

    try {
      const res = await fetch(`/api/shopkeeper/inventory/${productId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'x-shop-id': String(shopId) },
        body: JSON.stringify({ stockQuantity: newStock }),
      });

      if (res.ok) {
        setInventory((prev) =>
          prev.map((item) => {
            if (item.id === productId) {
              const available = newStock - item.reserved_quantity;
              let stockStatus = 'in_stock';
              if (available <= 0) stockStatus = 'out_of_stock';
              else if (available <= 5) stockStatus = 'low_stock';

              return {
                ...item,
                stock_quantity: newStock,
                available_stock: available,
                stock_status: stockStatus,
              };
            }
            return item;
          })
        );
      }
    } catch (err) {
      console.error(err);
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredItems = inventory.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      filterStatus === 'all' || item.stock_status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const lowStockCount = inventory.filter((i) => i.stock_status === 'low_stock').length;
  const outOfStockCount = inventory.filter((i) => i.stock_status === 'out_of_stock').length;

  return (
    <div className="space-y-8 pb-16">
      
      {/* Header */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-white shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800 uppercase tracking-wider mb-2">
            <Boxes size={13} />
            <span>Real-time Stock Control</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-stone-900">
            Live Inventory Management
          </h1>
          <p className="text-xs text-stone-500 mt-1">
            Available stock is automatically reserved when customers place reservations and released if expired.
          </p>
        </div>

        <button
          onClick={fetchInventory}
          className="px-4 py-2 rounded-xl text-xs font-bold glass-pill text-stone-700 hover:bg-white flex items-center gap-1.5"
        >
          <RefreshCw size={13} />
          <span>Sync Stock</span>
        </button>
      </div>

      {/* Overview Stat Badges */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <button
          onClick={() => setFilterStatus('all')}
          className={`p-4 rounded-2xl border text-left transition ${
            filterStatus === 'all' ? 'bg-emerald-600 text-white shadow-md' : 'glass-panel text-stone-800'
          }`}
        >
          <div className="text-[10px] font-bold uppercase tracking-wider opacity-80">All Products</div>
          <div className="text-2xl font-black mt-0.5">{inventory.length}</div>
        </button>

        <button
          onClick={() => setFilterStatus('low_stock')}
          className={`p-4 rounded-2xl border text-left transition ${
            filterStatus === 'low_stock' ? 'bg-orange-500 text-white shadow-md' : 'glass-panel text-stone-800'
          }`}
        >
          <div className="text-[10px] font-bold uppercase tracking-wider opacity-80">Low Stock (≤ 5)</div>
          <div className="text-2xl font-black mt-0.5">{lowStockCount}</div>
        </button>

        <button
          onClick={() => setFilterStatus('out_of_stock')}
          className={`p-4 rounded-2xl border text-left transition ${
            filterStatus === 'out_of_stock' ? 'bg-red-600 text-white shadow-md' : 'glass-panel text-stone-800'
          }`}
        >
          <div className="text-[10px] font-bold uppercase tracking-wider opacity-80">Out of Stock</div>
          <div className="text-2xl font-black mt-0.5">{outOfStockCount}</div>
        </button>

        <button
          onClick={() => setFilterStatus('in_stock')}
          className={`p-4 rounded-2xl border text-left transition ${
            filterStatus === 'in_stock' ? 'bg-emerald-700 text-white shadow-md' : 'glass-panel text-stone-800'
          }`}
        >
          <div className="text-[10px] font-bold uppercase tracking-wider opacity-80">Healthy Stock</div>
          <div className="text-2xl font-black mt-0.5">{inventory.length - lowStockCount - outOfStockCount}</div>
        </button>
      </div>

      {/* Filter and Search */}
      <div className="glass-panel p-4 rounded-2xl border border-white flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
          <input
            type="text"
            placeholder="Search inventory items..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="glass-input w-full pl-9 pr-3 py-2 text-xs sm:text-sm rounded-xl"
          />
        </div>
      </div>

      {/* Inventory Table */}
      <div className="glass-panel rounded-3xl border border-white shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-stone-700">
            <thead className="bg-stone-100/70 border-b border-stone-200/60 uppercase tracking-wider text-[10px] font-bold text-stone-500">
              <tr>
                <th className="py-3.5 px-4">Product</th>
                <th className="py-3.5 px-4">Category</th>
                <th className="py-3.5 px-4 text-center">Physical Stock</th>
                <th className="py-3.5 px-4 text-center">Reserved Units</th>
                <th className="py-3.5 px-4 text-center">Available to Sell</th>
                <th className="py-3.5 px-4 text-center">Status</th>
                <th className="py-3.5 px-4 text-right">Quick Stock Adjust</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-200/50">
              {filteredItems.map((item) => (
                <tr key={item.id} className="hover:bg-white/60 transition">
                  {/* Product */}
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={item.image_url}
                        alt={item.name}
                        className="w-10 h-10 rounded-xl object-cover bg-stone-100 shrink-0 border border-stone-200"
                      />
                      <div>
                        <span className="font-bold text-stone-900">{item.name}</span>
                        <div className="text-[11px] text-stone-400">{item.unit} • ₹{item.price}</div>
                      </div>
                    </div>
                  </td>

                  {/* Category */}
                  <td className="py-3.5 px-4 font-semibold text-stone-600">
                    {item.category_name || 'General'}
                  </td>

                  {/* Total Physical Stock */}
                  <td className="py-3.5 px-4 text-center font-bold text-stone-800">
                    {item.stock_quantity}
                  </td>

                  {/* Reserved Units */}
                  <td className="py-3.5 px-4 text-center">
                    <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800">
                      {item.reserved_quantity}
                    </span>
                  </td>

                  {/* Available Stock */}
                  <td className="py-3.5 px-4 text-center">
                    <span className={`text-sm font-black ${item.available_stock <= 0 ? 'text-red-600' : 'text-emerald-700'}`}>
                      {item.available_stock}
                    </span>
                  </td>

                  {/* Status Badge */}
                  <td className="py-3.5 px-4 text-center">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
                      item.stock_status === 'out_of_stock'
                        ? 'bg-red-100 text-red-800'
                        : item.stock_status === 'low_stock'
                        ? 'bg-orange-100 text-orange-800'
                        : 'bg-emerald-100 text-emerald-800'
                    }`}>
                      {item.stock_status.replace(/_/g, ' ')}
                    </span>
                  </td>

                  {/* Quick Adjust Buttons */}
                  <td className="py-3.5 px-4 text-right">
                    <div className="inline-flex items-center glass-pill rounded-xl p-1 border border-stone-200">
                      <button
                        onClick={() => handleUpdateStock(item.id, item.stock_quantity - 1)}
                        disabled={updatingId === item.id || item.stock_quantity <= 0}
                        className="w-7 h-7 rounded-lg bg-white/80 hover:bg-stone-100 text-stone-800 flex items-center justify-center transition shadow-xs disabled:opacity-30"
                        title="Reduce stock by 1"
                      >
                        <Minus size={13} />
                      </button>

                      <input
                        type="number"
                        min="0"
                        value={item.stock_quantity}
                        onChange={(e) => handleUpdateStock(item.id, Number(e.target.value))}
                        className="w-12 text-center text-xs font-bold text-stone-900 bg-transparent focus:outline-none"
                      />

                      <button
                        onClick={() => handleUpdateStock(item.id, item.stock_quantity + 1)}
                        disabled={updatingId === item.id}
                        className="w-7 h-7 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white flex items-center justify-center transition shadow-xs"
                        title="Increase stock by 1"
                      >
                        <Plus size={13} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
