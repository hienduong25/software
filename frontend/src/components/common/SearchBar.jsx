import { Search, X } from "lucide-react";
import { useState, useEffect } from "react";

export default function SearchBar({ 
  placeholder = "Tìm kiếm...", 
  onSearch, 
  debounceMs = 300 
}) {
  const [value, setValue] = useState("");

  // Debounce search to avoid too many API calls
  useEffect(() => {
    if (!onSearch) return;
    
    const timer = setTimeout(() => {
      onSearch(value);
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [value, onSearch, debounceMs]);

  const handleClear = () => {
    setValue("");
    onSearch?.("");
  };

  return (
    <div className="panel-surface flex items-center gap-3 rounded-3xl px-5 py-4 hover:shadow-lg transition group">
      <Search
        size={20}
        className="text-slate-400 group-hover:text-slate-500 transition"
      />
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className="w-full bg-transparent text-sm font-medium text-slate-900 placeholder-slate-400 outline-none"
      />
      {value && (
        <button
          onClick={handleClear}
          className="rounded-lg p-1 hover:bg-slate-100 transition text-slate-400 hover:text-slate-600"
        >
          <X size={18} />
        </button>
      )}
    </div>
  );
}
