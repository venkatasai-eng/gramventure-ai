import React, { useState } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { t, SUPPORTED_LANGUAGES } from '@/lib/i18n';
import {
  Compass,
  Store,
  Landmark,
  ShieldAlert,
  FileText,
  Sparkles,
  RotateCcw,
  Languages,
  CheckCircle2,
  MapPin,
  Menu,
  X,
  ChevronRight,
} from 'lucide-react';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Header: React.FC<HeaderProps> = ({ activeTab, setActiveTab }) => {
  const { language, setLanguage, isDemoMode, loadDemoData, resetAll, onboarding } =
    useAppStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { id: 'home', label: t('nav.demand', language), icon: Compass },
    { id: 'village', label: t('nav.village', language), icon: MapPin },
    { id: 'compare', label: t('nav.compare', language), icon: Store },
    { id: 'finance', label: t('nav.finance', language), icon: Landmark },
    { id: 'simulator', label: t('nav.simulator', language), icon: ShieldAlert },
    { id: 'advisor', label: t('nav.advisor', language), icon: Sparkles },
    { id: 'report', label: t('nav.report', language), icon: FileText },
  ];

  const handleDemoClick = () => {
    loadDemoData();
    setActiveTab('village');
    setMobileMenuOpen(false);
  };

  const handleResetClick = () => {
    if (window.confirm('Reset all entered data and return to initial state?')) {
      resetAll();
      setActiveTab('home');
      setMobileMenuOpen(false);
    }
  };

  const handleNavClick = (tabId: string) => {
    setActiveTab(tabId);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-gray-200 shadow-xs">
      {/* ==========================================
          ROW 1: Branding, Descriptor, Language, Demo & Reset
          Solid Forest Green (#123B2A) Top Row
          ========================================== */}
      <div className="bg-[#123B2A] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-14 sm:h-16 gap-3">
            {/* Left: Branding & Product Descriptor */}
            <div className="flex items-center gap-3 min-w-0">
              <div
                onClick={() => handleNavClick('home')}
                className="flex items-center gap-2.5 cursor-pointer group shrink-0"
                title="GramVenture AI Home"
              >
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-[#23835B] text-white flex items-center justify-center font-black text-lg sm:text-xl shadow-xs group-hover:bg-emerald-600 transition-colors shrink-0">
                  <span>G</span>
                  <span className="text-[#E7A23B]">V</span>
                </div>
                <div className="flex flex-col">
                  <div className="flex items-center gap-2">
                    <span className="text-base sm:text-lg font-bold text-white tracking-tight shrink-0">
                      GramVenture <span className="text-emerald-300">AI</span>
                    </span>
                    <span className="hidden sm:inline-flex bg-emerald-900/80 text-emerald-200 text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded border border-emerald-700/50">
                      Tamil Nadu
                    </span>
                  </div>
                </div>
              </div>

              {/* Concise Product Descriptor */}
              <div className="hidden lg:flex items-center border-l border-white/20 pl-3 min-w-0">
                <span className="text-xs text-emerald-100/85 truncate">
                  {t('app.subtitle', language)}
                </span>
              </div>

              {/* Demo Mode Badge */}
              {isDemoMode && (
                <span className="hidden xl:inline-flex items-center gap-1 bg-amber-400/20 text-amber-300 border border-amber-400/35 px-2.5 py-0.5 rounded-full text-[11px] font-medium shrink-0">
                  <CheckCircle2 size={12} className="text-amber-400" />
                  <span>{t('header.demoLoaded', language)}</span>
                </span>
              )}
            </div>

            {/* Right: Language Selector, Demo, Reset, and Mobile Toggle */}
            <div className="flex items-center gap-2 sm:gap-3 shrink-0">
              {/* Multilingual Selector: English, తెలుగు, தமிழ் */}
              <div
                className="flex items-center bg-black/30 border border-white/15 rounded-lg p-0.5 shadow-inner"
                role="group"
                aria-label="Language Selector"
              >
                <Languages size={13} className="text-emerald-300/80 mx-1.5 shrink-0 hidden sm:inline-block" />
                {SUPPORTED_LANGUAGES.map((lang, idx) => (
                  <button
                    key={lang.code}
                    onClick={() => setLanguage(lang.code)}
                    className={`px-2 py-1 rounded-md text-xs font-semibold transition-all whitespace-nowrap ${
                      language === lang.code
                        ? 'bg-[#23835B] text-white shadow-xs'
                        : 'text-gray-300 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    {lang.label}
                  </button>
                ))}
              </div>

              {/* Explore Demo Button */}
              <button
                onClick={handleDemoClick}
                className="bg-[#E7A23B] hover:bg-[#d9952f] text-[#202A26] font-bold px-3 py-1.5 rounded-lg text-xs transition-colors shadow-xs flex items-center gap-1.5 shrink-0 whitespace-nowrap"
                title="Load standard Tamil Nadu demo scenario: Vadipatti, Madurai"
              >
                <Sparkles size={13} className="text-[#202A26]" />
                <span>{t('header.demo', language)}</span>
              </button>

              {/* Reset Button */}
              <button
                onClick={handleResetClick}
                className="text-gray-300 hover:text-white hover:bg-white/10 px-2 sm:px-2.5 py-1.5 rounded-lg text-xs transition-colors flex items-center gap-1 shrink-0"
                title="Reset all inputs"
              >
                <RotateCcw size={13} />
                <span className="hidden md:inline">{t('header.reset', language)}</span>
              </button>

              {/* Mobile/Tablet Menu Hamburger Button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden text-gray-200 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition-colors shrink-0"
                aria-label="Toggle navigation menu"
                aria-expanded={mobileMenuOpen}
              >
                {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ==========================================
          ROW 2: Primary Navigation, Location Indicator & Blueprint Action
          White bar with full horizontal visibility
          ========================================== */}
      <div className="bg-white border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="hidden lg:flex items-center justify-between h-13 gap-4">
            {/* Primary Navigation Tabs */}
            <nav className="flex items-center gap-1 min-w-0" aria-label="Main Navigation">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleNavClick(item.id)}
                    className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs xl:text-sm font-medium transition-all whitespace-nowrap ${
                      isActive
                        ? 'bg-[#123B2A] text-white font-semibold shadow-xs'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                    }`}
                  >
                    <Icon
                      size={15}
                      className={isActive ? 'text-emerald-300' : 'text-gray-400'}
                    />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>

            {/* Right Group: Current Location & Business Blueprint Action */}
            <div className="flex items-center gap-3 shrink-0">
              {onboarding.location.district ? (
                <div
                  className="flex items-center gap-1.5 text-xs text-gray-700 bg-gray-50 border border-gray-200 px-3 py-1.5 rounded-lg shrink-0 max-w-[220px] xl:max-w-[260px]"
                  title={`Active location: ${onboarding.location.village ? `${onboarding.location.village}, ` : ''}${onboarding.location.district}`}
                >
                  <MapPin size={13} className="text-[#23835B] shrink-0" />
                  <span className="truncate font-semibold text-gray-900">
                    {onboarding.location.village ? `${onboarding.location.village}, ` : ''}
                    {onboarding.location.district}
                  </span>
                </div>
              ) : null}

              <button
                onClick={() => handleNavClick('report')}
                className="bg-[#23835B] hover:bg-[#1b6b49] text-white text-xs font-semibold px-3.5 py-2 rounded-lg shadow-xs flex items-center gap-1.5 shrink-0 transition-colors whitespace-nowrap"
              >
                <FileText size={14} />
                <span>{t('header.blueprint', language)}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ==========================================
          MOBILE / TABLET NAVIGATION
          Compact active tab strip + Expandable Menu Drawer
          ========================================== */}
      {/* Scrollable Tab Strip for quick switching on small screens */}
      <div className="lg:hidden bg-gray-50 border-t border-gray-200 overflow-x-auto py-2 px-3 flex items-center gap-1.5 scrollbar-none">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => handleNavClick(item.id)}
              className={`shrink-0 inline-flex items-center gap-1 px-3 py-1.5 rounded-md text-xs font-medium whitespace-nowrap transition-colors ${
                isActive
                  ? 'bg-[#123B2A] text-white shadow-xs font-semibold'
                  : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-100'
              }`}
            >
              <Icon size={13} className={isActive ? 'text-emerald-300' : 'text-gray-500'} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>

      {/* Expandable Mobile Drawer (when Hamburger is clicked) */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-t border-gray-200 px-4 py-4 space-y-4 shadow-lg animate-in fade-in slide-in-from-top-2 duration-150">
          {/* Mobile Location Badge */}
          {onboarding.location.district && (
            <div className="flex items-center gap-2 p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs">
              <MapPin size={16} className="text-[#23835B] shrink-0" />
              <div>
                <span className="text-[10px] text-emerald-800 uppercase font-bold tracking-wider block">
                  {t('header.activeLocation', language)}
                </span>
                <span className="font-semibold text-gray-900">
                  {onboarding.location.village ? `${onboarding.location.village}, ` : ''}
                  {onboarding.location.district}
                </span>
              </div>
            </div>
          )}

          {/* Vertical Navigation Links */}
          <div className="space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400 px-2 block">
              Workflow Navigation
            </span>
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`w-full flex items-center justify-between p-2.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-[#123B2A] text-white font-semibold'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon size={16} className={isActive ? 'text-emerald-300' : 'text-gray-500'} />
                    <span>{item.label}</span>
                  </div>
                  <ChevronRight size={14} className={isActive ? 'text-emerald-300' : 'text-gray-400'} />
                </button>
              );
            })}
          </div>

          {/* Quick Actions in Drawer */}
          <div className="pt-2 border-t border-gray-100 flex items-center gap-2">
            <button
              onClick={() => handleNavClick('report')}
              className="flex-1 bg-[#23835B] hover:bg-[#1b6b49] text-white text-xs font-semibold py-2.5 px-3 rounded-lg flex items-center justify-center gap-2 transition-colors"
            >
              <FileText size={15} />
              <span>{t('header.blueprint', language)}</span>
            </button>
            <button
              onClick={handleResetClick}
              className="bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-medium py-2.5 px-3 rounded-lg flex items-center gap-1.5 transition-colors"
            >
              <RotateCcw size={14} />
              <span>{t('header.reset', language)}</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
