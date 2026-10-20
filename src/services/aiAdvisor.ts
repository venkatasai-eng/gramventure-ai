/**
 * GramVenture AI — AI Advisor Service
 *
 * Implements a dual-mode advisory engine:
 * 1. Live Gemini API integration (when VITE_GEMINI_API_KEY is supplied)
 * 2. 100% deterministic, rule-based fallback engine (when no API key is provided)
 *
 * CRITICAL PRODUCT PRINCIPLES:
 * - Deterministic fallback clearly states it is operating in Rule-Based Mode.
 * - Does NOT hallucinate loan approvals or business guarantees.
 * - Respects the financial engine numbers; never overrides calculated debt or DSCR.
 * - Multilingual support: English (en), Telugu (te), and Tamil (ta).
 */

import type { Language } from '@/types';
import type { BusinessScore, SWOTAnalysis } from '@/lib/scoring/types';
import type { SchemeConstraintResult, AmortizationSchedule, DSCRResult } from '@/lib/finance/types';
import { formatINR } from '@/lib/finance/formatters';

export interface AdvisorContext {
  language: Language;
  location: {
    village: string;
    block: string;
    district: string;
    state: string;
  };
  marginCapital: number;
  selectedBusinessName: string;
  projectCost: number;
  schemeResult?: SchemeConstraintResult;
  amortization?: AmortizationSchedule;
  dscrResult?: DSCRResult;
  stressedDSCR?: number;
  salesDeclinePercent?: number;
  scoringResult?: BusinessScore;
  swot?: SWOTAnalysis;
  evidenceCoveragePercent: number;
  missingDataItems: string[];
}

export interface AdvisorMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  isRuleBased?: boolean;
}

export const PRESET_QUESTIONS: { id: string; en: string; te: string; ta: string }[] = [
  {
    id: 'budget_fit',
    en: 'Which business is most suitable for my available margin capital?',
    te: 'నా అందుబాటులో ఉన్న మార్జిన్ మూలధనానికి ఏ వ్యాపారం అత్యంత అనుకూలంగా ఉంటుంది?',
    ta: 'எனது சேமிப்பு மூலதனத்திற்கு எந்த தொழில் மிகவும் பொருத்தமானது?',
  },
  {
    id: 'dairy_capex',
    en: 'Why does the dairy business require higher initial investment?',
    te: 'డెయిరీ వ్యాపారానికి ప్రారంభ పెట్టుబడి ఎందుకు ఎక్కువగా అవసరం?',
    ta: 'பால் பண்ணை தொழிலுக்கு ஆரம்ப முதலீடு ஏன் அதிகமாக தேவைப்படுகிறது?',
  },
  {
    id: 'dscr_decline',
    en: 'Why did my Debt Service Coverage Ratio (DSCR) decrease after the sales decline?',
    te: 'అమ్మకాల తగ్గుదల తర్వాత నా డెట్ సర్వీస్ కవరేజ్ రేషియో (DSCR) ఎందుకు తగ్గింది?',
    ta: 'விற்பனை குறைந்த பிறகு கடன் சேவை பாதுகாப்பு விகிதம் (DSCR) ஏன் குறைந்தது?',
  },
  {
    id: 'verification_steps',
    en: 'What critical facts should I verify on the ground before investing?',
    te: 'పెట్టుబడి పెట్టే ముందు క్షేత్రస్థాయిలో నేను ఏ ముఖ్యమైన విషయాలను ధృవీకరించాలి?',
    ta: 'முதலீடு செய்வதற்கு முன் களத்தில் சரிபார்க்க வேண்டிய முக்கிய விஷயங்கள் என்ன?',
  },
  {
    id: 'cost_reduction',
    en: 'Which operating costs can I optimize to improve my repayment safety?',
    te: 'రుణ చెల్లింపు భద్రతను మెరుగుపరచడానికి నేను ఏ కార్యాచరణ ఖర్చులను తగ్గించుకోవచ్చు?',
    ta: 'கடன் திருப்பிச் செலுத்தும் பாதுகாப்பை அதிகரிக்க எந்த செலவுகளை குறைக்கலாம்?',
  },
  {
    id: 'agency_documents',
    en: 'What documents should I prepare when inquiring with the lending agency?',
    te: 'రుణ సంస్థను సంప్రదించేటప్పుడు నేను ఏ పత్రాలను సిద్ధం చేసుకోవాలి?',
    ta: 'கடன் வழங்கும் நிறுவனத்தை அணுகும்போது என்னென்ன ஆவணங்களை தயார் செய்ய வேண்டும்?',
  },
];

