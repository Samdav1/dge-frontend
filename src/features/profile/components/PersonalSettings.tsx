import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { 
    Image as ImageIcon, 
    Loader2, 
    CheckCircle, 
    AlertTriangle, 
    Camera, 
    User, 
    Phone, 
    Calendar, 
    MapPin, 
    Globe, 
    FileText, 
    ArrowRight 
} from "lucide-react";
import { updateProfile, getProfile } from "../actions";
import FallbackImage from "@/components/ui/FallbackImage";
import { COUNTRIES, STATES_BY_COUNTRY } from "@/lib/countries-states";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

function SuccessModal({
    open,
    onClose,
    title,
    message,
    nextLabel = "Continue to Portfolio Setup",
    onNext,
}: {
    open: boolean;
    onClose: () => void;
    title: string;
    message: string;
    nextLabel?: string;
    onNext?: () => void;
}) {
    const [countdown, setCountdown] = useState(3);

    useEffect(() => {
        if (!open || !onNext) return;
        setCountdown(3);
        const timer = setInterval(() => {
            setCountdown((prev) => {
                if (prev <= 1) {
                    clearInterval(timer);
                    onClose();
                    onNext();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(timer);
    }, [open, onNext, onClose]);

    if (!open) return null;

    const handleNextClick = () => {
        onClose();
        if (onNext) onNext();
    };

    return (
        <div className="fixed inset-0 bg-black/60 z-[60] flex items-center justify-center p-4 animate-in fade-in duration-200" onClick={onClose}>
            <div className="bg-white dark:bg-[#121212] border border-gray-100 dark:border-[#2A2A2A] rounded-3xl w-full max-w-sm shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
                <div className="p-8 text-center">
                    <div className="w-16 h-16 bg-emerald-50 dark:bg-emerald-950/30 rounded-full flex items-center justify-center mx-auto mb-4 text-emerald-500">
                        <CheckCircle className="w-8 h-8" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{title}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">{message}</p>

                    {onNext && (
                        <div className="mb-6 p-3 rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-800/30 text-xs text-amber-700 dark:text-amber-400 flex items-center justify-center gap-2">
                            <span>Auto-advancing to next section in <strong>{countdown}s</strong>...</span>
                        </div>
                    )}

                    <div className="flex flex-col gap-2.5">
                        {onNext && (
                            <button
                                onClick={handleNextClick}
                                className="w-full py-3.5 rounded-xl bg-[#C69C2E] text-white text-sm font-bold hover:bg-[#b08b29] transition-all shadow-lg shadow-[#C69C2E]/20 cursor-pointer flex items-center justify-center gap-2 group"
                            >
                                <span>{nextLabel}</span>
                                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                            </button>
                        )}
                        <button
                            onClick={onClose}
                            className={`w-full py-2.5 rounded-xl text-xs font-semibold text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors cursor-pointer ${
                                !onNext ? "bg-[#C69C2E] text-white !py-3.5 !text-sm font-bold" : ""
                            }`}
                        >
                            {onNext ? "Stay on this section" : "Great!"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

interface PersonalSettingsProps {
    onNext?: () => void;
}

export function PersonalSettings({ onNext }: PersonalSettingsProps = {}) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showSuccess, setShowSuccess] = useState(false);
    const [avatarFile, setAvatarFile] = useState<File | null>(null);
    const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [dynamicStates, setDynamicStates] = useState<string[]>([]);
    const [loadingStates, setLoadingStates] = useState(false);
    const [dynamicCities, setDynamicCities] = useState<string[]>([]);
    const [loadingCities, setLoadingCities] = useState(false);

    const [formData, setFormData] = useState({
        bio: "",
        first_name: "",
        last_name: "",
        phone: "",
        date_of_birth: "",
        gender: "",
        country: "",
        state: "",
        city: "",
        address_line1: "",
        address_line2: "",
        postal_code: "",
    });

    const fetchProfile = async () => {
        const res = await getProfile();
        if (res.success && res.data) {
            const profile = res.data;
            setFormData({
                bio: profile.bio || "",
                first_name: profile.first_name || "",
                last_name: profile.last_name || "",
                phone: profile.phone || "",
                date_of_birth: profile.date_of_birth || "",
                gender: profile.gender || "",
                country: profile.country || "",
                state: profile.state || "",
                city: profile.city || "",
                address_line1: profile.address_line1 || "",
                address_line2: profile.address_line2 || "",
                postal_code: profile.postal_code || "",
            });

            if (profile.avatar_url) {
                let previewUrl = profile.avatar_url;
                if (!previewUrl.startsWith("http")) {
                    previewUrl = `${BASE_URL}${previewUrl}`;
                }
                setAvatarPreview(previewUrl);
            }
        }
    };

    useEffect(() => {
        fetchProfile();
    }, []);

    // Load states dynamically when selected country changes
    useEffect(() => {
        if (!formData.country) {
            setDynamicStates([]);
            return;
        }

        // If we already have predefined states, use them first
        if (STATES_BY_COUNTRY[formData.country]) {
            setDynamicStates(STATES_BY_COUNTRY[formData.country]);
            return;
        }

        let isSubscribed = true;
        const fetchStates = async () => {
            setLoadingStates(true);
            try {
                const res = await fetch("https://countriesnow.space/api/v0.1/countries/states", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ country: formData.country }),
                });
                if (!res.ok) throw new Error("Failed to fetch states");
                const json = await res.json();
                if (isSubscribed) {
                    if (json.data && Array.isArray(json.data.states)) {
                        const stateNames = json.data.states.map((s: any) => s.name);
                        setDynamicStates(stateNames);
                    } else {
                        setDynamicStates([]);
                    }
                }
            } catch (err) {
                console.error("Failed to fetch country states dynamically:", err);
                if (isSubscribed) setDynamicStates([]);
            } finally {
                if (isSubscribed) setLoadingStates(false);
            }
        };

        fetchStates();

        return () => {
            isSubscribed = false;
        };
    }, [formData.country]);

    // Load cities dynamically when selected country/state changes
    useEffect(() => {
        if (!formData.country || !formData.state) {
            setDynamicCities([]);
            return;
        }

        let isSubscribed = true;
        const fetchCities = async () => {
            setLoadingCities(true);
            try {
                const res = await fetch("https://countriesnow.space/api/v0.1/countries/state/cities", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ country: formData.country, state: formData.state }),
                });
                if (!res.ok) throw new Error("Failed to fetch cities");
                const json = await res.json();
                if (isSubscribed) {
                    if (json.data && Array.isArray(json.data)) {
                        setDynamicCities(json.data);
                    } else {
                        setDynamicCities([]);
                    }
                }
            } catch (err) {
                console.error("Failed to fetch country cities dynamically:", err);
                if (isSubscribed) setDynamicCities([]);
            } finally {
                if (isSubscribed) setLoadingCities(false);
            }
        };

        fetchCities();

        return () => {
            isSubscribed = false;
        };
    }, [formData.country, formData.state]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSelectChange = (field: string, value: string) => {
        setFormData(prev => {
            const updated = { ...prev, [field]: value };
            if (field === "country") {
                updated.state = ""; // Reset state when country changes
                updated.city = "";  // Reset city when country changes
            } else if (field === "state") {
                updated.city = "";  // Reset city when state changes
            }
            return updated;
        });
    };

    const handleAvatarClick = () => {
        fileInputRef.current?.click();
    };

    const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setAvatarFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setAvatarPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setShowSuccess(false);
        setIsSubmitting(true);

        try {
            const submitData = new FormData();

            Object.entries(formData).forEach(([key, value]) => {
                if (value) submitData.append(key, value);
            });

            if (avatarFile) {
                submitData.append("avatar_file", avatarFile);
            }

            const result = await updateProfile(submitData);

            if (result.success) {
                setShowSuccess(true);
                await fetchProfile(); // Refresh to get the latest avatar URL etc.
            } else {
                setError(result.error || "Failed to update profile");
            }
        } catch (err) {
            console.error("Submit error:", err);
            setError("An unexpected error occurred");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-8 max-w-4xl mx-auto">
            {error && (
                <div className="p-4 rounded-2xl bg-red-50 border border-red-100 text-red-600 text-sm flex items-center gap-2.5 animate-in fade-in duration-200">
                    <AlertTriangle className="w-5 h-5 text-red-500 shrink-0" />
                    <span className="font-medium">{error}</span>
                </div>
            )}

            {/* Profile Avatar / Cover Card */}
            <div className="relative bg-gradient-to-r from-gray-900 to-gray-800 rounded-3xl p-6 sm:p-8 text-white overflow-hidden shadow-lg">
                <div className="absolute top-0 right-0 w-[300px] h-[300px] rounded-full bg-[#C69C2E]/10 blur-[100px] pointer-events-none" />
                <div className="relative z-10 flex flex-col sm:flex-row items-center gap-6">
                    {/* Avatar Upload Container */}
                    <div className="relative group cursor-pointer shrink-0" onClick={handleAvatarClick}>
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleAvatarChange}
                            accept="image/*"
                            className="hidden"
                        />
                        <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full border-4 border-white/10 overflow-hidden bg-white/5 flex items-center justify-center transition-all duration-300 group-hover:border-[#C69C2E] shadow-xl">
                            {avatarPreview ? (
                                <FallbackImage src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
                            ) : (
                                <User className="w-10 h-10 text-gray-400" />
                            )}
                        </div>
                        {/* Hover Overlay */}
                        <div className="absolute inset-0 rounded-full bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center text-white text-[10px] font-bold gap-1">
                            <Camera className="w-5 h-5 text-[#C69C2E]" />
                            <span>Change Photo</span>
                        </div>
                    </div>

                    {/* Quick Profile Summary */}
                    <div className="text-center sm:text-left flex-1 min-w-0">
                        <h2 className="text-xl sm:text-2xl font-bold truncate">
                            {formData.first_name || formData.last_name 
                                ? `${formData.first_name} ${formData.last_name}`.trim() 
                                : "Your Profile"}
                        </h2>
                        <p className="text-xs text-gray-400 mt-1 font-medium flex items-center justify-center sm:justify-start gap-1.5">
                            <Globe className="w-3.5 h-3.5" />
                            {formData.city && formData.country ? `${formData.city}, ${formData.country}` : "Location not set"}
                        </p>
                        <p className="text-xs text-gray-400 mt-2 line-clamp-2 max-w-xl italic">
                            {formData.bio || "No bio added yet. Tell the community a bit about yourself."}
                        </p>
                    </div>
                </div>
            </div>

            {/* Grid for Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Profile Details Card */}
                <div className="bg-white dark:bg-[#141414] rounded-3xl border border-gray-100 dark:border-[#2A2A2A] p-6 shadow-sm flex flex-col gap-5 hover:shadow-md transition-shadow duration-200">
                    <div className="flex items-center gap-3 border-b border-gray-50 dark:border-[#2A2A2A] pb-4">
                        <div className="w-9 h-9 rounded-xl bg-[#C69C2E]/10 flex items-center justify-center text-[#C69C2E]">
                            <User className="w-4 h-4" />
                        </div>
                        <div>
                            <h3 className="text-sm font-bold text-gray-900 dark:text-white">Personal Details</h3>
                            <p className="text-[10px] text-gray-400 dark:text-gray-500">Your basic information settings</p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-gray-500 dark:text-gray-400">First Name</label>
                                <Input
                                    name="first_name"
                                    value={formData.first_name}
                                    onChange={handleInputChange}
                                    placeholder="First name"
                                    className="h-11 bg-gray-50/50 dark:bg-[#1C1C1C] border-gray-100 dark:border-[#2E2E2E] dark:text-white rounded-xl focus:border-[#C69C2E]/50 focus:bg-white dark:focus:bg-[#1A1A1A] transition-all text-xs"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-gray-500 dark:text-gray-400">Last Name</label>
                                <Input
                                    name="last_name"
                                    value={formData.last_name}
                                    onChange={handleInputChange}
                                    placeholder="Last name"
                                    className="h-11 bg-gray-50/50 dark:bg-[#1C1C1C] border-gray-100 dark:border-[#2E2E2E] dark:text-white rounded-xl focus:border-[#C69C2E]/50 focus:bg-white dark:focus:bg-[#1A1A1A] transition-all text-xs"
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-gray-500 dark:text-gray-400">Biography</label>
                            <Textarea
                                name="bio"
                                value={formData.bio}
                                onChange={handleInputChange}
                                placeholder="Write a short bio about yourself..."
                                className="min-h-[96px] bg-gray-50/50 dark:bg-[#1C1C1C] border-gray-100 dark:border-[#2E2E2E] dark:text-white rounded-xl resize-none focus:border-[#C69C2E]/50 focus:bg-white dark:focus:bg-[#1A1A1A] transition-all text-xs py-3"
                            />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-gray-500 dark:text-gray-400">Date of Birth</label>
                                <Input
                                    name="date_of_birth"
                                    type="date"
                                    value={formData.date_of_birth}
                                    onChange={handleInputChange}
                                    className="h-11 bg-gray-50/50 dark:bg-[#1C1C1C] border-gray-100 dark:border-[#2E2E2E] dark:text-white rounded-xl focus:border-[#C69C2E]/50 focus:bg-white dark:focus:bg-[#1A1A1A] transition-all text-xs"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-gray-500 dark:text-gray-400">Gender</label>
                                <Select value={formData.gender} onValueChange={(v) => handleSelectChange("gender", v)}>
                                    <SelectTrigger className="h-11 bg-gray-50/50 dark:bg-[#1C1C1C] border-gray-100 dark:border-[#2E2E2E] dark:text-white rounded-xl focus:border-[#C69C2E]/50 focus:bg-white dark:focus:bg-[#1A1A1A] text-xs">
                                        <SelectValue placeholder="Select Gender" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="male">Male</SelectItem>
                                        <SelectItem value="female">Female</SelectItem>
                                        <SelectItem value="other">Other</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Contact & Location Card */}
                <div className="bg-white dark:bg-[#141414] rounded-3xl border border-gray-100 dark:border-[#2A2A2A] p-6 shadow-sm flex flex-col gap-5 hover:shadow-md transition-shadow duration-200">
                    <div className="flex items-center gap-3 border-b border-gray-50 dark:border-[#2A2A2A] pb-4">
                        <div className="w-9 h-9 rounded-xl bg-[#C69C2E]/10 flex items-center justify-center text-[#C69C2E]">
                            <Phone className="w-4 h-4" />
                        </div>
                        <div>
                            <h3 className="text-sm font-bold text-gray-900 dark:text-white">Contact & Address</h3>
                            <p className="text-[10px] text-gray-400 dark:text-gray-500">Manage communication and address details</p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-gray-500 dark:text-gray-400">Phone Number</label>
                            <Input
                                name="phone"
                                value={formData.phone}
                                onChange={handleInputChange}
                                placeholder="Enter phone number"
                                className="h-11 bg-gray-50/50 dark:bg-[#1C1C1C] border-gray-100 dark:border-[#2E2E2E] dark:text-white rounded-xl focus:border-[#C69C2E]/50 focus:bg-white dark:focus:bg-[#1A1A1A] transition-all text-xs"
                            />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-gray-500 dark:text-gray-400">Country</label>
                                <Select value={formData.country} onValueChange={(v) => handleSelectChange("country", v)}>
                                    <SelectTrigger className="h-11 bg-gray-50/50 dark:bg-[#1C1C1C] border-gray-100 dark:border-[#2E2E2E] dark:text-white rounded-xl focus:border-[#C69C2E]/50 focus:bg-white dark:focus:bg-[#1A1A1A] text-xs">
                                        <SelectValue placeholder="Select Country" />
                                    </SelectTrigger>
                                    <SelectContent className="max-h-[300px]">
                                        {COUNTRIES.map((country) => (
                                            <SelectItem key={country} value={country}>{country}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-gray-500 dark:text-gray-400">State / Region</label>
                                {loadingStates ? (
                                    <Input
                                        disabled
                                        placeholder="Loading states..."
                                        className="h-11 bg-gray-50/50 dark:bg-[#1C1C1C] border-gray-100 dark:border-[#2E2E2E] dark:text-white rounded-xl text-xs"
                                    />
                                ) : dynamicStates.length > 0 ? (
                                    <Select value={formData.state} onValueChange={(v) => handleSelectChange("state", v)}>
                                        <SelectTrigger className="h-11 bg-gray-50/50 dark:bg-[#1C1C1C] border-gray-100 dark:border-[#2E2E2E] dark:text-white rounded-xl focus:border-[#C69C2E]/50 focus:bg-white dark:focus:bg-[#1A1A1A] text-xs">
                                            <SelectValue placeholder="Select State" />
                                        </SelectTrigger>
                                        <SelectContent className="max-h-[300px]">
                                            {dynamicStates.map((st) => (
                                                <SelectItem key={st} value={st}>{st}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                ) : (
                                    <Input
                                        name="state"
                                        value={formData.state}
                                        onChange={handleInputChange}
                                        placeholder="Enter state"
                                        className="h-11 bg-gray-50/50 dark:bg-[#1C1C1C] border-gray-100 dark:border-[#2E2E2E] dark:text-white rounded-xl focus:border-[#C69C2E]/50 focus:bg-white dark:focus:bg-[#1A1A1A] transition-all text-xs"
                                    />
                                )}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-gray-500 dark:text-gray-400">
                                    City {loadingCities && <span className="text-[10px] text-gray-400 animate-pulse">(loading suggestions...)</span>}
                                </label>
                                <Input
                                    name="city"
                                    list="cities-list"
                                    value={formData.city}
                                    onChange={handleInputChange}
                                    placeholder={loadingCities ? "Loading cities..." : "Enter or select city"}
                                    className="h-11 bg-gray-50/50 dark:bg-[#1C1C1C] border-gray-100 dark:border-[#2E2E2E] dark:text-white rounded-xl focus:border-[#C69C2E]/50 focus:bg-white dark:focus:bg-[#1A1A1A] transition-all text-xs"
                                />
                                <datalist id="cities-list">
                                    {dynamicCities.map((city) => (
                                        <option key={city} value={city} />
                                    ))}
                                </datalist>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-gray-500 dark:text-gray-400">Postal Code</label>
                                <Input
                                    name="postal_code"
                                    value={formData.postal_code}
                                    onChange={handleInputChange}
                                    placeholder="Enter Postal"
                                    className="h-11 bg-gray-50/50 dark:bg-[#1C1C1C] border-gray-100 dark:border-[#2E2E2E] dark:text-white rounded-xl focus:border-[#C69C2E]/50 focus:bg-white dark:focus:bg-[#1A1A1A] transition-all text-xs"
                                />
                            </div>
                        </div>

                        <div className="space-y-4 pt-1">
                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-gray-500 dark:text-gray-400">Address Line 1</label>
                                <Input
                                    name="address_line1"
                                    value={formData.address_line1}
                                    onChange={handleInputChange}
                                    placeholder="Address Line 1"
                                    className="h-11 bg-gray-50/50 dark:bg-[#1C1C1C] border-gray-100 dark:border-[#2E2E2E] dark:text-white rounded-xl focus:border-[#C69C2E]/50 focus:bg-white dark:focus:bg-[#1A1A1A] transition-all text-xs"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-gray-500 dark:text-gray-400">Address Line 2 (Optional)</label>
                                <Input
                                    name="address_line2"
                                    value={formData.address_line2}
                                    onChange={handleInputChange}
                                    placeholder="Apartment, suite, unit etc."
                                    className="h-11 bg-gray-50/50 dark:bg-[#1C1C1C] border-gray-100 dark:border-[#2E2E2E] dark:text-white rounded-xl focus:border-[#C69C2E]/50 focus:bg-white dark:focus:bg-[#1A1A1A] transition-all text-xs"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Actions */}
            <div className="flex justify-end pt-4 border-t border-gray-50 dark:border-[#2A2A2A]">
                <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full sm:w-auto px-8 h-12 bg-[#C69C2E] hover:bg-[#b08b29] text-white font-bold rounded-xl shadow-lg shadow-[#C69C2E]/20 transition-all duration-300 flex items-center justify-center gap-2 group cursor-pointer"
                >
                    {isSubmitting ? (
                        <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Saving Profile...
                        </>
                    ) : (
                        <>
                            Save Changes
                            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                        </>
                    )}
                </Button>
            </div>

            <SuccessModal
                open={showSuccess}
                onClose={() => setShowSuccess(false)}
                title="Profile Updated!"
                message="Your personal settings have been successfully saved."
                nextLabel="Continue to Portfolio Setup"
                onNext={onNext}
            />
        </form>
    );
}
