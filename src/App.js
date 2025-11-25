import React, { useState, useEffect, useRef, useMemo } from "react";
import {
  User,
  Stethoscope,
  Activity,
  FileText,
  Plus,
  ChevronDown,
  ChevronUp,
  Trash2,
  Search,
  LogOut,
  Check,
  X,
  Heart,
  Zap,
  Brain,
  PieChart,
  Users,
  AlertCircle,
  Cloud,
  Loader2,
  AlertTriangle,
  Moon,
  Sun,
  Globe,
  Edit3,
  Save,
  ArrowLeft,
  ArrowRight,
  Building2,
  Flag,
  Filter,
  Thermometer,
  Image as ImageIcon,
} from "lucide-react";

// --- Firebase Imports ---
import { initializeApp } from "firebase/app";
import {
  getAuth,
  signInAnonymously,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
} from "firebase/auth";
import {
  getFirestore,
  collection,
  addDoc,
  onSnapshot,
  deleteDoc,
  updateDoc,
  doc,
  serverTimestamp,
} from "firebase/firestore";

// --- Firebase Configuration ---
const firebaseConfig = {
  apiKey: "AIzaSyBM9MT1madlAAk0fYJc2LgyTYPbFhR4Tc4",
  authDomain: "medical-b4a61.firebaseapp.com",
  projectId: "medical-b4a61",
  storageBucket: "medical-b4a61.firebasestorage.app",
  messagingSenderId: "107082658380",
  appId: "1:107082658380:web:ee0557a7f28771bf9abae9",
  measurementId: "G-YGV5D2TXLT",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const appId = "patient-tracker-v1";

// --- Translations ---
const TRANSLATIONS = {
  en: {
    appName: "Med Trac",
    slogan: "Collaborative Patient System",
    loginGoogle: "Continue with Google",
    loginGuest: "Continue as Guest",
    docName: "Doctor Name",
    hospital: "Hospital / College",
    grade: "Grade",
    start: "Enter System",
    dashboard: "Dashboard",
    search: "Search name, diagnosis...",
    total: "Total",
    highRisk: "High Risk",
    topRisk: "Top Risk",
    addPatient: "New Admission",
    editPatient: "Edit Case",
    save: "Save Record",
    update: "Update Record",
    delete: "Discharge/Delete",
    presentation: "Diagnosis & Presentation",
    riskProfile: "Risk Factors",
    exam: "Vitals & Exam",
    workup: "Investigations",
    recordedBy: "Admitted by",
    date: "Date",
    deleteConfirm: "Are you sure you want to delete this record globally?",
    risks: "Risks",
    loading: "Syncing...",
    dept: "Department / Referral",
    isHighRisk: "Mark as High Risk Case",
    status: "Status",
    filterAll: "All Patients",
    filterHigh: "High Risk Only",
    filterMy: "My Entries",
  },
  ar: {
    appName: "ميد تراك",
    slogan: "نظام متابعة المرضى التشاركي",
    loginGoogle: "دخول عبر جوجل",
    loginGuest: "دخول كضيف",
    docName: "اسم الطبيب",
    hospital: "المستشفى",
    grade: "الدرجة",
    start: "دخول النظام",
    dashboard: "لوحة المتابعة",
    search: "بحث بالاسم أو التشخيص...",
    total: "العدد الكلي",
    highRisk: "حالات خطرة",
    topRisk: "الأكثر شيوعاً",
    addPatient: "تسجيل دخول حالة",
    editPatient: "تعديل بيانات",
    save: "حفظ السجل",
    update: "تحديث البيانات",
    delete: "حذف / خروج",
    presentation: "التشخيص والشكوى",
    riskProfile: "عوامل الخطر",
    exam: "الفحص والعلامات الحيوية",
    workup: "الفحوصات",
    recordedBy: "سُجلت بواسطة",
    date: "التاريخ",
    deleteConfirm: "هل أنت متأكد؟ سيتم حذف الحالة من عند جميع الأطباء.",
    risks: "عامل خطر",
    loading: "جاري المزامنة...",
    dept: "القسم / تحويل من",
    isHighRisk: "تصنيف كحالة خطرة (High Risk)",
    status: "حالة التواجد",
    filterAll: "كل الحالات",
    filterHigh: "الحالات الخطرة فقط",
    filterMy: "تسجيلاتي فقط",
  },
};

// --- Constants ---
const GRADES = ["Junior", "Mid-Senior", "Senior", "Consultant"];
const DEPARTMENTS = [
  "ER (Emergency)",
  "Internal Medicine",
  "Neurology",
  "ICU",
  "Surgery",
  "Cardiology",
  "Outpatient Clinic",
  "Referral (External)",
];
const PATIENT_STATUS = [
  "Admitted",
  "Under Observation",
  "Discharge Planned",
  "Critical",
];

const RISK_FACTORS = [
  "Hypertension",
  "Diabetes",
  "AF",
  "Ischemic Heart",
  "Past Stroke",
  "Regular on ttt",
  "Renal",
  "Hepatic",
  "Smoker",
  "Addict",
];
const EXAMINATION_FIELDS = [
  {
    id: "bp",
    label: "BP",
    icon: <Activity size={16} />,
    placeholder: "120/80",
  },
  { id: "rbs", label: "RBS", icon: <Zap size={16} />, placeholder: "mg/dL" },
  { id: "ipp", label: "Pulse", icon: <Heart size={16} />, placeholder: "bpm" },
  {
    id: "power",
    label: "Motor",
    icon: <Activity size={16} />,
    placeholder: "Power",
  },
  {
    id: "conscious",
    label: "GCS",
    icon: <Brain size={16} />,
    placeholder: "/15",
  },
  {
    id: "temp",
    label: "Temp",
    icon: <Thermometer size={16} />,
    placeholder: "°C",
  },
];
const LAB_INVESTIGATIONS = [
  "CBC",
  "Creatinine",
  "Urea",
  "PT/INR",
  "Na/K",
  "CRP",
  "ABG",
  "HbA1c",
  "Trop I",
  "D-Dimer",
  "Liver Enzymes",
];
const IMAGING_INVESTIGATIONS = [
  "CT Brain",
  "MRI Brain",
  "CT Chest",
  "Echo",
  "ECG",
  "EEG",
  "NCS/EMG",
  "Fundus",
];

// --- Helper Components ---

const CircularProgress = ({
  value,
  max,
  label,
  subLabel,
  colorClass,
  icon: Icon,
}) => {
  const radius = 30;
  const circumference = 2 * Math.PI * radius;
  const percentage = max > 0 ? Math.min((value / max) * 100, 100) : 0;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-lg border border-slate-100 dark:border-slate-700 flex items-center gap-3 relative overflow-hidden group hover:scale-[1.02] transition-transform duration-300">
      <div
        className={`absolute inset-0 opacity-0 group-hover:opacity-5 transition-opacity duration-500 bg-current ${colorClass}`}
      ></div>
      <div className="relative w-16 h-16 flex items-center justify-center shrink-0">
        <svg className="transform -rotate-90 w-16 h-16">
          <circle
            cx="32"
            cy="32"
            r={radius}
            stroke="currentColor"
            strokeWidth="5"
            fill="transparent"
            className="text-slate-100 dark:text-slate-700"
          />
          <circle
            cx="32"
            cy="32"
            r={radius}
            stroke="currentColor"
            strokeWidth="5"
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            className={`${colorClass} transition-all duration-1000 ease-out`}
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center flex-col">
          {Icon && <Icon size={14} className={`${colorClass}`} />}
        </div>
      </div>
      <div className="flex flex-col min-w-0">
        <span className="text-2xl font-bold text-slate-800 dark:text-white leading-none mb-1">
          {value}
        </span>
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider truncate">
          {label}
        </span>
        {subLabel && (
          <span className={`text-[10px] ${colorClass} font-medium truncate`}>
            {subLabel}
          </span>
        )}
      </div>
    </div>
  );
};