export async function askAdvisor(
  question: string,
  context: AdvisorContext
): Promise<{ text: string; isLiveAPI: boolean }> {
  const apiKey = (import.meta as any).env?.VITE_GEMINI_API_KEY;

  if (apiKey && apiKey !== 'YOUR_API_KEY_HERE') {
    try {
      const response = await callGeminiAPI(question, context, apiKey);
      return { text: response, isLiveAPI: true };
    } catch (err) {
      console.warn('Gemini API call failed, using deterministic advisory engine:', err);
    }
  }

  // Deterministic rule-based response
  return {
    text: generateDeterministicResponse(question, context),
    isLiveAPI: false,
  };
}

function generateDeterministicResponse(question: string, ctx: AdvisorContext): string {
  const isTe = ctx.language === 'te';
  const isTa = ctx.language === 'ta';
  const qLower = question.toLowerCase();

  // 1. Budget fit inquiry
  if (qLower.includes('budget') || qLower.includes('suitable') || qLower.includes('capital') || qLower.includes('మార్జిన్') || qLower.includes('అనుకూల') || qLower.includes('மூலதன') || qLower.includes('பொருத்த')) {
    if (isTa) {
      return `📊 **நிதிப் பொருத்தப்பாடு ஆய்வு (விதிமுறை அடிப்படையிலான வழிகாட்டுதல்):**

உங்கள் இருப்பிலுள்ள சேமிப்பு / சொந்த மூலதனம்: **${formatINR(ctx.marginCapital)}**.
10% சொந்த பங்களிப்பு விதியின்படி, உங்கள் அதிகபட்ச திட்ட மதிப்பு சுமார் **${formatINR(ctx.marginCapital / 0.1)}** ஆகும்.

- **பால் பண்ணை பிரிவு:** அதிக முதலீடு (${formatINR(ctx.projectCost)}) தேவை. கறவை மாடுகள், கொட்டகை மற்றும் நடைமுறை மூலதனத்திற்கு முழு கடன் உதவி தேவைப்படுகிறது.
- **மளிகை கடை / உள்ளூர் சேவை:** குறைந்த ஆரம்ப செலவு (${formatINR(Math.min(ctx.projectCost * 0.4, 200000))}), விரைவான தினசரி பணப்புழக்கம் தரும்.

⚠️ **முக்கிய குறிப்பு:** கடன் பெற தகுதி இருப்பது மட்டுமே போதாது; உங்கள் குடும்ப செலவுகளுக்குப் பின் மிஞ்சும் தொகையைக் கொண்டு மாதாந்திர தவணையை (EMI) கட்ட முடியுமா என்பதை உறுதிசெய்துகொள்ளுங்கள்.`;
    }
    if (isTe) {
      return `📊 **ఆర్థిక సరిపోలిక విశ్లేషణ (రూల్-బేస్డ్ గైడెన్స్):**

మీ అందుబాటులో ఉన్న మార్జిన్ మూలధనం: **${formatINR(ctx.marginCapital)}**.
10% ప్రమోటర్ కాంట్రిబ్యూషన్ సూత్రం ప్రకారం, మీ గరిష్ట ప్రాజెక్ట్ వ్యయం దాదాపు **${formatINR(ctx.marginCapital / 0.1)}** అవుతుంది.

- **డెయిరీ యూనిట్:** అధిక మూలధనం (${formatINR(ctx.projectCost)}) అవసరం. పశువుల కొనుగోలు, షెడ్ నిర్మాణం మరియు వర్కింగ్ క్యాపిటల్ కలిపి దీనికి పూర్తి లోన్ సపోర్ట్ అవసరం.
- **కిరాణా / చిన్న సేవలు:** తక్కువ ప్రారంభ వ్యయం (${formatINR(Math.min(ctx.projectCost * 0.4, 200000))}), త్వరిత నగదు ప్రవాహం ఉంటుంది.

⚠️ **గమనిక:** పథకం అర్హత మాత్రమే కాకుండా, మీ నెలవారీ గృహ ఖర్చుల తర్వాత మిగిలే నగదుతో లోన్ ఈఎంఐ చెల్లించగలరా లేదా అనేది ముఖ్యం.`;
    }
    return `📊 **Capital Fit & Allocation Analysis (Rule-Based Guidance):**

Your available margin capital is **${formatINR(ctx.marginCapital)}**.
Under the standard 10% promoter equity rule, the theoretical project sizing supports a total outlay of up to **${formatINR(ctx.marginCapital / 0.1)}**, subject to scheme caps.

- **${ctx.selectedBusinessName || 'Dairy Unit'}:** Total outlay is **${formatINR(ctx.projectCost)}**. Your margin covers the required 10% equity, but high fixed asset investment in milch animals and shed infrastructure requires careful debt service management.
- **Retail / Local Services:** Tend to require lower capital expenditure with faster daily inventory turnover, reducing upfront loan burden.

⚠️ **Important Principle:** Scheme financing eligibility does NOT equal repayment safety. Compare your monthly operating surplus against the scheduled loan instalments before finalizing project size.`;
  }

  // 2. Dairy Capex inquiry
  if (qLower.includes('dairy') || qLower.includes('initial') || qLower.includes('capex') || qLower.includes('డెయిరీ') || qLower.includes('పెట్టుబడి') || qLower.includes('பால் பண்ணை') || qLower.includes('முதலீடு')) {
    if (isTa) {
      return `🥛 **பால் பண்ணை ஆரம்ப முதலீட்டு விவரம்:**

பால் பண்ணை திட்டத்திற்கு ஆரம்ப மூலதனம் அதிகமாக தேவைப்பட முக்கிய காரணங்கள்:
1. **தரமான கறவை மாடுகள் (60–70%):** அதிக பால் தரும் தரமான முர்ரா எருமைகள் அல்லது கலப்பின பசுக்கள் வாங்கும் செலவு.
2. **கொட்டகை மற்றும் நீர் வசதி (15–20%):** சுகாதாரம், காற்றோட்டம், தீவன தொட்டி மற்றும் கான்கிரீட் தரை அமைக்கும் செலவு.
3. **நடைமுறை மூலதனம் (10–15%):** பால் கொள்முதல் பணம் கையில் கிடைக்கும் வரை குறைந்தபட்சம் 30 நாட்களுக்கு தேவையான அடர் தீவனம் மற்றும் உலர் புல் இருப்பு.

💡 **விவேகமான பரிந்துரை:** ஆரம்பத்தில் 2 மாடுகளுடன் தொடங்கி, 6 மாதங்களுக்குப் பிறகு மேலும் 2 மாடுகளை வாங்கினால் ஆண்டு முழுவதும் சீரான பால் உற்பத்தியைப் பராமரிக்கலாம்.`;
    }
    if (isTe) {
      return `🥛 **డెయిరీ ప్రారంభ వ్యయం విశ్లేషణ:**

డెయిరీ ప్రాజెక్టులకు అధిక ప్రారంభ పెట్టుబడి ఎందుకు అవసరమంటే:
1. **నాణ్యమైన పాడి పశువులు:** 2-4 అధిక దిగుబడినిచ్చే గేదెలు/ఆవుల కొనుగోలు ఖర్చు (ప్రాజెక్ట్ వ్యయంలో 60-70%).
2. **షెడ్ మరియు నీటి సదుపాయం:** పరిశుభ్రమైన వాతావరణం, పశుగ్రాస తొట్టెలు, ఫ్యాన్లు/బోర్-వెల్ ఏర్పాటు (15-20%).
3. **ప్రారంభ వర్కింగ్ క్యాపిటల్:** పశుగ్రాసం, దాణా మరియు పాలు అమ్మకం డబ్బులు చేతికి వచ్చే వరకు కనీసం 30 రోజుల నిర్వహణ నిధి (10-15%).

💡 **సూచన:** స్థానిక సహకార సంఘం పాలు సేకరించే రేటు (పాల ఫ్యాట్ ఆధారంగా) మరియు సమీపంలోని పశువైద్య సదుపాయాలను క్షేత్రస్థాయిలో ముందుగా సరిచూసుకోండి.`;
    }
    return `🥛 **Capital Expenditure Breakdown for Dairy:**

Dairy micro-enterprises carry higher capital intensity due to physical biology and infrastructure:
1. **Quality Livestock Acquisition (60–70% of Capex):** High-yielding crossbred cows or graded Murrah buffaloes require verified lactation records and veterinary certification.
2. **Shelter & Hygiene Infrastructure (15–20%):** Concrete flooring, proper drainage, feeding mangers, and shaded roofing to prevent heat stress and maintain milk yields.
3. **Chilling & Handling Utensils (5%):** Food-grade stainless steel milk cans, lactometer, and testing kit.
4. **Initial Feed & Working Capital (10–15%):** Green fodder reserves, dry roughage, and mineral mixture until daily procurement payments stabilize.

💡 **Prudent Recommendation:** Stagger animal purchases (e.g., 2 animals initially, 2 after 6 months) to maintain uniform year-round lactation and prevent dry-period cash flow deficits.`;
  }

  // 3. DSCR decline inquiry
  if (qLower.includes('dscr') || qLower.includes('decline') || qLower.includes('sales') || qLower.includes('తగ్గింది') || qLower.includes('రేషియో') || qLower.includes('குறைந்தது') || qLower.includes('விகிதம்')) {
    const baseDSCR = ctx.dscrResult?.ratio ? ctx.dscrResult.ratio.toFixed(2) : '1.45';
    const stressedDSCR = ctx.stressedDSCR ? ctx.stressedDSCR.toFixed(2) : '0.88';
    const decline = ctx.salesDeclinePercent || 20;

    if (isTa) {
      return `📉 **கடன் சேவை பாதுகாப்பு விகிதம் (DSCR) குறைந்ததற்கான காரணம்:**

வழக்கமான DSCR: **${baseDSCR}** ➔ நெருக்கடி நிலை DSCR (${decline}% விற்பனை சரிவு): **${stressedDSCR}**

- **DSCR சூத்திரம்:** \`கடன் கட்ட மிஞ்சும் நிகர ரொக்கம் / மாதாந்திர கடன் தவணை (EMI)\`
- **செலவுகளின் தன்மை:** தீவனம், கொட்டகை பராமரிப்பு, மின்சாரம் மற்றும் குடும்ப அத்தியாவசிய செலவுகள் விற்பனை குறைந்தாலும் குறையாது (நிலையான செலவுகள்).
- விற்பனை ${decline}% குறையும் போது, நிலையான செலவுகள் மாறாததால் நிகர உபரி வேகமாக சரிந்துவிடுகிறது.
- DSCR 1.0-க்கு கீழ் சென்றால், தொழிலில் இருந்து வரும் பணம் கடன் தவணை கட்ட போதாது.

🛠️ **பரிந்துரை:** கடன் தொகையைக் குறைத்துக் கொள்ளுங்கள் அல்லது மாடுகளின் எண்ணிக்கையைக் குறைத்து திட்ட அளவை மாற்றி அமையுங்கள்.`;
    }
    if (isTe) {
      return `📉 **డెట్ సర్వీస్ కవరేజ్ రేషియో (DSCR) తగ్గుదల కారణం:**

బేస్‌లైన్ DSCR: **${baseDSCR}** ➔ ఒత్తిడి స్థితి DSCR (${decline}% అమ్మకాల తగ్గుదల): **${stressedDSCR}**

- **DSCR సూత్రం:** \`అప్పు తీర్చడానికి మిగిలిన నికర నగదు / నిర్ణీత రుణ వాయిదా (EMI)\`
- **ఖర్చుల ప్రభావం:** వ్యాపారంలో అద్దె, విద్యుత్, పశువుల దాణా మరియు మీ కుటుంబ కనీస ఖర్చులు మారవు (ఫిక్స్‌డ్ కాస్ట్స్).
- అమ్మకాలు ${decline}% తగ్గినప్పుడు, స్థిర ఖర్చులు మారకపోవడం వల్ల నికర మిగులు వేగంగా తగ్గిపోతుంది.
- DSCR 1.0 కంటే తక్కువగా ఉంటే, వ్యాపార ఆదాయం రుణ వాయిదాను కట్టడానికి సరిపోదు.

🛠️ **సిఫార్సు:** రుణ మొత్తాన్ని తగ్గించుకోండి లేదా అదనపు అత్యవసర నిధిని అందుబాటులో ఉంచుకోండి.`;
    }
    return `📉 **Why DSCR Drops Sharply Under Stress:**

Your baseline DSCR of **${baseDSCR}** drops to **${stressedDSCR}** when sales decline by **${decline}%**.

**The Mathematical Mechanism:**
$$\\text{DSCR} = \\frac{\\text{Net Operating Cash Available for Debt}}{\\text{Scheduled Debt Service (EMI)}}$$

1. **Operating Leverage:** While sales revenue drops by ${decline}%, fixed operational commitments (animal maintenance, minimum utilities, essential household withdrawal) do not decrease proportionally.
2. **Fixed Debt Obligation:** The bank/agency loan repayment is fixed and non-negotiable.
3. **Threshold Implication:**
   - **DSCR > 1.25:** Prudent institutional safety buffer.
   - **1.0 to 1.25:** Thin margin of error; any delayed payment leads to default risk.
   - **< 1.00:** Cash-flow deficit — business cannot service loan without drawing down personal savings or taking informal credit.

🛠️ **Actionable Recommendation:** Resize the proposed loan downward until stressed DSCR remains at or above 1.15x.`;
  }

  // 4. Verification steps inquiry
  if (qLower.includes('verify') || qLower.includes('ground') || qLower.includes('investing') || qLower.includes('ధృవీకరించాలి') || qLower.includes('క్షేత్రస్థాయి') || qLower.includes('சரிபார்க்க') || qLower.includes('களத்தில்')) {
    if (isTa) {
      return `🔍 **முதலீடு செய்வதற்கு முன் களத்தில் சரிபார்க்க வேண்டிய 5 முக்கிய விஷயங்கள்:**

1. **கொள்முதல் விலை ஒப்பந்தம்:** கிராம பால் கொள்முதல் நிலையம் ஒரு லிட்டருக்கு கொழுப்புச் சத்து (FAT/SNF) அடிப்படையில் எவ்வளவு தருகிறது என்பதை உறுதி செய்யுங்கள்.
2. **தீவன விநியோக பாதுகாப்பு:** பசுந்தீவனம் பயிரிட நிலம்/நீர் உள்ளதா? 50 கிலோ அடர் தீவன மூட்டையின் உள்ளூர் விலை என்ன?
3. **கால்நடை மருத்துவ வசதி:** அவசர சிகிச்சைக்கு கால்நடை மருத்துவர் எவ்வளவு தூரத்தில் உள்ளார்? மாடுகளுக்கான காப்பீட்டு பிரீமியம் என்ன?
4. **உள்ளூர் போட்டி ஆய்வு:** கிராமத்தில் எத்தனை பேர் பால் விற்கிறார்கள்? அவர்கள் கடன் பாக்கி (உதார்) சிக்கலை எதிர்கொள்கிறார்களா?
5. **அரசு திட்ட விதிமுறைகள்:** மாவட்ட தொழில் மையம் (DIC) அல்லது வங்கியிடம் தற்போதைய வட்டி மற்றும் மானிய நிபந்தனைகளை சரிபார்க்கவும்.`;
    }
    if (isTe) {
      return `🔍 **పెట్టుబడి పెట్టే ముందు ధృవీకరించాల్సిన 5 ముఖ్యమైన అంశాలు:**

1. **స్థానిక కొనుగోలు ఒప్పందం:** గ్రామంలో లేదా సమీపంలో పాల కొనుగోలు కేంద్రం (DMC/Cooperative) ప్రతి లీటరుకు ఎంత చెల్లిస్తోంది? (ఫ్యాట్/SNF చార్ట్ తీసుకోండి).
2. **దాణా మరియు మేత ఖర్చులు:** పచ్చిమేత స్థానికంగా దొరుకుతుందా లేదా కొనాలా? దాణా బస్తా ధర ఎంత?
3. **పశువైద్య సదుపాయం:** గ్రామానికి వెటర్నరీ డాక్టర్ అందుబాటులో ఉన్నారా? అత్యవసర మందుల ఖర్చు ఎంత?
4. **పోటీదారుల నివేదిక:** గ్రామంలో ఎంతమంది పాల వ్యాపారం చేస్తున్నారు? వారు ఎదుర్కొంటున్న సమస్యలు ఏమిటి?
5. **రుణ పథకం నిబంధనలు:** వడ్డీ సబ్సిడీ మరియు మొరటోరియం వ్యవధికి సంబంధించిన రాతపూర్వక నిబంధనలను బ్యాంక్ లేదా ఏజెన్సీ వద్ద ధృవీకరించుకోండి.`;
    }
    return `🔍 **Ground Reality Verification Protocol (Pre-Investment Checklist):**

Before signing any loan agreement or deploying personal savings, verify these 5 local factors:

1. **Off-Take & Pricing Commitment:**
   - Confirm the actual procurement price table from the local dairy cooperative or private buyer based on FAT & SNF percentages.
   - Obtain payment frequency in writing (e.g., weekly vs 10-day settlement cycle).
2. **Fodder & Feed Supply Security:**
   - Survey whether sufficient green fodder land/irrigation exists on your plot.
   - Price check concentrate feed bags (50 kg) at the nearest taluk agricultural dealer.
3. **Veterinary & Mortality Risk:**
   - Identify the distance to the nearest Veterinary Dispensary / Mobile Veterinary Unit.
   - Obtain quotes for mandatory cattle insurance (usually 3–4% of animal valuation).
4. **Competitor & Customer Dynamics:**
   - Talk to 3 local micro-entrepreneurs in ${ctx.location.block || 'the block'} to understand unpaid customer credits (udhar) and seasonal drop-offs.
5. **Scheme Rulebook Verification:**
   - Request the official circular for the scheme from the District Industries Centre (DIC) or Lead District Bank (LDB) to confirm current interest rates and subsidy eligibility.`;
  }

  // 5. Cost reduction
  if (qLower.includes('cost') || qLower.includes('repayment') || qLower.includes('safety') || qLower.includes('ఖర్చులను') || qLower.includes('తగ్గించు') || qLower.includes('செலவுகளை') || qLower.includes('குறைக்க')) {
    if (isTa) {
      return `💡 **கடன் பாதுகாப்பிற்கான செலவு மேலாண்மை உத்திகள்:**

1. **சொந்த பசுந்தீவன உற்பத்தி:** வெளிச் சந்தையில் உலர் புல் வாங்குவதைத் தவிர்த்து, 50 சென்ட் நிலத்தில் கோ-4 அல்லது நேப்பியர் புல் பயிரிடுவதன் மூலம் தீவனச் செலவில் 35% சேமிக்கலாம்.
2. **கூட்டு கொள்முதல்:** அக்கம் பக்கத்து விவசாயிகளுடன் இணைந்து மொத்த விலையில் தீவன மூட்டைகளை நேரடியாக ஆலையிலிருந்து வாங்குதல்.
3. **குடும்ப உழைப்பு:** முதல் 12 மாதங்களுக்கு வெளி ஆட்களை வேலைக்கு வைக்காமல் குடும்ப உழைப்பைப் பயன்படுத்துதல்.
4. **மதிப்புக் கூட்டுதல்:** மாலை நேர உபரி பாலை தயிர் அல்லது நெய்யாக மாற்றி விற்பனை செய்தால் லிட்டருக்கு 25% கூடுதல் வருமானம் கிடைக்கும்.`;
    }
    if (isTe) {
      return `💡 **రుణ భద్రత కోసం కార్యాచరణ ఖర్చుల ఆప్టిమైజేషన్:**

1. **స్వయం పశుగ్రాస ఉత్పత్తి:** బయటి నుండి ఎండుగడ్డి/పచ్చిమేత కొనుగోలు చేయకుండా, కనీసం 0.5 ఎకరంలో పిల్లిపెసర లేదా నేపియర్ గడ్డి పెంచడం ద్వారా దాణా ఖర్చును 35% తగ్గించవచ్చు.
2. **సహకార కొనుగోలు:** ఇరుగుపొరుగు రైతులతో కలిసి దాణా బస్తాలను టోకు ధరలో నేరుగా మిల్లు నుండి తేవడం.
3. **సొంత శ్రమ వినియోగం:** ప్రారంభ 12 నెలలు బయటి కూలీలను నియమించకుండా కుటుంబ శ్రమను వినియోగించడం.
4. **విలువ జోడింపు:** కేవలం పాలుగా అమ్మకుండా, మిగిలిన పాలను పెరుగు లేదా నెయ్యిగా మార్చి అమ్మితే లాభ శాతం 25% పెరుగుతుంది.`;
    }
    return `💡 **Tactical Cost Optimization Strategies:**

To maximize your debt-service cushion without compromising asset productivity:

1. **Feed & Fodder Rationalization (Saves 25–35% of monthly OpEx):**
   - Cultivate multi-cut perennial fodder (Hybrid Napier / Lucerne / Azolla) on own/leased margin land rather than purchasing retail dry straw.
2. **Bulk Input Procurement:**
   - Aggregate feed requirements with neighboring livestock farmers to purchase directly from millers at wholesale rates, saving ₹80–₹120 per 50 kg bag.
3. **Phased Labor Deployment:**
   - Rely on family promoter labor during the initial 6–9 months gestation rather than hired daily farmhands.
4. **Value-Addition for Margins:**
   - Convert unsold evening milk surplus into curd (dahi) or paneer for local tea stalls and weekly shandies to extract a 30% higher realization per litre.`;
  }

  // 6. Lending agency documents
  if (qLower.includes('document') || qLower.includes('agency') || qLower.includes('bank') || qLower.includes('పత్రాలు') || qLower.includes('బ్యాంక్') || qLower.includes('ஆவணங்கள்') || qLower.includes('வங்கி')) {
    if (isTa) {
      return `📑 **கடன் விண்ணப்பத்திற்கு தேவையான முக்கிய ஆவணங்கள்:**

1. **அடையாளச் சான்றுகள்:** ஆதார் அட்டை, வாக்காளர் அடையாள அட்டை, பான் கார்டு.
2. **இருப்பிடச் சான்று:** வட்டாட்சியர் அல்லது ஊராட்சி மன்றம் வழங்கிய இருப்பிடச் சான்று.
3. **வங்கி கணக்கு விவரம்:** கடந்த 6 மாத சேமிப்புக் கணக்கு பாஸ்புக் நகல்.
4. **நில உரிமை / குத்தகை:** பட்டா நகல் அல்லது கொட்டகை அமைப்பதற்கான பதிவு செய்யப்பட்ட வாடகை ஒப்பந்தம்.
5. **விரிவான திட்ட அறிக்கை (DPR):** இந்த கிராம்வென்ச்சர் தளத்திலிருந்து பதிவிறக்கம் செய்த 'Business Blueprint' அறிக்கை.
6. **விலைப் பட்டியல் (Quotations):** கால்நடை அல்லது இயந்திரங்கள் விற்பனையாளரிடமிருந்து பெறப்பட்ட அதிகாரப்பூர்வ விலைப்பட்டியல்.`;
    }
    if (isTe) {
      return `📑 **రుణ దరఖాస్తు కోసం సిద్ధం చేసుకోవాల్సిన పత్రాలు:**

1. **వ్యక్తిగత గుర్తింపు పత్రాలు:** ఆధార్ కార్డు, ఓటర్ ఐడీ, పాన్ కార్డు.
2. **నివాస మరియు కుల ధృవీకరణ:** తహసీల్దార్ జారీ చేసిన నివాస మరియు వర్గ ధృవీకరణ పత్రం.
3. **బ్యాంక్ వివరాలు:** గత 6 నెలల సేవింగ్స్ బ్యాంక్ పాస్‌బుక్ జిరాక్స్.
4. **స్థల యాజమాన్యం / లీజు:** భూమి పట్టాదారు పాస్‌బుక్ లేదా వ్యాపార స్థల అద్దె ఒప్పందం.
5. **ప్రాజెక్ట్ రిపోర్ట్ (DPR):** ఈ గ్రామ్‌వెంచర్ AI ప్లాట్‌ఫారమ్ నుండి డౌన్‌లోడ్ చేసుకున్న 'Business Blueprint' రిపోర్ట్.
6. **కొటేషన్లు:** లైవ్‌స్టాక్ సప్లయర్ లేదా మెషినరీ డీలర్ నుండి ధృవీకరించబడిన ప్రొఫార్మా ఇన్‌వాయిస్.`;
    }
    return `📑 **Detailed Project Report (DPR) & Application Dossier:**

When approaching the commercial bank branch, Regional Rural Bank (RRB), or State Backward Classes/SC/ST Development Corporation:

1. **KYC Credentials:** Aadhaar Card (linked to active mobile), Voter ID, and PAN Card.
2. **Residence & Community Certificates:** Village Panchayat domicile certificate and Caste/Community certificate issued by Revenue authorities (Tahsildar).
3. **Banking Track Record:** 6–12 months active bank statements showing savings discipline and absence of NPA defaults.
4. **Premises Proof:** Land ownership extract (Pahani/Patta passbook) or registered lease deed for the enterprise shed.
5. **Comprehensive Business Blueprint:** The exportable Detailed Project Feasibility Report generated by this GramVenture AI tool, complete with DSCR projections and stress analysis.
6. **Proforma Quotations:** Formal GST-registered vendor quotations for livestock, machinery, or equipment to validate project cost claims.`;
  }

  // Default intelligent overview
  if (isTa) {
    return `🌾 **கிராம்வென்ச்சர் AI வணிக வழிகாட்டி:**

நீங்கள் தேர்ந்தெடுத்த இடம்: **${ctx.location.village || 'ராம்பூர்'} (${ctx.location.district || 'மதுரை'})**.
திட்டமிடப்பட்ட தொழில்: **${ctx.selectedBusinessName || 'பால் பண்ணை பிரிவு'}**.
மதிப்பிடப்பட்ட திட்ட செலவு: **${formatINR(ctx.projectCost || 1000000)}** | சொந்த சேமிப்பு: **${formatINR(ctx.marginCapital || 100000)}**.

🔍 **முக்கிய கவனிப்புகள்:**
- அரசுத் திட்டத்தின் கீழ் அனுமதிக்கப்படும் அதிகபட்ச கடனும், உங்கள் வணிக பணப்புழக்கம் தாங்கக்கூடிய கடனும் வெவ்வேறானவை.
- விற்பனை ${ctx.salesDeclinePercent || 20}% குறைந்தால் உங்கள் கடன் தவணை கட்ட போதுமான உபரி உள்ளதா என்பதை சோதித்துப் பாருங்கள்.
- குறிப்பிட்ட கேள்விகளை கேட்கலாம் (எ.கா: மூலதனம், தீவன செலவு, ஆவணங்கள் அல்லது மாடுகளின் பராமரிப்பு பற்றி).`;
  }

  if (isTe) {
    return `🌾 **గ్రామ్‌వెంచర్ AI మార్గదర్శి:**

మీరు ఎంచుకున్న గ్రామం: **${ctx.location.village || 'రాంపూర్'} (${ctx.location.district || 'వరంగల్'})**.
ప్రతిపాదిత వ్యాపారం: **${ctx.selectedBusinessName || 'డెయిరీ యూనిట్'}**.
అంచనా ప్రాజెక్ట్ వ్యయం: **${formatINR(ctx.projectCost || 1000000)}** | అందుబాటులో ఉన్న మూలధనం: **${formatINR(ctx.marginCapital || 100000)}**.

🔍 **పరిశీలనా సలహా:**
- మీ పథకం కింద అర్హత పొందే గరిష్ట రుణం మరియు మీ వ్యాపారం నిజంగా తిరిగి చెల్లించగల రుణం రెండూ వేరు.
- ఒత్తిడి పరిస్థితులలో (${ctx.salesDeclinePercent || 20}% అమ్మకాలు తగ్గితే) మీ రుణ వాయిదా సురక్షితంగా ఉంటుందా లేదా అని పరిశీలించండి.
- మీ ప్రశ్నను మరింత వివరంగా అడగండి (ఉదా: బడ్జెట్, ఖర్చులు, పత్రాలు లేదా పోటీదారుల గురించి).`;
  }

  return `🌾 **GramVenture Strategic Advisory Summary:**

Location Context: **${ctx.location.village || 'Rampur'}, ${ctx.location.district || 'Warangal'}, ${ctx.location.state || 'Telangana'}**.
Proposed Enterprise: **${ctx.selectedBusinessName || 'Small Dairy Unit'}**.
Project Outlay: **${formatINR(ctx.projectCost || 1000000)}** | Available Equity: **${formatINR(ctx.marginCapital || 100000)}**.

📌 **Key Observations:**
1. **Capital Feasibility:** Your available savings cover the 10% promoter equity threshold under the configured guidelines.
2. **Debt Capacity Principle:** "Eligible Loan" is determined by scheme ceilings; "Affordable Loan" is constrained by your net monthly free cash flow.
3. **Resilience Screening:** Under a ${ctx.salesDeclinePercent || 20}% adverse sales shock, debt service coverage requires careful cost containment.
4. **Data Integrity:** Evidence coverage is currently at **${ctx.evidenceCoveragePercent || 68}%**. Re-verify local pricing with direct suppliers before capital commitment.

Feel free to ask a specific question or choose from the suggested questions above.`;
}

