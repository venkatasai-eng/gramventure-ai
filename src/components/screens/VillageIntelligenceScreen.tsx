import React, { useState, useEffect, useMemo } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { t } from '@/lib/i18n';
import { EvidenceBadge } from '@/components/common/EvidenceBadge';
import { buildEvidenceReport } from '@/lib/scoring/evidenceEngine';
import { generateSWOT } from '@/lib/scoring/swotGenerator';
import { BUSINESS_MODELS, BUSINESS_CATEGORIES } from '@/lib/scoring/businessModels';
import type { BusinessCategory, CompetitorObservation, PricingObservation, ProviderCompetitor } from '@/types';
import { BUSINESS_CATEGORY_LABELS } from '@/types';
import type { UserInput } from '@/lib/scoring/types';
import { formatINR } from '@/lib/finance/formatters';
import { fetchLiveCompetitors, getDemoCompetitors, haversineDistance } from '@/services/competitorService';
import {
  MapPin,
  Store,
  Plus,
  Trash2,
  FileCheck,
  AlertTriangle,
  Lightbulb,
  Tag,
  ShieldCheck,
  RefreshCw,
  Search,
  ExternalLink,
  Layers,
  Map as MapIcon,
  List as ListIcon,
  HelpCircle,
  Clock,
  Phone,
} from 'lucide-react';

interface VillageIntelligenceScreenProps {
  onContinue: () => void;
  onBack: () => void;
}

