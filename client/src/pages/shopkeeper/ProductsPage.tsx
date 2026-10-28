import React, { useState, useEffect } from 'react';
import {
  Package,
  Plus,
  Search,
  Edit2,
  Trash2,
  X,
  CheckCircle,
  AlertCircle,
  Store,
  Boxes
} from 'lucide-react';
import { Product, Category } from '../../types';
import { useAuth } from '../../context/AuthContext';

export const ProductsPage: React.FC = () => {
  const { shop } = useAuth();
  const shopId = shop?.id;

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [isLoading, setIsLoading] = useState(true);

  // Modal State for Add / Edit
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Form Fields
  const [formName, setFormName] = useState('');
  const [formCategoryId, setFormCategoryId] = useState<number>(1);
  const [formDescription, setFormDescription] = useState('');
  const [formPrice, setFormPrice] = useState<number>(50);
  const [formMrp, setFormMrp] = useState<number>(65);
  const [formUnit, setFormUnit] = useState('1 kg');
  const [formImageUrl, setFormImageUrl] = useState('');
  const [formStock, setFormStock] = useState<number>(20);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProductsAndCategories = async () => {
    if (!shopId) return;
    try {
      setIsLoading(true);
      const [prodRes, catRes] = await Promise.all([
        fetch(`/api/shopkeeper/products?shopId=${shopId}`, {
          headers: { 'x-shop-id': String(shopId) },
        }),
        fetch('/api/categories'),
      ]);

      const prodData = await prodRes.json();
      const catData = await catRes.json();

      setProducts(Array.isArray(prodData) ? prodData : []);
      setCategories(Array.isArray(catData) ? catData : []);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (shopId) {
      fetchProductsAndCategories();
    }
  }, [shopId]);

  const handleOpenAdd = () => {
    setEditingProduct(null);
    setFormName('');
    setFormCategoryId(categories[0]?.id || 1);
    setFormDescription('');
    setFormPrice(50);
    setFormMrp(65);
    setFormUnit('1 unit');
    setFormImageUrl('https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=500&q=80');
    setFormStock(20);
    setError(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (p: Product) => {
    setEditingProduct(p);
    setFormName(p.name);
    setFormCategoryId(p.category_id);
    setFormDescription(p.description || '');
    setFormPrice(p.price);
    setFormMrp(p.mrp || p.price);
    setFormUnit(p.unit || '1 unit');
    setFormImageUrl(p.image_url);
    setFormStock(p.stock_quantity);
    setError(null);
    setIsModalOpen(true);
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formPrice) {
      setError('Product name and price are required.');
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      const payload = {
        shopId,
        name: formName.trim(),
        categoryId: formCategoryId,
        description: formDescription.trim(),
        price: Number(formPrice),
        mrp: Number(formMrp),
        unit: formUnit.trim(),
        imageUrl: formImageUrl.trim(),
        stockQuantity: Number(formStock),
      };

      const url = editingProduct
        ? `/api/shopkeeper/products/${editingProduct.id}`
        : '/api/shopkeeper/products';

      const method = editingProduct ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', 'x-shop-id': String(shopId) },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to save product');
      }

      setIsModalOpen(false);
      fetchProductsAndCategories();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteProduct = async (id: number) => {
    if (!window.confirm('Are you sure you want to remove this product from your storefront catalog?')) {
      return;
    }

    try {
      const res = await fetch(`/api/shopkeeper/products/${id}`, {
        method: 'DELETE',
        headers: { 'x-shop-id': String(shopId) },
      });

      if (res.ok) {
        fetchProductsAndCategories();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      selectedCategory === 'All' || String(p.category_id) === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-8 pb-16">
      
      {/* Header */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-white shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 uppercase tracking-wider mb-2">
            <Package size={13} />
            <span>Storefront Catalog</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-stone-900">
            Manage Products ({products.length})
          </h1>
          <p className="text-xs text-stone-500 mt-1">
            Add items, update descriptions and rates, or manage availability for local customers.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="px-5 py-2.5 rounded-2xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 transition shadow-md shadow-emerald-700/20 flex items-center gap-2"
          id="add-product-btn"
        >
          <Plus size={16} />
          <span>Add New Product</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="glass-panel p-4 rounded-2xl border border-white flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
          <input
            type="text"
            placeholder="Search products in catalog..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="glass-input w-full pl-9 pr-3 py-2 text-xs sm:text-sm rounded-xl"
          />
        </div>

        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="glass-input px-3 py-2 text-xs sm:text-sm rounded-xl sm:w-56"
        >
          <option value="All">All Categories</option>
          {categories.map((c) => (
            <option key={c.id} value={String(c.id)}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      {/* Products Table / Cards */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((n) => (
            <div key={n} className="glass-panel h-20 rounded-2xl animate-pulse bg-white/40" />
          ))}
        </div>
      ) : filteredProducts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredProducts.map((product) => (
            <div
              key={product.id}
              className="glass-panel p-4 rounded-2xl border border-white shadow-sm flex flex-col justify-between group hover:shadow-md transition"
            >
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <img
                    src={product.image_url}
                    alt={product.name}
                    className="w-16 h-16 rounded-xl object-cover bg-stone-100 shrink-0 border border-stone-200"
                  />
                  <div className="overflow-hidden">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md inline-block mb-0.5">
                      {product.category_name || 'Item'}
                    </span>
                    <h3 className="font-bold text-sm text-stone-900 line-clamp-1">
                      {product.name}
                    </h3>
                    <div className="text-xs text-stone-400 mt-0.5">
                      {product.unit}
                    </div>
                  </div>
                </div>

                <p className="text-xs text-stone-500 line-clamp-2 mb-3">
                  {product.description}
                </p>

                <div className="flex items-baseline justify-between text-xs py-2 border-t border-stone-200/50">
                  <div className="flex items-baseline gap-2">
                    <span className="font-extrabold text-base text-stone-900">
                      ₹{product.price}
                    </span>
                    {product.mrp && product.mrp > product.price && (
                      <span className="text-stone-400 line-through text-[11px]">
                        ₹{product.mrp}
                      </span>
                    )}
                  </div>

                  <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
                    product.available_stock <= 0
                      ? 'bg-red-100 text-red-800'
                      : product.available_stock <= 5
                      ? 'bg-orange-100 text-orange-800'
                      : 'bg-emerald-100 text-emerald-800'
                  }`}>
                    {product.available_stock <= 0
                      ? 'Out of Stock'
                      : `${product.available_stock} in stock`}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="pt-3 border-t border-stone-200/50 flex items-center justify-end gap-2">
                <button
                  onClick={() => handleOpenEdit(product)}
                  className="px-3 py-1.5 rounded-xl text-xs font-semibold glass-pill text-stone-700 hover:bg-white flex items-center gap-1"
                >
                  <Edit2 size={13} />
                  <span>Edit</span>
                </button>
                <button
                  onClick={() => handleDeleteProduct(product.id)}
                  className="px-3 py-1.5 rounded-xl text-xs font-semibold text-red-600 hover:bg-red-50 flex items-center gap-1"
                >
                  <Trash2 size={13} />
                  <span>Remove</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="glass-panel p-12 text-center rounded-3xl max-w-lg mx-auto">
          <Package size={40} className="mx-auto text-stone-400 mb-3" />
          <h3 className="font-bold text-base text-stone-800">No products found</h3>
          <p className="text-xs text-stone-500 mt-1 mb-4">Click "Add New Product" to populate your store inventory.</p>
          <button
            onClick={handleOpenAdd}
            className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-emerald-600"
          >
            Add First Product
          </button>
        </div>
      )}

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="glass-panel-elevated w-full max-w-lg rounded-3xl p-6 relative text-stone-800 shadow-2xl max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-stone-100 text-stone-500"
            >
              <X size={20} />
            </button>

            <h3 className="text-lg font-bold text-stone-900 mb-1">
              {editingProduct ? 'Edit Product' : 'Add New Product to Store'}
            </h3>
            <p className="text-xs text-stone-500 mb-4">
              Enter product details and stock quantities. Updates reflect immediately on customer side.
            </p>

            {error && (
              <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                <AlertCircle size={15} />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSaveProduct} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Product Name
                </label>
                <input
                  type="text"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="e.g. Farm Fresh Hybrid Tomatoes"
                  required
                  className="glass-input w-full px-3 py-2 text-xs sm:text-sm rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Category
                  </label>
                  <select
                    value={formCategoryId}
                    onChange={(e) => setFormCategoryId(Number(e.target.value))}
                    className="glass-input w-full px-3 py-2 text-xs sm:text-sm rounded-xl"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Unit / Size
                  </label>
                  <input
                    type="text"
                    value={formUnit}
                    onChange={(e) => setFormUnit(e.target.value)}
                    placeholder="e.g. 1 kg / 500g / 1 pc"
                    className="glass-input w-full px-3 py-2 text-xs sm:text-sm rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Price (₹)
                  </label>
                  <input
                    type="number"
                    value={formPrice}
                    onChange={(e) => setFormPrice(Number(e.target.value))}
                    required
                    min={1}
                    className="glass-input w-full px-3 py-2 text-xs sm:text-sm rounded-xl"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    MRP (₹)
                  </label>
                  <input
                    type="number"
                    value={formMrp}
                    onChange={(e) => setFormMrp(Number(e.target.value))}
                    min={1}
                    className="glass-input w-full px-3 py-2 text-xs sm:text-sm rounded-xl"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Stock Quantity
                  </label>
                  <input
                    type="number"
                    value={formStock}
                    onChange={(e) => setFormStock(Number(e.target.value))}
                    required
                    min={0}
                    className="glass-input w-full px-3 py-2 text-xs sm:text-sm rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Product Image URL
                </label>
                <input
                  type="url"
                  value={formImageUrl}
                  onChange={(e) => setFormImageUrl(e.target.value)}
                  placeholder="https://..."
                  className="glass-input w-full px-3 py-2 text-xs sm:text-sm rounded-xl"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Description
                </label>
                <textarea
                  rows={2}
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="Freshness, grade, origin, etc."
                  className="glass-input w-full p-2.5 text-xs sm:text-sm rounded-xl"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-stone-600 hover:bg-stone-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-sm"
                >
                  {isSaving ? 'Saving...' : editingProduct ? 'Save Changes' : 'Create Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
