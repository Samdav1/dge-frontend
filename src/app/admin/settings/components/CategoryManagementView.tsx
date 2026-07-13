"use client";

import React, { useState, useEffect } from "react";
import {
    ChevronDown,
    MoreHorizontal,
    Plus,
    Edit,
    Trash2,
    Folder,
    X
} from "lucide-react";
import { getCategoryEmoji, resolveCategoryEmoji } from "@/features/marketplace/helpers";
import { useQueryClient } from "@tanstack/react-query";

const SUGGESTED_EMOJIS = [
    // Top services
    "🧑‍🍳", "🍳", "🍽️", "🍹", "🧹", "🧼", "🪣", "🪠", "⚡", "❄️", "🛠️", "🖌️", "🚗", "🛞", "📦", "🚛",
    "🌱", "🧑‍🌾", "💻", "🌐", "📱", "✂️", "💈", "💅", "💆", "🏋️", "🧘", "📸", "🎧", "🎤", "🎨", "✍️",
    "💵", "⚖️", "🔑", "🏠", "🚪", "📞", "📅", "🛡️", "🛍️", "🩺", "🐾", "🐕", "🐈", "🧬", "🧪", "🍕"
];

export default function CategoryManagementView() {
    const [categoriesList, setCategoriesList] = useState<any[]>([]);
    const queryClient = useQueryClient();

    const [isCategoryEmpty, setIsCategoryEmpty] = useState(false);
    const [addCategoryModalOpen, setAddCategoryModalOpen] = useState(false);
    const [editCategoryModalOpen, setEditCategoryModalOpen] = useState(false);
    const [deleteCategoryModalOpen, setDeleteCategoryModalOpen] = useState(false);
    const [bulkDeleteModalOpen, setBulkDeleteModalOpen] = useState(false);

    // Form states
    const [catName, setCatName] = useState("");
    const [catIcon, setCatIcon] = useState("");
    const [selectedRows, setSelectedRows] = useState<number[]>([]);

    const [editTargetIndex, setEditTargetIndex] = useState<number | null>(null);
    const [deleteTargetIndex, setDeleteTargetIndex] = useState<number | null>(null);

    const [activeRowPopup, setActiveRowPopup] = useState<number | null>(null);
    const [popupPosition, setPopupPosition] = useState({ top: 0, left: 0 });

    async function fetchCategories() {
        try {
            const res = await fetch(`/api/admin/categories?t=${Date.now()}`);
            if (res.ok) {
                const data = await res.json();
                if (Array.isArray(data)) {
                    setCategoriesList(data.map((item: any) => ({
                        id: item.id,
                        name: item.name,
                        icon: item.icon || "",
                        created: item.created_at ? new Date(item.created_at).toLocaleDateString("en-GB") : "N/A"
                    })));
                }
                // Invalidate query key to update other parts of the UI live
                queryClient.invalidateQueries({ queryKey: ["categories"] });
            }
        } catch (err) {
            console.error("Error fetching categories:", err);
        }
    }

    useEffect(() => {
        fetchCategories();
    }, []);

    const toggleRowPopup = (idx: number, event: React.MouseEvent) => {
        event.stopPropagation();
        if (activeRowPopup === idx) {
            setActiveRowPopup(null);
        } else {
            const rect = event.currentTarget.getBoundingClientRect();
            setPopupPosition({
                top: rect.bottom + window.scrollY,
                left: rect.left + window.scrollX - 140
            });
            setActiveRowPopup(idx);
        }
    };

    const handleToggleRow = (idx: number) => {
        if (selectedRows.includes(idx)) {
            setSelectedRows(selectedRows.filter((i) => i !== idx));
        } else {
            setSelectedRows([...selectedRows, idx]);
        }
    };

    const handleToggleAll = () => {
        if (selectedRows.length === categoriesList.length) {
            setSelectedRows([]);
        } else {
            setSelectedRows(categoriesList.map((_, i) => i));
        }
    };

    const handleAddCategory = async () => {
        if (!catName) {
            alert("Category name is required!");
            return;
        }
        try {
            const res = await fetch("/api/admin/categories", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name: catName, icon: catIcon })
            });
            if (res.ok) {
                alert("Category added successfully!");
                setCatName("");
                setCatIcon("");
                setAddCategoryModalOpen(false);
                fetchCategories();
            } else {
                alert("Failed to add category");
            }
        } catch (err) {
            console.error("Error adding category:", err);
        }
    };

    const handleExportCSV = () => {
        if (categoriesList.length === 0) return;
        
        const headers = ["Name", "Date Created"];
        const rows = categoriesList.map(c => [c.name, c.created]);
        
        const csvContent = [
            headers.join(","),
            ...rows.map(r => r.map(cell => `"${cell}"`).join(","))
        ].join("\n");
        
        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", `categories_export_${new Date().toISOString().split("T")[0]}.csv`);
        link.style.visibility = "hidden";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="space-y-6 flex-1 flex flex-col select-none relative animate-fade-in">
            {/* Toolbar section top right */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 select-none">
                <div className="flex items-center gap-2 select-none">
                    <button className="px-3 py-1.5 bg-white border border-slate-100 rounded-xl font-bold text-[10px] text-slate-500 flex items-center gap-1 select-none shadow-sm">
                        Status <ChevronDown size={12} />
                    </button>
                    <button className="px-3 py-1.5 bg-white border border-slate-100 rounded-xl font-bold text-[10px] text-slate-500 flex items-center gap-1 select-none shadow-sm">
                        Roles <ChevronDown size={12} />
                    </button>
 
                    <button
                        onClick={() => setIsCategoryEmpty(!isCategoryEmpty)}
                        className="px-3 py-1.5 bg-white border border-slate-100 rounded-xl font-bold text-[10px] text-slate-400 select-none shadow-sm ml-4"
                    >
                        Toggle Empty State
                    </button>
                </div>
 
                <div className="flex items-center gap-3 select-none">
                    {selectedRows.length > 0 ? (
                        /* Selected Context Actions */
                        <div className="flex items-center gap-2 select-none animate-fade-in">
                            <button
                                onClick={() => {
                                    if (selectedRows.length === 1) {
                                        const idx = selectedRows[0];
                                        setCatName(categoriesList[idx].name);
                                        setCatIcon(categoriesList[idx].icon && !/[a-zA-Z0-9]/.test(categoriesList[idx].icon) ? categoriesList[idx].icon : "");
                                        setEditTargetIndex(idx);
                                        setEditCategoryModalOpen(true);
                                    } else {
                                        alert("Please select exactly 1 category to edit.");
                                    }
                                }}
                                className="p-2 bg-blue-50 hover:bg-blue-100 border border-blue-100 rounded-xl text-blue-600 font-bold text-xs select-none hover:scale-[1.01] transition-all flex items-center gap-1 shadow-sm"
                            >
                                <Edit size={14} />
                            </button>
                            <button
                                onClick={() => setBulkDeleteModalOpen(true)}
                                className="p-2 bg-red-50 hover:bg-red-100 border border-red-100 rounded-xl text-red-600 font-bold text-xs select-none hover:scale-[1.01] transition-all flex items-center gap-1 shadow-sm"
                            >
                                <Trash2 size={14} />
                            </button>
                        </div>
                    ) : (
                        <>
                            <button 
                                onClick={handleExportCSV}
                                className="px-3.5 py-1.5 bg-white border border-slate-200 rounded-xl font-bold text-[11px] text-slate-600 hover:bg-slate-50 select-none shadow-sm transition-all flex items-center gap-1"
                            >
                                Export CSV <ChevronDown size={13} className="text-slate-400" />
                            </button>
                            <button
                                onClick={() => {
                                    setCatName("");
                                    setCatIcon("");
                                    setAddCategoryModalOpen(true);
                                }}
                                className="px-4 py-2 bg-[#b68512] hover:bg-[#9d720f] active:bg-[#85610d] rounded-xl text-white font-bold text-[11px] select-none hover:scale-[1.01] shadow-sm transition-all flex items-center gap-1"
                            >
                                <Plus size={14} /> <span>Add New Category</span>
                            </button>
                        </>
                    )}
                </div>
            </div>

            {/* Content list or empty state */}
            {isCategoryEmpty || categoriesList.length === 0 ? (
                /* Categories empty state matching Screenshot 1 */
                <div className="bg-white p-12 flex flex-col items-center justify-center border border-slate-100 rounded-2xl min-h-[420px] text-center select-none shadow-[0_4px_24px_rgba(0,0,0,0.01)]">
                    <div className="w-20 h-20 bg-slate-50 border border-slate-100/50 rounded-2xl flex items-center justify-center mb-4 select-none">
                        <Folder className="w-10 h-10 text-slate-300" />
                    </div>
                    <h3 className="font-bold text-slate-800 text-sm tracking-tight leading-tight select-none">
                        No Categories Here
                    </h3>
                    <p className="text-xs text-slate-400 max-w-sm mt-1 select-none font-medium leading-normal mb-5">
                        It seems this section is currently empty. As you begin to add new category, they'll appear right here!
                    </p>
                    <button
                        onClick={() => setAddCategoryModalOpen(true)}
                        className="bg-[#b68512] hover:bg-[#9d720f] active:bg-[#85610d] px-5 py-2 rounded-xl text-white font-bold text-xs select-none hover:scale-[1.01] shadow-sm transition-all flex items-center gap-1"
                    >
                        <Plus size={15} /> <span>Add New Category</span>
                    </button>
                </div>
            ) : (
                /* Category populated list matching Screenshot 3 */
                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-[0_4px_24px_rgba(0,0,0,0.01)] flex flex-col justify-between overflow-x-auto select-none relative">
                    <table className="w-full text-left border-collapse select-none">
                        <thead>
                            <tr className="border-b border-slate-50 select-none">
                                <th className="py-3 px-2 w-10 select-none">
                                    <input
                                        type="checkbox"
                                        checked={selectedRows.length === categoriesList.length}
                                        onChange={handleToggleAll}
                                        className="w-4 h-4 rounded border-slate-200 focus:ring-amber-500 text-amber-600 bg-white"
                                    />
                                </th>
                                <th className="py-3 px-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                    Category Name
                                </th>
                                <th className="py-3 px-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                    Date Created
                                </th>
                                <th className="py-3 px-2 w-8"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50 select-none">
                            {categoriesList.map((cat, idx) => (
                                <tr
                                    key={idx}
                                    onClick={() => handleToggleRow(idx)}
                                    className={`cursor-pointer transition-colors select-none relative ${
                                        selectedRows.includes(idx) ? "bg-amber-50/20" : "hover:bg-slate-50/50"
                                    }`}
                                >
                                    <td className="py-4 px-2 select-none">
                                        <input
                                            type="checkbox"
                                            checked={selectedRows.includes(idx)}
                                            onChange={(e) => {
                                                e.stopPropagation();
                                                handleToggleRow(idx);
                                            }}
                                            onClick={(e) => e.stopPropagation()}
                                            className="w-4 h-4 rounded border-slate-200 focus:ring-amber-500 text-amber-600 bg-white"
                                        />
                                    </td>
                                    <td className="py-4 px-2 text-xs font-bold text-slate-800 leading-none select-none flex items-center gap-2">
                                        <span className="text-sm font-normal">{resolveCategoryEmoji(cat.icon, cat.name)}</span>
                                        <span>{cat.name}</span>
                                    </td>
                                    <td className="py-4 px-2 text-xs text-slate-400 font-medium select-none leading-none">
                                        {cat.created || cat.created_at || "N/A"}
                                    </td>
                                    <td className="py-4 px-2 select-none text-slate-400 hover:text-slate-600 relative">
                                        <button
                                            onClick={(e) => toggleRowPopup(idx, e)}
                                            className="focus:outline-none select-none relative p-1 rounded-md hover:bg-slate-100"
                                        >
                                            <MoreHorizontal size={16} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {/* Fixed Positioned Popups to avoid clipping */}
                    {activeRowPopup !== null && (
                        <div 
                            className="fixed bg-white border border-slate-100 shadow-xl rounded-xl p-1 z-[100] flex flex-col select-none animate-fade-in w-36"
                            style={{ 
                                top: `${popupPosition.top - window.scrollY}px`, 
                                left: `${popupPosition.left - window.scrollX}px` 
                            }}
                        >
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    const cat = categoriesList[activeRowPopup];
                                    setCatName(cat.name);
                                    setCatIcon(cat.icon && !/[a-zA-Z0-9]/.test(cat.icon) ? cat.icon : "");
                                    setEditTargetIndex(activeRowPopup);
                                    setActiveRowPopup(null);
                                    setEditCategoryModalOpen(true);
                                }}
                                className="flex items-center gap-2.5 px-3 py-2 text-slate-600 hover:bg-slate-50 rounded-lg text-xs font-semibold select-none transition-all text-left"
                            >
                                <Edit size={13} className="text-slate-400" />
                                <span>Update Category</span>
                            </button>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setDeleteTargetIndex(activeRowPopup);
                                    setActiveRowPopup(null);
                                    setDeleteCategoryModalOpen(true);
                                }}
                                className="flex items-center gap-2.5 px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg text-xs font-semibold select-none transition-all text-left border-t border-slate-50 mt-1 pt-2"
                            >
                                <Trash2 size={13} />
                                <span>Delete Category</span>
                            </button>
                        </div>
                    )}

                    {/* Footer pagination exactly matching screenshots */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mt-6 select-none pt-4 border-t border-slate-50 select-none">
                        <div className="flex items-center gap-2 select-none">
                            <select className="px-2.5 py-1.5 bg-white border border-slate-200 rounded-xl font-bold text-xs text-slate-600 focus:outline-none focus:ring-2 focus:ring-amber-50">
                                <option value="50">50</option>
                                <option value="100">100</option>
                            </select>
                            <span className="text-xs font-semibold text-slate-400 select-none">
                                Rows Per Page
                            </span>
                        </div>

                        <div className="flex items-center gap-4 select-none">
                            <span className="text-xs font-semibold text-slate-400 select-none">
                                Page 1 of 7
                            </span>
                            <div className="flex items-center gap-2 select-none">
                                <button className="p-1 rounded-full border border-slate-200 hover:bg-slate-50 text-slate-400 hover:text-slate-600 select-none transition-colors">
                                    <ChevronDown size={14} className="rotate-90" />
                                </button>
                                <button className="p-1 rounded-full border border-slate-200 hover:bg-slate-50 text-slate-400 hover:text-slate-600 select-none transition-colors">
                                    <ChevronDown size={14} className="-rotate-90" />
                                </button>
                            </div>
                            <span className="text-xs font-bold text-slate-600 select-none">
                                Showing 10 of 70
                            </span>
                        </div>
                    </div>
                </div>
            )}

            {/* Slider Add Category modal exactly matching Image 2 */}
            {addCategoryModalOpen && (
                <div className="fixed inset-0 z-50 flex justify-end select-none">
                    <div
                        onClick={() => setAddCategoryModalOpen(false)}
                        className="absolute inset-0 bg-black/20 backdrop-blur-sm transition-all"
                    ></div>

                    <div className="relative bg-white w-full max-w-sm h-full flex flex-col justify-between p-6 md:p-8 shadow-2xl border-l border-slate-100/50 select-none transform transition-all duration-300 animate-slide-in overflow-y-auto">
                        <div className="space-y-6 select-none">
                            <div className="flex items-center justify-between border-b border-slate-50 pb-4 select-none">
                                <h3 className="text-base font-bold text-slate-800 tracking-tight leading-tight select-none">
                                    Add Category
                                </h3>
                                <button
                                    onClick={() => setAddCategoryModalOpen(false)}
                                    className="p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all select-none"
                                >
                                    <X size={18} />
                                </button>
                            </div>

                            <div className="space-y-4">
                                <div className="space-y-1 select-none">
                                    <label className="text-xs font-bold text-slate-700 block select-none" htmlFor="catName">
                                        Category Name
                                    </label>
                                    <input
                                        id="catName"
                                        type="text"
                                        value={catName}
                                        onChange={(e) => setCatName(e.target.value)}
                                        placeholder="eg. UI/UX Designer"
                                        className="w-full h-10 px-3 bg-white rounded-xl border border-slate-100 focus:border-amber-500/50 focus:ring-4 focus:ring-amber-50 text-xs text-slate-700 placeholder:text-slate-300 transition-all outline-none"
                                    />
                                </div>

                                <div className="space-y-2 select-none">
                                    <label className="text-xs font-bold text-slate-700 block select-none">
                                        Category Icon (Emoji)
                                    </label>
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 bg-amber-50 border border-amber-100 rounded-xl flex items-center justify-center text-2xl shadow-sm">
                                            {catIcon || "📦"}
                                        </div>
                                        <input
                                            type="text"
                                            value={catIcon}
                                            onChange={(e) => setCatIcon(e.target.value)}
                                            placeholder="Paste emoji or choose below"
                                            maxLength={8}
                                            className="flex-1 h-10 px-3 bg-white rounded-xl border border-slate-100 focus:border-amber-500/50 focus:ring-4 focus:ring-amber-50 text-xs text-slate-700 placeholder:text-slate-300 transition-all outline-none"
                                        />
                                        {catIcon && (
                                            <button
                                                type="button"
                                                onClick={() => setCatIcon("")}
                                                className="px-2.5 py-1.5 border border-slate-200 rounded-xl text-[10px] font-bold text-slate-400 hover:text-slate-600 hover:bg-slate-50"
                                            >
                                                Clear
                                            </button>
                                        )}
                                    </div>
                                    <div className="border border-slate-50 rounded-xl p-2.5 bg-slate-50/50">
                                        <span className="text-[10px] font-bold text-slate-400 block mb-1.5">Suggested Icons Library</span>
                                        <div className="grid grid-cols-8 gap-1.5 max-h-32 overflow-y-auto pr-1">
                                            {SUGGESTED_EMOJIS.map((emoji) => (
                                                <button
                                                    key={emoji}
                                                    type="button"
                                                    onClick={() => setCatIcon(emoji)}
                                                    className={`w-7 h-7 flex items-center justify-center text-base rounded-lg hover:bg-white hover:shadow-sm border transition-all ${
                                                        catIcon === emoji ? "bg-white border-amber-500 shadow-sm" : "bg-transparent border-transparent"
                                                    }`}
                                                >
                                                    {emoji}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 pt-6 select-none mt-4 border-t border-slate-50">
                            <button
                                onClick={() => setAddCategoryModalOpen(false)}
                                className="flex-1 border border-slate-200 hover:bg-slate-50 px-3.5 py-2 rounded-full text-slate-600 font-bold text-xs select-none transition-all"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleAddCategory}
                                className="flex-1 bg-[#b68512] hover:bg-[#9d720f] active:bg-[#85610d] px-3.5 py-2 rounded-full text-white font-bold text-xs select-none hover:scale-[1.01] shadow-sm leading-none"
                            >
                                Add New Category
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Slider Edit Category modal */}
            {editCategoryModalOpen && editTargetIndex !== null && (
                <div className="fixed inset-0 z-50 flex justify-end select-none">
                    <div
                        onClick={() => setEditCategoryModalOpen(false)}
                        className="absolute inset-0 bg-black/20 backdrop-blur-sm transition-all"
                    ></div>

                    <div className="relative bg-white w-full max-w-sm h-full flex flex-col justify-between p-6 md:p-8 shadow-2xl border-l border-slate-100/50 select-none transform transition-all duration-300 animate-slide-in overflow-y-auto">
                        <div className="space-y-6 select-none">
                            <div className="flex items-center justify-between border-b border-slate-50 pb-4 select-none">
                                <h3 className="text-base font-bold text-slate-800 tracking-tight leading-tight select-none">
                                    Update Category
                                </h3>
                                <button
                                    onClick={() => setEditCategoryModalOpen(false)}
                                    className="p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all select-none"
                                >
                                    <X size={18} />
                                </button>
                            </div>

                            <div className="space-y-4">
                                <div className="space-y-1 select-none">
                                    <label className="text-xs font-bold text-slate-700 block select-none" htmlFor="editCatName">
                                        Category Name
                                    </label>
                                    <input
                                        id="editCatName"
                                        type="text"
                                        value={catName}
                                        onChange={(e) => setCatName(e.target.value)}
                                        placeholder="eg. UI/UX Designer"
                                        className="w-full h-10 px-3 bg-white rounded-xl border border-slate-100 focus:border-amber-500/50 focus:ring-4 focus:ring-amber-50 text-xs text-slate-700 placeholder:text-slate-300 transition-all outline-none"
                                    />
                                </div>

                                <div className="space-y-2 select-none">
                                    <label className="text-xs font-bold text-slate-700 block select-none">
                                        Category Icon (Emoji)
                                    </label>
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 bg-amber-50 border border-amber-100 rounded-xl flex items-center justify-center text-2xl shadow-sm">
                                            {catIcon || "📦"}
                                        </div>
                                        <input
                                            type="text"
                                            value={catIcon}
                                            onChange={(e) => setCatIcon(e.target.value)}
                                            placeholder="Paste emoji or choose below"
                                            maxLength={8}
                                            className="flex-1 h-10 px-3 bg-white rounded-xl border border-slate-100 focus:border-amber-500/50 focus:ring-4 focus:ring-amber-50 text-xs text-slate-700 placeholder:text-slate-300 transition-all outline-none"
                                        />
                                        {catIcon && (
                                            <button
                                                type="button"
                                                onClick={() => setCatIcon("")}
                                                className="px-2.5 py-1.5 border border-slate-200 rounded-xl text-[10px] font-bold text-slate-400 hover:text-slate-600 hover:bg-slate-50"
                                            >
                                                Clear
                                            </button>
                                        )}
                                    </div>
                                    <div className="border border-slate-50 rounded-xl p-2.5 bg-slate-50/50">
                                        <span className="text-[10px] font-bold text-slate-400 block mb-1.5">Suggested Icons Library</span>
                                        <div className="grid grid-cols-8 gap-1.5 max-h-32 overflow-y-auto pr-1">
                                            {SUGGESTED_EMOJIS.map((emoji) => (
                                                <button
                                                    key={emoji}
                                                    type="button"
                                                    onClick={() => setCatIcon(emoji)}
                                                    className={`w-7 h-7 flex items-center justify-center text-base rounded-lg hover:bg-white hover:shadow-sm border transition-all ${
                                                        catIcon === emoji ? "bg-white border-amber-500 shadow-sm" : "bg-transparent border-transparent"
                                                    }`}
                                                >
                                                    {emoji}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 pt-6 select-none mt-4 border-t border-slate-50">
                            <button
                                onClick={() => setEditCategoryModalOpen(false)}
                                className="flex-1 border border-slate-200 hover:bg-slate-50 px-3.5 py-2 rounded-full text-slate-600 font-bold text-xs select-none transition-all"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={async () => {
                                    if (!catName) {
                                        alert("Category name is required!");
                                        return;
                                    }
                                    const catId = categoriesList[editTargetIndex].id;
                                    try {
                                        const res = await fetch(`/api/admin/categories?category_id=${catId}`, {
                                            method: "PUT",
                                            headers: { "Content-Type": "application/json" },
                                            body: JSON.stringify({ name: catName, icon: catIcon })
                                        });
                                        if (res.ok) {
                                            alert("Category updated successfully!");
                                            setEditCategoryModalOpen(false);
                                            fetchCategories();
                                        } else {
                                            alert("Failed to update category");
                                        }
                                    } catch (err) {
                                        console.error("Error updating category:", err);
                                    }
                                }}
                                className="flex-1 bg-[#b68512] hover:bg-[#9d720f] active:bg-[#85610d] px-3.5 py-2 rounded-full text-white font-bold text-xs select-none hover:scale-[1.01] shadow-sm leading-none"
                            >
                                Update Category
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Single Delete confirmation modal exactly matching Screenshot 4 */}
            {deleteCategoryModalOpen && deleteTargetIndex !== null && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 select-none">
                    <div
                        onClick={() => setDeleteCategoryModalOpen(false)}
                        className="absolute inset-0 bg-black/20 backdrop-blur-sm transition-all"
                    ></div>

                    <div className="relative bg-white w-full max-w-md h-auto p-6 md:p-8 rounded-2xl border border-slate-100 shadow-2xl flex flex-col items-center justify-center text-center select-none transform transition-all duration-300 animate-fade-in">
                        {/* Close button at top-right */}
                        <button
                            onClick={() => setDeleteCategoryModalOpen(false)}
                            className="absolute top-4 right-4 p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all select-none"
                        >
                            <X size={18} />
                        </button>

                        <div className="w-16 h-16 rounded-xl bg-red-50 border border-red-100 flex items-center justify-center font-semibold text-red-600 mb-4 select-none shadow-sm">
                            <Trash2 className="w-8 h-8 text-red-600" />
                        </div>

                        <h3 className="font-bold text-slate-800 text-lg tracking-tight select-none mb-3">
                            Delete Category?
                        </h3>

                        <div className="bg-red-50/50 border border-red-100/50 p-4 rounded-xl text-center mb-6 max-w-sm">
                            <p className="text-[11px] text-slate-600 font-medium leading-normal flex items-start gap-1 select-none">
                                ⚠️ You have selected this category to delete. If this was the action that you wanted to do, please confirm your choice or cancel and return to the page.
                            </p>
                        </div>

                        <div className="flex items-center gap-3 w-full select-none">
                            <button
                                onClick={() => setDeleteCategoryModalOpen(false)}
                                className="flex-1 border border-slate-200 hover:bg-slate-50 px-4 py-2.5 rounded-full text-slate-600 font-bold text-xs select-none transition-all"
                            >
                                No, Cancel
                            </button>
                            <button
                                onClick={async () => {
                                    const catId = categoriesList[deleteTargetIndex].id;
                                    try {
                                        const res = await fetch(`/api/admin/categories?category_id=${catId}`, {
                                            method: "DELETE"
                                        });
                                        if (res.ok) {
                                            alert("Category deleted successfully!");
                                            setDeleteCategoryModalOpen(false);
                                            setDeleteTargetIndex(null);
                                            fetchCategories();
                                        } else {
                                            alert("Failed to delete category");
                                        }
                                    } catch (err) {
                                        console.error("Error deleting category:", err);
                                    }
                                }}
                                className="flex-1 bg-red-600 hover:bg-red-700 active:bg-red-800 px-4 py-2.5 rounded-full text-white font-bold text-xs select-none hover:scale-[1.01] transition-all shadow-sm leading-none"
                            >
                                Yes, Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Bulk delete modal exactly matching Screenshot 4 */}
            {bulkDeleteModalOpen && selectedRows.length > 0 && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 select-none">
                    <div
                        onClick={() => setBulkDeleteModalOpen(false)}
                        className="absolute inset-0 bg-black/20 backdrop-blur-sm transition-all"
                    ></div>

                    <div className="relative bg-white w-full max-w-md h-auto p-6 md:p-8 rounded-2xl border border-slate-100 shadow-2xl flex flex-col items-center justify-center text-center select-none transform transition-all duration-300 animate-fade-in">
                        {/* Close button at top-right */}
                        <button
                            onClick={() => setBulkDeleteModalOpen(false)}
                            className="absolute top-4 right-4 p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all select-none"
                        >
                            <X size={18} />
                        </button>

                        <div className="w-16 h-16 rounded-xl bg-red-50 border border-red-100 flex items-center justify-center font-semibold text-red-600 mb-4 select-none shadow-sm">
                            <Trash2 className="w-8 h-8 text-red-600" />
                        </div>

                        <h3 className="font-bold text-slate-800 text-lg tracking-tight select-none mb-3">
                            Delete Categories?
                        </h3>

                        <div className="bg-red-50/50 border border-red-100/50 p-4 rounded-xl text-center mb-6 max-w-sm">
                            <p className="text-[11px] text-slate-600 font-medium leading-normal flex items-start gap-1 select-none">
                                ⚠️ You have selected these categories to delete. If this was the action that you wanted to do, please confirm your choice or cancel and return to the page.
                            </p>
                        </div>

                        <div className="flex items-center gap-3 w-full select-none">
                            <button
                                onClick={() => setBulkDeleteModalOpen(false)}
                                className="flex-1 border border-slate-200 hover:bg-slate-50 px-4 py-2.5 rounded-full text-slate-600 font-bold text-xs select-none transition-all"
                            >
                                No, Cancel
                            </button>
                            <button
                                onClick={async () => {
                                    for (const idx of selectedRows) {
                                        const catId = categoriesList[idx]?.id;
                                        if (catId) {
                                            try {
                                                await fetch(`/api/admin/categories?category_id=${catId}`, { method: "DELETE" });
                                            } catch {}
                                        }
                                    }
                                    await fetchCategories();
                                    setSelectedRows([]);
                                    setBulkDeleteModalOpen(false);
                                }}
                                className="flex-1 bg-red-600 hover:bg-red-700 active:bg-red-800 px-4 py-2.5 rounded-full text-white font-bold text-xs select-none hover:scale-[1.01] transition-all shadow-sm leading-none"
                            >
                                Yes, Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
