import { useState, useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react";

interface CategoryDropdownProps {
    selectedCategory: string;
    categories: string[];
    onCategoryChange: (value: string) => void;
}

function CategoryDropdown({ selectedCategory, categories, onCategoryChange }: CategoryDropdownProps) {
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    const displayLabel = selectedCategory === "all" ? "Kõik kategooriad" : selectedCategory;

    return (
        <div className="relative" ref={ref}>
            <button
                onClick={() => setOpen((o) => !o)}
                className="flex items-center gap-2 pl-4 pr-10 py-2 bg-zinc-800/60 backdrop-blur-sm border border-zinc-700 rounded-lg text-white focus:outline-none focus:border-violet-400 transition cursor-pointer relative"
            >
                {displayLabel}
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
            </button>

            {open && (
                <div className="absolute z-50 mt-2 p-2 bg-zinc-800 border border-zinc-600 rounded-lg shadow-xl min-w-[320px]">
                    <button
                        onClick={() => { onCategoryChange("all"); setOpen(false); }}
                        className={`w-full text-left px-3 py-1.5 rounded-md text-sm transition mb-1 cursor-pointer
                            ${selectedCategory === "all"
                            ? "bg-zinc-600 text-white"
                            : "text-zinc-300 hover:bg-zinc-600"}`}
                    >
                        Kõik kategooriad
                    </button>

                    <div className="grid grid-cols-2 gap-1">
                        {categories.map((category) => (
                            <button
                                key={category}
                                onClick={() => { onCategoryChange(category); setOpen(false); }}
                                className={`text-left px-3 py-1.5 rounded-md text-sm transition truncate cursor-pointer
                                    ${selectedCategory === category
                                    ? "bg-zinc-600 text-white"
                                    : "text-zinc-300 hover:bg-zinc-600"}`}
                            >
                                {category}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

export default CategoryDropdown;