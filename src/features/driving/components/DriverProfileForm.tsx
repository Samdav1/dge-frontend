import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Car, AlertTriangle, CheckCircle, Shield, Star, TrendingUp, Camera, FileText } from "lucide-react";
import { getDriverProfile, createDriverProfile, updateDriverProfile, uploadDriverCarPicture, uploadDriverLicensePicture } from "../actions";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

interface DriverProfileFormProps {
    isAccepting?: boolean;
    onToggleAccepting?: (val: boolean) => void;
}

export function DriverProfileForm({ isAccepting, onToggleAccepting }: DriverProfileFormProps = {}) {
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [isExisting, setIsExisting] = useState(false);
    
    const [carPictureFile, setCarPictureFile] = useState<File | null>(null);
    const [carPicturePreview, setCarPicturePreview] = useState<string | null>(null);

    const [licensePictureFile, setLicensePictureFile] = useState<File | null>(null);
    const [licensePicturePreview, setLicensePicturePreview] = useState<string | null>(null);
    const [licenseStatus, setLicenseStatus] = useState<string>("unverified");
    const [licenseRejectionReason, setLicenseRejectionReason] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        car_name: "",
        car_model: "",
        plate_number: "",
        vehicle_type: "car",
        license_number: "",
    });

    const fetchProfile = async () => {
        setIsLoading(true);
        const res = await getDriverProfile();
        if (res.success && res.data) {
            setIsExisting(true);
            setFormData({
                car_name: res.data.car_name || "",
                car_model: res.data.car_model || "",
                plate_number: res.data.plate_number || "",
                vehicle_type: res.data.vehicle_type || "car",
                license_number: res.data.license_number || "",
            });
            setLicenseStatus(res.data.license_status || "unverified");
            setLicenseRejectionReason(res.data.license_rejection_reason || null);

            if (res.data.car_picture_url) {
                let previewUrl = res.data.car_picture_url;
                if (!previewUrl.startsWith("http")) {
                    const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";
                    previewUrl = `${BASE_URL.replace('0.0.0.0', '127.0.0.1')}${previewUrl}`;
                }
                setCarPicturePreview(previewUrl);
            }

            if (res.data.license_picture_url) {
                let previewUrl = res.data.license_picture_url;
                if (!previewUrl.startsWith("http")) {
                    const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";
                    previewUrl = `${BASE_URL.replace('0.0.0.0', '127.0.0.1')}${previewUrl}`;
                }
                setLicensePicturePreview(previewUrl);
            }
        } else {
            setIsExisting(false);
        }
        setIsLoading(false);
    };

    useEffect(() => {
        fetchProfile();
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setSuccessMessage(null);

        if (!formData.car_name || !formData.car_model || !formData.plate_number || !formData.license_number) {
            setError("All fields (including driver's license number) are required.");
            return;
        }

        if (!isExisting && !licensePictureFile) {
            setError("You must upload a clear image of your driver's license.");
            return;
        }

        setIsSubmitting(true);
        try {
            let result;
            if (isExisting) {
                result = await updateDriverProfile(formData);
            } else {
                result = await createDriverProfile(formData);
            }

            if (result.success) {
                // Upload vehicle photo
                if (carPictureFile) {
                    const uploadData = new FormData();
                    uploadData.append("file", carPictureFile);
                    const uploadResult = await uploadDriverCarPicture(uploadData);
                    if (!uploadResult.success) {
                        setError(uploadResult.error || "Profile saved, but vehicle picture upload failed.");
                        setIsSubmitting(false);
                        return;
                    }
                }
                // Upload license photo
                if (licensePictureFile) {
                    const uploadData = new FormData();
                    uploadData.append("file", licensePictureFile);
                    const uploadResult = await uploadDriverLicensePicture(uploadData);
                    if (!uploadResult.success) {
                        setError(uploadResult.error || "Profile saved, but license picture upload failed.");
                        setIsSubmitting(false);
                        return;
                    }
                }
                setSuccessMessage(isExisting ? "Driver profile updated successfully!" : "Driver profile created successfully!");
                setIsExisting(true);
                await fetchProfile();
            } else {
                setError(result.error || "Failed to save driver profile.");
            }
        } catch (err) {
            console.error("Submit driver profile error:", err);
            setError("An unexpected error occurred.");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center p-12 bg-white rounded-2xl border border-gray-100 shadow-sm">
                <div className="text-center">
                    <Loader2 className="w-8 h-8 text-[#C69C2E] animate-spin mx-auto mb-3" />
                    <p className="text-sm text-gray-400">Loading profile...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* License Status Banner */}
            <div className={`p-4 rounded-xl flex items-start gap-3 border ${
                licenseStatus === "verified" ? "bg-green-50 border-green-200 text-green-800" :
                licenseStatus === "pending" ? "bg-amber-50 border-amber-200 text-amber-800" :
                licenseStatus === "rejected" ? "bg-red-50 border-red-200 text-red-800" :
                "bg-gray-50 border-gray-200 text-gray-800"
            }`}>
                {licenseStatus === "verified" && <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />}
                {licenseStatus === "pending" && <Loader2 className="w-5 h-5 text-amber-500 mt-0.5 animate-spin" />}
                {licenseStatus === "rejected" && <AlertTriangle className="w-5 h-5 text-red-500 mt-0.5" />}
                {licenseStatus === "unverified" && <AlertTriangle className="w-5 h-5 text-gray-500 mt-0.5" />}
                
                <div>
                    <h3 className="font-semibold capitalize">Driver Status: {licenseStatus}</h3>
                    {licenseStatus === "verified" && <p className="text-sm opacity-90">Your driver's license has been verified. You can now accept rides.</p>}
                    {licenseStatus === "pending" && <p className="text-sm opacity-90">Your driver's license application is under review by our administrators.</p>}
                    {licenseStatus === "rejected" && (
                        <p className="text-sm opacity-90">
                            Your application was rejected. Reason: {licenseRejectionReason || "Invalid driver's license."}
                        </p>
                    )}
                    {licenseStatus === "unverified" && <p className="text-sm opacity-90">Please enter your driver's license information and upload images to apply.</p>}
                </div>
            </div>

            {/* Quick Stats Cards */}
            {licenseStatus === "verified" && (
                <div className="grid grid-cols-3 gap-3">
                    {[
                        { icon: Star, label: 'Rating', value: '4.9', color: '#F59E0B' },
                        { icon: TrendingUp, label: 'Completion', value: '98%', color: '#10B981' },
                        { icon: Shield, label: 'Status', value: 'Active', color: '#3B82F6' },
                    ].map((stat, i) => (
                        <div key={i} className="p-4 rounded-xl bg-white border border-gray-100 shadow-sm">
                            <div className="w-9 h-9 rounded-lg flex items-center justify-center mb-2.5"
                                style={{ background: `${stat.color}10`, border: `1px solid ${stat.color}20` }}>
                                <stat.icon className="h-4 w-4" style={{ color: stat.color }} />
                            </div>
                            <p className="text-[10px] text-gray-400 font-medium">{stat.label}</p>
                            <p className="text-lg font-bold text-gray-900">{stat.value}</p>
                        </div>
                    ))}
                </div>
            )}

            {/* Profile Form */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                {/* Header with accent */}
                <div className="h-1 bg-gradient-to-r from-[#C69C2E] to-[#E5B84D]" />
                <div className="p-6 lg:p-8 space-y-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2.5">
                                <div className="w-9 h-9 rounded-xl bg-[#C69C2E]/10 flex items-center justify-center">
                                    <Car className="w-5 h-5 text-[#C69C2E]" />
                                </div>
                                Vehicle & License Information
                            </h2>
                            <p className="text-xs text-gray-400 mt-1 ml-[46px]">
                                {isExisting ? 'Update your vehicle and driver details' : 'Set up your driver profile to start earning'}
                            </p>
                        </div>

                        {/* Accept Ride Requests Toggle */}
                        {licenseStatus === "verified" && onToggleAccepting && (
                            <div className="flex items-center gap-3">
                                <span className="text-sm font-semibold text-gray-700">Accepting Rides</span>
                                <button
                                    type="button"
                                    onClick={() => onToggleAccepting(!isAccepting)}
                                    className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${isAccepting ? 'bg-green-500' : 'bg-gray-200'}`}
                                >
                                    <span className="sr-only">Accept Ride Requests</span>
                                    <span
                                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${isAccepting ? 'translate-x-5' : 'translate-x-0'}`}
                                    />
                                </button>
                            </div>
                        )}
                    </div>

                    {error && (
                        <div className="p-3.5 rounded-xl bg-red-50 border border-red-100 text-sm flex items-center gap-2.5">
                            <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0" />
                            <span className="text-red-600 text-xs font-medium">{error}</span>
                        </div>
                    )}
                    
                    {successMessage && (
                        <div className="p-3.5 rounded-xl bg-green-50 border border-green-100 text-sm flex items-center gap-2.5">
                            <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                            <span className="text-green-600 text-xs font-medium">{successMessage}</span>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Vehicle Photo Upload */}
                            <div>
                                <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5 block">Vehicle / Card Photo</label>
                                <div 
                                    onClick={() => document.getElementById("car-picture-input")?.click()}
                                    className="group relative border-2 border-dashed border-gray-200 hover:border-[#C69C2E]/40 rounded-2xl p-4 flex flex-col items-center justify-center cursor-pointer transition-all bg-gray-50/50 hover:bg-gray-50 text-center"
                                >
                                    <input
                                        id="car-picture-input"
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => {
                                            const file = e.target.files?.[0];
                                            if (file) {
                                                setCarPictureFile(file);
                                                const reader = new FileReader();
                                                reader.onloadend = () => {
                                                    setCarPicturePreview(reader.result as string);
                                                };
                                                reader.readAsDataURL(file);
                                            }
                                        }}
                                        className="hidden"
                                    />
                                    {carPicturePreview ? (
                                        <div className="relative w-full h-40 rounded-xl overflow-hidden shadow-sm">
                                            <img src={carPicturePreview} alt="Vehicle Preview" className="w-full h-full object-cover" />
                                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center text-white transition-opacity duration-200 gap-1.5">
                                                <Camera className="w-6 h-6 text-[#C69C2E]" />
                                                <span className="text-xs font-bold">Change Photo</span>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="py-4 flex flex-col items-center gap-2">
                                            <div className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center border border-gray-100 group-hover:scale-110 transition-transform">
                                                <Camera className="w-5 h-5 text-gray-400 group-hover:text-[#C69C2E]" />
                                            </div>
                                            <div className="text-xs font-bold text-gray-700">Upload car image or document</div>
                                            <div className="text-[10px] text-gray-400">PNG, JPG or WEBP up to 5MB</div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Driver License Photo Upload */}
                            <div>
                                <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5 block">Driver's License Photo</label>
                                <div 
                                    onClick={() => document.getElementById("license-picture-input")?.click()}
                                    className="group relative border-2 border-dashed border-gray-200 hover:border-[#C69C2E]/40 rounded-2xl p-4 flex flex-col items-center justify-center cursor-pointer transition-all bg-gray-50/50 hover:bg-gray-50 text-center"
                                >
                                    <input
                                        id="license-picture-input"
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => {
                                            const file = e.target.files?.[0];
                                            if (file) {
                                                setLicensePictureFile(file);
                                                const reader = new FileReader();
                                                reader.onloadend = () => {
                                                    setLicensePicturePreview(reader.result as string);
                                                };
                                                reader.readAsDataURL(file);
                                            }
                                        }}
                                        className="hidden"
                                    />
                                    {licensePicturePreview ? (
                                        <div className="relative w-full h-40 rounded-xl overflow-hidden shadow-sm">
                                            <img src={licensePicturePreview} alt="License Preview" className="w-full h-full object-cover" />
                                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center text-white transition-opacity duration-200 gap-1.5">
                                                <Camera className="w-6 h-6 text-[#C69C2E]" />
                                                <span className="text-xs font-bold">Change Photo</span>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="py-4 flex flex-col items-center gap-2">
                                            <div className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center border border-gray-100 group-hover:scale-110 transition-transform">
                                                <FileText className="w-5 h-5 text-gray-400 group-hover:text-[#C69C2E]" />
                                            </div>
                                            <div className="text-xs font-bold text-gray-700">Upload license image</div>
                                            <div className="text-[10px] text-gray-400">PNG, JPG or WEBP up to 5MB</div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div>
                            <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5 block">Driver's License Number</label>
                            <Input
                                name="license_number"
                                value={formData.license_number}
                                onChange={handleChange}
                                placeholder="e.g. DL-12345678"
                                className="h-12 bg-gray-50/80 border-gray-100 rounded-xl text-sm focus:ring-[#C69C2E]/20 focus:border-[#C69C2E]/30"
                            />
                        </div>

                        <div>
                            <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5 block">Car Make</label>
                            <Input
                                name="car_name"
                                value={formData.car_name}
                                onChange={handleChange}
                                placeholder="e.g. Toyota"
                                className="h-12 bg-gray-50/80 border-gray-100 rounded-xl text-sm focus:ring-[#C69C2E]/20 focus:border-[#C69C2E]/30"
                            />
                        </div>

                        <div>
                            <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5 block">Car Model</label>
                            <Input
                                name="car_model"
                                value={formData.car_model}
                                onChange={handleChange}
                                placeholder="e.g. Camry"
                                className="h-12 bg-gray-50/80 border-gray-100 rounded-xl text-sm focus:ring-[#C69C2E]/20 focus:border-[#C69C2E]/30"
                            />
                        </div>

                        <div>
                            <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5 block">Vehicle Type</label>
                            <Select value={formData.vehicle_type} onValueChange={(value) => setFormData(prev => ({ ...prev, vehicle_type: value }))}>
                                <SelectTrigger className="h-12 bg-gray-50/80 border-gray-100 rounded-xl text-sm focus:ring-[#C69C2E]/20 focus:border-[#C69C2E]/30 w-full text-left">
                                    <SelectValue placeholder="Select Vehicle Type" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="car">Car (Standard)</SelectItem>
                                    <SelectItem value="van">Van</SelectItem>
                                    <SelectItem value="truck">Truck</SelectItem>
                                    <SelectItem value="bike">Bike (Motorcycle)</SelectItem>
                                    <SelectItem value="tricycle">Tricycle (Keke)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div>
                            <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5 block">Plate Number</label>
                            <Input
                                name="plate_number"
                                value={formData.plate_number}
                                onChange={handleChange}
                                placeholder="e.g. ABC-123-XY"
                                className="h-12 bg-gray-50/80 border-gray-100 rounded-xl text-sm uppercase focus:ring-[#C69C2E]/20 focus:border-[#C69C2E]/30"
                            />
                        </div>

                        <Button
                            type="submit"
                            disabled={isSubmitting || licenseStatus === "verified" || licenseStatus === "pending"}
                            className="w-full h-12 bg-[#C69C2E] hover:bg-[#b08b29] text-white font-bold text-sm rounded-xl transition-all hover:shadow-lg hover:shadow-[#C69C2E]/20"
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    {isExisting ? "Updating..." : "Saving..."}
                                </>
                            ) : (
                                licenseStatus === "verified" ? "Driver Profile Verified" :
                                licenseStatus === "pending" ? "Verification Pending" :
                                isExisting ? "Update Vehicle & License Info" : "Apply as Driver"
                            )}
                        </Button>
                    </form>
                </div>
            </div>
        </div>
    );
}