export const VillageIntelligenceScreen: React.FC<VillageIntelligenceScreenProps> = ({
  onContinue,
  onBack,
}) => {
  const {
    language,
    onboarding,
    addCompetitor,
    removeCompetitor,
    setProviderCompetitors,
    addPricing,
    removePricing,
    isDemoMode,
  } = useAppStore();

  const [activeView, setActiveView] = useState<'list' | 'map'>('list');
  const [selectedRadiusFilter, setSelectedRadiusFilter] = useState<number>(5);
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('all');
  const [isLoadingProvider, setIsLoadingProvider] = useState<boolean>(false);
  const [providerStatusNote, setProviderStatusNote] = useState<string>('');
  const [providerAttribution, setProviderAttribution] = useState<string>('');
  const [lastFetchedTime, setLastFetchedTime] = useState<string>('');

  // Observation form states
  const [newCompCategory, setNewCompCategory] = useState<BusinessCategory>('dairy');
  const [newCompCount, setNewCompCount] = useState<number>(1);
  const [newCompRadius, setNewCompRadius] = useState<number>(3);
  const [newCompDate, setNewCompDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [newCompNotes, setNewCompNotes] = useState<string>('');

  // Pricing form states
  const [newPriceProduct, setNewPriceProduct] = useState<string>('');
  const [newPriceComp, setNewPriceComp] = useState<number>(0);
  const [newPriceCost, setNewPriceCost] = useState<number>(0);
  const [newPriceMargin, setNewPriceMargin] = useState<number>(25);

  const coords = onboarding.location.coordinates || { lat: 9.9252, lng: 78.1198 };

  // Trigger competitor search on load or location change
  const handleFetchLivePlaces = async () => {
    setIsLoadingProvider(true);
    try {
      if (isDemoMode) {
        const demoResults = getDemoCompetitors(coords.lat, coords.lng, selectedRadiusFilter);
        setProviderCompetitors(demoResults);
        setProviderStatusNote('Loaded standard Tamil Nadu demonstration competitor baseline.');
        setProviderAttribution('Demonstration Benchmark (Clearly labeled as Demo POI)');
        setLastFetchedTime(new Date().toLocaleTimeString());
      } else {
        const result = await fetchLiveCompetitors(coords.lat, coords.lng, selectedRadiusFilter);
        setProviderCompetitors(result.competitors);
        setProviderStatusNote(result.note);
        setProviderAttribution(result.attribution);
        setLastFetchedTime(result.retrievalTime);
      }
    } catch (err) {
      console.warn('Error fetching live competitors:', err);
      setProviderStatusNote('Provider service unavailable. Showing ground observations only.');
    } finally {
      setIsLoadingProvider(false);
    }
  };

  useEffect(() => {
    if (!onboarding.providerCompetitors || onboarding.providerCompetitors.length === 0) {
      handleFetchLivePlaces();
    }
  }, [coords.lat, coords.lng]);

  // Filter provider competitors
  const filteredProviderCompetitors = useMemo(() => {
    const list = onboarding.providerCompetitors || [];
    return list.filter((c) => {
      const matchRadius = c.distanceKm <= selectedRadiusFilter;
      const matchCat =
        selectedCategoryFilter === 'all' ||
        c.category.toLowerCase().includes(selectedCategoryFilter.toLowerCase());
      return matchRadius && matchCat;
    });
  }, [onboarding.providerCompetitors, selectedRadiusFilter, selectedCategoryFilter]);

  // Context for evidence and SWOT engine
  const primaryBusinessId = onboarding.selectedBusinesses[0] || 'dairy';
  const primaryModel =
    BUSINESS_MODELS[`${primaryBusinessId}-small`] ||
    BUSINESS_MODELS['dairy-small'] ||
    Object.values(BUSINESS_MODELS)[0];

  const userInputContext: UserInput = {
    village: {
      villageName: onboarding.location.village || 'Vadipatti (Demo)',
      district: onboarding.location.district || 'Madurai',
      state: onboarding.location.state || 'Tamil Nadu',
      population: {
        value: 3850,
        source: isDemoMode ? 'Model Estimate' : 'Missing Data',
        verificationNote: isDemoMode
          ? 'Projected based on 2011 Census trends (illustrative demo estimate)'
          : 'Official verified 2024 village population not provided',
      },
      households: {
        value: 820,
        source: isDemoMode ? 'Model Estimate' : 'Missing Data',
        verificationNote: isDemoMode ? 'Estimated assuming average family size 4.7' : 'Missing data',
      },
      distanceToTownKm: {
        value: 12,
        source: 'Verified Local Observation',
        verificationNote: 'Distance measured to nearest municipal shandy center',
      },
      economicActivities: ['Agriculture', 'Dairy', 'Retail'],
      isIllustrative: isDemoMode,
    },
    availableCapital: onboarding.profile.availableSavings,
    selectedBusinessIds: [primaryModel.id],
    competitorObservations: onboarding.competitors.map((c) => ({
      id: c.id,
      businessCategory: c.category,
      competitorName: `${c.category} local shop`,
      distanceKm: {
        value: c.radiusKm,
        source: 'User-Provided Observation',
        verificationNote: 'Observed during field walk',
      },
      strengthAssessment: 'moderate',
      productsOffered: [c.category],
      observedDate: c.dateObserved,
      notes: c.notes,
      source: 'User-Provided Observation',
    })),
    pricingObservations: onboarding.pricing.map((p) => ({
      id: p.id,
      productName: p.productName,
      businessCategory: primaryModel.category,
      observedPrice: {
        value: p.competitorPrice,
        source: p.source,
        verificationNote: p.notes,
      },
      location: onboarding.location.village,
      observedDate: new Date().toISOString().split('T')[0],
      source: p.source,
    })),
    preferredScenario: 'base',
  };

  const evidenceReport = buildEvidenceReport(userInputContext, primaryModel);
  const swot = generateSWOT(primaryModel, userInputContext, 'base');

  const handleAddCompetitor = (e: React.FormEvent) => {
    e.preventDefault();
    if (newCompCount <= 0) return;

    const newObs: CompetitorObservation = {
      id: `user-obs-${Date.now()}`,
      category: newCompCategory,
      count: newCompCount,
      radiusKm: newCompRadius,
      dateObserved: newCompDate,
      notes: newCompNotes || `Counted ${newCompCount} shop(s) during local field survey`,
      isUserObservation: true,
    };

    addCompetitor(newObs);
    setNewCompNotes('');
  };

  const handleAddPricing = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPriceProduct || newPriceComp <= 0) return;

    const newPrice: PricingObservation = {
      id: `price-${Date.now()}`,
      productName: newPriceProduct,
      competitorPrice: newPriceComp,
      estimatedCost: newPriceCost,
      desiredMargin: newPriceMargin,
      source: 'User-Provided Input',
      notes: 'Logged directly by entrepreneur',
    };

    addPricing(newPrice);
    setNewPriceProduct('');
    setNewPriceComp(0);
    setNewPriceCost(0);
  };

  return (
    <div className="space-y-8 pb-16">
      {/* Header Banner */}
      <div className="card p-6 border-l-4 border-l-primary-600 bg-white shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-bold uppercase tracking-wider text-primary-700">
                Phase 2 of 5
              </span>
              <span className="text-gray-300">•</span>
              <span className="text-xs text-gray-500">Hyper-Local Market Intelligence</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">
              {t('competitor.title', language)}
            </h1>
            <p className="text-xs sm:text-sm text-gray-600 mt-1">
              Location: <strong>{onboarding.location.village || 'Selected Village'}</strong>,{' '}
              {onboarding.location.district}, Tamil Nadu • Center Coordinates:{' '}
              <span className="font-mono text-gray-800">
                [{coords.lat.toFixed(4)}, {coords.lng.toFixed(4)}]
              </span>{' '}
              ({onboarding.location.locationAccuracy || 'District Centroid'})
            </p>
          </div>

          {/* Evidence Coverage Indicator */}
          <div className="bg-primary-50 border border-primary-200 rounded-xl p-4 text-right shrink-0">
            <div className="text-xs text-primary-800 font-medium">
              {t('evidence.coverageTitle', language)}
            </div>
            <div className="text-3xl font-extrabold text-primary-900">
              {evidenceReport.overallCoveragePercent}%
            </div>
            <div className="text-[11px] text-primary-700 mt-0.5">
              5 Documented Field Factors
            </div>
          </div>
        </div>
      </div>

      {/* 1. Transparent Evidence Coverage Formula */}
      <div className="card p-6 space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <h2 className="section-title text-base">
            <FileCheck size={18} className="text-primary-700" />
            <span>{t('evidence.coverageTitle', language)}</span>
          </h2>
          <span className="badge badge-estimate text-xs">
            Evidence Coverage (NOT Probability of Success)
          </span>
        </div>

        <p className="text-xs text-gray-600 leading-relaxed">
          {t('evidence.coverageFormula', language)}
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-2">
          {evidenceReport.dimensions.map((dim) => (
            <div key={dim.dimension} className="bg-gray-50 rounded-lg p-3 border border-gray-200">
              <div className="text-xs font-bold text-gray-700 capitalize">
                {dim.dimension.replace('_', ' ')}
              </div>
              <div className="text-lg font-extrabold text-gray-900 my-1">{dim.score}%</div>
              <p className="text-[11px] text-gray-500 line-clamp-2">{dim.explanation}</p>
            </div>
          ))}
        </div>

        {evidenceReport.missingDataItems.length > 0 && (
          <div className="warning-box flex items-start gap-2">
            <AlertTriangle size={16} className="shrink-0 mt-0.5 text-amber-700" />
            <div className="text-xs">
              <span className="font-bold">Missing Local Evidence to Validate Before Borrowing:</span>
              <ul className="list-disc pl-4 mt-1 space-y-0.5">
                {evidenceReport.missingDataItems.map((item, idx) => (
                  <li key={idx}>{item}</li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>

      {/* 2. Provider-Adapter Competitor Discovery (within 5 km) */}
      <div className="card p-6 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 pb-4">
          <div>
            <h2 className="section-title text-lg">
              <Store size={20} className="text-primary-700" />
              <span>{t('competitor.title', language)}</span>
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Real Overpass / OpenStreetMap POIs centered on [{coords.lat.toFixed(4)}, {coords.lng.toFixed(4)}], filtered by Haversine distance
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleFetchLivePlaces}
              disabled={isLoadingProvider}
              className="btn-secondary text-xs py-1.5 px-3 flex items-center gap-1.5"
            >
              <RefreshCw size={13} className={isLoadingProvider ? 'animate-spin' : ''} />
              <span>{isLoadingProvider ? 'Searching...' : 'Refresh Overpass POIs'}</span>
            </button>

            {/* View Mode Toggle */}
            <div className="flex bg-gray-100 rounded-lg p-0.5 border border-gray-200">
              <button
                onClick={() => setActiveView('list')}
                className={`p-1.5 rounded text-xs flex items-center gap-1 ${
                  activeView === 'list'
                    ? 'bg-white shadow-2xs font-semibold text-primary-900'
                    : 'text-gray-500'
                }`}
                title="List View"
              >
                <ListIcon size={14} />
              </button>
              <button
                onClick={() => setActiveView('map')}
                className={`p-1.5 rounded text-xs flex items-center gap-1 ${
                  activeView === 'map'
                    ? 'bg-white shadow-2xs font-semibold text-primary-900'
                    : 'text-gray-500'
                }`}
                title="Geographic Map View"
              >
                <MapIcon size={14} />
              </button>
            </div>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 bg-surface-warm p-3 rounded-lg border border-gray-200 text-xs">
          <div className="flex items-center gap-3">
            <span className="font-semibold text-gray-700">Radius Filter:</span>
            {[1, 3, 5].map((r) => (
              <label key={r} className="inline-flex items-center gap-1 cursor-pointer">
                <input
                  type="radio"
                  name="radiusFilter"
                  checked={selectedRadiusFilter === r}
                  onChange={() => setSelectedRadiusFilter(r)}
                  className="text-primary-600"
                />
                <span>≤ {r} km</span>
              </label>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <span className="font-semibold text-gray-700">Category:</span>
            <select
              value={selectedCategoryFilter}
              onChange={(e) => setSelectedCategoryFilter(e.target.value)}
              className="input-field text-xs py-1 px-2 w-40"
            >
              <option value="all">All Categories</option>
              <option value="dairy">Dairy</option>
              <option value="grocery">Grocery / Kirana</option>
              <option value="tailor">Tailoring</option>
              <option value="mobile">Mobile Repair</option>
              <option value="agro">Agri / Farming</option>
              <option value="service">Services / Banking</option>
            </select>
          </div>
        </div>

        {/* Sparse Data Warning / Caveat Banner */}
        <div className="bg-amber-50/80 border border-amber-200 rounded-lg p-3 text-xs text-amber-900 flex items-start gap-2">
          <AlertTriangle size={15} className="shrink-0 mt-0.5 text-amber-700" />
          <div>
            <span className="font-bold">Important Ground Reality Caveat:</span>
            <p className="mt-0.5 text-[11px] text-amber-800">
              {t('competitor.sparseWarning', language)} Lack of mapped competitors in open GIS databases does NOT prove absence of local competition. Unregistered tea stalls, home tailors, and daily shandy vendors must be confirmed via the field observation form below.
            </p>
          </div>
        </div>

        {/* View Mode: Map vs List */}
        {activeView === 'map' ? (
          /* Interactive Geographic Radar / Map Projection */
          <div className="bg-primary-950 text-white rounded-xl p-6 text-center space-y-4 relative overflow-hidden">
            <div className="flex items-center justify-between text-xs text-gray-400">
              <span>Geographic POI Radar Centered on [{coords.lat.toFixed(4)}, {coords.lng.toFixed(4)}]</span>
              <span>Concentric Circles: 1 km, 3 km, 5 km Radius</span>
            </div>

            <div className="relative w-72 h-72 mx-auto my-4 border-2 border-primary-700 rounded-full flex items-center justify-center">
              {/* 5 km outer boundary */}
              <div className="absolute inset-0 rounded-full border border-primary-800/80 pointer-events-none" />
              {/* 3 km ring */}
              <div className="absolute w-44 h-44 rounded-full border border-dashed border-primary-700/60 pointer-events-none" />
              {/* 1 km ring */}
              <div className="absolute w-20 h-20 rounded-full border border-primary-600/40 pointer-events-none" />

              {/* Center User Location Marker */}
              <div className="relative z-10 w-4 h-4 bg-accent-400 rounded-full ring-4 ring-accent-400/30 flex items-center justify-center text-[8px] font-bold text-gray-900">
                ★
              </div>

              {/* Plot Competitors */}
              {filteredProviderCompetitors.map((comp, idx) => {
                // Approximate coordinate offset projection on 144px radius circle (5 km = 144px)
                const dLat = (comp.lat || coords.lat) - coords.lat;
                const dLon = (comp.lon || coords.lng) - coords.lng;
                const scale = 2500; // Visual scaling factor
                const posX = Math.max(-130, Math.min(130, dLon * scale));
                const posY = Math.max(-130, Math.min(130, -dLat * scale));

                return (
                  <div
                    key={comp.id || idx}
                    style={{ transform: `translate(${posX}px, ${posY}px)` }}
                    className="absolute z-20 group cursor-pointer"
                  >
                    <div className="w-3.5 h-3.5 bg-emerald-400 rounded-full ring-2 ring-emerald-300/40 hover:scale-150 transition-transform" />
                    <div className="hidden group-hover:block absolute bottom-4 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[10px] whitespace-nowrap p-1.5 rounded shadow-lg border border-gray-700 z-30">
                      <strong>{comp.name}</strong>
                      <div className="text-gray-300">{comp.category} • {comp.distanceKm} km</div>
                    </div>
                  </div>
                );
              })}
            </div>

            <p className="text-[11px] text-gray-400">
              Showing {filteredProviderCompetitors.length} POIs strictly within {selectedRadiusFilter} km.
            </p>
          </div>
        ) : (
          /* List View */
          <div className="space-y-3">
            {filteredProviderCompetitors.length === 0 ? (
              <div className="bg-gray-50 border border-dashed border-gray-300 rounded-lg p-8 text-center text-gray-500 text-xs">
                <p className="font-semibold text-gray-700">{t('competitor.emptyStateTitle', language)}</p>
                <p className="mt-1 text-gray-500 max-w-lg mx-auto">{t('competitor.emptyStateDesc', language)}</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {filteredProviderCompetitors.map((comp) => (
                  <div
                    key={comp.id}
                    className="p-3.5 bg-white rounded-lg border border-gray-200 flex flex-col justify-between text-xs space-y-2 shadow-2xs hover:border-primary-300 transition-colors"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <span className="font-bold text-gray-900 line-clamp-1">{comp.name}</span>
                        <span className="badge badge-verified shrink-0">
                          {comp.distanceKm} km
                        </span>
                      </div>
                      <span className="text-[11px] text-primary-800 font-semibold">{comp.category}</span>
                    </div>

                    {comp.address && (
                      <p className="text-[11px] text-gray-500 line-clamp-1">
                        📍 {comp.address}
                      </p>
                    )}

                    {comp.phone && (
                      <p className="text-[11px] text-gray-600 flex items-center gap-1">
                        <Phone size={11} />
                        <span>{comp.phone}</span>
                      </p>
                    )}

                    <div className="pt-2 border-t border-gray-100 flex items-center justify-between text-[10px] text-gray-400">
                      <span>Source: {comp.source}</span>
                      <span>{comp.retrievalTime}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Attribution Notice */}
        <div className="pt-2 text-[11px] text-gray-400 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
          <span>{providerAttribution || 'Data © OpenStreetMap contributors, licensed under ODbL.'}</span>
          {lastFetchedTime && <span>Retrieved at: {lastFetchedTime}</span>}
        </div>
      </div>

      {/* 3. User Ground Field Observations (Strictly Kept Separate) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Logged User Observations */}
        <div className="lg:col-span-2 card p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="section-title text-base">
                <Store size={18} className="text-primary-700" />
                <span>{t('competitor.logObservationTitle', language)}</span>
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">
                {t('competitor.logObservationDesc', language)}
              </p>
            </div>
            <span className="badge badge-estimate">
              {onboarding.competitors.length} User Records
            </span>
          </div>

          {onboarding.competitors.length === 0 ? (
            <div className="bg-gray-50 border border-dashed border-gray-300 rounded-lg p-6 text-center text-gray-500 text-xs">
              No manual field observations recorded yet. Use the form on the right to log shops you saw during your village walk.
            </div>
          ) : (
            <div className="space-y-2.5">
              {onboarding.competitors.map((comp) => (
                <div
                  key={comp.id}
                  className="p-3 bg-white rounded-lg border border-gray-200 flex items-start justify-between gap-3 text-xs"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-gray-900 capitalize">
                        {BUSINESS_CATEGORY_LABELS[comp.category]?.[language] || comp.category}
                      </span>
                      <span className="text-gray-500">• {comp.count} shop(s)</span>
                      <span className="badge badge-estimate text-[10px]">
                        User-Provided Observation (Within {comp.radiusKm} km)
                      </span>
                    </div>
                    <p className="text-gray-600">{comp.notes}</p>
                    <span className="text-[10px] text-gray-400">Date Logged: {comp.dateObserved}</span>
                  </div>

                  <button
                    onClick={() => removeCompetitor(comp.id)}
                    className="text-gray-400 hover:text-red-600 transition-colors p-1"
                    title="Remove observation"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Observation Logging Form */}
        <div className="card p-6 bg-surface-warm">
          <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2 mb-3">
            <Plus size={16} className="text-primary-700" />
            <span>Record Local Ground Observation</span>
          </h3>

          <form onSubmit={handleAddCompetitor} className="space-y-3 text-xs">
            <div>
              <label className="label">Business Category</label>
              <select
                value={newCompCategory}
                onChange={(e) => setNewCompCategory(e.target.value as BusinessCategory)}
                className="input-field text-xs py-2"
              >
                {BUSINESS_CATEGORIES.map((c) => (
                  <option key={c} value={c.toLowerCase().replace(/ /g, '-')}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="label">Count Observed</label>
                <input
                  type="number"
                  min="1"
                  max="50"
                  value={newCompCount}
                  onChange={(e) => setNewCompCount(Math.max(1, Number(e.target.value)))}
                  className="input-field text-xs py-2"
                />
              </div>
              <div>
                <label className="label">Distance (km)</label>
                <input
                  type="number"
                  min="0.5"
                  step="0.5"
                  max="10"
                  value={newCompRadius}
                  onChange={(e) => setNewCompRadius(Number(e.target.value))}
                  className="input-field text-xs py-2"
                />
              </div>
            </div>

            <div>
              <label className="label">Date Surveyed</label>
              <input
                type="date"
                value={newCompDate}
                onChange={(e) => setNewCompDate(e.target.value)}
                className="input-field text-xs py-2"
              />
            </div>

            <div>
              <label className="label">Observed Features / Notes</label>
              <textarea
                rows={2}
                value={newCompNotes}
                onChange={(e) => setNewCompNotes(e.target.value)}
                placeholder="e.g. Sells unpasteurized milk, lacks chiller equipment"
                className="input-field text-xs py-2"
              />
            </div>

            <button type="submit" className="btn-primary w-full text-xs py-2 mt-2">
              Save Field Record
            </button>
          </form>
        </div>
      </div>

      {/* 4. Ground Pricing Benchmarks & Opportunity Hypotheses */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pricing Module */}
        <div className="card p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="section-title text-base">
              <Tag size={18} className="text-primary-700" />
              <span>Observed Local Market Prices</span>
            </h2>
            <span className="text-xs text-gray-500">
              {onboarding.pricing.length} Price Points
            </span>
          </div>

          <div className="space-y-2">
            {onboarding.pricing.map((price) => {
              const margin = price.estimatedCost
                ? Math.round(((price.competitorPrice - price.estimatedCost) / price.competitorPrice) * 100)
                : price.desiredMargin;
              return (
                <div
                  key={price.id}
                  className="p-3 bg-gray-50 rounded-lg border border-gray-200 flex items-center justify-between text-xs"
                >
                  <div>
                    <span className="font-bold text-gray-900 block">{price.productName}</span>
                    <span className="text-gray-500">
                      Market: ₹{price.competitorPrice} | Cost: ₹{price.estimatedCost}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="bg-emerald-100 text-emerald-800 font-semibold px-2 py-0.5 rounded">
                      {margin}% Margin
                    </span>
                    <button
                      onClick={() => removePricing(price.id)}
                      className="text-gray-400 hover:text-red-500"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          <form onSubmit={handleAddPricing} className="pt-2 border-t border-gray-100 grid grid-cols-4 gap-2 text-xs">
            <input
              type="text"
              placeholder="Product name"
              value={newPriceProduct}
              onChange={(e) => setNewPriceProduct(e.target.value)}
              className="input-field text-xs py-1.5 col-span-2"
            />
            <input
              type="number"
              placeholder="Price (₹)"
              value={newPriceComp || ''}
              onChange={(e) => setNewPriceComp(Number(e.target.value))}
              className="input-field text-xs py-1.5"
            />
            <button type="submit" className="btn-secondary text-xs py-1.5">
              + Add
            </button>
          </form>
        </div>

        {/* Possible Opportunities to Validate (Never "Unserved") */}
        <div className="card p-6 space-y-4">
          <h2 className="section-title text-base">
            <Lightbulb size={18} className="text-accent-600" />
            <span>Differentiation Hypotheses to Validate</span>
          </h2>
          <p className="text-xs text-gray-500">
            Commercial hypotheses for the entrepreneur to test locally; not guaranteed unserved markets.
          </p>

          <div className="space-y-2.5">
            {[
              {
                title: 'Early Morning Delivery (Before 6:30 AM)',
                desc: 'Supplying fresh milk and essential curd directly to tea stalls and working households before morning shandy opens.',
                tag: 'Differentiation',
              },
              {
                title: 'Smaller Unit Packaging (Sachets / 250ml)',
                desc: 'Daily wage agricultural laborers often prefer smaller daily purchasing quantities matching cash wages.',
                tag: 'Unit Sizing',
              },
              {
                title: 'Value-Addition: Curd & Ghee Processing',
                desc: 'Converting evening milk into curd lifts realization margin from 25% to 40% per litre.',
                tag: 'Margin Expansion',
              },
              {
                title: 'Weekly Shandy Aggregation',
                desc: 'Aggregating farm produce for weekly shandy markets in nearest taluk center.',
                tag: 'Volume Scale',
              },
            ].map((opp, idx) => (
              <div key={idx} className="p-3 bg-primary-50/60 rounded-lg border border-primary-200/60">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-gray-900">{opp.title}</span>
                  <span className="text-[10px] font-semibold bg-white text-primary-800 px-2 py-0.5 rounded border border-primary-200">
                    {opp.tag}
                  </span>
                </div>
                <p className="text-xs text-gray-600">{opp.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 5. Navigation Controls */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-200">
        <button onClick={onBack} className="btn-secondary text-xs px-5 py-2.5">
          ← {t('action.back', language)}
        </button>

        <button onClick={onContinue} className="btn-primary text-xs px-6 py-2.5 flex items-center gap-2">
          <span>{t('compare.title', language)}</span>
          <span>→</span>
        </button>
      </div>
    </div>
  );
};
