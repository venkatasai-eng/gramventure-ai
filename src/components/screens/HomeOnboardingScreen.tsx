import React, { useState, useMemo, useEffect } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { t } from '@/lib/i18n';
import { TAMIL_NADU_DISTRICTS, getDistrictDisplayName, getTamilNaduDistrictById } from '@/data/tamilNaduDistricts';
import { geocodeLocation } from '@/services/competitorService';
import { formatINR } from '@/lib/finance/formatters';
import type { BusinessCategory } from '@/types';
import { BUSINESS_CATEGORY_LABELS } from '@/types';
import {
  ArrowRight,
  Sparkles,
  MapPin,
  Wallet,
  Store,
  Info,
  AlertCircle,
  CheckCircle,
  Search,
  ChevronDown,
  ChevronUp,
  Sliders,
  FileCheck2,
  Building2,
  ShieldAlert,
} from 'lucide-react';

interface HomeOnboardingScreenProps {
  onContinue: () => void;
}

export const HomeOnboardingScreen: React.FC<HomeOnboardingScreenProps> = ({ onContinue }) => {
  const {
    language,
    onboarding,
    updateLocation,
    updateProfile,
    updateHousehold,
    setSelectedBusinesses,
    loadDemoData,
    isDemoMode,
  } = useAppStore();

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [districtSearch, setDistrictSearch] = useState('');
  const [showDistrictDropdown, setShowDistrictDropdown] = useState(false);
  const [showOptionalDetails, setShowOptionalDetails] = useState(false);
  const [isGeocoding, setIsGeocoding] = useState(false);

  // Filtered 38 districts based on user search in current language
  const filteredDistricts = useMemo(() => {
    const q = districtSearch.toLowerCase().trim();
    if (!q) return TAMIL_NADU_DISTRICTS;
    return TAMIL_NADU_DISTRICTS.filter((d) => {
      const nameEn = d.nameEn.toLowerCase();
      const nameTe = d.nameTe.toLowerCase();
      const nameTa = d.nameTa.toLowerCase();
      return nameEn.includes(q) || nameTe.includes(q) || nameTa.includes(q);
    });
  }, [districtSearch]);

  const selectedDistrictObj = useMemo(() => {
    return (
      getTamilNaduDistrictById(onboarding.location.districtId || '') ||
      TAMIL_NADU_DISTRICTS.find(
        (d) => d.nameEn.toLowerCase() === onboarding.location.district.toLowerCase()
      ) ||
      TAMIL_NADU_DISTRICTS[13] // Madurai default
    );
  }, [onboarding.location.districtId, onboarding.location.district]);

  // Keyword-based category inference from demand description
  const inferredCategories = useMemo<BusinessCategory[]>(() => {
    const text = (onboarding.profile.demandDescription || '').toLowerCase();
    const categories: BusinessCategory[] = [];

    if (/milk|cow|dairy|buffalo|ghee|curd|பால்|மாடு|வெண்ணெய்|பాలు|పాడి/.test(text)) {
      categories.push('dairy');
    }
    if (/grocery|kirana|provision|shop|fmcg|rice|dal|மளிகை|பருப்பு|அரிசி|కిరాణా/.test(text)) {
      categories.push('grocery');
    }
    if (/tailor|dress|cloth|garment|stitching|தையல்|துணி|ఆడ దుస్తులు|దర్జీ/.test(text)) {
      categories.push('tailoring');
    }
    if (/hen|egg|chicken|poultry|layer|கோழி|முட்டை|కోడి|గుడ్లు/.test(text)) {
      categories.push('poultry');
    }
    if (/mobile|phone|repair|charger|screen|மொபைல்|செல்போன்|మొబైల్|రిపేర్/.test(text)) {
      categories.push('mobile-repair');
    }
    if (/fertilizer|seed|pesticide|agri|farming|விவசாயம்|உரம்|விதை|విత్తనాలు|ఎరువులు/.test(text)) {
      categories.push('agri-inputs');
    }
    if (/pickle|flour|masala|spice|grinding|ஊறுகாய்|மசாலா|மாவு|ఊరగాయ|మసాలా/.test(text)) {
      categories.push('food-processing');
    }
    if (/xerox|print|csc|aadhaar|banking|சேவை|ஜெராக்ஸ்|ஜிరాక్స్|సేవలు/.test(text)) {
      categories.push('local-services');
    }
    if (/workshop|welding|manufacturing|craft|பட்டறை|உற்பத்தி|వర్క్‌షాప్/.test(text)) {
      categories.push('small-manufacturing');
    }

    if (categories.length === 0) {
      return ['dairy', 'grocery', 'food-processing'];
    }
    return categories.slice(0, 3);
  }, [onboarding.profile.demandDescription]);

  // Sync inferred categories to profile and selectedBusinesses if not manually set
  useEffect(() => {
    if (inferredCategories.length > 0 && onboarding.selectedBusinesses.length === 0) {
      setSelectedBusinesses(inferredCategories);
    }
  }, [inferredCategories, onboarding.selectedBusinesses.length, setSelectedBusinesses]);

  const handleSelectDistrict = (d: typeof TAMIL_NADU_DISTRICTS[0]) => {
    updateLocation({
      state: 'Tamil Nadu',
      district: d.nameEn,
      districtId: d.id,
      coordinates: { lat: d.lat, lng: d.lon },
      locationAccuracy: 'District Headquarters Centroid',
      locationSource: 'District Centroid',
    });
    setDistrictSearch('');
    setShowDistrictDropdown(false);
  };

  const handleLocalityBlur = async () => {
    const loc = onboarding.location.village.trim();
    if (loc && loc.length >= 3 && selectedDistrictObj) {
      setIsGeocoding(true);
      try {
        const geo = await geocodeLocation(loc, selectedDistrictObj.nameEn);
        updateLocation({
          coordinates: { lat: geo.lat, lng: geo.lng },
          locationAccuracy: geo.accuracy,
          locationSource: geo.source,
        });
      } finally {
        setIsGeocoding(false);
      }
    }
  };

  const handleBusinessToggle = (cat: BusinessCategory) => {
    const current = onboarding.selectedBusinesses;
    if (current.includes(cat)) {
      if (current.length === 1) {
        alert('Please keep at least 1 candidate business selected.');
        return;
      }
      setSelectedBusinesses(current.filter((c) => c !== cat));
    } else {
      if (current.length >= 3) {
        alert('You can compare a maximum of 3 businesses at a time.');
        return;
      }
      setSelectedBusinesses([...current, cat]);
    }
  };

  const validateAndProceed = () => {
    const errors: Record<string, string> = {};

    if (!onboarding.location.district) {
      errors.district = t('validation.districtRequired', language);
    }
    if (!onboarding.location.village.trim()) {
      errors.village = t('validation.localityRequired', language);
    }
    if (!onboarding.profile.demandDescription?.trim()) {
      errors.demand = t('validation.demandRequired', language);
    }
    if (onboarding.profile.availableSavings <= 0) {
      errors.savings = t('validation.savingsPositive', language);
    }
    if (
      onboarding.household.monthlyHouseholdExpenses < 0 ||
      onboarding.household.existingMonthlyLoanPayments < 0 ||
      onboarding.household.essentialReserve < 0
    ) {
      errors.negativeMoney = t('validation.noNegativeMoney', language);
    }

    setFormErrors(errors);

    if (Object.keys(errors).length === 0) {
      onContinue();
    } else {
      window.scrollTo({ top: 380, behavior: 'smooth' });
    }
  };

  const handleStartDemo = () => {
    loadDemoData();
    onContinue();
  };

  return (
    <div className="space-y-8 pb-16">
      {/* 1. Demand-First Hero Header */}
      <section className="relative bg-linear-to-b from-primary-900 via-primary-950 to-primary-950 text-white rounded-2xl p-6 sm:p-10 shadow-md overflow-hidden">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-80 h-80 rounded-full bg-primary-800/20 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-80 h-80 rounded-full bg-accent-500/10 blur-3xl pointer-events-none" />

        <div className="relative max-w-4xl space-y-4">
          <div className="inline-flex items-center gap-2 bg-primary-800/80 border border-primary-700/60 rounded-full px-3 py-1 text-xs text-accent-300 font-medium">
            <Sparkles size={14} />
            <span>Tamil Nadu Rural Micro-FinTech Initiative</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight leading-tight">
            {t('demand.question', language)}
          </h1>

          <p className="text-sm sm:text-base text-primary-100 max-w-3xl leading-relaxed">
            {t('demand.questionHelper', language)}
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-3">
            <button
              onClick={() => {
                const el = document.getElementById('demand-form-anchor');
                el?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="bg-accent-500 hover:bg-accent-600 text-white font-semibold px-5 py-2.5 rounded-lg text-sm flex items-center gap-2 shadow-sm transition-transform active:scale-95"
            >
              <span>{t('action.analyzeArea', language)}</span>
              <ArrowRight size={16} />
            </button>

            <button
              onClick={handleStartDemo}
              className="bg-white/10 hover:bg-white/15 text-white border border-white/20 font-medium px-4 py-2.5 rounded-lg text-sm flex items-center gap-2 transition-colors"
            >
              <span>{t('action.loadDemo', language)}</span>
            </button>
          </div>
        </div>
      </section>

      {/* 2. Structured Demand-First Form */}
      <section id="demand-form-anchor" className="card p-6 sm:p-8 space-y-8 bg-white border border-gray-200 shadow-xs">
        <div className="border-b border-gray-200 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <Building2 className="text-primary-700" size={22} />
              <span>{t('demand.essentialTitle', language)}</span>
            </h2>
            <p className="text-xs text-gray-500 mt-1">
              {t('demand.essentialDesc', language)}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleStartDemo}
              className="text-xs font-semibold text-primary-700 bg-primary-50 hover:bg-primary-100 px-3 py-1.5 rounded-md border border-primary-200 transition-colors"
            >
              {t('action.loadDemo', language)} (₹1 Lakh Margin)
            </button>
          </div>
        </div>

        {/* Essential Input 1: The Core Demand Description */}
        <div className="space-y-2">
          <label className="label text-sm font-bold text-gray-900 flex items-center gap-2">
            <span>1. {t('demand.question', language)} *</span>
          </label>
          <textarea
            rows={3}
            value={onboarding.profile.demandDescription || ''}
            onChange={(e) => updateProfile({ demandDescription: e.target.value })}
            placeholder={t('demand.placeholder', language)}
            className={`input-field text-sm leading-relaxed ${
              formErrors.demand ? 'border-red-500 ring-1 ring-red-500' : ''
            }`}
          />
          {formErrors.demand && (
            <p className="text-xs text-red-600 font-medium flex items-center gap-1">
              <AlertCircle size={13} />
              <span>{formErrors.demand}</span>
            </p>
          )}

          {/* Inferred Categories Badge Bar */}
          {inferredCategories.length > 0 && (
            <div className="bg-primary-50/70 border border-primary-200 rounded-lg p-3 text-xs text-primary-900 flex flex-wrap items-center gap-2 mt-2">
              <span className="font-semibold">{t('demand.inferred', language)}</span>
              {inferredCategories.map((cat) => (
                <span
                  key={cat}
                  className="bg-white border border-primary-300 text-primary-800 font-medium px-2 py-0.5 rounded shadow-2xs"
                >
                  {BUSINESS_CATEGORY_LABELS[cat]?.[language] || cat}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Essential Input 2 & 3: Tamil Nadu Location (District & Locality) */}
        <div className="space-y-4 pt-2">
          <div className="flex items-center gap-2 text-primary-800 font-semibold text-sm">
            <MapPin size={18} />
            <span>2. {t('location.title', language)}</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Searchable 38 Tamil Nadu District Selector */}
            <div className="relative">
              <label className="label">{t('demand.district', language)} *</label>
              <div
                onClick={() => setShowDistrictDropdown(!showDistrictDropdown)}
                className={`input-field cursor-pointer flex items-center justify-between ${
                  formErrors.district ? 'border-red-500' : ''
                }`}
              >
                <span className="font-medium text-gray-900">
                  {getDistrictDisplayName(selectedDistrictObj, language)} ({selectedDistrictObj.nameEn})
                </span>
                <ChevronDown size={16} className="text-gray-400" />
              </div>

              {showDistrictDropdown && (
                <div className="absolute z-30 mt-1 w-full bg-white rounded-lg shadow-lg border border-gray-200 max-h-60 overflow-y-auto p-2">
                  <div className="relative mb-2">
                    <Search size={14} className="absolute left-2.5 top-2.5 text-gray-400" />
                    <input
                      type="text"
                      autoFocus
                      placeholder={t('demand.districtPlaceholder', language)}
                      value={districtSearch}
                      onChange={(e) => setDistrictSearch(e.target.value)}
                      className="w-full text-xs pl-8 pr-3 py-1.5 border border-gray-300 rounded focus:outline-hidden focus:border-primary-500"
                    />
                  </div>

                  <div className="space-y-1">
                    {filteredDistricts.map((d) => (
                      <div
                        key={d.id}
                        onClick={() => handleSelectDistrict(d)}
                        className={`px-3 py-1.5 text-xs rounded cursor-pointer flex items-center justify-between ${
                          onboarding.location.districtId === d.id
                            ? 'bg-primary-50 text-primary-900 font-bold'
                            : 'hover:bg-gray-100 text-gray-700'
                        }`}
                      >
                        <span>{getDistrictDisplayName(d, language)}</span>
                        <span className="text-gray-400 text-[11px]">{d.nameEn}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {formErrors.district && (
                <p className="text-xs text-red-600 mt-1">{formErrors.district}</p>
              )}
            </div>

            {/* Locality / Village / Town / PIN */}
            <div>
              <label className="label">{t('demand.locality', language)} *</label>
              <div className="relative">
                <input
                  type="text"
                  value={onboarding.location.village}
                  onChange={(e) => updateLocation({ village: e.target.value })}
                  onBlur={handleLocalityBlur}
                  placeholder={t('demand.localityPlaceholder', language)}
                  className={`input-field ${formErrors.village ? 'border-red-500' : ''}`}
                />
                {isGeocoding && (
                  <span className="absolute right-3 top-2.5 text-xs text-primary-600 animate-pulse">
                    Locating...
                  </span>
                )}
              </div>
              <p className="text-[11px] text-gray-500 mt-1">
                {t('demand.localityHelper', language)}
              </p>
              {formErrors.village && (
                <p className="text-xs text-red-600 mt-1">{formErrors.village}</p>
              )}
            </div>

            {/* Analysis Radius */}
            <div>
              <label className="label">Search Radius</label>
              <div className="flex items-center gap-3 mt-2 text-xs">
                <label className="inline-flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="radio"
                    name="radius"
                    checked={onboarding.location.analysisRadius === 5}
                    onChange={() => updateLocation({ analysisRadius: 5 })}
                    className="text-primary-600"
                  />
                  <span>5 km (Village Cluster)</span>
                </label>
                <label className="inline-flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="radio"
                    name="radius"
                    checked={onboarding.location.analysisRadius === 10}
                    onChange={() => updateLocation({ analysisRadius: 10 })}
                    className="text-primary-600"
                  />
                  <span>10 km (Taluk Market)</span>
                </label>
              </div>
            </div>
          </div>

          {/* Coordinates & Accuracy Badge */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-xs text-gray-600 flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-gray-800">{t('location.accuracy', language)}:</span>
              <span className="bg-white border border-gray-300 text-gray-700 px-2 py-0.5 rounded text-[11px] font-medium">
                {onboarding.location.locationAccuracy || t('location.accuracyCentroid', language)}
              </span>
              <span className="text-gray-400">•</span>
              <span className="text-gray-500">
                {t('location.source', language)}: {onboarding.location.locationSource || 'District Centroid'}
              </span>
            </div>

            {onboarding.location.coordinates && (
              <div className="text-gray-500 font-mono text-[11px]">
                Lat: {onboarding.location.coordinates.lat.toFixed(4)}, Lon:{' '}
                {onboarding.location.coordinates.lng.toFixed(4)}
              </div>
            )}
          </div>
        </div>

        {/* Essential Input 4: Available Personal Margin Capital */}
        <div className="space-y-4 pt-2">
          <div className="flex items-center gap-2 text-primary-800 font-semibold text-sm">
            <Wallet size={18} />
            <span>3. {t('demand.savings', language)}</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-gray-500 font-bold text-sm">₹</span>
                <input
                  type="number"
                  min="0"
                  step="5000"
                  value={onboarding.profile.availableSavings || ''}
                  onChange={(e) => {
                    const val = Math.max(0, Number(e.target.value));
                    updateProfile({ availableSavings: val });
                  }}
                  placeholder={t('demand.savingsPlaceholder', language)}
                  className={`input-field pl-8 font-semibold text-base ${
                    formErrors.savings ? 'border-red-500' : ''
                  }`}
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {t('demand.savingsHelper', language)}
              </p>
              {formErrors.savings && (
                <p className="text-xs text-red-600 mt-1">{formErrors.savings}</p>
              )}
            </div>

            {/* Indicative Sizing Preview */}
            <div className="bg-primary-50/80 border border-primary-200 rounded-lg p-3 text-xs space-y-1">
              <div className="flex justify-between">
                <span className="text-gray-600">Entered Equity:</span>
                <span className="font-bold text-gray-900">
                  {formatINR(onboarding.profile.availableSavings || 0)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Theoretical 10% Project Sizing:</span>
                <span className="font-bold text-primary-800">
                  {formatINR((onboarding.profile.availableSavings || 0) / 0.1)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Indicative 90% Loan (Pre-Cap):</span>
                <span className="font-bold text-accent-700">
                  {formatINR(((onboarding.profile.availableSavings || 0) / 0.1) * 0.9)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Candidate Business Selection (Compare up to 3) */}
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between">
            <label className="label font-bold text-gray-900 flex items-center gap-2">
              <Store size={16} className="text-primary-700" />
              <span>4. Candidate Business Options to Analyze (Select up to 3)</span>
            </label>
            <span className="text-xs text-gray-500 font-semibold">
              Selected: {onboarding.selectedBusinesses.length} / 3
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5">
            {[
              'dairy',
              'grocery',
              'tailoring',
              'poultry',
              'mobile-repair',
              'agri-inputs',
              'food-processing',
              'local-services',
            ].map((catId) => {
              const cat = catId as BusinessCategory;
              const isSelected = onboarding.selectedBusinesses.includes(cat);
              const label = BUSINESS_CATEGORY_LABELS[cat]?.[language] || cat;
              return (
                <div
                  key={cat}
                  onClick={() => handleBusinessToggle(cat)}
                  className={`p-3 rounded-lg border text-left cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-primary-50 border-primary-600 ring-2 ring-primary-500/20'
                      : 'bg-white border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-gray-900">{label}</span>
                    {isSelected && <CheckCircle size={14} className="text-primary-700 shrink-0" />}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 3. Progressive Optional Details Toggle */}
        <div className="pt-2 border-t border-gray-200">
          <button
            type="button"
            onClick={() => setShowOptionalDetails(!showOptionalDetails)}
            className="w-full flex items-center justify-between py-2 text-sm font-semibold text-primary-800 hover:text-primary-900"
          >
            <span className="flex items-center gap-2">
              <Sliders size={16} />
              <span>{t('demand.optionalTitle', language)}</span>
            </span>
            {showOptionalDetails ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </button>

          {showOptionalDetails && (
            <div className="mt-4 space-y-4 bg-surface-warm rounded-xl p-5 border border-gray-200 animate-fadeIn text-xs">
              <p className="text-gray-500 mb-3">{t('demand.optionalDesc', language)}</p>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className="label">{t('demand.resaleProducts', language)}</label>
                  <input
                    type="text"
                    value={onboarding.profile.productsForResale || ''}
                    onChange={(e) => updateProfile({ productsForResale: e.target.value })}
                    placeholder={t('demand.resaleProductsPlaceholder', language)}
                    className="input-field text-xs py-2"
                  />
                </div>

                <div>
                  <label className="label">{t('demand.customerGroups', language)}</label>
                  <input
                    type="text"
                    value={onboarding.profile.intendedCustomerGroups || ''}
                    onChange={(e) => updateProfile({ intendedCustomerGroups: e.target.value })}
                    placeholder={t('demand.customerGroupsPlaceholder', language)}
                    className="input-field text-xs py-2"
                  />
                </div>

                <div>
                  <label className="label">{t('demand.sellingPrice', language)}</label>
                  <input
                    type="text"
                    value={onboarding.profile.desiredSellingPriceOrBudget || ''}
                    onChange={(e) => updateProfile({ desiredSellingPriceOrBudget: e.target.value })}
                    placeholder={t('demand.sellingPricePlaceholder', language)}
                    className="input-field text-xs py-2"
                  />
                </div>

                <div>
                  <label className="label">{t('demand.householdExpenses', language)}</label>
                  <input
                    type="number"
                    min="0"
                    step="1000"
                    value={onboarding.household.monthlyHouseholdExpenses || ''}
                    onChange={(e) =>
                      updateHousehold({ monthlyHouseholdExpenses: Math.max(0, Number(e.target.value)) })
                    }
                    placeholder="12000"
                    className="input-field text-xs py-2"
                  />
                </div>

                <div>
                  <label className="label">{t('demand.existingLoans', language)}</label>
                  <input
                    type="number"
                    min="0"
                    step="500"
                    value={onboarding.household.existingMonthlyLoanPayments || ''}
                    onChange={(e) =>
                      updateHousehold({ existingMonthlyLoanPayments: Math.max(0, Number(e.target.value)) })
                    }
                    placeholder="0"
                    className="input-field text-xs py-2"
                  />
                </div>

                <div>
                  <label className="label">{t('demand.essentialReserve', language)}</label>
                  <input
                    type="number"
                    min="0"
                    step="5000"
                    value={onboarding.household.essentialReserve || ''}
                    onChange={(e) =>
                      updateHousehold({ essentialReserve: Math.max(0, Number(e.target.value)) })
                    }
                    placeholder="30000"
                    className="input-field text-xs py-2"
                  />
                </div>

                <div>
                  <label className="label">{t('demand.workspace', language)}</label>
                  <input
                    type="text"
                    value={onboarding.profile.availableLandOrWorkspace || ''}
                    onChange={(e) => updateProfile({ availableLandOrWorkspace: e.target.value })}
                    placeholder={t('demand.workspacePlaceholder', language)}
                    className="input-field text-xs py-2"
                  />
                </div>

                <div>
                  <label className="label">{t('demand.experience', language)}</label>
                  <input
                    type="number"
                    min="0"
                    max="40"
                    value={onboarding.profile.experienceYears}
                    onChange={(e) =>
                      updateProfile({ experienceYears: Math.max(0, Number(e.target.value)) })
                    }
                    className="input-field text-xs py-2"
                  />
                </div>

                <div>
                  <label className="label">{t('demand.additionalNotes', language)}</label>
                  <input
                    type="text"
                    value={onboarding.profile.additionalNotes || ''}
                    onChange={(e) => updateProfile({ additionalNotes: e.target.value })}
                    placeholder={t('demand.additionalNotesPlaceholder', language)}
                    className="input-field text-xs py-2"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Form Action Controls */}
        <div className="pt-4 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-start gap-2 max-w-xl text-xs text-gray-500">
            <Info size={16} className="text-primary-600 shrink-0 mt-0.5" />
            <span>
              All financial calculations and scheme caps are deterministic code. No random or hallucinated loan approvals.
            </span>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              onClick={validateAndProceed}
              className="btn-primary w-full sm:w-auto px-8 py-3 text-sm flex items-center justify-center gap-2 shadow-sm"
            >
              <span>{t('action.analyzeArea', language)}</span>
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
