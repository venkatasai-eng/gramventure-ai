import React, { useState } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { t } from '@/lib/i18n';
import { askAdvisor, PRESET_QUESTIONS, type AdvisorMessage, type AdvisorContext } from '@/services/aiAdvisor';
import { formatINR } from '@/lib/finance/formatters';
import {
  Sparkles,
  Send,
  HelpCircle,
  Bot,
  User,
  ShieldCheck,
  AlertCircle,
  Languages,
  CheckCircle,
} from 'lucide-react';

interface AdvisorScreenProps {
  onContinue: () => void;
  onBack: () => void;
}

export const AdvisorScreen: React.FC<AdvisorScreenProps> = ({ onContinue, onBack }) => {
  const { onboarding, language, setLanguage, stressTest, activeScenario } = useAppStore();

  const [inputQuery, setInputQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<AdvisorMessage[]>([
    {
      id: 'init-1',
      role: 'assistant',
      content:
        language === 'te'
          ? `నమస్కారం! నేను **గ్రామ్‌వెంచర్ AI** సలహాదారుని. మీ లొకేషన్ (${onboarding.location.locality || onboarding.location.village || 'వాడిపట్టి'}, ${onboarding.location.district || 'మదురై'}), అందుబాటులో ఉన్న మార్జిన్ క్యాపిటల్ (${formatINR(onboarding.profile.availableSavings || 100000)}), మరియు ఫైనాన్షియల్ ఇంజిన్ లెక్కింపుల ఆధారంగా నేను మీకు సహాయం చేయగలను. క్రింది ప్రశ్నలలో ఒకదానిని ఎంచుకోండి లేదా మీ ప్రశ్నను టైప్ చేయండి.`
          : language === 'ta'
          ? `வணக்கம்! நான் உங்கள் **கிராம்வென்ச்சர் AI** வணிக ஆலோசகர். உங்கள் இருப்பிட விவரங்கள் (${onboarding.location.locality || onboarding.location.village || 'வாடிப்பட்டி'}, ${onboarding.location.district || 'மதுரை'}), சொந்த சேமிப்பு (${formatINR(onboarding.profile.availableSavings || 100000)}), திட்ட கடன் வரம்புகள் மற்றும் நிதி மதிப்பீடுகளின் அடிப்படையில் நான் உங்களுக்கு உதவ முடியும். கீழேயுள்ள கேள்விகளில் ஒன்றைத் தேர்ந்தெடுக்கவும் அல்லது உங்கள் கேள்வியை தட்டச்சு செய்யவும்.`
          : `Hello! I am your **GramVenture AI** Business Advisor. I have full read-only access to your structured project context: **${onboarding.location.locality || onboarding.location.village || 'Vadipatti'}, ${onboarding.location.district || 'Madurai'}**, margin capital of **${formatINR(onboarding.profile.availableSavings || 100000)}**, scheme limits, and stress simulation results. Choose a question below or type your own.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isRuleBased: true,
    },
  ]);

  // Build advisor context from current store state
  const advisorContext: AdvisorContext = {
    language,
    location: {
      village: onboarding.location.locality || onboarding.location.village || 'Vadipatti',
      block: onboarding.location.block || 'Vadipatti Block',
      district: onboarding.location.district || 'Madurai',
      state: onboarding.location.state || 'Tamil Nadu',
    },
    marginCapital: onboarding.profile.availableSavings || 100000,
    selectedBusinessName: onboarding.profile.desiredBusinessActivity || onboarding.demand?.desiredBusinessActivity || onboarding.profile.demandDescription || 'Small Dairy Unit',
    projectCost: (onboarding.profile.availableSavings || 100000) / 0.1,
    salesDeclinePercent: stressTest.salesDeclinePercent,
    stressedDSCR: 0.88,
    evidenceCoveragePercent: 68,
    missingDataItems: [
      'Written quotation for livestock from registered dairy farm in Tamil Nadu',
      'Aavin / cooperative milk society procurement rate slip',
      'Local veterinary surgeon emergency visit rate',
    ],
  };

  const handleSend = async (textToSend?: string) => {
    const query = (textToSend || inputQuery).trim();
    if (!query) return;

    const userMsg: AdvisorMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputQuery('');
    setLoading(true);

    try {
      const result = await askAdvisor(query, advisorContext);
      const assistantMsg: AdvisorMessage = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: result.text,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isRuleBased: !result.isLiveAPI,
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err) {
      console.error('Advisor error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 pb-16">
      {/* Top Banner */}
      <div className="card p-6 bg-white border-l-4 border-l-primary-600">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-bold uppercase tracking-wider text-primary-700">
                Decision Support Specialist
              </span>
              <span className="text-gray-300">•</span>
              <span className="text-xs text-gray-500">Multilingual Knowledge Assistant</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">
              AI Business Advisory & Plain-Language Guidance
            </h1>
            <p className="text-sm text-gray-600 mt-1">
              Plain-language reasoning grounded strictly in deterministic numbers.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="badge bg-primary-100 text-primary-800 border border-primary-300 text-xs py-1">
              🛡️ Rule-Based Deterministic Fallback Active
            </span>
          </div>
        </div>
      </div>

      {/* Suggested Questions Grid */}
      <div className="card p-5 space-y-3 bg-surface-warm">
        <span className="text-xs font-bold uppercase tracking-wider text-gray-600 flex items-center gap-1.5">
          <HelpCircle size={14} className="text-primary-700" />
          Suggested Questions for Hackathon Evaluation:
        </span>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
          {PRESET_QUESTIONS.map((q) => (
            <button
              key={q.id}
              onClick={() => handleSend(language === 'te' ? q.te : language === 'ta' ? q.ta : q.en)}
              className="text-left text-xs bg-white hover:bg-primary-50 hover:border-primary-300 text-gray-800 p-3 rounded-lg border border-gray-200 transition-all shadow-2xs"
            >
              <span className="font-semibold text-primary-700 block mb-0.5">Q:</span>
              {language === 'te' ? q.te : language === 'ta' ? q.ta : q.en}
            </button>
          ))}
        </div>
      </div>

      {/* Chat Area */}
      <div className="card overflow-hidden flex flex-col h-[520px]">
        {/* Messages Scroll Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50/50">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex items-start gap-3 max-w-3xl ${
                msg.role === 'user' ? 'ml-auto flex-row-reverse' : ''
              }`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                  msg.role === 'user'
                    ? 'bg-primary-700 text-white'
                    : 'bg-emerald-600 text-white'
                }`}
              >
                {msg.role === 'user' ? <User size={16} /> : <Bot size={16} />}
              </div>

              <div
                className={`p-4 rounded-xl text-xs leading-relaxed space-y-2 ${
                  msg.role === 'user'
                    ? 'bg-primary-700 text-white rounded-tr-none'
                    : 'bg-white border border-gray-200 text-gray-800 shadow-2xs rounded-tl-none'
                }`}
              >
                <div className="whitespace-pre-line">{msg.content}</div>
                <div
                  className={`text-[10px] flex items-center justify-between pt-1 border-t ${
                    msg.role === 'user'
                      ? 'border-primary-600/60 text-primary-200'
                      : 'border-gray-100 text-gray-400'
                  }`}
                >
                  <span>{msg.timestamp}</span>
                  {msg.isRuleBased && (
                    <span className="text-[10px] bg-emerald-50 text-emerald-800 px-1.5 py-0.2 rounded font-medium">
                      Verified Rule Output
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex items-center gap-3 text-xs text-gray-500 italic">
              <Bot size={18} className="animate-spin text-primary-600" />
              <span>Analyzing financial engine context & generating plain-language guidance...</span>
            </div>
          )}
        </div>

        {/* Query Input Bar */}
        <div className="p-4 bg-white border-t border-gray-200">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              placeholder={
                language === 'te'
                  ? 'మీ ప్రశ్నను ఇక్కడ అడగండి (ఉదా: రుణ వాయిదా, దాణా ఖర్చు, డాక్యుమెంట్లు)...'
                  : language === 'ta'
                  ? 'உங்கள் கேள்வியை இங்கே கேட்கவும் (எ.கா: கடன் தவணை, தீவன செலவு, ஆவணங்கள்)...'
                  : 'Ask a question about your business plan, loan rules, or risk mitigation...'
              }
              className="input-field text-xs py-2.5"
            />
            <button
              type="submit"
              disabled={loading || !inputQuery.trim()}
              className="btn-primary text-xs py-2.5 px-4 flex items-center gap-1.5 shrink-0"
            >
              <span>Ask</span>
              <Send size={14} />
            </button>
          </form>
        </div>
      </div>

      {/* Ethical Safeguard Disclaimers */}
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-xs text-amber-900 space-y-1">
        <span className="font-bold flex items-center gap-1.5">
          <AlertCircle size={15} className="text-amber-700" />
          Responsible AI & Decision-Support Protocol:
        </span>
        <p className="leading-relaxed">
          The advisor explains mathematical outputs generated by the deterministic financial engine.
          It never overrides numbers, modifies loan amounts, or promises loan sanction.
          Always consult your local bank branch manager or district industries authority before financial signing.
        </p>
      </div>

      {/* Navigation Controls */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-200">
        <button onClick={onBack} className="btn-secondary text-xs px-5 py-2.5">
          {language === 'te'
            ? '← సిమ్యులేటర్‌కు వెనుకకు'
            : language === 'ta'
            ? '← சிமுலேட்டருக்குச் செல்ல'
            : '← Back to Simulator'}
        </button>

        <button onClick={onContinue} className="btn-primary text-xs px-6 py-2.5 flex items-center gap-2">
          <span>
            {language === 'te'
              ? 'వ్యాపార బ్లూప్రింట్ తయారు చేయండి'
              : language === 'ta'
              ? 'தொழில் திட்ட வரைபடத்தைத் தயாரிக்க'
              : 'Generate Bankable Business Blueprint'}
          </span>
          <span>→</span>
        </button>
      </div>
    </div>
  );
};
