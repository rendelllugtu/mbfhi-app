// src/pages/MBFHIApply.tsx

import { useState, useEffect } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { apiCall } from "../api/api";
import { Calendar, Clock, Upload, FileText, X, ChevronRight, ChevronLeft, Check } from "lucide-react";

type FormState = {
  name: string;
  email: string;
  facility: string;
  typeOfFacility: string[];
  contact: string;
  preferredDate: string;
  preferredTime: string;
  file: File | null;
};

type Errors = Partial<Record<keyof FormState, string>>;

const STEPS = [
  { id: 1, title: "Personal Info", description: "Your contact details" },
  { id: 2, title: "Facility", description: "Facility information" },
  { id: 3, title: "Schedule", description: "Preferred date & time" },
  { id: 4, title: "Documents", description: "Upload required files" },
  { id: 5, title: "Review", description: "Confirm your application" },
];

export default function MBFHIApply() {
  const [currentStep, setCurrentStep] = useState(1);
  const [isAnimating, setIsAnimating] = useState(false);
  const [direction, setDirection] = useState<"forward" | "backward">("forward");
  const [form, setForm] = useState<FormState>({
    name: "",
    email: "",
    facility: "",
    typeOfFacility: [],
    contact: "",
    preferredDate: "",
    preferredTime: "",
    file: null,
  });

  const facilityTypes = [
    "Hospital",
    "Rural Health Unit (RHU)",
    "Health Center",
    "Private Clinic",
    "Lying-in Clinic",
    "Birthing Home",
  ];

  const [errors, setErrors] = useState<Errors>({});
  const [unavailableDates, setUnavailableDates] = useState<string[]>([]);

  useEffect(() => {
    const fetchDates = async () => {
      const res = await apiCall<{ unavailable: string[] }>("getAvailableDates");
      setUnavailableDates(res.unavailable || []);
    };
    fetchDates();
  }, []);

  // =========================
  // STEP VALIDATION
  // =========================
  const validateStep = (step: number): boolean => {
    const newErrors: Errors = {};

    if (step === 1) {
      if (!form.name) newErrors.name = "Name is required";
      if (!form.email) newErrors.email = "Email is required";
      if (!form.contact) newErrors.contact = "Contact is required";
    } else if (step === 2) {
      if (!form.facility) newErrors.facility = "Facility is required";
      if (form.typeOfFacility.length === 0) newErrors.typeOfFacility = "Type of Facility is required";
    } else if (step === 3) {
      if (!form.preferredDate) newErrors.preferredDate = "Select a date";
      if (!form.preferredTime) newErrors.preferredTime = "Select a time";
    } else if (step === 4) {
      if (!form.file) {
        newErrors.file = "File is required";
      } else {
        const allowedTypes = [
          "application/pdf",
          "application/msword",
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        ];

        if (!allowedTypes.includes(form.file.type)) {
          newErrors.file = "Only PDF or DOC files allowed";
        }

        const maxSize = 5 * 1024 * 1024; // 5MB
        if (form.file.size > maxSize) {
          newErrors.file = "File must be less than 5MB";
        }
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // =========================
  // NAVIGATION
  // =========================
  const goToStep = (step: number) => {
    if (step < currentStep) {
      setDirection("backward");
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentStep(step);
        setIsAnimating(false);
      }, 300);
    } else if (step > currentStep) {
      if (validateStep(currentStep)) {
        setDirection("forward");
        setIsAnimating(true);
        setTimeout(() => {
          setCurrentStep(step);
          setIsAnimating(false);
        }, 300);
      }
    }
  };

  const nextStep = () => {
    if (currentStep < STEPS.length && validateStep(currentStep)) {
      setDirection("forward");
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentStep(currentStep + 1);
        setIsAnimating(false);
      }, 300);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setDirection("backward");
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentStep(currentStep - 1);
        setIsAnimating(false);
      }, 300);
    }
  };

  // =========================
  // HANDLERS
  // =========================
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (errors[e.target.name as keyof FormState]) {
      setErrors({ ...errors, [e.target.name]: undefined });
    }
  };

  const handleFile = (file: File) => {
    setForm({ ...form, file });
    if (errors.file) {
      setErrors({ ...errors, file: undefined });
    }
  };

  const handleInputFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    handleFile(e.target.files[0]);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const removeFile = () => {
    setForm({ ...form, file: null });
  };

  const handleFacilityTypeChange = (type: string) => {
    const currentTypes = form.typeOfFacility;
    if (currentTypes.includes(type)) {
      setForm({ ...form, typeOfFacility: currentTypes.filter((t) => t !== type) });
    } else if (currentTypes.length < 2) {
      setForm({ ...form, typeOfFacility: [...currentTypes, type] });
    }
    if (errors.typeOfFacility) {
      setErrors({ ...errors, typeOfFacility: undefined });
    }
  };

  const handleSubmit = async () => {
    if (!validateStep(4)) return;

    try {
      const base64 = await toBase64(form.file!);

      const res = await apiCall<{ success: boolean; message?: string }>(
        "submitMBFHIForm",
        {
          ...form,
          fileData: base64,
          fileName: form.file!.name,
          mimeType: form.file!.type,
        }
      );

      if (!res.success) throw new Error(res.message);

      alert("Application submitted!");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'An error occurred';
      alert(message);
    }
  };

  // =========================
  // STEP CONTENT
  // =========================
  const renderStepContent = () => {
    const animationClass = isAnimating
      ? direction === "forward"
        ? "animate-slide-out-left"
        : "animate-slide-out-right"
      : direction === "forward"
      ? "animate-slide-in-right"
      : "animate-slide-in-left";

    return (
      <div className={`transition-all duration-300 ${animationClass}`}>
        {currentStep === 1 && (
          <div className="space-y-4">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">Personal Information</h2>
              <p className="text-gray-600 mt-1">Please provide your contact details</p>
            </div>
            <Input label="Full Name" name="name" value={form.name} onChange={handleChange} error={errors.name} />
            <Input label="Email Address" name="email" type="email" value={form.email} onChange={handleChange} error={errors.email} />
            <Input label="Contact Number" name="contact" value={form.contact} onChange={handleChange} error={errors.contact} />
          </div>
        )}

        {currentStep === 2 && (
          <div className="space-y-4">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">Facility Information</h2>
              <p className="text-gray-600 mt-1">Tell us about your facility</p>
            </div>
            <Input label="Facility Name" name="facility" value={form.facility} onChange={handleChange} error={errors.facility} />

            <div>
              <label className="block text-center font-semibold mb-2">Type of Facility (Select up to 2)</label>
              <div className="grid grid-cols-2 gap-2">
                {facilityTypes.map((type) => (
                  <label
                    key={type}
                    className={`flex items-center gap-2 p-3 border rounded-lg cursor-pointer text-sm transition-all duration-200 ${
                      form.typeOfFacility.includes(type)
                        ? "bg-teal-100 border-teal-500 shadow-sm"
                        : "bg-white border-gray-300 hover:border-teal-300 hover:bg-gray-50"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={form.typeOfFacility.includes(type)}
                      onChange={() => handleFacilityTypeChange(type)}
                      className="w-4 h-4 text-teal-600 rounded"
                      disabled={!form.typeOfFacility.includes(type) && form.typeOfFacility.length >= 2}
                    />
                    <span>{type}</span>
                  </label>
                ))}
              </div>
              {form.typeOfFacility.length > 0 && (
                <p className="text-xs text-gray-600 mt-2 text-center">
                  Selected: {form.typeOfFacility.join(", ")}
                </p>
              )}
              {errors.typeOfFacility && <p className="text-red-500 text-xs mt-1">{errors.typeOfFacility}</p>}
            </div>
          </div>
        )}

        {currentStep === 3 && (
          <div className="space-y-4">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">Schedule Your Visit</h2>
              <p className="text-gray-600 mt-1">Choose your preferred date and time</p>
            </div>

            <div>
              <label className="block text-center font-semibold mb-2">Preferred Visit Date</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-2.5 w-5 h-5 text-gray-500" />
                <DatePicker
                  selected={form.preferredDate ? new Date(form.preferredDate) : null}
                  onChange={(date: Date | null) => {
                    if (!date) return;
                    const formatted = date.toISOString().split("T")[0];
                    setForm({ ...form, preferredDate: formatted });
                    if (errors.preferredDate) {
                      setErrors({ ...errors, preferredDate: undefined });
                    }
                  }}
                  filterDate={(date) => {
                    const formatted = date.toISOString().split("T")[0];
                    const day = date.getDay();
                    if (day === 5 || day === 6 || day === 0) return false;
                    if (unavailableDates.includes(formatted)) return false;
                    return true;
                  }}
                  minDate={new Date()}
                  className="w-full border px-10 py-3 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  placeholderText="Select a date"
                />
              </div>
              {errors.preferredDate && <p className="text-red-500 text-xs mt-1">{errors.preferredDate}</p>}
            </div>

            <div>
              <label className="block text-center font-semibold mb-2">Preferred Visit Time</label>
              <div className="relative">
                <Clock className="absolute left-3 top-2.5 w-5 h-5 text-gray-500" />
                <input
                  type="time"
                  name="preferredTime"
                  value={form.preferredTime}
                  onChange={handleChange}
                  title="Preferred Visit Time"
                  placeholder="Select time"
                  className="w-full border px-10 py-3 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                />
              </div>
              {errors.preferredTime && <p className="text-red-500 text-xs mt-1">{errors.preferredTime}</p>}
            </div>
          </div>
        )}

        {currentStep === 4 && (
          <div className="space-y-4">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">Upload Documents</h2>
              <p className="text-gray-600 mt-1">Upload your required documents (PDF or DOC, max 5MB)</p>
            </div>

            <div>
              {!form.file ? (
                <div
                  onDrop={handleDrop}
                  onDragOver={(e) => e.preventDefault()}
                  className="border-2 border-dashed border-gray-400 rounded-xl p-8 text-center cursor-pointer hover:border-teal-500 hover:bg-teal-50 transition-all duration-200"
                >
                  <Upload className="mx-auto mb-3 w-10 h-10 text-gray-500" />
                  <p className="text-gray-600 mb-2">Drag & drop your file here</p>
                  <p className="text-gray-400 text-sm mb-3">or</p>
                  <input type="file" onChange={handleInputFile} className="hidden" id="fileUpload" />
                  <label
                    htmlFor="fileUpload"
                    className="inline-block bg-teal-500 hover:bg-teal-600 text-white px-6 py-2 rounded-lg cursor-pointer transition-colors duration-200"
                  >
                    Browse File
                  </label>
                </div>
              ) : (
                <div className="flex justify-between items-center border-2 border-teal-500 p-4 rounded-xl bg-teal-50">
                  <div className="flex items-center gap-3">
                    <FileText className="w-8 h-8 text-teal-600" />
                    <div>
                      <p className="font-medium text-gray-800">{form.file.name}</p>
                      <p className="text-sm text-gray-500">
                        {(form.file.size / 1024).toFixed(1)} KB
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={removeFile}
                    title="Remove file"
                    className="p-2 hover:bg-red-100 rounded-full transition-colors duration-200"
                  >
                    <X className="w-5 h-5 text-red-500" />
                  </button>
                </div>
              )}
              {errors.file && <p className="text-red-500 text-xs mt-2">{errors.file}</p>}
            </div>
          </div>
        )}

        {currentStep === 5 && (
          <div className="space-y-4">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">Review Your Application</h2>
              <p className="text-gray-600 mt-1">Please confirm all information is correct</p>
            </div>

            <div className="bg-gray-50 rounded-xl p-5 space-y-4">
              <ReviewItem label="Full Name" value={form.name} />
              <ReviewItem label="Email" value={form.email} />
              <ReviewItem label="Contact" value={form.contact} />
              <ReviewItem label="Facility" value={form.facility} />
              <ReviewItem label="Facility Type" value={form.typeOfFacility.join(", ")} />
              <ReviewItem label="Visit Date" value={form.preferredDate} />
              <ReviewItem label="Visit Time" value={form.preferredTime} />
              <ReviewItem label="Document" value={form.file?.name || "No file"} />
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
              <p className="text-yellow-800 text-sm">
                <strong>Note:</strong> By submitting this application, you confirm that all information provided is accurate and complete.
              </p>
            </div>
          </div>
        )}
      </div>
    );
  };

  // =========================
  // UI
  // =========================
  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-blue-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">MBFHI Application</h1>
          <p className="text-gray-600">Complete all steps to submit your application</p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            {STEPS.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <button
                  onClick={() => goToStep(step.id)}
                  className={`flex items-center justify-center w-10 h-10 rounded-full font-semibold transition-all duration-300 ${
                    currentStep > step.id
                      ? "bg-teal-500 text-white"
                      : currentStep === step.id
                      ? "bg-teal-500 text-white ring-4 ring-teal-200"
                      : "bg-gray-200 text-gray-500"
                  }`}
                >
                  {currentStep > step.id ? <Check className="w-5 h-5" /> : step.id}
                </button>
                {index < STEPS.length - 1 && (
                  <div
                    className={`w-12 sm:w-20 h-1 mx-2 transition-all duration-300 ${
                      currentStep > step.id ? "bg-teal-500" : "bg-gray-200"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
          <div className="text-center">
            <p className="font-semibold text-gray-800">{STEPS[currentStep - 1].title}</p>
            <p className="text-sm text-gray-500">{STEPS[currentStep - 1].description}</p>
          </div>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8">
          {renderStepContent()}

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8 pt-6 border-t border-gray-200">
            <button
              onClick={prevStep}
              disabled={currentStep === 1}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all duration-200 ${
                currentStep === 1
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              <ChevronLeft className="w-5 h-5" />
              Previous
            </button>

            {currentStep < STEPS.length ? (
              <button
                onClick={nextStep}
                className="flex items-center gap-2 px-6 py-3 bg-teal-500 hover:bg-teal-600 text-white rounded-lg font-semibold transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                Next
                <ChevronRight className="w-5 h-5" />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                className="flex items-center gap-2 px-8 py-3 bg-green-500 hover:bg-green-600 text-white rounded-lg font-semibold transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                <Check className="w-5 h-5" />
                Submit Application
              </button>
            )}
          </div>
        </div>

        {/* Step Indicators */}
        <div className="flex justify-center mt-6 gap-2">
          {STEPS.map((step) => (
            <div
              key={step.id}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                currentStep === step.id ? "bg-teal-500 w-8" : "bg-gray-300"
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

// =========================
// REUSABLE COMPONENTS
// =========================
function Input({
  label,
  name,
  type = "text",
  value,
  onChange,
  error,
}: {
  label: string;
  name: string;
  type?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error?: string;
}) {
  return (
    <div>
      <label className="block text-center font-semibold mb-1">{label}</label>
      <input
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        title={label}
        placeholder={label}
        className="w-full border px-4 py-3 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-200"
      />
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  );
}

function ReviewItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-center py-2 border-b border-gray-200 last:border-0">
      <span className="text-gray-600 font-medium">{label}</span>
      <span className="text-gray-800 font-semibold">{value || "—"}</span>
    </div>
  );
}

// =========================
// BASE64 HELPER
// =========================
const toBase64 = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);

    reader.onload = () => {
      const base64 = (reader.result as string).split(",")[1];
      if (!base64) reject("Invalid file");
      resolve(base64);
    };

    reader.onerror = () => reject("File error");
  });
