import React, { useState, useEffect } from 'react';
import { FoodItem } from '../types';
import { fetchFoods, API_BASE } from '../services/api';
import { Download, Database, Search, ChevronLeft, ChevronRight } from 'lucide-react';

const PAGE_SIZE = 150;

export const DatabaseExplorer: React.FC = () => {
  const [scope, setScope] = useState<'bangladesh' | 'global'>('bangladesh');
  const [category, setCategory] = useState<string>('All Categories');
  const [search, setSearch] = useState<string>('');
  const [categories, setCategories] = useState<string[]>([]);
  const [foods, setFoods] = useState<FoodItem[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [page, setPage] = useState<number>(1);
  const [showAll, setShowAll] = useState<boolean>(false);

  useEffect(() => {
    let isMounted = true;
    const timer = setTimeout(() => {
      if (!isMounted) return;
      setLoading(true);
      fetchFoods(scope, category, search)
        .then((res) => {
          if (!isMounted) return;
          setCategories(res.categories);
          setFoods(res.items);
          setTotalCount(res.total_count ?? res.items.length);
          setPage(1);
          setLoading(false);
        })
        .catch(() => {
          if (isMounted) setLoading(false);
        });
    }, 150);
    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [scope, category, search]);

  const totalPages = Math.max(1, Math.ceil(foods.length / PAGE_SIZE));
  const visibleFoods = showAll
    ? foods
    : foods.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleDownload = () => {
    window.open(`${API_BASE}/database/export?scope=${scope}`, '_blank');
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-xs h-full min-h-0 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between gap-2 pb-3 border-b border-slate-100 shrink-0 flex-wrap">
        <div className="flex items-center gap-2">
          <Database className="w-5 h-5 text-blue-600 shrink-0" />
          <div>
            <h3 className="text-base sm:text-lg font-extrabold text-slate-900 tracking-tight">
              Master Nutrition Database Explorer (Bangladeshi &amp; Global)
            </h3>
            <p className="text-xs text-slate-500 font-medium">
              Browse 190 authentic Bangladeshi staple foods alongside all 8,790 simplified unique USDA items.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-200">
            {totalCount.toLocaleString()} Items
          </span>
        </div>
      </div>

      {/* Controls Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 my-3 items-end shrink-0">
        <div>
          <label htmlFor="db-scope" className="text-xs font-bold text-slate-700 block mb-1">
            Database Scope:
          </label>
          <select
            id="db-scope"
            value={scope}
            onChange={(e) => {
              setScope(e.target.value as 'bangladesh' | 'global');
              setCategory('All Categories');
              setShowAll(false);
            }}
            className="w-full text-xs font-semibold bg-white border border-slate-300 rounded-lg p-2 text-slate-800 cursor-pointer"
          >
            <option value="bangladesh">Bangladeshi Staples (190 Items)</option>
            <option value="global">Global / USDA Database (8,790 Items)</option>
          </select>
        </div>

        <div>
          <label htmlFor="db-category" className="text-xs font-bold text-slate-700 block mb-1">
            Category Filter:
          </label>
          <select
            id="db-category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full text-xs font-semibold bg-white border border-slate-300 rounded-lg p-2 text-slate-800 cursor-pointer"
          >
            <option value="All Categories">All Categories</option>
            {categories.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="db-search" className="text-xs font-bold text-slate-700 block mb-1">
            Filter Search:
          </label>
          <div className="relative">
            <input
              id="db-search"
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Type food name..."
              className="w-full text-xs font-semibold bg-white border border-slate-300 rounded-lg p-2 pr-7 text-slate-800"
            />
            <Search className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-2.5 pointer-events-none" />
          </div>
        </div>

        <div>
          <button
            type="button"
            onClick={handleDownload}
            className="w-full flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-lg transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" /> Download CSV
          </button>
        </div>
      </div>

      {/* Scrollable Table */}
      {loading ? (
        <div className="flex-1 min-h-0 flex items-center justify-center text-xs text-slate-400">
          Loading {scope === 'global' ? '8,790 global' : '190 Bangladeshi'} database records...
        </div>
      ) : (
        <>
          <div className="flex-1 min-h-0 overflow-auto custom-scrollbar border border-slate-200 rounded-xl">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-50 sticky top-0 border-b border-slate-200 font-bold text-slate-700 z-10">
                <tr>
                  <th className="p-2.5">Food Name (Simplified Unique)</th>
                  <th className="p-2.5">Category</th>
                  <th className="p-2.5 text-right">Calories</th>
                  <th className="p-2.5 text-right">Protein</th>
                  <th className="p-2.5 text-right">Carbs</th>
                  <th className="p-2.5 text-right">Fat</th>
                  <th className="p-2.5">Serving Size</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-600 font-medium">
                {visibleFoods.map((f) => (
                  <tr key={f.index} className="hover:bg-slate-50/70">
                    <td className="p-2.5 font-bold text-slate-900">{f.Clean_Name}</td>
                    <td className="p-2.5">
                      <span className="px-2 py-0.5 rounded-full bg-slate-100 text-[0.68rem] font-semibold text-slate-700">
                        {f.Category}
                      </span>
                    </td>
                    <td className="p-2.5 text-right font-black text-slate-900">{Math.round(f.Energ_Kcal)} kcal</td>
                    <td className="p-2.5 text-right text-emerald-600 font-bold">{f.Protein_g}g</td>
                    <td className="p-2.5 text-right text-blue-600">{f.Carbohydrt_g}g</td>
                    <td className="p-2.5 text-right text-amber-600">{f.Lipid_Tot_g}g</td>
                    <td className="p-2.5 text-slate-500 text-[0.7rem]">{f.GmWt_Desc1}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination / View Controls */}
          {foods.length > PAGE_SIZE && (
            <div className="pt-2.5 flex items-center justify-between flex-wrap gap-2 text-xs text-slate-600 shrink-0">
              <span className="font-medium">
                Showing {showAll ? `all ${foods.length.toLocaleString()}` : `${((page - 1) * PAGE_SIZE + 1).toLocaleString()}–${Math.min(page * PAGE_SIZE, foods.length).toLocaleString()} of ${foods.length.toLocaleString()}`} items
              </span>
              <div className="flex items-center gap-1.5">
                {!showAll && (
                  <>
                    <button
                      type="button"
                      disabled={page <= 1}
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 font-semibold cursor-pointer"
                    >
                      <ChevronLeft className="w-3.5 h-3.5" /> Prev
                    </button>
                    <span className="px-2 font-bold text-slate-700">
                      Page {page} / {totalPages}
                    </span>
                    <button
                      type="button"
                      disabled={page >= totalPages}
                      onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 font-semibold cursor-pointer"
                    >
                      Next <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </>
                )}
                <button
                  type="button"
                  onClick={() => setShowAll((s) => !s)}
                  className="px-2.5 py-1 rounded-lg border border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100 font-bold cursor-pointer"
                >
                  {showAll ? 'Paginate (150/page)' : `Show All (${foods.length.toLocaleString()})`}
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};
