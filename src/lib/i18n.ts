// Internationalization (i18n) system for GramVenture AI
// Supports: English ('en'), Telugu ('te'), and Tamil ('ta')

import type { Language } from '@/types';

export const SUPPORTED_LANGUAGES = [
  { code: 'en' as Language, label: 'English' },
  { code: 'te' as Language, label: 'తెలుగు (Telugu)' },
  { code: 'ta' as Language, label: 'தமிழ் (Tamil)' },
] as const;

export const translations = {
  en: {
    // Brand
    'app.name': 'GramVenture AI',
    'app.tagline': 'Your Village. Your Opportunity. Your Business Plan.',
    'app.subtitle': 'Hyper-Local Business Advisory & Financial Structuring for Rural Tamil Nadu',

    // Navigation
    'nav.home': 'Home',
    'nav.demand': 'Demand & Location',
    'nav.village': 'Market Intelligence',
    'nav.compare': 'Business Comparison',
    'nav.finance': 'Financial Structuring',
    'nav.simulator': 'Survival Simulator',
    'nav.report': 'Business Blueprint',
    'nav.advisor': 'AI Advisor',

    // Language Selector labels
    'lang.en': 'English',
    'lang.te': 'తెలుగు (Telugu)',
    'lang.ta': 'தமிழ் (Tamil)',

    // Header & Actions
    'header.demo': 'Explore Demo',
    'header.demoLoaded': 'Demo Mode: Tamil Nadu Pilot Loaded',
    'header.reset': 'Reset',
    'header.activeLocation': 'Active Location',
    'header.blueprint': 'Blueprint',

    // Demand-First Onboarding Screen
    'demand.question': 'What products or services do people in your area need, or what products or services do you want to sell?',
    'demand.questionHelper': 'Describe what locals travel to nearby towns to buy, unserved village demands, or your business concept in simple words.',
    'demand.placeholder': 'e.g. Fresh milk and curd collection point, daily vegetables delivery, affordable readymade garments, or mobile phone battery and screen repair...',
    'demand.essentialTitle': 'Essential Information',
    'demand.essentialDesc': 'We start with your local demand and location before recommending business options.',
    'demand.district': 'Tamil Nadu District',
    'demand.districtPlaceholder': 'Select from all 38 Tamil Nadu districts...',
    'demand.locality': 'Village, Town, Locality, or PIN Code',
    'demand.localityPlaceholder': 'e.g. Vadipatti, Alanganallur, or 625218',
    'demand.localityHelper': 'Free text allowed. No fabricated villages or fake PIN codes are invented.',
    'demand.savings': 'Available Personal Investment / Margin Capital (₹)',
    'demand.savingsPlaceholder': 'e.g. 100000',
    'demand.savingsHelper': 'Under 10% margin rules, ₹1,00,000 supports up to ₹10,00,000 project sizing.',
    'demand.desiredActivity': 'Desired Business Activity (Optional)',
    'demand.desiredActivityPlaceholder': 'Select or let our rules infer from your demand description...',
    'demand.inferred': 'Candidate business categories inferred from your demand:',

    // Progressive Optional Details
    'demand.optionalTitle': 'Progressive Optional Details (Click to Expand)',
    'demand.optionalDesc': 'Add extra context to refine unit economics and working capital buffers.',
    'demand.resaleProducts': 'Products to Purchase for Resale / Operations',
    'demand.resaleProductsPlaceholder': 'e.g. Cattle feed bags, packaging pouches, spare parts...',
    'demand.customerGroups': 'Intended Customer Groups',
    'demand.customerGroupsPlaceholder': 'e.g. Local tea stalls, daily wage households, school students...',
    'demand.sellingPrice': 'Desired Selling Price or Purchasing Budget',
    'demand.sellingPricePlaceholder': 'e.g. ₹45 per litre milk, ₹250 tailoring charge...',
    'demand.householdExpenses': 'Monthly Household Living Expenses (₹)',
    'demand.existingLoans': 'Existing Monthly Loan Obligations (₹)',
    'demand.essentialReserve': 'Emergency Family Reserve (Do Not Spend) (₹)',
    'demand.workspace': 'Available Land / Workspace / Equipment',
    'demand.workspacePlaceholder': 'e.g. 100 sq ft veranda, 0.5 acre ancestral grazing land...',
    'demand.experience': 'Business / Sector Experience (Years)',
    'demand.additionalNotes': 'Additional Notes / Constraints',
    'demand.additionalNotesPlaceholder': 'e.g. Power cuts during afternoon, water tanker needed in summer...',

    // Form Actions & Buttons
    'action.analyzeArea': 'Analyze My Area',
    'action.loadDemo': 'Load Demo (Tamil Nadu Pilot)',
    'action.editInputs': 'Edit Inputs',
    'action.continue': 'Continue to Next Step',
    'action.back': 'Back',
    'action.save': 'Save',
    'action.cancel': 'Cancel',
    'action.reset': 'Reset Inputs',
    'action.searchPlaces': 'Search Nearby Competitors',

    // Validation Messages
    'validation.districtRequired': 'Please select a Tamil Nadu district.',
    'validation.localityRequired': 'Village, town, locality or PIN code is required.',
    'validation.demandRequired': 'Please describe what products or services people need.',
    'validation.savingsPositive': 'Available personal investment must be a positive amount (> ₹0).',
    'validation.noNegativeMoney': 'Money amounts cannot be negative.',

    // Location Accuracy & Provenance
    'location.title': 'Tamil Nadu Location Scope',
    'location.coordinates': 'Coordinates',
    'location.accuracy': 'Location Accuracy',
    'location.source': 'Source',
    'location.accuracyExact': 'Exact Verified Geocoder Result',
    'location.accuracyCentroid': 'District Headquarters Centroid (Approximate)',
    'location.accuracyUser': 'User-Provided Coordinates',
    'location.accuracyManual': 'Manual Address (Coordinates Pending)',
    'location.note': 'Competitor discovery searches within a 5 km straight-line radius from these verified coordinates.',
    'location.noCoordinatesWarning': 'Exact coordinates not yet resolved. Competitor radius searches require verified coordinates.',

    // Competitor Discovery (Phase 2)
    'competitor.title': 'Competitor Discovery within 5 km',
    'competitor.subtitle': 'Provider-based local evidence and ground field survey',
    'competitor.providerLabel': 'Provider Result',
    'competitor.userObsLabel': 'User-Provided Observation',
    'competitor.syntheticDemoLabel': 'Synthetic Demo Data',
    'competitor.filterAll': 'All Categories',
    'competitor.viewList': 'List View',
    'competitor.viewMap': 'Geographic Map View',
    'competitor.emptyStateTitle': 'No Mapped Competitors Found Within 5 km',
    'competitor.emptyStateDesc': 'A lack of mapped competitors in public databases does not prove lack of competition. In rural Tamil Nadu, unmapped informal stalls frequently exist. Please validate locally with the field observation form.',
    'competitor.sparseWarning': 'Data may be incomplete. Rural commercial points are often partially mapped in open databases.',
    'competitor.distance': 'Distance',
    'competitor.address': 'Address',
    'competitor.phone': 'Phone / Contact',
    'competitor.rating': 'Rating',
    'competitor.retrievalTime': 'Retrieved At',
    'competitor.attribution': 'Attribution',
    'competitor.logObservationTitle': 'Log Field Ground Observation',
    'competitor.logObservationDesc': 'Record real shops you saw in person. Kept strictly distinct from provider records.',

    // Evidence & Methodology
    'evidence.official': 'Official Data',
    'evidence.provider': 'Provider Result',
    'evidence.userObs': 'User-Provided Observation',
    'evidence.userAssumption': 'User-Provided Assumption',
    'evidence.estimate': 'Illustrative Model Estimate',
    'evidence.synthetic': 'Synthetic Demo Data',
    'evidence.missing': 'Missing / Unknown',
    'evidence.coverageTitle': 'Evidence Coverage Score',
    'evidence.coverageFormula': 'Calculated via documented formula: (Population 20% + Competitors 25% + Pricing 20% + Cost Schedules 20% + Freshness 15%). Labeled strictly as Evidence Coverage, NOT probability of business success.',

    // Business Comparison (Phase 3)
    'compare.title': 'Business Unit-Economics & Model Comparison',
    'compare.subtitle': 'Compare up to 3 candidate ventures under transparent low / base / high assumptions',
    'compare.setupCost': 'Total Setup & Equipment',
    'compare.workingCapital': 'Opening Working Capital',
    'compare.monthlyRevenue': 'Monthly Revenue',
    'compare.monthlyCosts': 'Monthly Operating Expenses',
    'compare.grossMargin': 'Gross Margin',
    'compare.netSurplus': 'Net Monthly Operating Surplus',
    'compare.breakEven': 'Break-Even Sales (Units)',
    'compare.rankTitle': 'Transparent Business Ranking',
    'compare.rankDesc': 'Provisional heuristic scoring based on 5 inspectable pillars (Affordability 30%, Evidence 25%, Competitive 20%, Risk 15%, Capital Fit 10%). Not AI text opinions.',

    // Financial Structuring (Phase 4)
    'finance.title': 'Financial Engine & Scheme Router',
    'finance.subtitle': 'Deterministic Reducing-Balance Amortization, Scheme Caps & Repayment Schedules',
    'finance.phaseBadge': 'Phase 4 of 5',
    'finance.phaseDesc': 'Concessional Financing & Debt Structuring',
    'finance.routedSchemeLabel': 'Routed Scheme',
    'finance.marginSizing': '10% Margin Sizing Rule',
    'finance.availableMargin': 'Available Margin Capital',
    'finance.marginDesc': "Promoter's cash equity savings",
    'finance.tenPercentRule': '10% Equity Rule',
    'finance.theoreticalCost': 'Theoretical Project Cost',
    'finance.theoreticalCostDesc': 'Project Cost = Margin ÷ 0.10',
    'finance.theoreticalLoan': 'Theoretical Loan (90%)',
    'finance.feasibleCost': 'Feasible Project Cost',
    'finance.maxFundingLabel': 'Max Scheme Loan (90%)',
    'finance.sanctionedLoan': 'Maximum Eligible Scheme Loan',
    'finance.loanCapDesc': 'Subject to statutory scheme cap: {cap}',
    'finance.ownContribution': 'Required Own Contribution',
    'finance.ownEquityLabel': 'Required Own Equity',
    'finance.ofProjectCost': 'of total project outlay',
    'finance.availableMarginLeft': 'Available Margin Left After Contribution',
    'finance.eligibilityVsAffordability': 'Core FinTech Distinction: Eligibility ≠ Cash-Flow Affordability',
    'finance.eligibilitySubtitle': 'A concessional scheme allows theoretical borrowing up to statutory caps, but prudent micro-lending requires borrowing only what monthly operating cash surplus safely supports.',
    'finance.statutoryMax': 'Statutory Scheme Sanction Maximum',
    'finance.statutoryMaxDesc': 'Based solely on theoretical 90% financing formula and scheme project caps. Does NOT verify village sales velocity or family livelihood expenses.',
    'finance.safeBorrowingCapacity': 'Cash-Flow Grounded Safe Borrowing Capacity',
    'finance.safeBorrowingCapacityDesc': 'Derived from Net Operating Cash Flow minus household living costs, targeting institutional safety (DSCR ≥ 1.25x).',
    'finance.warning.exceedsTitle': 'Financing Limit Exceeds Cash-Flow Capacity',
    'finance.warning.exceeds': 'Your scheme-based financing limit ({schemeLimit}) exceeds the amount supported by the current cash-flow assumptions ({affordableAmount}). Consider reducing the project size or borrowing less to reduce repayment risk.',
    'finance.quarterlySchedule': 'Expected Quarterly Repayment Schedule',
    'finance.monthlyEmi': 'Monthly EMI Equivalent',
    'finance.moratorium': 'Moratorium Grace Period',
    'finance.interestTreatment': 'Interest capitalized during moratorium as configured',
    'finance.dscrTitle': 'Debt Service Coverage Ratio (DSCR)',
    'finance.dscrFormula': 'DSCR = Cash Available for Debt Service (CADS) ÷ Scheduled Debt Service',
    'finance.dscrAdequate': 'Prudent Institutional Safety Buffer (≥ 1.25x)',
    'finance.dscrThin': 'Thin Cash Buffer (1.00x – 1.24x); Vulnerable to Shocks',
    'finance.dscrDeficit': 'Cash Flow Deficit (< 1.00x); Business Cannot Afford This Debt',
    'finance.schemeVerificationNotice': 'Scheme parameters reflect challenge brief configuration; not independently verified against current implementing agency circulars.',
    'finance.reducingBalanceTitle': 'Reducing-Balance Amortization Schedule',
    'finance.reducingBalanceSubtitle': 'Tenure: {tenure} Months ({moratorium} Months Moratorium Period)',
    'finance.quarterlyTab': 'Quarterly Schedule (Primary)',
    'finance.monthlyTab': 'Monthly EMI Equivalent',
    'finance.periodicInstalment': 'Periodic Instalment',
    'finance.totalInterest': 'Total Illustrative Interest',
    'finance.totalRepayment': 'Total Repayment Outlay',
    'finance.colPeriod': 'Period',
    'finance.colOpeningBalance': 'Opening Balance',
    'finance.colInstalment': 'Instalment',
    'finance.colPrincipal': 'Principal',
    'finance.colInterest': 'Interest',
    'finance.colClosingBalance': 'Closing Balance',
    'finance.colStatus': 'Status',
    'finance.statusMoratorium': 'Moratorium',
    'finance.statusActive': 'Active Repayment',
    'finance.showAllInstalments': 'View All {count} Instalments',
    'finance.collapseInstalments': 'Collapse Table',
    'finance.schemeAssumptionsTitle': 'Scheme Parameters Note',
    'finance.schemeAssumptionsBody': 'Calculations use concessional parameters from the program guidelines. Moratorium interest is capitalized during the grace period. Official terms from the lending bank or development agency govern final sanctions.',
    'finance.btnBack': '← Back to Business Models',
    'finance.btnContinue': 'Run Business Survival Simulator →',

    // Survival Simulator (Phase 5)
    'sim.title': 'Business Stress Test & Survival Simulator',
    'sim.subtitle': 'Test debt service resilience against adverse operational shocks before borrowing',
    'sim.salesDecline': 'Sales Decline (-20% Default)',
    'sim.costInflation': 'Input Cost Inflation (+15% Default)',
    'sim.paymentDelay': 'Customer Credit / Late Payment Delay',
    'sim.delayDuration': 'Delay Duration (Days)',
    'sim.seasonalSlowdown': 'Seasonal Slowdown Month',
    'sim.unexpectedExpense': 'One-Time Emergency Cost (₹)',
    'sim.baseVsStressed': 'Baseline vs. Stressed Comparison',
    'sim.cads': 'Cash Available for Debt Service',
    'sim.liquidityShortfall': 'Estimated Liquidity Shortfall',
    'sim.recommendation': 'Recommended Borrowing Range Under Assumptions',

    // Experimental ML Panel
    'ml.title': 'Experimental Synthetic-Data ML Output',
    'ml.disclaimer': 'Experimental synthetic-data model output — not a real-world success probability. Trained on 600 synthetic benchmark records only.',
    'ml.modelType': 'Model Architecture',
    'ml.accuracy': 'Benchmark Accuracy',
    'ml.f1': 'Benchmark F1 Score',
    'ml.status': 'Synthetic Classification',
    'ml.features': 'Audited Predictors Used',

    // Business Blueprint Report
    'report.title': 'Comprehensive Business Blueprint (DPR)',
    'report.subtitle': 'Bankable Project Feasibility Dossier for Rural Entrepreneurs in Tamil Nadu',
    'report.print': 'Print / Save as PDF',
    'report.checklistTitle': '90-Day Pre-Investment Execution Checklist',
    'report.disclaimer': 'This blueprint is produced purely as an algorithmic decision-support tool. It does NOT guarantee loan sanction or business success. Verify all scheme terms with district authorities.',

    // Common
    'common.yes': 'Yes',
    'common.no': 'No',
    'common.loading': 'Loading data...',
    'common.error': 'An error occurred',
    'common.retry': 'Retry',
    'common.perMonth': '/month',
    'common.perQuarter': '/quarter',
    'common.rupees': '₹',
  },

  te: {
    // Brand
    'app.name': 'గ్రామ్‌వెంచర్ AI',
    'app.tagline': 'మీ గ్రామం. మీ అవకాశం. మీ వ్యాపార ప్రణాళిక.',
    'app.subtitle': 'గ్రామీణ తమిళనాడు కోసం హైపర్-లోకల్ వ్యాపార సలహా & ఆర్థిక నిర్మాణం',

    // Navigation
    'nav.home': 'హోమ్',
    'nav.demand': 'డిమాండ్ & స్థానం',
    'nav.village': 'మార్కెట్ విశ్లేషణ',
    'nav.compare': 'వ్యాపార పోలిక',
    'nav.finance': 'ఆర్థిక నిర్మాణం',
    'nav.simulator': 'సర్వైవల్ సిమ్యులేటర్',
    'nav.report': 'వ్యాపార బ్లూప్రింట్',
    'nav.advisor': 'AI సలహాదారు',

    // Language Selector labels
    'lang.en': 'English',
    'lang.te': 'తెలుగు (Telugu)',
    'lang.ta': 'தமிழ் (Tamil)',

    // Header & Actions
    'header.demo': 'డెమో చూడండి',
    'header.demoLoaded': 'డెమో మోడ్: తమిళనాడు పైలట్ లోడ్ అయింది',
    'header.reset': 'రీసెట్',
    'header.activeLocation': 'ఎంచుకున్న స్థానం',
    'header.blueprint': 'బ్లూప్రింట్',

    // Demand-First Onboarding Screen
    'demand.question': 'మీ ప్రాంతంలో ప్రజలకు ఏ ఉత్పత్తులు లేదా సేవలు అవసరం, లేదా మీరు ఏ ఉత్పత్తులు లేదా సేవలను విక్రయించాలనుకుంటున్నారు?',
    'demand.questionHelper': 'గ్రామస్తులు సమీప పట్టణాలకు వెళ్లి కొనుగోలు చేసే వస్తువులు లేదా మీ వ్యాపార ఆలోచనను సులభమైన మాటల్లో వివరించండి.',
    'demand.placeholder': 'ఉదాహరణ: తాజా పాలు మరియు పెరుగు సేకరణ కేంద్రం, రోజువారీ కూరగాయల సరఫరా, రెడీమేడ్ దుస్తులు, లేదా మొబైల్ ఫోన్ రిపేర్...',
    'demand.essentialTitle': 'ప్రాథమిక సమాచారం',
    'demand.essentialDesc': 'వ్యాపార సిఫార్సులు చేసే ముందు మీ స్థానిక డిమాండ్ మరియు ప్రాంతంతో ప్రారంభిస్తాము.',
    'demand.district': 'తమిళనాడు జిల్లా',
    'demand.districtPlaceholder': 'మొత్తం 38 తమిళనాడు జిల్లాల నుండి ఎంచుకోండి...',
    'demand.locality': 'గ్రామం, పట్టణం లేదా పిన్ కోడ్',
    'demand.localityPlaceholder': 'ఉదాహరణ: వాడిపట్టి, అలంగనల్లూర్, లేదా 625218',
    'demand.localityHelper': 'యూజర్ నమోదు చేసిన సమాచారం మాత్రమే ఉపయోగించబడుతుంది. కల్పిత గ్రామాలు సృష్టించబడవు.',
    'demand.savings': 'అందుబాటులో ఉన్న పెట్టుబడి / మార్జిన్ మూలధనం (₹)',
    'demand.savingsPlaceholder': 'ఉదా: 100000',
    'demand.savingsHelper': '10% మార్జిన్ నిబంధన ప్రకారం, ₹1,00,000 తో ₹10,00,000 ప్రాజెక్ట్ పరిమాణాన్ని లెక్కించవచ్చు.',
    'demand.desiredActivity': 'ఆశించిన వ్యాపార రకం (ఐచ్ఛికం)',
    'demand.desiredActivityPlaceholder': 'ఎంచుకోండి లేదా మా సూత్రాలు డిమాండ్ ఆధారంగా వర్గాన్ని నిర్ణయిస్తాయి...',
    'demand.inferred': 'మీ డిమాండ్ వివరణ నుండి ప్రతిపాదించబడిన వ్యాపార వర్గాలు:',

    // Progressive Optional Details
    'demand.optionalTitle': 'అదనపు వివరాలు (క్లిక్ చేసి విస్తరించండి)',
    'demand.optionalDesc': 'ఖచ్చితమైన యూనిట్ ఎకనామిక్స్ మరియు వర్కింగ్ క్యాపిటల్ కోసం అదనపు వివరాలు ఇవ్వండి.',
    'demand.resaleProducts': 'పునఃవిక్రయానికి కొనుగోలు చేయాల్సిన వస్తువులు',
    'demand.resaleProductsPlaceholder': 'ఉదా: పశుగ్రాసం బస్తాలు, ప్యాకేజింగ్ కవర్లు, విడిభాగాలు...',
    'demand.customerGroups': 'ఉద్దేశించిన కస్టమర్ సమూహాలు',
    'demand.customerGroupsPlaceholder': 'ఉదా: స్థానిక టీ దుకాణాలు, దినసరి కూలీలు, విద్యార్థులు...',
    'demand.sellingPrice': 'ఆశించిన అమ్మకపు ధర లేదా కొనుగోలు బడ్జెట్',
    'demand.sellingPricePlaceholder': 'ఉదా: లీటరు పాలు ₹45, దర్జీ కూలీ ₹250...',
    'demand.householdExpenses': 'నెలవారీ గృహ జీవన ఖర్చులు (₹)',
    'demand.existingLoans': 'ఇప్పటికే ఉన్న నెలవారీ రుణ వాయిదాలు (₹)',
    'demand.essentialReserve': 'అత్యవసర కుటుంబ నిల్వ (ఖర్చు చేయకూడదు) (₹)',
    'demand.workspace': 'అందుబాటులో ఉన్న స్థలం / భూమి / యంత్రాలు',
    'demand.workspacePlaceholder': 'ఉదా: 100 చదరపు అడుగుల దుకాణం స్థలం, సొంత పచ్చిక భూమి...',
    'demand.experience': 'వ్యాపార లేదా రంగ అనుభవం (సంవత్సరాలు)',
    'demand.additionalNotes': 'అదనపు గమనికలు / పరిమితులు',
    'demand.additionalNotesPlaceholder': 'ఉదా: మధ్యాహ్నం విద్యుత్ కోతలు ఉంటాయి, వేసవిలో నీటి ట్యాంకర్ అవసరం...',

    // Form Actions & Buttons
    'action.analyzeArea': 'నా ప్రాంతాన్ని విశ్లేషించండి',
    'action.loadDemo': 'డెమో లోడ్ చేయండి (తమిళనాడు పైలట్)',
    'action.editInputs': 'వివరాలు సవరించండి',
    'action.continue': 'తదుపరి దశకు కొనసాగించండి',
    'action.back': 'వెనుకకు',
    'action.save': 'సేవ్ చేయండి',
    'action.cancel': 'రద్దు చేయండి',
    'action.reset': 'మొత్తం రీసెట్ చేయండి',
    'action.searchPlaces': 'సమీప పోటీదారులను శోధించండి',

    // Validation Messages
    'validation.districtRequired': 'దయచేసి తమిళనాడు జిల్లాను ఎంచుకోండి.',
    'validation.localityRequired': 'గ్రామం, పట్టణం లేదా పిన్ కోడ్ అవసరం.',
    'validation.demandRequired': 'ప్రజలకు అవసరమైన ఉత్పత్తులు లేదా సేవలను వివరించండి.',
    'validation.savingsPositive': 'పెట్టుబడి ధనాత్మక విలువగా ఉండాలి (> ₹0).',
    'validation.noNegativeMoney': 'డబ్బు విలువలు రుణాత్మకంగా ఉండకూడదు.',

    // Location Accuracy & Provenance
    'location.title': 'తమిళనాడు స్థాన పరిధి',
    'location.coordinates': 'భౌగోళిక కోఆర్డినేట్లు',
    'location.accuracy': 'స్థాన ఖచ్చితత్వం',
    'location.source': 'మూలం',
    'location.accuracyExact': 'ధృవీకరించబడిన ఖచ్చితమైన జియోకోడర్ ఫలితం',
    'location.accuracyCentroid': 'జిల్లా ప్రధాన కేంద్రం కేంద్రం (సుమారు)',
    'location.accuracyUser': 'వినియోగదారు అందించిన కోఆర్డినేట్లు',
    'location.accuracyManual': 'చిరునామా మాత్రమే (కోఆర్డినేట్లు లేవు)',
    'location.note': 'పోటీదారుల శోధన ఈ ధృవీకరించిన కోఆర్డినేట్ల నుండి 5 కి.మీ వ్యాసార్థంలో జరుగుతుంది.',
    'location.noCoordinatesWarning': 'ఖచ్చితమైన కోఆర్డినేట్లు లేవు. 5 కి.మీ పోటీదారుల శోధనకు కోఆర్డినేట్లు అవసరం.',

    // Competitor Discovery (Phase 2)
    'competitor.title': '5 కి.మీ పరిధిలో పోటీదారుల గుర్తింపు',
    'competitor.subtitle': 'ప్రొవైడర్ ఆధారిత స్థానిక సాక్ష్యం & క్షేత్ర పరిశీలన',
    'competitor.providerLabel': 'ప్రొవైడర్ ఫలితం',
    'competitor.userObsLabel': 'వినియోగదారు అందించిన పరిశీలన',
    'competitor.syntheticDemoLabel': 'సింథటిక్ డెమో డేటా',
    'competitor.filterAll': 'అన్ని వర్గాలు',
    'competitor.viewList': 'జాబితా వీక్షణ',
    'competitor.viewMap': 'మ్యాప్ వీక్షణ',
    'competitor.emptyStateTitle': '5 కి.మీ పరిధిలో నమోదైన పోటీదారులు కనుగొనబడలేదు',
    'competitor.emptyStateDesc': 'పబ్లిక్ డేటాబేస్‌లలో వ్యాపారాలు కనిపించకపోవడం పోటీ లేదని రుజువు చేయదు. గ్రామీణ ప్రాంతాల్లో నమోదుకాని దుకాణాలు ఉండవచ్చు. క్షేత్రస్థాయిలో సరిచూసుకోండి.',
    'competitor.sparseWarning': 'డేటా అసంపూర్తిగా ఉండవచ్చు. గ్రామీణ వాణిజ్య పాయింట్లు పాక్షికంగా మాత్రమే మ్యాప్ చేయబడి ఉంటాయి.',
    'competitor.distance': 'దూరం',
    'competitor.address': 'చిరునామా',
    'competitor.phone': 'ఫోన్ / సంప్రదింపు',
    'competitor.rating': 'రేటింగ్',
    'competitor.retrievalTime': 'తీసుకున్న సమయం',
    'competitor.attribution': 'డేటా మూలం',
    'competitor.logObservationTitle': 'క్షేత్రస్థాయి పరిశీలనను నమోదు చేయండి',
    'competitor.logObservationDesc': 'మీరు స్వయంగా చూసిన దుకాణాలను నమోదు చేయండి. ఇవి ప్రొవైడర్ రికార్డులతో కలవవు.',

    // Evidence & Methodology
    'evidence.official': 'అధికారిక డేటా',
    'evidence.provider': 'ప్రొవైడర్ ఫలితం',
    'evidence.userObs': 'వినియోగదారు పరిశీలన',
    'evidence.userAssumption': 'వినియోగదారు ఊహ',
    'evidence.estimate': 'మోడల్ అంచనా',
    'evidence.synthetic': 'సింథటిక్ డెమో డేటా',
    'evidence.missing': 'డేటా లేదు / తెలియదు',
    'evidence.coverageTitle': 'సాక్ష్య కవరేజ్ స్కోరు',
    'evidence.coverageFormula': 'సూత్రం: (జనాభా 20% + పోటీదారులు 25% + ధరలు 20% + ఖర్చులు 20% + తాజాదనం 15%). ఇది సాక్ష్య కవరేజ్ మాత్రమే, వ్యాపార విజయ సంభావ్యత కాదు.',

    // Business Comparison (Phase 3)
    'compare.title': 'వ్యాపార యూనిట్ ఎకనామిక్స్ & పోలిక',
    'compare.subtitle': '3 వ్యాపారాలను కనిష్ట / బేస్ / గరిష్ట ఊహలతో పారదర్శకంగా పోల్చండి',
    'compare.setupCost': 'ప్రారంభ యంత్రాలు & మౌలిక వ్యయం',
    'compare.workingCapital': 'ప్రారంభ వర్కింగ్ క్యాపిటల్',
    'compare.monthlyRevenue': 'నెలవారీ ఆదాయం',
    'compare.monthlyCosts': 'నెలవారీ నిర్వహణ ఖర్చులు',
    'compare.grossMargin': 'స్థూల లాభ శాతం',
    'compare.netSurplus': 'నికర నెలవారీ నిర్వహణ మిగులు',
    'compare.breakEven': 'బ్రేక్-ఈవెన్ అమ్మకాలు (యూనిట్లు)',
    'compare.rankTitle': 'పారదర్శక వ్యాపార ర్యాంకింగ్',
    'compare.rankDesc': '5 స్తంభాల ఆధారంగా లెక్కింపు (ఆర్థిక స్థోమత 30%, సాక్ష్యం 25%, పోటీ 20%, రిస్క్ 15%, మూలధన ఫిట్ 10%).',

    // Financial Structuring (Phase 4)
    'finance.title': 'ఆర్థిక ఇంజిన్ & పథక రూటింగ్',
    'finance.subtitle': 'డిక్రీజింగ్ బ్యాలెన్స్ అమోర్టైజేషన్, పథక పరిమితులు & వాయిదాల చార్ట్',
    'finance.phaseBadge': 'దశ 4 (మొత్తం 5)',
    'finance.phaseDesc': 'రాయితీ రుణాలు & ఆర్థిక నిర్మాణం',
    'finance.routedSchemeLabel': 'ఎంపికైన పథకం',
    'finance.marginSizing': '10% మార్జిన్ సూత్రం',
    'finance.availableMargin': 'అందుబాటులో ఉన్న మార్జిన్ మూలధనం',
    'finance.marginDesc': 'వ్యాపారవేత్త సొంత నగదు పొదుపు',
    'finance.tenPercentRule': '10% సొంత వాటా నియమం',
    'finance.theoreticalCost': 'సైద్ధాంతిక ప్రాజెక్ట్ వ్యయం',
    'finance.theoreticalCostDesc': 'ప్రాజెక్ట్ వ్యయం = మార్జిన్ ÷ 0.10',
    'finance.theoreticalLoan': 'సైద్ధాంతిక రుణం (90%)',
    'finance.feasibleCost': 'సాధ్యమయ్యే ప్రాజెక్ట్ వ్యయం',
    'finance.maxFundingLabel': 'గరిష్ట పథక రుణం (90%)',
    'finance.sanctionedLoan': 'గరిష్ట సూచనాత్మక పథక రుణం',
    'finance.loanCapDesc': 'పథక పరిమితికి లోబడి: {cap}',
    'finance.ownContribution': 'అవసరమైన సొంత సహకారం',
    'finance.ownEquityLabel': 'అవసరమైన సొంత సహకారం',
    'finance.ofProjectCost': 'మొత్తం ప్రాజెక్ట్ వ్యయంలో',
    'finance.availableMarginLeft': 'మిగిలిన మార్జిన్ మూలధనం',
    'finance.eligibilityVsAffordability': 'కీలక వ్యత్యాసం: రుణ అర్హత ≠ నగదు ప్రవాహ స్తోమత',
    'finance.eligibilitySubtitle': 'ప్రభుత్వ పథకం గరిష్ట రుణాన్ని అనుమతించినప్పటికీ, మీ నెలవారీ వ్యాపార లాభాలు మరియు కుటుంబ ఖర్చుల తర్వాత మిగిలే నగదుతో మాత్రమే రుణం తీసుకోవడం సురక్షితం.',
    'finance.statutoryMax': 'చట్టబద్ధ గరిష్ట పథక రుణం',
    'finance.statutoryMaxDesc': '90% సూత్రం మరియు పథక సీలింగ్ ఆధారంగా మాత్రమే. గ్రామీణ అమ్మకాల వేగం లేదా కుటుంబ ఖర్చులను ఇది లెక్కించదు.',
    'finance.safeBorrowingCapacity': 'నగదు ప్రవాహం ఆధారిత సురక్షిత రుణ పరిమితి',
    'finance.safeBorrowingCapacityDesc': 'నికర నిర్వహణ నగదు మైనస్ కుటుంబ జీవన వ్యయాల ఆధారంగా, సురక్షితమైన DSCR (≥ 1.25x) లక్ష్యంగా నిర్ణయించబడింది.',
    'finance.warning.exceedsTitle': 'రుణ పరిమితి నగదు ప్రవాహ సామర్థ్యాన్ని మించిపోయింది',
    'finance.warning.exceeds': 'మీ పథకం ఆధారిత రుణ పరిమితి ({schemeLimit}) ప్రస్తుత నగదు ప్రవాహ అంచనాలకు మించి ఉంది ({affordableAmount}). రుణ చెల్లింపు ప్రమాదాన్ని తగ్గించడానికి ప్రాజెక్ట్ పరిమాణాన్ని తగ్గించుకోవడం లేదా తక్కువ రుణం తీసుకోండి.',
    'finance.quarterlySchedule': 'త్రైమాసిక రుణ చెల్లింపు షెడ్యూల్',
    'finance.monthlyEmi': 'నెలవారీ సమాన EMI',
    'finance.moratorium': 'మొరటోరియం గ్రేస్ పిరియడ్',
    'finance.interestTreatment': 'మొరటోరియం సమయంలో వడ్డీ కేపిటలైజ్ చేయబడుతుంది',
    'finance.dscrTitle': 'డెట్ సర్వీస్ కవరేజ్ రేషియో (DSCR)',
    'finance.dscrFormula': 'DSCR = అప్పు తీర్చడానికి మిగిలిన నికర నగదు ÷ రుణ వాయిదా',
    'finance.dscrAdequate': 'సురక్షితమైన రక్షణ బఫర్ (≥ 1.25x)',
    'finance.dscrThin': 'స్వల్ప బఫర్ (1.00x – 1.24x); ఒత్తిడికి గురయ్యే ప్రమాదం',
    'finance.dscrDeficit': 'నగదు కొరత (< 1.00x); ఈ రుణాన్ని భరించడం అసాధ్యం',
    'finance.schemeVerificationNotice': 'పథక వివరాలు ఛాలెంజ్ బ్రీఫ్ ఆధారితమైనవి; సంబంధిత శాఖల ద్వారా అధికారికంగా ధృవీకరించబడలేదు.',
    'finance.reducingBalanceTitle': 'తగ్గుతున్న నిల్వ రుణ విమోచన షెడ్యూల్',
    'finance.reducingBalanceSubtitle': 'వ్యవధి: {tenure} నెలలు ({moratorium} నెలల మొరటోరియం వ్యవధి)',
    'finance.quarterlyTab': 'త్రైమాసిక షెడ్యూల్ (ప్రాథమిక)',
    'finance.monthlyTab': 'నెలవారీ సమాన EMI',
    'finance.periodicInstalment': 'వాయిదా మొత్తం',
    'finance.totalInterest': 'మొత్తం వడ్డీ చెల్లింపు',
    'finance.totalRepayment': 'మొత్తం తిరిగి చెల్లింపు',
    'finance.colPeriod': 'వ్యవధి',
    'finance.colOpeningBalance': 'ప్రారంభ నిల్వ',
    'finance.colInstalment': 'వాయిదా',
    'finance.colPrincipal': 'అసలు',
    'finance.colInterest': 'వడ్డీ',
    'finance.colClosingBalance': 'ముగింపు నిల్వ',
    'finance.colStatus': 'స్థితి',
    'finance.statusMoratorium': 'మొరటోరియం',
    'finance.statusActive': 'చెల్లింపు దశ',
    'finance.showAllInstalments': 'అన్ని {count} వాయిదాలను చూడండి',
    'finance.collapseInstalments': 'పట్టికను కుదించండి',
    'finance.schemeAssumptionsTitle': 'పథక నిబంధనల గమనిక',
    'finance.schemeAssumptionsBody': 'లెక్కింపులు ప్రామాణిక రాయితీ పథక నియమాల ఆధారంగా చేయబడ్డాయి. మొరటోరియం సమయంలో వడ్డీ కేపిటలైజ్ చేయబడుతుంది. రుణ మంజూరు సమయంలో బ్యాంక్ అధికారిక నిబంధనలు వర్తిస్తాయి.',
    'finance.btnBack': '← వ్యాపార నమూనాలకు వెనుకకు',
    'finance.btnContinue': 'సర్వైవల్ సిమ్యులేటర్ నడపండి →',

    // Survival Simulator (Phase 5)
    'sim.title': 'వ్యాపార ఒత్తిడి పరీక్ష & సర్వైవల్ సిమ్యులేటర్',
    'sim.subtitle': 'అప్పు తీసుకునే ముందు వ్యాపార సవాళ్లను ఎదుర్కొనే సామర్థ్యాన్ని పరీక్షించండి',
    'sim.salesDecline': 'అమ్మకాల తగ్గుదల (-20% డిఫాల్ట్)',
    'sim.costInflation': 'ఖర్చుల పెరుగుదల (+15% డిఫాల్ట్)',
    'sim.paymentDelay': 'కస్టమర్ చెల్లింపుల ఆలస్యం',
    'sim.delayDuration': 'ఆలస్య వ్యవధి (రోజులు)',
    'sim.seasonalSlowdown': 'సీజనల్ మందగమన నెల',
    'sim.unexpectedExpense': 'ఊహించని అత్యవసర ఖర్చు (₹)',
    'sim.baseVsStressed': 'బేస్‌లైన్ వర్సెస్ ఒత్తిడి పోలిక',
    'sim.cads': 'రుణ చెల్లింపుకు అందుబాటులో ఉన్న నగదు',
    'sim.liquidityShortfall': 'అంచనా వేసిన నగదు కొరత',
    'sim.recommendation': 'ఈ ఊహల ప్రకారం సురక్షితమైన రుణ పరిధి',

    // Experimental ML Panel
    'ml.title': 'ప్రయోగాత్మక సింథటిక్-డేటా ML ఫలితం',
    'ml.disclaimer': 'ప్రయోగాత్మక సింథటిక్-డేటా మోడల్ ఫలితం — ఇది నిజమైన ప్రపంచ విజయావకాశం కాదు. కేవలం 600 సింథటిక్ రికార్డులతో మాత్రమే శిక్షణ పొందింది.',
    'ml.modelType': 'మోడల్ ఆర్కిటెక్చర్',
    'ml.accuracy': 'బెంచ్‌మార్క్ ఖచ్చితత్వం',
    'ml.f1': 'బెంచ్‌మార్క్ F1 స్కోరు',
    'ml.status': 'సింథటిక్ వర్గీకరణ',
    'ml.features': 'ఉపయోగించిన ఫీచర్లు',

    // Business Blueprint Report
    'report.title': 'సమగ్ర వ్యాపార బ్లూప్రింట్ (DPR)',
    'report.subtitle': 'తమిళనాడు గ్రామీణ వ్యవస్థాపకుల కోసం ప్రాజెక్ట్ సాధ్యాసాధ్యాల నివేదిక',
    'report.print': 'ప్రింట్ / PDF గా సేవ్',
    'report.checklistTitle': '90 రోజుల ముందస్తు కార్యాచరణ చెక్‌లిస్ట్',
    'report.disclaimer': 'ఈ నివేదిక అల్గోరిథమిక్ నిర్ణయ మద్దతు సాధనం మాత్రమే. ఇది రుణ మంజూరు లేదా వ్యాపార విజయానికి హామీ ఇవ్వదు.',

    // Common
    'common.yes': 'అవును',
    'common.no': 'కాదు',
    'common.loading': 'డేటా లోడ్ అవుతోంది...',
    'common.error': 'లోపం సంభవించింది',
    'common.retry': 'మళ్ళీ ప్రయత్నించండి',
    'common.perMonth': '/నెల',
    'common.perQuarter': '/త్రైమాసికం',
    'common.rupees': '₹',
  },

  ta: {
    // Brand
    'app.name': 'கிராம்வென்ச்சர் AI',
    'app.tagline': 'உங்கள் கிராமம். உங்கள் வாய்ப்பு. உங்கள் தொழில் திட்டம்.',
    'app.subtitle': 'ஊரக தமிழ்நாட்டிற்கான உள்ளூர் வணிக ஆலோசனை & நிதி கட்டமைப்பு',

    // Navigation
    'nav.home': 'முகப்பு',
    'nav.demand': 'தேவை & இருப்பிடம்',
    'nav.village': 'சந்தை நுண்ணறிவு',
    'nav.compare': 'தொழில் ஒப்பீடு',
    'nav.finance': 'நிதி கட்டமைப்பு',
    'nav.simulator': 'வாழ்வாதார சிமுலேட்டர்',
    'nav.report': 'தொழில் வரைபடம்',
    'nav.advisor': 'AI ஆலோசகர்',

    // Language Selector labels
    'lang.en': 'English',
    'lang.te': 'తెలుగు (Telugu)',
    'lang.ta': 'தமிழ் (Tamil)',

    // Header & Actions
    'header.demo': 'மாதிரி திட்டம்',
    'header.demoLoaded': 'மாதிரி முறைமை: தமிழ்நாடு முன்னோடி திட்டம் ஏற்றப்பட்டது',
    'header.reset': 'மீட்டமை',
    'header.activeLocation': 'தேர்ந்தெடுத்த இடம்',
    'header.blueprint': 'திட்ட வரைபடம்',

    // Demand-First Onboarding Screen
    'demand.question': 'உங்கள் பகுதியில் உள்ள மக்களுக்கு என்ன பொருட்கள் அல்லது சேவைகள் தேவைப்படுகின்றன, அல்லது நீங்கள் என்ன பொருட்கள் அல்லது சேவைகளை விற்க விரும்புகிறீர்கள்?',
    'demand.questionHelper': 'கிராம மக்கள் அருகில் உள்ள நகரங்களுக்குச் சென்று வாங்கும் அத்தியாவசிய பொருட்கள் அல்லது உங்கள் தொழில் யோசனையை எளிய வார்த்தைகளில் விவரிக்கவும்.',
    'demand.placeholder': 'உதாரணமாக: தூய பால் மற்றும் தயிர் கொள்முதல் மையம், தினசரி காய்கறி விற்பனை, ஆயத்த ஆடைகள், அல்லது மொபைல் போன் பழுதுநீக்கம்...',
    'demand.essentialTitle': 'அத்தியாவசிய தகவல்கள்',
    'demand.essentialDesc': 'பொதுவான வணிகப் பட்டியலைத் தவிர்த்து, உங்கள் உள்ளூர் தேவை மற்றும் இடத்திலிருந்து துவங்குகிறோம்.',
    'demand.district': 'தமிழ்நாடு மாவட்டம்',
    'demand.districtPlaceholder': '38 தமிழ்நாடு மாவட்டங்களில் ஒன்றைத் தேர்ந்தெடுக்கவும்...',
    'demand.locality': 'கிராமம், நகரம் அல்லது அஞ்சல் குறியீட்டு எண் (PIN)',
    'demand.localityPlaceholder': 'உதாரணம்: வாடிப்பட்டி, அலங்காநல்லூர், அல்லது 625218',
    'demand.localityHelper': 'பயனர் உள்ளீடு மட்டுமே ஏற்றுக்கொள்ளப்படும். பொய்யான கிராமங்களோ அஞ்சல் எண்களோ உருவாக்கப்படாது.',
    'demand.savings': 'இருப்பில் உள்ள சேமிப்பு / சொந்த மூலதனம் (₹)',
    'demand.savingsPlaceholder': 'உதா: 100000',
    'demand.savingsHelper': '10% சொந்த பங்களிப்பு விதியின்படி, ₹1,00,000 சேமிப்பு மூலம் ₹10,00,000 மதிப்புள்ள திட்டத்தை வடிவமைக்கலாம்.',
    'demand.desiredActivity': 'விருப்பமான தொழில் துறை (விருப்பப்பட்டால்)',
    'demand.desiredActivityPlaceholder': 'தேர்வு செய்யவும் அல்லது தேவை விளக்கத்திலிருந்து தானாக வகைப்படுத்தப்படும்...',
    'demand.inferred': 'உங்கள் தேவை விளக்கத்திலிருந்து கண்டறியப்பட்ட பரிந்துரை தொழில்கள்:',

    // Progressive Optional Details
    'demand.optionalTitle': 'கூடுதல் விருப்ப விவரங்கள் (காண கிளிக் செய்யவும்)',
    'demand.optionalDesc': 'நடைமுறை மூலதனம் மற்றும் நிதி பாதுகாப்பை துல்லியமாக மதிப்பிட கூடுதல் தகவல்களை வழங்கலாம்.',
    'demand.resaleProducts': 'மறுவிற்பனைக்கு வாங்க வேண்டிய பொருட்கள்',
    'demand.resaleProductsPlaceholder': 'உதா: மாட்டு தீவன மூட்டைகள், பாக்கெட்டுகள், உதிரிபாகங்கள்...',
    'demand.customerGroups': 'உத்தேசிக்கப்பட்டுள்ள வாடிக்கையாளர்கள்',
    'demand.customerGroupsPlaceholder': 'உதா: உள்ளூர் டீக்கடைகள், தினக்கூலி தொழிலாளர்கள், பள்ளி மாணவர்கள்...',
    'demand.sellingPrice': 'எதிர்பார்க்கும் விற்பனை விலை அல்லது கொள்முதல் பட்ஜெட்',
    'demand.sellingPricePlaceholder': 'உதா: பால் லிட்டர் ₹45, தையல் கூலி ₹250...',
    'demand.householdExpenses': 'மாதாந்திர குடும்ப அத்தியாவசிய செலவுகள் (₹)',
    'demand.existingLoans': 'தற்போதுள்ள மாதாந்திர கடன் தவணைகள் (₹)',
    'demand.essentialReserve': 'அவசர கால குடும்ப சேமிப்பு (செலவழிக்கக் கூடாது) (₹)',
    'demand.workspace': 'பணிமனை / கொட்டகை / நில வசதி',
    'demand.workspacePlaceholder': 'உதா: 100 சதுர அடி கடை இடம், சொந்த மேய்ச்சல் நிலம்...',
    'demand.experience': 'தொழில் அல்லது துறை அனுபவம் (ஆண்டுகள்)',
    'demand.additionalNotes': 'கூடுதல் குறிப்புகள் / கள நிலவரம்',
    'demand.additionalNotesPlaceholder': 'உதா: மதிய நேர மின்தடை, கோடையில் தண்ணீர் லாரி தேவைப்படும்...',

    // Form Actions & Buttons
    'action.analyzeArea': 'என் பகுதியை ஆய்வு செய்',
    'action.loadDemo': 'மாதிரி திட்டத்தை ஏற்று (தமிழ்நாடு)',
    'action.editInputs': 'விவரங்களை திருத்து',
    'action.continue': 'அடுத்த நிலைக்குச் செல்',
    'action.back': 'பின்செல்ல',
    'action.save': 'சேமிக்க',
    'action.cancel': 'ரத்துசெய்',
    'action.reset': 'முழுதும் மீட்டமை',
    'action.searchPlaces': 'அருகிலுள்ள கடைகளைத் தேடு',

    // Validation Messages
    'validation.districtRequired': 'தயவுசெய்து ஒரு தமிழ்நாடு மாவட்டத்தைத் தேர்ந்தெடுக்கவும்.',
    'validation.localityRequired': 'கிராமம், நகரம் அல்லது அஞ்சல் குறியீடு அவசியம்.',
    'validation.demandRequired': 'மக்களுக்குத் தேவையான பொருட்கள் அல்லது சேவைகளை விவரிக்கவும்.',
    'validation.savingsPositive': 'சொந்த மூலதனம் நேர்மறை எண்ணாக இருக்க வேண்டும் (> ₹0).',
    'validation.noNegativeMoney': 'பண மதிப்புகள் எதிர்மறையாக இருக்கக்கூடாது.',

    // Location Accuracy & Provenance
    'location.title': 'தமிழ்நாடு இருப்பிட எல்லை',
    'location.coordinates': 'புவிசார் ஆயத்தொலைவுகள் (Coordinates)',
    'location.accuracy': 'இருப்பிட துல்லியம்',
    'location.source': 'தகவல் மூலம்',
    'location.accuracyExact': 'சரிபார்க்கப்பட்ட புவிசார் குறியீடு (Geocoder)',
    'location.accuracyCentroid': 'மாவட்ட தலைநகர மையம் (தோராயமானது)',
    'location.accuracyUser': 'பயனர் வழங்கிய ஆயத்தொலைவுகள்',
    'location.accuracyManual': 'முகவரி மட்டுமே (ஆயத்தொலைவுகள் இல்லை)',
    'location.note': 'போட்டியாளர் தேடல் இந்த சரிபார்க்கப்பட்ட ஆயத்தொலைவுகளிலிருந்து 5 கி.மீ வட்டத்திற்குள் மட்டுமே மேற்கொள்ளப்படுகிறது.',
    'location.noCoordinatesWarning': 'துல்லியமான ஆயத்தொலைவுகள் கிடைக்கவில்லை. 5 கி.மீ போட்டியாளர் ஆய்வுக்கு ஆயத்தொலைவுகள் அவசியம்.',

    // Competitor Discovery (Phase 2)
    'competitor.title': '5 கி.மீ சுற்றளவில் உள்ள போட்டியாளர்கள்',
    'competitor.subtitle': 'தகவல் தளம் சார்ந்த நேரடி சான்றுகள் மற்றும் கள ஆய்வு',
    'competitor.providerLabel': 'தகவல் தள முடிவு',
    'competitor.userObsLabel': 'பயனர் கள ஆய்வு பதிவு',
    'competitor.syntheticDemoLabel': 'மாதிரி தரவு',
    'competitor.filterAll': 'அனைத்து பிரிவுகளும்',
    'competitor.viewList': 'பட்டியல் வடிவம்',
    'competitor.viewMap': 'வரைபட வடிவம்',
    'competitor.emptyStateTitle': '5 கி.மீ சுற்றளவில் பதிவான கடைகள் இல்லை',
    'competitor.emptyStateDesc': 'பொது வரைபடங்களில் கடைகள் இல்லாதது அங்கு போட்டியே இல்லை என்பதை நிரூபிக்காது. கிராமப்புறங்களில் பதிவு செய்யப்படாத கடைகள் இருக்கலாம். கள ஆய்வுப் படிவத்தைப் பயன்படுத்தி நீங்களே பதிவு செய்யுங்கள்.',
    'competitor.sparseWarning': 'தரவு முழுமையற்றதாக இருக்கலாம். கிராமப்புற சிறு கடைகள் வரைபடங்களில் குறைவாகவே பதிவாகியுள்ளன.',
    'competitor.distance': 'தூரம்',
    'competitor.address': 'முகவரி',
    'competitor.phone': 'தொலைபேசி எண்',
    'competitor.rating': 'மதிப்பீடு',
    'competitor.retrievalTime': 'பெறப்பட்ட நேரம்',
    'competitor.attribution': 'தரவு உரிமம்',
    'competitor.logObservationTitle': 'கள ஆய்வு தகவலை பதிவு செய்',
    'competitor.logObservationDesc': 'நீங்கள் கிராமத்தில் நேரில் பார்த்த கடைகளை பதிவு செய்யுங்கள். இவை தகவல் தளத் தரவுகளுடன் கலக்கப்படாது.',

    // Evidence & Methodology
    'evidence.official': 'அதிகாரப்பூர்வ தரவு',
    'evidence.provider': 'தகவல் தள முடிவு',
    'evidence.userObs': 'பயனர் கள ஆய்வு',
    'evidence.userAssumption': 'பயனர் அனுமானம்',
    'evidence.estimate': 'மாதிரி மதிப்பீடு',
    'evidence.synthetic': 'மாதிரி தரவு',
    'evidence.missing': 'தரவு இல்லை / அறியப்படவில்லை',
    'evidence.coverageTitle': 'சான்றுகள் கவரேஜ் குறியீடு',
    'evidence.coverageFormula': 'கணக்கீட்டு முறை: (மக்கள் தொகை 20% + கடைகள் 25% + விலை 20% + திட்டச் செலவு 20% + புதுமை 15%). இது சான்றுகளின் அளவு மட்டுமே, தொழில் வெற்றிக்கு உத்தரவாதம் அல்ல.',

    // Business Comparison (Phase 3)
    'compare.title': 'தொழில் ஒப்பீடு & அலகு பொருளாதாரம்',
    'compare.subtitle': '3 தொழில்களை வெளிப்படையான குறைந்த / இயல்பான / அதிக அனுமானங்களுடன் ஒப்பிடுங்கள்',
    'compare.setupCost': 'ஆரம்ப இயந்திரங்கள் & கொட்டகை செலவு',
    'compare.workingCapital': 'தொடக்க நடைமுறை மூலதனம்',
    'compare.monthlyRevenue': 'மாதாந்திர வரவு / விற்பனை',
    'compare.monthlyCosts': 'மாதாந்திர செயல்பாட்டு செலவுகள்',
    'compare.grossMargin': 'மொத்த லாப வரம்பு',
    'compare.netSurplus': 'நிகர மாதாந்திர பண உபரி',
    'compare.breakEven': 'லாப-நஷ்டமற்ற விற்பனை அளவு (Break-Even)',
    'compare.rankTitle': 'வெளிப்படையான தொழில் தரவரிசை',
    'compare.rankDesc': '5 முக்கிய அம்சங்களின் அடிப்படையில் கணக்கிடப்படுகிறது (நிதி திறன் 30%, சான்று 25%, போட்டி 20%, அபாயம் 15%, மூலதன பொருத்தம் 10%).',

    // Financial Structuring (Phase 4)
    'finance.title': 'நிதி கட்டமைப்பு & திட்ட வழிகாட்டி',
    'finance.subtitle': 'குறைந்துவரும் அசல் தவணை கணக்கீடு, திட்ட வரம்புகள் & காலாண்டு தவணை அட்டவணை',
    'finance.phaseBadge': 'நிலை 4 / 5',
    'finance.phaseDesc': 'மானிய கடன் வசதி & நிதி கட்டமைப்பு',
    'finance.routedSchemeLabel': 'பொருந்தும் கடன் திட்டம்',
    'finance.marginSizing': '10% சொந்த மூலதன விதி',
    'finance.availableMargin': 'இருப்பிலுள்ள சொந்த மூலதனம்',
    'finance.marginDesc': 'தொழில்முனைவோரின் சொந்த ரொக்கச் சேமிப்பு',
    'finance.tenPercentRule': '10% சொந்த மூலதன விதி',
    'finance.theoreticalCost': 'தோராய திட்ட மொத்த மதிப்பு',
    'finance.theoreticalCostDesc': 'திட்ட மதிப்பு = சேமிப்பு ÷ 0.10',
    'finance.theoreticalLoan': 'தோராய தகுதி கடன் (90%)',
    'finance.feasibleCost': 'நடைமுறைக்கு சாத்தியமான திட்ட மதிப்பு',
    'finance.maxFundingLabel': 'அதிகபட்ச திட்ட கடன் (90%)',
    'finance.sanctionedLoan': 'அரசு திட்ட அதிகபட்ச உத்தேச கடன்',
    'finance.loanCapDesc': 'திட்ட சட்டப்பூர்வ வரம்பிற்கு உட்பட்டது: {cap}',
    'finance.ownContribution': 'தேவையான சொந்த பங்களிப்பு',
    'finance.ownEquityLabel': 'தேவையான சொந்த பங்களிப்பு',
    'finance.ofProjectCost': 'மொத்த திட்ட மதிப்பில்',
    'finance.availableMarginLeft': 'பங்களிப்பிற்கு பின் மிஞ்சும் சேமிப்பு',
    'finance.eligibilityVsAffordability': 'முக்கிய வேறுபாடு: கடன் பெறும் தகுதி ≠ திருப்பிச் செலுத்தும் திறன்',
    'finance.eligibilitySubtitle': 'அரசு திட்டம் அதிகபட்ச கடனை அனுமதித்தாலும், உங்கள் மாதாந்திர தொழில் லாபம் மற்றும் குடும்ப செலவுகளுக்குப் பின் மிஞ்சும் பணத்தைக் கொண்டு மட்டுமே கடன் வாங்குவது பாதுகாப்பானது.',
    'finance.statutoryMax': 'திட்ட அதிகபட்ச உத்தேச கடன் வரம்பு',
    'finance.statutoryMaxDesc': '90% கடன் விதி மற்றும் உச்சவரம்பு அடிப்படையில் மட்டுமே. கிராமப்புற விற்பனை வேகம் அல்லது குடும்ப செலவுகளை இது கணக்கில் கொள்ளாது.',
    'finance.safeBorrowingCapacity': 'பணப்புழக்கத்திற்கு உகந்த பாதுகாப்பான கடன் அளவு',
    'finance.safeBorrowingCapacityDesc': 'தொழில் நிகர பணப்புழக்கம் கழித்தல் குடும்ப செலவுகளின் அடிப்படையில், வங்கி பாதுகாப்பு விகிதத்தை (DSCR ≥ 1.25x) உறுதிசெய்கிறது.',
    'finance.warning.exceedsTitle': 'கடன் வரம்பு பணப்புழக்க திறனை விட அதிகமாக உள்ளது',
    'finance.warning.exceeds': 'உங்கள் திட்ட அடிப்படையிலான கடன் வரம்பு ({schemeLimit}) தற்போதைய பணப்புழக்க ஆதரவை விட அதிகமாக உள்ளது ({affordableAmount}). திருப்பிச் செலுத்தும் அபாயத்தைக் குறைக்க திட்ட மதிப்பைக் குறைப்பது அல்லது குறைந்த கடன் பெறுவது நல்லது.',
    'finance.quarterlySchedule': 'எதிர்பார்க்கப்படும் காலாண்டு தவணை அட்டவணை',
    'finance.monthlyEmi': 'மாதாந்திர தவணைக்கு இணையானது (EMI)',
    'finance.moratorium': 'மொரட்டோரியம் அவகாச காலம்',
    'finance.interestTreatment': 'மொரட்டோரியம் கால வட்டி அசலுடன் இணைக்கப்படுகிறது',
    'finance.dscrTitle': 'கடன் சேவை பாதுகாப்பு விகிதம் (DSCR)',
    'finance.dscrFormula': 'DSCR = கடன் கட்ட மிஞ்சும் நிகர ரொக்கம் ÷ திட்டமிடப்பட்ட தவணை தொகை',
    'finance.dscrAdequate': 'வங்கியியல் பாதுகாப்பு நிலை (≥ 1.25x)',
    'finance.dscrThin': 'குறைந்த பண பாதுகாப்பு (1.00x – 1.24x); பாதிப்புக்குள்ளாகலாம்',
    'finance.dscrDeficit': 'பணப்பற்றாக்குறை (< 1.00x); இந்த கடனை தொழில் தாங்காது',
    'finance.schemeVerificationNotice': 'திட்ட விதிமுறைகள் போட்டி வழிகாட்டலின் அடிப்படையில் அமைக்கப்பட்டவை; மாவட்ட தொழில் மையத்திடம் அதிகாரப்பூர்வமாக சரிபார்க்கவும்.',
    'finance.reducingBalanceTitle': 'குறைந்துவரும் அசல் தவணை அட்டவணை',
    'finance.reducingBalanceSubtitle': 'கால அளவு: {tenure} மாதங்கள் ({moratorium} மாதங்கள் அவகாசம்)',
    'finance.quarterlyTab': 'காலாண்டு அட்டவணை (முதன்மை)',
    'finance.monthlyTab': 'மாதாந்திர EMI சமநிலை',
    'finance.periodicInstalment': 'தவணைத் தொகை',
    'finance.totalInterest': 'மதிப்பிடப்பட்ட மொத்த வட்டி',
    'finance.totalRepayment': 'மொத்த திருப்பிச் செலுத்தும் தொகை',
    'finance.colPeriod': 'தவணை எண்',
    'finance.colOpeningBalance': 'தொடக்க இருப்பு',
    'finance.colInstalment': 'தவணை',
    'finance.colPrincipal': 'அசல்',
    'finance.colInterest': 'வட்டி',
    'finance.colClosingBalance': 'முடிவு இருப்பு',
    'finance.colStatus': 'நிலை',
    'finance.statusMoratorium': 'அவகாச காலம்',
    'finance.statusActive': 'தவணை செலுத்துதல்',
    'finance.showAllInstalments': 'அனைத்து {count} தவணைகளையும் காண்க',
    'finance.collapseInstalments': 'சுருக்கவும்',
    'finance.schemeAssumptionsTitle': 'திட்ட விதிகள் பற்றிய குறிப்பு',
    'finance.schemeAssumptionsBody': 'கணக்கீடுகள் வழிகாட்டு நெறிமுறைகளின்படி செய்யப்பட்டுள்ளன. அவகாச காலத்தில் வட்டி அசலுடன் இணைக்கப்படுகிறது. வங்கியின் இறுதி விதிமுறைகளே கடன் ஒப்புதலுக்கு பொருந்தும்.',
    'finance.btnBack': '← வணிக மாதிரிகளுக்குச் செல்ல',
    'finance.btnContinue': 'வாழ்வாதார சிமுலேட்டரை இயக்கவும் →',

    // Survival Simulator (Phase 5)
    'sim.title': 'வணிக வாழ்வாதார நெருக்கடி சிமுலேட்டர்',
    'sim.subtitle': 'கடன் வாங்குவதற்கு முன் விற்பனை சரிவு மற்றும் நஷ்டங்களை தாங்கும் திறனை சோதிக்கவும்',
    'sim.salesDecline': 'விற்பனை சரிவு (-20% இயல்பானது)',
    'sim.costInflation': 'இடுபொருள் விலை உயர்வு (+15% இயல்பானது)',
    'sim.paymentDelay': 'வாடிக்கையாளர் கடன் பாக்கி தாமதம்',
    'sim.delayDuration': 'தாமத காலம் (நாட்கள்)',
    'sim.seasonalSlowdown': 'பருவகால மந்தநிலை மாதம்',
    'sim.unexpectedExpense': 'எதிர்பாராத அவசர செலவு (₹)',
    'sim.baseVsStressed': 'இயல்பு நிலை vs நெருக்கடி நிலை ஒப்பீடு',
    'sim.cads': 'கடன் அடைக்க மிஞ்சும் பணம்',
    'sim.liquidityShortfall': 'மதிப்பிடப்பட்ட பணப்பற்றாக்குறை',
    'sim.recommendation': 'இந்த அனுமானங்களின் கீழ் பரிந்துரைக்கப்படும் கடன் வரம்பு',

    // Experimental ML Panel
    'ml.title': 'ஆராய்ச்சி நோக்கிலான மாதிரி தரவு ML முடிவு',
    'ml.disclaimer': 'ஆராய்ச்சி நோக்கிலான மாதிரி தரவு ML முடிவு — இது நிஜ உலக வணிக வெற்றிக்கான உத்தரவாதம் அல்ல. 600 மாதிரி பதிவுகளைக் கொண்டு மட்டுமே சோதிக்கப்பட்டது.',
    'ml.modelType': 'இயந்திர கற்றல் மாதிரி',
    'ml.accuracy': 'சோதனை துல்லியம்',
    'ml.f1': 'F1 மதிப்பீடு',
    'ml.status': 'மாதிரி வகைப்பாடு',
    'ml.features': 'பயன்படுத்தப்பட்ட காரணிகள்',

    // Business Blueprint Report
    'report.title': 'விரிவான திட்ட அறிக்கை (DPR)',
    'report.subtitle': 'தமிழ்நாடு ஊரக தொழில்முனைவோருக்கான விரிவான திட்ட சாத்தியக்கூறு அறிக்கை',
    'report.print': 'அச்சிடு / PDF ஆக சேமி',
    'report.checklistTitle': '90 நாள் கள ஆய்வு மற்றும் ஆயத்தப் பணிகள்',
    'report.disclaimer': 'இந்த அறிக்கை முடிவெடுக்கும் ஆதரவு கருவி மட்டுமே. இது கடன் அனுமதிக்கோ அல்லது வணிக வெற்றிக்கோ உத்தரவாதம் அளிக்காது.',

    // Common
    'common.yes': 'ஆம்',
    'common.no': 'இல்லை',
    'common.loading': 'ஏற்றப்படுகிறது...',
    'common.error': 'பிழை ஏற்பட்டது',
    'common.retry': 'மீண்டும் முயற்சிக்கவும்',
    'common.perMonth': '/மாதம்',
    'common.perQuarter': '/காலாண்டு',
    'common.rupees': '₹',
  },
} as const;

export type TranslationKey = keyof typeof translations.en;

export function t(
  key: string,
  lang: Language = 'en',
  params?: Record<string, string | number>
): string {
  const dict = (translations as any)[lang] || translations.en;
  let val = dict[key] || (translations.en as any)[key];
  if (!val) {
    if ((import.meta as any).env?.MODE !== 'production') {
      console.warn(`[i18n missing key]: "${key}" for language "${lang}"`);
    }
    return key;
  }
  if (params) {
    Object.entries(params).forEach(([paramKey, paramVal]) => {
      val = val.replace(new RegExp(`\\{${paramKey}\\}`, 'g'), String(paramVal));
    });
  }
  return val;
}

export function useTranslation() {
  return { t };
}

/**
 * Development utility to audit missing keys across languages
 */
export function validateTranslationKeys(): {
  missingInTe: string[];
  missingInTa: string[];
} {
  const enKeys = Object.keys(translations.en) as TranslationKey[];
  const teKeys = new Set(Object.keys(translations.te));
  const taKeys = new Set(Object.keys(translations.ta));

  const missingInTe = enKeys.filter((k) => !teKeys.has(k));
  const missingInTa = enKeys.filter((k) => !taKeys.has(k));

  return { missingInTe, missingInTa };
}