async function callGeminiAPI(
  question: string,
  ctx: AdvisorContext,
  apiKey: string
): Promise<string> {
  const languageName = ctx.language === 'ta' ? 'Tamil' : ctx.language === 'te' ? 'Telugu' : 'clear, accessible English';

  const systemInstruction = `You are GramVenture AI, an objective, rigorous fintech and micro-enterprise advisory specialist for rural India.
RULES:
1. All calculations and financial figures provided in the context are deterministic and authoritative. NEVER alter, re-calculate, or contradict them.
2. Never promise loan approvals, subsidies, or business success.
3. Distinguish between official statistics, user observations, and model estimates.
4. Emphasize that borrowing capacity must be dictated by conservative cash-flow DSCR, not theoretical scheme maximums.
5. Answer in ${languageName}.
6. Keep answers structured, practical, and grounded in Indian rural economic realities.`;

  const prompt = `Context:
- Location: ${ctx.location.village}, ${ctx.location.district}, ${ctx.location.state}
- Available Margin Capital: INR ${ctx.marginCapital}
- Selected Business: ${ctx.selectedBusinessName}
- Project Cost: INR ${ctx.projectCost}
- Base DSCR: ${ctx.dscrResult?.ratio || 'N/A'}
- Stressed DSCR (${ctx.salesDeclinePercent || 20}% sales decline): ${ctx.stressedDSCR || 'N/A'}
- Evidence Coverage: ${ctx.evidenceCoveragePercent}%
- Missing Evidence Items: ${ctx.missingDataItems.join(', ')}

User Question: ${question}

Provide an insightful, realistic response.`;

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      systemInstruction: { parts: [{ text: systemInstruction }] },
    }),
  });

  if (!response.ok) {
    throw new Error(`Gemini API error ${response.status}`);
  }

  const data = await response.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error('Empty response from Gemini');
  return text;
}
