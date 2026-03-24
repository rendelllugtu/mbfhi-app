// src/pages/MBFHIApply.tsx

import { useState, useEffect } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { apiCall } from "../api/api";
import { Calendar, Clock, Upload, FileText, X } from "lucide-react";

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

export default function MBFHIApply() {
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
  // VALIDATION
  // =========================
  const validate = (): boolean => {
    const newErrors: Errors = {};

    if (!form.name) newErrors.name = "Name is required";
    if (!form.email) newErrors.email = "Email is required";
    if (!form.facility) newErrors.facility = "Facility is required";
    if (form.typeOfFacility.length === 0) newErrors.typeOfFacility = "Type of Facility is required";
    if (!form.contact) newErrors.contact = "Contact is required";
    if (!form.preferredDate) newErrors.preferredDate = "Select a date";
    if (!form.preferredTime) newErrors.preferredTime = "Select a time";

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

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // =========================
  // HANDLERS
  // =========================
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleFile = (file: File) => {
    setForm({ ...form, file });
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
      // Remove if already selected
      setForm({ ...form, typeOfFacility: currentTypes.filter((t) => t !== type) });
    } else if (currentTypes.length < 2) {
      // Add if less than 2 selections
      setForm({ ...form, typeOfFacility: [...currentTypes, type] });
    }
  };

  const handleSubmit = async () => {
    if (!validate()) return;

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
    } catch (err: any) {
      alert(err.message);
    }
  };

  // =========================
  // UI
  // =========================
  return (
    <div className="min-h-screen bg-gray-200 flex items-center justify-center">
      <div className="bg-gray-100 rounded-xl shadow-md p-8 w-full max-w-md space-y-4">

        <Input label="Name" name="name" onChange={handleChange} error={errors.name} />
        <Input label="Email" name="email" onChange={handleChange} error={errors.email} />
        <Input label="Facility Name" name="facility" onChange={handleChange} error={errors.facility} />

        {/* TYPE OF FACILITY */}
        <div>
          <label className="block text-center font-semibold mb-1">Type of Facility (Select up to 2)</label>
          <div className="grid grid-cols-2 gap-2">
            {facilityTypes.map((type) => (
              <label
                key={type}
                className={`flex items-center gap-2 p-2 border rounded cursor-pointer text-sm ${
                  form.typeOfFacility.includes(type)
                    ? "bg-teal-100 border-teal-500"
                    : "bg-white border-gray-300"
                }`}
              >
                <input
                  type="checkbox"
                  checked={form.typeOfFacility.includes(type)}
                  onChange={() => handleFacilityTypeChange(type)}
                  className="w-4 h-4 text-teal-600"
                  disabled={!form.typeOfFacility.includes(type) && form.typeOfFacility.length >= 2}
                />
                <span>{type}</span>
              </label>
            ))}
          </div>
          {form.typeOfFacility.length > 0 && (
            <p className="text-xs text-gray-600 mt-1">
              Selected: {form.typeOfFacility.join(", ")}
            </p>
          )}
          {errors.typeOfFacility && <p className="text-red-500 text-xs">{errors.typeOfFacility}</p>}
        </div>
        <Input label="Contact Number" name="contact" onChange={handleChange} error={errors.contact} />

        {/* DATE */}
        <div>
          <label className="block text-center font-semibold mb-1">Preferred Visit Date</label>
          <div className="relative">
            <Calendar className="absolute left-3 top-2.5 w-4 h-4 text-gray-500" />
            <DatePicker
              selected={form.preferredDate ? new Date(form.preferredDate) : null}
              onChange={(date) => {
                if (!date) return;
                const formatted = date.toISOString().split("T")[0];
                setForm({ ...form, preferredDate: formatted });
              }}
              filterDate={(date) => {
                const formatted = date.toISOString().split("T")[0];
                const day = date.getDay();
                if (day === 5 || day === 6 || day === 0) return false;
                if (unavailableDates.includes(formatted)) return false;
                return true;
              }}
              minDate={new Date()}
              className="w-full border px-8 py-2 rounded"
            />
          </div>
          {errors.preferredDate && <p className="text-red-500 text-xs">{errors.preferredDate}</p>}
        </div>

        {/* TIME */}
        <div>
          <label className="block text-center font-semibold mb-1">Preferred Visit Time</label>
          <div className="relative">
            <Clock className="absolute left-3 top-2.5 w-4 h-4 text-gray-500" />
            <input
              type="time"
              name="preferredTime"
              onChange={handleChange}
              className="w-full border px-8 py-2 rounded"
            />
          </div>
          {errors.preferredTime && <p className="text-red-500 text-xs">{errors.preferredTime}</p>}
        </div>

        {/* FILE DROPZONE */}
        <div>
          <label className="block text-center font-semibold mb-1">Upload Document</label>

          {!form.file ? (
            <div
              onDrop={handleDrop}
              onDragOver={(e) => e.preventDefault()}
              className="border-2 border-dashed border-gray-400 rounded-lg p-6 text-center cursor-pointer hover:bg-gray-200"
            >
              <Upload className="mx-auto mb-2 w-6 h-6 text-gray-600" />
              <p className="text-sm">Drag & drop or click</p>

              <input type="file" onChange={handleInputFile} className="hidden" id="fileUpload" />
              <label htmlFor="fileUpload" className="text-teal-600 cursor-pointer">
                Browse File
              </label>
            </div>
          ) : (
            <div className="flex justify-between items-center border p-3 rounded bg-white">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                <div>
                  <p className="text-sm">{form.file.name}</p>
                  <p className="text-xs text-gray-500">
                    {(form.file.size / 1024).toFixed(1)} KB
                  </p>
                </div>
              </div>
              <button onClick={removeFile}>
                <X className="text-red-500" />
              </button>
            </div>
          )}

          {errors.file && <p className="text-red-500 text-xs">{errors.file}</p>}
        </div>

        <button
          onClick={handleSubmit}
          className="w-full bg-teal-500 hover:bg-teal-600 text-white py-2 rounded font-semibold"
        >
          Submit Application
        </button>

      </div>
    </div>
  );
}

// =========================
// REUSABLE INPUT
// =========================
function Input({
  label,
  name,
  onChange,
  error,
}: {
  label: string;
  name: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error?: string;
}) {
  return (
    <div>
      <label className="block text-center font-semibold mb-1">{label}</label>
      <input name={name} onChange={onChange} className="w-full border px-3 py-2 rounded" />
      {error && <p className="text-red-500 text-xs">{error}</p>}
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