const Button = ({
  children,
  onClick,
  variant = "primary",
  className = "",
  type = "button",
  icon: Icon,
  disabled = false,
}) => {
  const variants = {
    primary:
      "bg-gradient-to-r from-emerald-500 to-teal-600 text-white hover:shadow-lg hover:shadow-emerald-500/30 border-none",
    secondary:
      "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700",
    danger:
      "bg-gradient-to-r from-rose-500 to-red-600 text-white hover:shadow-lg hover:shadow-rose-500/30 border-none",
    google:
      "bg-white dark:bg-slate-700 text-slate-700 dark:text-white border border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-600",
    ghost:
      "bg-transparent text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800",
  };
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`px-5 py-3 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed ${variants[variant]} ${className}`}
    >
      {Icon && <Icon size={18} />}
      {children}
    </button>
  );
};

const Input = ({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  required = false,
  icon: Icon,
}) => (
  <div className="mb-4 w-full group">
    {label && (
      <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1.5 mx-1">
        {label}
      </label>
    )}
    <div className="relative">
      {Icon && (
        <div className="absolute top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 group-focus-within:text-emerald-500 start-3 transition-colors">
          {Icon}
        </div>
      )}
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        className={`w-full ${
          Icon ? "ps-10" : "ps-4"
        } pe-4 py-3.5 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all text-slate-700 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-600 shadow-sm`}
      />
    </div>
  </div>
);

const Select = ({ label, value, onChange, options, icon: Icon }) => (
  <div className="mb-4 w-full">
    {label && (
      <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1.5 mx-1">
        {label}
      </label>
    )}
    <div className="relative">
      {Icon && (
        <div className="absolute top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 start-3 pointer-events-none">
          {Icon}
        </div>
      )}
      <select
        value={value}
        onChange={onChange}
        className={`w-full ${
          Icon ? "ps-10" : "ps-4"
        } pe-10 py-3.5 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all text-slate-700 dark:text-slate-200 appearance-none shadow-sm cursor-pointer`}
      >
        <option value="" disabled>
          Select...
        </option>
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
      <ChevronDown
        size={16}
        className="absolute top-1/2 -translate-y-1/2 end-4 text-slate-400 pointer-events-none"
      />
    </div>
  </div>
);

const TextArea = ({ label, value, onChange, placeholder, rows = 3 }) => (
  <div className="mb-4 w-full">
    {label && (
      <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1.5 mx-1">
        {label}
      </label>
    )}
    <textarea
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      rows={rows}
      className="w-full p-4 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none resize-none text-slate-700 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-600 shadow-sm"
    />
  </div>
);

const InvestigationItem = ({ name, data, onUpdate, t }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef(null);

  // Modified image handler to support multiple files & resize them to avoid Firestore limit
  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setIsProcessing(true);

    const readFileAndResize = (file) => {
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (event) => {
          const img = new Image();
          img.onload = () => {
            const canvas = document.createElement("canvas");
            const MAX_WIDTH = 800; // Limit width to 800px
            const scaleSize = MAX_WIDTH / img.width;

            if (scaleSize < 1) {
              canvas.width = MAX_WIDTH;
              canvas.height = img.height * scaleSize;
            } else {
              canvas.width = img.width;
              canvas.height = img.height;
            }

            const ctx = canvas.getContext("2d");
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            // Compress to JPEG 0.7 quality
            const dataUrl = canvas.toDataURL("image/jpeg", 0.7);
            resolve({ url: dataUrl, name: file.name });
          };
          img.src = event.target.result;
        };
        reader.readAsDataURL(file);
      });
    };

    try {
      // Process all images concurrently
      const newImages = await Promise.all(files.map(readFileAndResize));

      // Update state only ONCE after all images are processed
      const currentImages = data.images || [];
      onUpdate({ ...data, images: [...currentImages, ...newImages] });
    } catch (error) {
      console.error("Error processing images", error);
      alert("Error uploading images. Please try again.");
    } finally {
      setIsProcessing(false);
      // Reset input so same files can be selected again if needed
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const removeImage = (idx) => {
    const newImages = [...(data.images || [])];
    newImages.splice(idx, 1);
    onUpdate({ ...data, images: newImages });
  };

  const hasContent =
    data.result || data.notes || (data.images && data.images.length > 0);

  return (
    <div
      className={`mb-3 rounded-xl border transition-all ${
        hasContent
          ? "border-emerald-200 bg-emerald-50/50 dark:bg-emerald-900/10 dark:border-emerald-800"
          : "border-slate-100 bg-white dark:bg-slate-800 dark:border-slate-700"
      }`}
    >
      <div
        className="flex justify-between items-center p-3.5 cursor-pointer"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center gap-3">
          <div
            className={`w-2.5 h-2.5 rounded-full ring-2 ${
              hasContent
                ? "bg-emerald-500 ring-emerald-200 dark:ring-emerald-900"
                : "bg-slate-200 dark:bg-slate-600 ring-transparent"
            }`}
          ></div>
          <span
            className={`font-semibold ${
              hasContent
                ? "text-emerald-800 dark:text-emerald-400"
                : "text-slate-600 dark:text-slate-400"
            }`}
          >
            {name}
          </span>
        </div>
        <ChevronDown
          size={18}
          className={`text-slate-400 transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </div>
      {isOpen && (
        <div className="p-4 pt-0">
          <div className="h-px bg-slate-100 dark:bg-slate-700 mb-4 w-full"></div>
          <Input
            value={data.result || ""}
            onChange={(e) => onUpdate({ ...data, result: e.target.value })}
            placeholder="Result..."
          />
          <TextArea
            value={data.notes || ""}
            onChange={(e) => onUpdate({ ...data, notes: e.target.value })}
            placeholder="Notes..."
            rows={2}
          />
          <div className="flex flex-wrap gap-2 mt-2">
            {data.images?.map((img, idx) => (
              <div
                key={idx}
                className="relative w-16 h-16 rounded-lg overflow-hidden group border border-slate-200 dark:border-slate-600"
              >
                <img
                  src={img.url}
                  className="w-full h-full object-cover"
                  alt="scan"
                />
                <button
                  onClick={() => removeImage(idx)}
                  className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 text-white"
                >
                  <X size={12} />
                </button>
              </div>
            ))}
            <button
              onClick={() => fileInputRef.current.click()}
              disabled={isProcessing}
              className="w-16 h-16 border-2 border-dashed border-slate-200 dark:border-slate-600 rounded-lg flex flex-col items-center justify-center text-slate-400 hover:text-emerald-500 hover:border-emerald-400 hover:bg-emerald-50 dark:hover:bg-slate-700 transition-all"
            >
              {isProcessing ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <>
                  <Plus size={18} />
                  <span className="text-[10px]">Add</span>
                </>
              )}
            </button>
          </div>
          <input
            type="file"
            multiple
            accept="image/*"
            ref={fileInputRef}
            className="hidden"
            onChange={handleImageUpload}
          />
        </div>
      )}
    </div>
  );
};

// --- Dashboard ---

const Dashboard = ({
  user,
  authUser,
  patients,
  handleLogout,
  setView,
  setSelectedPatient,
  authError,
  lang,
  t,
  setLang,
  darkMode,
  setDarkMode,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterMode, setFilterMode] = useState("all");

  const filteredPatients = useMemo(() => {
    let data = patients;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      data = data.filter(
        (p) =>
          (p.name && p.name.toLowerCase().includes(q)) ||
          (p.presentation && p.presentation.toLowerCase().includes(q)) ||
          (p.department && p.department.toLowerCase().includes(q))
      );
    }
    if (filterMode === "high") {
      data = data.filter((p) => p.isHighRisk);
    } else if (filterMode === "my") {
      data = data.filter((p) => p.authorUid === authUser?.uid);
    }
    return data;
  }, [patients, searchQuery, filterMode, authUser]);

  const stats = useMemo(() => {
    const total = patients.length;
    const highRiskCount = patients.filter((p) => p.isHighRisk).length;

    const riskCounts = {};
    patients.forEach((p) => {
      const risks = Object.keys(p.riskFactors || {}).filter(
        (k) => p.riskFactors[k]
      );
      risks.forEach((r) => (riskCounts[r] = (riskCounts[r] || 0) + 1));
    });
    const topRisk = Object.entries(riskCounts).sort((a, b) => b[1] - a[1])[0];

    return {
      total,
      highRisk: highRiskCount,
      topRiskName: topRisk ? topRisk[0] : "-",
      topRiskCount: topRisk ? topRisk[1] : 0,
    };
  }, [patients]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-24 transition-colors duration-500">
      <div className="sticky top-0 z-30 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800 px-4 py-3 shadow-sm">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-emerald-400 to-teal-600 p-2 rounded-xl shadow-lg shadow-emerald-500/20">
                <Activity size={20} className="text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-800 dark:text-white font-sans leading-tight">
                  {t.appName}
                </h2>
                <p className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30 px-2 py-0.5 rounded-full inline-block w-fit">
                  {user?.name || "Doctor"}
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setDarkMode(!darkMode)}
                className="w-10 h-10 flex items-center justify-center bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              >
                {darkMode ? <Sun size={18} /> : <Moon size={18} />}
              </button>
              <button
                onClick={() => setLang(lang === "en" ? "ar" : "en")}
                className="w-10 h-10 flex items-center justify-center bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors font-bold text-sm"
              >
                {lang === "en" ? "ع" : "En"}
              </button>
              <button
                onClick={handleLogout}
                className="w-10 h-10 flex items-center justify-center bg-rose-50 dark:bg-rose-900/20 text-rose-500 dark:text-rose-400 rounded-xl hover:bg-rose-100 dark:hover:bg-rose-900/40 transition-colors"
              >
                <LogOut size={18} />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
            <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-lg border border-slate-100 dark:border-slate-700 flex items-center justify-between group hover:scale-[1.02] transition-transform">
              <div>
                <p className="text-slate-400 dark:text-slate-500 text-xs uppercase font-bold tracking-wider">
                  {t.total}
                </p>
                <p className="text-3xl font-bold text-slate-800 dark:text-white mt-1">
                  {stats.total}
                </p>
              </div>
              <div className="w-12 h-12 rounded-full bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-500">
                <Users size={24} />
              </div>
            </div>

            <CircularProgress
              value={stats.highRisk}
              max={stats.total}
              label={t.highRisk}
              colorClass="text-rose-500"
              icon={AlertCircle}
            />

            <CircularProgress
              value={stats.topRiskCount}
              max={stats.total}
              label={t.topRisk}
              subLabel={stats.topRiskName}
              colorClass="text-emerald-500"
              icon={PieChart}
            />
          </div>

          <div className="flex flex-col gap-3">
            <div className="relative shadow-sm rounded-xl w-full">
              <div className="absolute top-1/2 -translate-y-1/2 text-slate-400 start-3 pointer-events-none">
                <Search size={20} />
              </div>
              <input
                type="text"
                placeholder={t.search}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full ps-10 pe-4 py-3 bg-slate-100 dark:bg-slate-800 border-transparent rounded-xl focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-emerald-500 outline-none transition-all text-slate-700 dark:text-slate-200"
              />
            </div>

            <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
              {[
                { id: "all", label: t.filterAll },
                { id: "high", label: t.filterHigh },
                { id: "my", label: t.filterMy },
              ].map((f) => (
                <button
                  key={f.id}
                  onClick={() => setFilterMode(f.id)}
                  className={`px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
                    filterMode === f.id
                      ? "bg-slate-800 dark:bg-white text-white dark:text-slate-900 shadow-md"
                      : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700"
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filteredPatients.length === 0 ? (
          <div className="col-span-full flex flex-col items-center justify-center py-20 text-slate-400 dark:text-slate-600">
            <div className="w-20 h-20 bg-slate-100 dark:bg-slate-900 rounded-full flex items-center justify-center mb-4">
              <Activity size={32} className="opacity-40" />
            </div>
            <p className="font-medium">No patients found</p>
          </div>
        ) : (
          filteredPatients.map((patient) => (
            <div
              key={patient.id}
              onClick={() => {
                setSelectedPatient(patient);
                setView("details");
              }}
              className="group bg-white dark:bg-slate-800 p-5 rounded-2xl shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-slate-100 dark:border-slate-700 cursor-pointer relative overflow-hidden"
            >
              <div
                className={`absolute top-0 start-0 w-1.5 h-full rounded-s-2xl ${
                  patient.isHighRisk ? "bg-rose-500" : "bg-emerald-500"
                }`}
              ></div>

              <div className="flex justify-between items-start mb-3 ps-3">
                <div>
                  <h3 className="font-bold text-lg text-slate-800 dark:text-white leading-tight line-clamp-1">
                    {patient.name}
                  </h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-slate-500 dark:text-slate-400 text-xs font-medium bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded-md">
                      {patient.age} Yrs
                    </span>
                    {patient.department && (
                      <span className="text-xs text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 px-2 py-0.5 rounded-md truncate max-w-[100px]">
                        {patient.department}
                      </span>
                    )}
                  </div>
                </div>
                {patient.isHighRisk && (
                  <div className="w-8 h-8 rounded-full bg-rose-100 dark:bg-rose-900/30 flex items-center justify-center text-rose-600 dark:text-rose-400 shrink-0 animate-pulse">
                    <AlertCircle size={16} />
                  </div>
                )}
              </div>

              <p className="text-slate-600 dark:text-slate-300 text-sm line-clamp-2 mb-4 ps-3 bg-slate-50 dark:bg-slate-900/50 p-2 rounded-lg border border-slate-50 dark:border-slate-700/50">
                {patient.presentation}
              </p>

              <div className="flex items-center gap-3 text-xs text-slate-400 dark:text-slate-500 ps-3 mt-auto pt-2 border-t border-slate-100 dark:border-slate-700">
                <div className="flex items-center gap-1">
                  <User size={12} />
                  <span className="truncate max-w-[80px]">
                    {patient.author}
                  </span>
                </div>
                <span className="ms-auto font-medium text-slate-300 dark:text-slate-600">
                  {patient.dateAdded}
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      <button
        onClick={() => setView("add")}
        className="fixed bottom-6 end-6 bg-gradient-to-br from-slate-800 to-slate-900 dark:from-emerald-500 dark:to-teal-600 text-white w-16 h-16 rounded-2xl shadow-2xl shadow-slate-900/30 flex items-center justify-center hover:scale-105 active:scale-95 transition-all z-30"
      >
        <Plus size={32} />
      </button>
    </div>
  );
};

// --- Form Component ---

const PatientForm = ({ user, authUser, setView, existingPatient, t }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    age: "",
    presentation: "",
    department: "",
    isHighRisk: false,
    status: "Admitted",
    riskFactors: {},
    examination: {},
    investigations: {},
  });

  useEffect(() => {
    if (existingPatient) {
      setFormData({
        name: existingPatient.name || "",
        age: existingPatient.age || "",
        presentation: existingPatient.presentation || "",
        department: existingPatient.department || "",
        isHighRisk: existingPatient.isHighRisk || false,
        status: existingPatient.status || "Admitted",
        riskFactors: existingPatient.riskFactors || {},
        examination: existingPatient.examination || {},
        investigations: existingPatient.investigations || {},
      });
    }
  }, [existingPatient]);

  const handleSubmit = async () => {
    if (!formData.name || !formData.presentation)
      return alert("Enter Name & Presentation");
    if (!authUser) return alert(t.dbError);
    setLoading(true);
    try {
      const collectionRef = collection(
        db,
        "artifacts",
        appId,
        "public",
        "data",
        "patients"
      );

      // Ensure undefined values are not sent to Firestore
      const safeData = {
        name: formData.name || "",
        age: formData.age || "",
        presentation: formData.presentation || "",
        department: formData.department || "",
        isHighRisk: !!formData.isHighRisk,
        status: formData.status || "Admitted",
        riskFactors: formData.riskFactors || {},
        examination: formData.examination || {},
        investigations: formData.investigations || {},
      };

      if (existingPatient) {
        await updateDoc(doc(collectionRef, existingPatient.id), {
          ...safeData,
          lastModifiedBy: user?.name || "Unknown",
        });
      } else {
        await addDoc(collectionRef, {
          ...safeData,
          author: user?.name || "Guest",
          authorUid: authUser.uid,
          createdAt: serverTimestamp(),
        });
      }
      setView("dashboard");
    } catch (error) {
      console.error(error);
      alert(`Failed to save: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const updateRisk = (f) =>
    setFormData((p) => ({
      ...p,
      riskFactors: { ...p.riskFactors, [f]: !p.riskFactors[f] },
    }));
  const updateInv = (k, d) =>
    setFormData((p) => ({
      ...p,
      investigations: { ...p.investigations, [k]: d },
    }));

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-20 transition-colors duration-300">
      <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-md shadow-sm px-4 py-3 sticky top-0 z-30 flex items-center gap-4 border-b border-slate-200 dark:border-slate-800">
        <button
          onClick={() => setView(existingPatient ? "details" : "dashboard")}
          className="text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 p-2 rounded-xl transition-colors"
        >
          <ArrowLeft className="rtl:rotate-180" size={24} />
        </button>
        <h2 className="text-lg font-bold text-slate-800 dark:text-white">
          {existingPatient ? t.editPatient : t.addPatient}
        </h2>
        <Button
          onClick={handleSubmit}
          disabled={loading}
          className="ms-auto px-6 py-2 text-sm"
        >
          {loading ? (
            <Loader2 className="animate-spin" />
          ) : existingPatient ? (
            t.update
          ) : (
            t.save
          )}
        </Button>
      </div>

      <div className="p-4 max-w-3xl mx-auto space-y-6">
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
          <h3 className="text-emerald-700 dark:text-emerald-400 font-bold mb-4 flex items-center gap-2 text-sm uppercase tracking-wider">
            <User size={18} /> Profile
          </h3>
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div className="col-span-2">
              <Input
                label="Name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
              />
            </div>
            <div className="col-span-1">
              <Input
                label="Age"
                type="number"
                value={formData.age}
                onChange={(e) =>
                  setFormData({ ...formData, age: e.target.value })
                }
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 mb-2">
            <Select
              label={t.dept}
              value={formData.department}
              onChange={(e) =>
                setFormData({ ...formData, department: e.target.value })
              }
              options={DEPARTMENTS}
              icon={<Building2 size={16} />}
            />
            <Select
              label={t.status}
              value={formData.status}
              onChange={(e) =>
                setFormData({ ...formData, status: e.target.value })
              }
              options={PATIENT_STATUS}
              icon={<Flag size={16} />}
            />
          </div>
          <TextArea
            label={t.presentation}
            value={formData.presentation}
            onChange={(e) =>
              setFormData({ ...formData, presentation: e.target.value })
            }
          />

          <div
            onClick={() =>
              setFormData((p) => ({ ...p, isHighRisk: !p.isHighRisk }))
            }
            className={`mt-4 p-4 rounded-xl border-2 cursor-pointer flex items-center gap-4 transition-all ${
              formData.isHighRisk
                ? "border-rose-500 bg-rose-50 dark:bg-rose-900/20"
                : "border-slate-200 dark:border-slate-700 hover:border-rose-200"
            }`}
          >
            <div
              className={`w-6 h-6 rounded-md border flex items-center justify-center ${
                formData.isHighRisk
                  ? "bg-rose-500 border-rose-500 text-white"
                  : "border-slate-300 bg-white"
              }`}
            >
              {formData.isHighRisk && <Check size={16} />}
            </div>
            <div>
              <p
                className={`font-bold ${
                  formData.isHighRisk
                    ? "text-rose-700 dark:text-rose-400"
                    : "text-slate-600 dark:text-slate-300"
                }`}
              >
                {t.isHighRisk}
              </p>
              <p className="text-xs text-slate-400">
                Mark this case to be tracked separately in stats.
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
          <h3 className="text-emerald-700 dark:text-emerald-400 font-bold mb-4 flex items-center gap-2 text-sm uppercase tracking-wider">
            <Activity size={18} /> {t.riskProfile}
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {RISK_FACTORS.map((f) => (
              <div
                key={f}
                onClick={() => updateRisk(f)}
                className={`px-3 py-3 rounded-xl border-2 cursor-pointer flex items-center justify-between transition-all text-sm font-semibold ${
                  formData.riskFactors[f]
                    ? "bg-emerald-600 border-emerald-600 text-white"
                    : "bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-700 text-slate-500 dark:text-slate-400"
                }`}
              >
                <span>{f}</span>
                {formData.riskFactors[f] && <Check size={14} />}
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
          <h3 className="text-emerald-700 dark:text-emerald-400 font-bold mb-4 flex items-center gap-2 text-sm uppercase tracking-wider">
            <Stethoscope size={18} /> {t.exam}
          </h3>
          <div className="grid grid-cols-2 gap-4">
            {EXAMINATION_FIELDS.map((f) => (
              <Input
                key={f.id}
                label={f.label}
                icon={f.icon}
                value={formData.examination[f.id] || ""}
                onChange={(e) =>
                  setFormData((p) => ({
                    ...p,
                    examination: { ...p.examination, [f.id]: e.target.value },
                  }))
                }
              />
            ))}
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
          <h3 className="text-emerald-700 dark:text-emerald-400 font-bold mb-4 flex items-center gap-2 text-sm uppercase tracking-wider">
            <FileText size={18} /> {t.workup}
          </h3>
          {[...LAB_INVESTIGATIONS, ...IMAGING_INVESTIGATIONS].map((item) => (
            <InvestigationItem
              key={item}
              name={item}
              data={formData.investigations[item] || {}}
              onUpdate={(d) => updateInv(item, d)}
              t={t}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

// --- Main App Component ---

export default function App() {
  const [user, setUser] = useState(null);
  const [authUser, setAuthUser] = useState(null);
  const [authError, setAuthError] = useState(null);
  const [view, setView] = useState("login");
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [lang, setLang] = useState("en");
  const [darkMode, setDarkMode] = useState(false);

  // Inject Tailwind
  useEffect(() => {
    if (!document.getElementById("tailwind-cdn")) {
      const script = document.createElement("script");
      script.id = "tailwind-cdn";
      script.src = "https://cdn.tailwindcss.com";
      script.async = true;
      script.onload = () => {
        window.tailwind.config = {
          darkMode: "class",
          theme: {
            extend: {
              colors: {
                slate: { 850: "#151f32", 900: "#0f172a", 950: "#020617" },
              },
            },
          },
        };
      };
      document.head.appendChild(script);
    }
  }, []);

  // Handle Lang & Theme
  useEffect(() => {
    document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
    document.documentElement.lang = lang;
    darkMode
      ? document.documentElement.classList.add("dark")
      : document.documentElement.classList.remove("dark");
  }, [lang, darkMode]);

  const t = TRANSLATIONS[lang];

  // Auth Listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setAuthUser(u);
      if (u) {
        setAuthError(null);
        const savedUser = localStorage.getItem("medUser");
        if (savedUser) {
          setUser(JSON.parse(savedUser));
          setView("dashboard");
        } else if (u.providerData.length > 0 && u.displayName) {
          const googleProfile = {
            name: u.displayName,
            college: "Hospital",
            grade: "Senior",
          };
          setUser(googleProfile);
          localStorage.setItem("medUser", JSON.stringify(googleProfile));
          setView("dashboard");
        }
      }
    });
    return () => unsubscribe();
  }, []);

  // Fetch Public Patients
  useEffect(() => {
    if (!authUser) return;
    const q = collection(db, "artifacts", appId, "public", "data", "patients");
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          dateAdded: doc.data().createdAt
            ? new Date(doc.data().createdAt.seconds * 1000).toLocaleDateString()
            : "Just now",
        }));
        data.sort(
          (a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0)
        );
        setPatients(data);
      },
      (error) => {
        console.error("Firestore Error:", error);
        setAuthError(error.message);
      }
    );
    return () => unsubscribe();
  }, [authUser]);

  const handleManualLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    const fd = new FormData(e.target);
    const userData = {
      name: fd.get("name"),
      college: fd.get("college"),
      grade: fd.get("grade"),
    };
    try {
      if (!authUser) await signInAnonymously(auth);
      setUser(userData);
      localStorage.setItem("medUser", JSON.stringify(userData));
      setView("dashboard");
    } catch (error) {
      setAuthError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsGoogleLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (error) {
      setAuthError(error.message);
      setIsGoogleLoading(false);
    }
  };

  const handleLogout = async () => {
    localStorage.removeItem("medUser");
    setUser(null);
    await signOut(auth);
    setView("login");
  };

  const handleDeletePatient = async (pid) => {
    if (window.confirm(t.deleteConfirm))
      await deleteDoc(
        doc(db, "artifacts", appId, "public", "data", "patients", pid)
      );
  };

  // --- Views Routing ---

  if (view === "login") {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-6 relative overflow-hidden transition-colors duration-500">
        <div className="absolute top-[-10%] start-[-10%] w-96 h-96 bg-emerald-200/30 dark:bg-emerald-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-[-10%] end-[-10%] w-96 h-96 bg-teal-200/30 dark:bg-teal-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>

        <div className="absolute top-6 end-6 flex gap-2 z-20">
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="p-2.5 bg-white/50 dark:bg-slate-800/50 backdrop-blur text-slate-600 dark:text-slate-300 rounded-full shadow-sm hover:scale-110 transition-transform"
          >
            {darkMode ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          <button
            onClick={() => setLang(lang === "en" ? "ar" : "en")}
            className="p-2.5 bg-white/50 dark:bg-slate-800/50 backdrop-blur text-slate-600 dark:text-slate-300 rounded-full shadow-sm font-bold text-sm w-10 h-10 flex items-center justify-center hover:scale-110 transition-transform"
          >
            {lang === "en" ? "ع" : "En"}
          </button>
        </div>

        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-2xl border border-white/50 dark:border-slate-700 rounded-[2rem] shadow-2xl p-8 w-full max-w-md relative z-10">
          <div className="text-center mb-8">
            <div className="bg-gradient-to-br from-emerald-400 to-teal-600 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-emerald-500/30 transform rotate-6 hover:rotate-0 transition-all duration-500">
              <Activity size={40} className="text-white" />
            </div>
            <h1 className="text-4xl font-black text-slate-800 dark:text-white tracking-tight font-sans mb-2">
              {t.appName}
            </h1>
            <p className="text-slate-500 dark:text-slate-400 font-medium">
              {t.slogan}
            </p>
          </div>
          {authError && (
            <div className="bg-red-50 dark:bg-rose-900/20 text-red-600 dark:text-rose-400 text-sm p-4 rounded-xl mb-6 border border-red-200 dark:border-rose-800 flex gap-2 items-center">
              <AlertTriangle size={18} /> {authError}
            </div>
          )}
          <div className="mb-8">
            <Button
              onClick={handleGoogleLogin}
              variant="google"
              className="w-full py-4 text-base"
              disabled={isGoogleLoading}
            >
              {isGoogleLoading ? (
                <Loader2 className="animate-spin" />
              ) : (
                <div className="flex items-center justify-center gap-3">
                  <Globe size={20} /> {t.loginGoogle}
                </div>
              )}
            </Button>
            <div className="relative my-8">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200 dark:border-slate-700"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white dark:bg-slate-900 text-slate-400 dark:text-slate-500 font-medium uppercase tracking-widest text-[10px]">
                  Or
                </span>
              </div>
            </div>
          </div>
          <form onSubmit={handleManualLogin} className="space-y-5">
            <Input
              label={t.docName}
              name="name"
              required
              placeholder="Dr. Name"
              icon={<User size={18} />}
            />
            <div className="grid grid-cols-2 gap-4">
              <Input
                label={t.hospital}
                name="college"
                required
                placeholder="Hospital"
                icon={<Activity size={18} />}
              />
              <Select label={t.grade} name="grade" options={GRADES} />
            </div>
            <Button
              type="submit"
              disabled={loading}
              className="w-full mt-4 py-4 text-lg shadow-xl shadow-emerald-500/20"
            >
              {loading ? <Loader2 className="animate-spin" /> : t.start}
            </Button>
          </form>
        </div>
      </div>
    );
  }

  if (view === "dashboard")
    return (
      <Dashboard
        user={user}
        authUser={authUser}
        patients={patients}
        handleLogout={handleLogout}
        setView={setView}
        setSelectedPatient={setSelectedPatient}
        authError={authError}
        lang={lang}
        t={t}
        setLang={setLang}
        darkMode={darkMode}
        setDarkMode={setDarkMode}
      />
    );

  if (view === "add")
    return (
      <PatientForm
        user={user}
        authUser={authUser}
        setView={setView}
        existingPatient={null}
        t={t}
      />
    );
  if (view === "edit")
    return (
      <PatientForm
        user={user}
        authUser={authUser}
        setView={setView}
        existingPatient={selectedPatient}
        t={t}
      />
    );

  if (view === "details" && selectedPatient) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-10 transition-colors duration-500">
        <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-md shadow-sm px-4 py-4 sticky top-0 z-30 flex items-center justify-between border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setView("dashboard")}
              className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 p-2 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            >
              <ArrowLeft className="rtl:rotate-180" size={20} />
            </button>
            <div>
              <h1 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
                {selectedPatient.name}
                {selectedPatient.isHighRisk && (
                  <span className="bg-rose-500 text-white text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider">
                    High Risk
                  </span>
                )}
              </h1>
              <span className="text-xs text-slate-500 dark:text-slate-400">
                {selectedPatient.age} Yrs •{" "}
                {selectedPatient.department || "General"}
              </span>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setView("edit")}
              className="text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 p-2 rounded-xl hover:bg-emerald-100 dark:hover:bg-emerald-900/40 transition-colors"
            >
              <Edit3 size={20} />
            </button>
            <button
              onClick={() => {
                handleDeletePatient(selectedPatient.id);
                setView("dashboard");
              }}
              className="text-rose-500 dark:text-rose-400 bg-rose-50 dark:bg-rose-900/20 p-2 rounded-xl hover:bg-rose-100 dark:hover:bg-rose-900/40 transition-colors"
            >
              <Trash2 size={20} />
            </button>
          </div>
        </div>
        <div className="p-4 max-w-3xl mx-auto space-y-5">
          <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
            <div className="flex justify-between items-start mb-4 border-b border-slate-100 dark:border-slate-700 pb-4">
              <div className="flex flex-col">
                <span className="text-xs text-slate-400 uppercase font-bold">
                  {t.status}
                </span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">
                  {selectedPatient.status || "Active"}
                </span>
              </div>
              <div className="flex flex-col text-end">
                <span className="text-xs text-slate-400 uppercase font-bold">
                  {t.recordedBy}
                </span>
                <div className="flex items-center gap-1 text-slate-700 dark:text-slate-200 font-medium justify-end">
                  <User size={14} /> {selectedPatient.author}
                </div>
              </div>
            </div>
            <h3 className="text-xs font-bold text-slate-400 uppercase mb-2">
              {t.presentation}
            </h3>
            <p className="text-lg text-slate-800 dark:text-white leading-relaxed">
              {selectedPatient.presentation}
            </p>
          </div>

          <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
            <h3 className="text-xs font-bold text-slate-400 uppercase mb-4">
              {t.riskProfile}
            </h3>
            <div className="flex flex-wrap gap-2">
              {Object.keys(selectedPatient.riskFactors || {})
                .filter((k) => selectedPatient.riskFactors[k])
                .map((k) => (
                  <span
                    key={k}
                    className="bg-rose-50 dark:bg-rose-900/30 text-rose-700 dark:text-rose-300 px-4 py-1.5 rounded-full text-sm font-semibold border border-rose-100 dark:border-rose-800"
                  >
                    {k}
                  </span>
                ))}
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
            <h3 className="text-xs font-bold text-slate-400 uppercase mb-4">
              {t.exam}
            </h3>
            <div className="grid grid-cols-2 gap-4">
              {EXAMINATION_FIELDS.map(
                (f) =>
                  selectedPatient.examination?.[f.id] && (
                    <div
                      key={f.id}
                      className="bg-slate-50 dark:bg-slate-900 p-4 rounded-xl"
                    >
                      <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                        {f.label}
                      </span>
                      <span className="font-bold text-xl text-slate-800 dark:text-white">
                        {selectedPatient.examination[f.id]}
                      </span>
                    </div>
                  )
              )}
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
            <h3 className="text-xs font-bold text-slate-400 uppercase mb-4">
              {t.workup}
            </h3>
            <div className="space-y-3">
              {Object.keys(selectedPatient.investigations || {}).map((k) => {
                const item = selectedPatient.investigations[k];
                if (!item.result && !item.notes && !item.images?.length)
                  return null;
                return (
                  <div
                    key={k}
                    className="border border-slate-200 dark:border-slate-700 rounded-xl p-4 bg-slate-50/50 dark:bg-slate-900/50"
                  >
                    <div className="flex justify-between mb-2">
                      <span className="font-bold text-slate-700 dark:text-slate-300">
                        {k}
                      </span>
                      {item.result && (
                        <span className="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-300 px-2 rounded text-sm font-bold">
                          {item.result}
                        </span>
                      )}
                    </div>
                    {item.notes && (
                      <p className="text-sm italic text-slate-600 dark:text-slate-400">
                        "{item.notes}"
                      </p>
                    )}
                    {item.images?.length > 0 && (
                      <div className="flex gap-2 mt-2 overflow-x-auto">
                        {item.images.map((img, i) => (
                          <img
                            key={i}
                            src={img.url}
                            className="h-20 w-20 rounded-lg object-cover border dark:border-slate-600"
                          />
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
