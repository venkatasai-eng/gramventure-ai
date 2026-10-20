/**
 * GramVenture AI — Business Model Templates
 *
 * 8 configurable business templates with realistic Indian rural cost structures.
 * All amounts in INR (₹). Indian lakhs notation used in comments.
 *
 * IMPORTANT: Cost / revenue figures are MODEL ESTIMATES derived from publicly
 * available NABARD / NSSO / MOSPI reports and aggregated market observations.
 * They are NOT verified for any specific village. The "source" field on every
 * DocumentedAssumption makes this transparent.
 */

import type {
  BusinessModelTemplate,
  BusinessCategory,
  SetupCostItem,
  MonthlyCostItem,
  RevenueStream,
  BusinessScenario,
  SeasonalityProfile,
  DocumentedAssumption,
} from './types';

// ---------------------------------------------------------------------------
// Helper factory
// ---------------------------------------------------------------------------

const da = <T = number>(
  value: T,
  source: DocumentedAssumption<T>['source'],
  verificationNote: string,
): DocumentedAssumption<T> => ({ value, source, verificationNote });

const modelEstimate = (value: number, note: string) =>
  da(value, 'Model Estimate', note);

const officialData = (value: number, note: string) =>
  da(value, 'Official Data', note);

// ---------------------------------------------------------------------------
// Flat seasonality (used as default)
// ---------------------------------------------------------------------------
const FLAT_SEASON: SeasonalityProfile = {
  monthlyMultipliers: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  notes: 'Relatively stable demand year-round.',
};

// ═══════════════════════════════════════════════════════════════════════════
// 1. DAIRY
// ═══════════════════════════════════════════════════════════════════════════

const dairyModel: BusinessModelTemplate = {
  id: 'dairy-small',
  name: 'Small Dairy Unit (2–5 Cows / Buffaloes)',
  category: 'Dairy',
  description:
    'Small-scale milk production and sale. Revenue from daily milk supply to local cooperative or direct consumers. By-products like curd, buttermilk can add margin.',
  timeToRevenueInDays: modelEstimate(7, 'Milk available from day one if animals are lactating.'),
  seasonality: {
    monthlyMultipliers: [1, 1, 1.05, 1.05, 0.9, 0.85, 0.85, 0.9, 1, 1.1, 1.1, 1.05],
    notes: 'Slight dip in summer (lower yield), higher in winter (festive demand + better yield).',
  },
  tags: ['dairy', 'milk', 'cattle', 'livestock', 'curd', 'rural'],
  ruralSuitabilityNotes:
    'Highly suitable for villages with grazing land and fodder availability. Cooperative milk collection networks (Amul, state cooperatives) provide a ready buyer.',
  scenarios: {
    // ── LOW ──────────────────────────────────────────────────────────────
    low: buildDairyScenario(2, 8, 30, 0.85),
    // ── BASE ─────────────────────────────────────────────────────────────
    base: buildDairyScenario(3, 10, 35, 1.0),
    // ── HIGH ─────────────────────────────────────────────────────────────
    high: buildDairyScenario(5, 12, 40, 1.15),
  },
};

function buildDairyScenario(
  numAnimals: number,
  litresPerAnimalPerDay: number,
  pricePerLitre: number,
  marginFactor: number,
): BusinessScenario {
  const totalDailyLitres = numAnimals * litresPerAnimalPerDay;
  const monthlyLitres = totalDailyLitres * 30;

  const setupCosts: SetupCostItem[] = [
    {
      name: `${numAnimals} milch animals (cow / buffalo)`,
      amount: modelEstimate(numAnimals * 45000, `Avg ₹45,000/animal — NABARD unit cost norms for crossbred cows.`),
      category: 'Livestock',
    },
    {
      name: 'Cattle shed construction',
      amount: modelEstimate(numAnimals * 15000, `Basic shed ₹15,000/animal for tin-roof open shed.`),
      category: 'Infrastructure',
    },
    {
      name: 'Milking vessels & cans',
      amount: modelEstimate(3000, 'Stainless steel cans and buckets.'),
      category: 'Equipment',
    },
    {
      name: 'Chaff cutter (manual)',
      amount: modelEstimate(5000, 'Manual chaff cutter available in local market.'),
      category: 'Equipment',
    },
  ];

  const monthlyCosts: MonthlyCostItem[] = [
    {
      name: 'Green & dry fodder',
      amount: modelEstimate(numAnimals * 2500, `₹2,500/animal/month — mix of green fodder, dry straw.`),
      category: 'raw_materials',
    },
    {
      name: 'Concentrate feed',
      amount: modelEstimate(numAnimals * 1500, `₹1,500/animal/month — 2–3 kg/day at ₹25/kg.`),
      category: 'raw_materials',
    },
    {
      name: 'Veterinary care',
      amount: modelEstimate(numAnimals * 300, '₹300/animal/month — deworming, vaccines, minor ailments.'),
      category: 'miscellaneous',
    },
    {
      name: 'Labour (part-time helper)',
      amount: modelEstimate(numAnimals > 3 ? 5000 : 2000, 'Part-time helper for milking & cleaning.'),
      category: 'labor',
    },
    {
      name: 'Transport to collection centre',
      amount: modelEstimate(1000 * marginFactor, 'Auto / bike fuel for daily milk delivery.'),
      category: 'transport',
    },
    {
      name: 'Utilities (water / electricity)',
      amount: modelEstimate(500, 'Rural water and small motor pump costs.'),
      category: 'utilities',
    },
  ];

  const revenueStreams: RevenueStream[] = [
    {
      name: 'Milk sales',
      volumePerMonth: modelEstimate(monthlyLitres, `${numAnimals} animals × ${litresPerAnimalPerDay} L/day × 30 days`),
      sellingPricePerUnit: modelEstimate(pricePerLitre, `Cooperative / local price ₹${pricePerLitre}/L.`),
      costPricePerUnit: modelEstimate(pricePerLitre * 0.6, 'Feed + vet costs as fraction of selling price.'),
    },
    {
      name: 'Curd / Buttermilk (value-add)',
      volumePerMonth: modelEstimate(Math.round(monthlyLitres * 0.1), '~10% of milk converted to value-add products.'),
      sellingPricePerUnit: modelEstimate(pricePerLitre * 1.4, 'Curd sells at ~40% premium over raw milk.'),
      costPricePerUnit: modelEstimate(pricePerLitre * 0.7, 'Same raw material cost + labour.'),
    },
  ];

  return {
    setupCosts,
    monthlyCosts,
    revenueStreams,
    workingCapitalNeeded: modelEstimate(
      Math.round(monthlyLitres * pricePerLitre * 0.5),
      '~15 days of operating costs as working capital buffer.',
    ),
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// 2. GROCERY / KIRANA
// ═══════════════════════════════════════════════════════════════════════════

const groceryModel: BusinessModelTemplate = {
  id: 'grocery-kirana',
  name: 'Grocery / Kirana Store',
  category: 'Grocery / Kirana',
  description:
    'Neighbourhood retail store stocking daily essentials — rice, dal, oil, spices, soap, biscuits, beverages. The backbone of rural retail.',
  timeToRevenueInDays: modelEstimate(3, 'Revenue starts from opening day.'),
  seasonality: {
    monthlyMultipliers: [1, 0.95, 1, 1, 1, 0.9, 0.9, 0.95, 1, 1.15, 1.2, 1.1],
    notes: 'Higher sales around harvest (Oct-Dec) when rural incomes peak. Slight dip in lean season (Jun-Jul).',
  },
  tags: ['grocery', 'kirana', 'retail', 'FMCG', 'daily-needs'],
  ruralSuitabilityNotes:
    'Universally suitable. Even the smallest habitation needs a kirana. Competitive moat comes from credit relationships, assortment, and proximity.',
  scenarios: {
    low: buildGroceryScenario(50000, 0.08, 600),
    base: buildGroceryScenario(80000, 0.10, 900),
    high: buildGroceryScenario(120000, 0.12, 1500),
  },
};

function buildGroceryScenario(
  monthlyTurnover: number,
  avgMarginPercent: number,
  dailyFootfall: number,
): BusinessScenario {
  const setupCosts: SetupCostItem[] = [
    {
      name: 'Shop fitting (shelves, counter, signboard)',
      amount: modelEstimate(25000, 'Wooden shelves, glass counter, painted signboard.'),
      category: 'Renovation',
    },
    {
      name: 'Weighing scale (electronic)',
      amount: modelEstimate(3000, 'Digital table-top scale 30 kg capacity.'),
      category: 'Equipment',
    },
    {
      name: 'Initial inventory stock',
      amount: modelEstimate(Math.round(monthlyTurnover * 0.6), 'First stock purchase ~60% of monthly turnover.'),
      category: 'Inventory',
    },
    {
      name: 'Shop deposit / advance rent',
      amount: modelEstimate(10000, '2–3 months advance on rural shop rent.'),
      category: 'Licensing',
    },
    {
      name: 'FSSAI basic registration',
      amount: officialData(100, 'FSSAI basic registration for turnover < ₹12 lakh/year.'),
      category: 'Licensing',
    },
  ];

  const monthlyCosts: MonthlyCostItem[] = [
    {
      name: 'Inventory replenishment',
      amount: modelEstimate(Math.round(monthlyTurnover * (1 - avgMarginPercent)), 'Cost of goods sold.'),
      category: 'inventory',
    },
    {
      name: 'Shop rent',
      amount: modelEstimate(3000, 'Small 100–150 sq ft shop in village market area.'),
      category: 'rent',
    },
    {
      name: 'Electricity',
      amount: modelEstimate(800, 'Lighting, fan, small fridge if stocking cold drinks.'),
      category: 'utilities',
    },
    {
      name: 'Transport (restocking trips)',
      amount: modelEstimate(1500, 'Weekly auto / shared transport to wholesale market in nearest town.'),
      category: 'transport',
    },
    {
      name: 'Helper / assistant',
      amount: modelEstimate(2000, 'Part-time help during peak hours (family member often).'),
      category: 'labor',
    },
    {
      name: 'Wastage & pilferage',
      amount: modelEstimate(Math.round(monthlyTurnover * 0.01), '~1% of turnover.'),
      category: 'miscellaneous',
    },
  ];

  const revenueStreams: RevenueStream[] = [
    {
      name: 'Staples (rice, dal, oil, atta)',
      volumePerMonth: modelEstimate(Math.round(dailyFootfall * 30 * 0.5), '50% of transactions include staples.'),
      sellingPricePerUnit: modelEstimate(80, 'Average basket value for staples per transaction.'),
      costPricePerUnit: modelEstimate(Math.round(80 * (1 - avgMarginPercent)), 'Staples have thin margins 5–8%.'),
    },
    {
      name: 'Packaged FMCG (soap, biscuits, snacks)',
      volumePerMonth: modelEstimate(Math.round(dailyFootfall * 30 * 0.7), '70% of transactions include FMCG.'),
      sellingPricePerUnit: modelEstimate(30, 'Average FMCG item price.'),
      costPricePerUnit: modelEstimate(Math.round(30 * (1 - avgMarginPercent - 0.02)), 'FMCG margins 10–15%.'),
    },
    {
      name: 'Loose items & spices',
      volumePerMonth: modelEstimate(Math.round(dailyFootfall * 30 * 0.3), '30% of transactions.'),
      sellingPricePerUnit: modelEstimate(25, 'Small packets / loose items.'),
      costPricePerUnit: modelEstimate(Math.round(25 * 0.80), 'Loose spices carry 15–20% margin.'),
    },
  ];

  return {
    setupCosts,
    monthlyCosts,
    revenueStreams,
    workingCapitalNeeded: modelEstimate(
      Math.round(monthlyTurnover * 0.3),
      '~30% of monthly turnover as working capital for credit sales + restocking.',
    ),
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// 3. TAILORING
// ═══════════════════════════════════════════════════════════════════════════

const tailoringModel: BusinessModelTemplate = {
  id: 'tailoring-unit',
  name: 'Tailoring & Alterations Unit',
  category: 'Tailoring',
  description:
    'Custom stitching of blouses, salwar-kameez, kurtas, and school uniforms. Low setup cost, skill-based business ideal for women entrepreneurs.',
  timeToRevenueInDays: modelEstimate(5, 'Takes orders immediately; delivery in 2–5 days.'),
  seasonality: {
    monthlyMultipliers: [0.9, 0.9, 1, 1.1, 1.2, 0.8, 0.8, 1, 1, 1.3, 1.3, 1.1],
    notes: 'Peak around festivals (Diwali Oct-Nov, weddings Apr-May). Lean during monsoon.',
  },
  tags: ['tailoring', 'stitching', 'garments', 'women', 'skill-based'],
  ruralSuitabilityNotes:
    'Excellent for women entrepreneurs. Minimal space needed. Government subsidies available under PM Vishwakarma and state livelihood missions.',
  scenarios: {
    low: buildTailoringScenario(40, 200, 1),
    base: buildTailoringScenario(60, 250, 2),
    high: buildTailoringScenario(90, 300, 2),
  },
};

function buildTailoringScenario(
  ordersPerMonth: number,
  avgStitchingCharge: number,
  machines: number,
): BusinessScenario {
  const setupCosts: SetupCostItem[] = [
    {
      name: `Sewing machine(s) × ${machines}`,
      amount: modelEstimate(machines * 8000, '₹8,000 per domestic sewing machine (foot-pedal or motor).'),
      category: 'Equipment',
    },
    {
      name: 'Overlock / edge machine',
      amount: modelEstimate(machines > 1 ? 12000 : 0, 'Overlock machine for higher-volume unit.'),
      category: 'Equipment',
    },
    {
      name: 'Iron, scissors, measuring tools',
      amount: modelEstimate(2000, 'Electric iron, fabric scissors, tape, chalk.'),
      category: 'Equipment',
    },
    {
      name: 'Work table & seating',
      amount: modelEstimate(3000, 'Cutting table and chairs.'),
      category: 'Infrastructure',
    },
    {
      name: 'Initial thread & notions stock',
      amount: modelEstimate(2000, 'Threads, buttons, zippers, hooks, elastic.'),
      category: 'Inventory',
    },
  ];

  const monthlyCosts: MonthlyCostItem[] = [
    {
      name: 'Thread, buttons, notions',
      amount: modelEstimate(Math.round(ordersPerMonth * 15), '₹15 per garment average for notions.'),
      category: 'raw_materials',
    },
    {
      name: 'Electricity',
      amount: modelEstimate(400, 'Machine motor + iron.'),
      category: 'utilities',
    },
    {
      name: 'Rent (if separate shop)',
      amount: modelEstimate(1500, 'Small room in market area; may be home-based (₹0).'),
      category: 'rent',
    },
    {
      name: 'Helper wages',
      amount: modelEstimate(machines > 1 ? 4000 : 0, 'One helper for 2-machine setup.'),
      category: 'labor',
    },
    {
      name: 'Machine maintenance',
      amount: modelEstimate(200, 'Oiling, needle replacement, minor repairs.'),
      category: 'miscellaneous',
    },
  ];

  const revenueStreams: RevenueStream[] = [
    {
      name: 'Custom stitching (blouse, kameez, kurta)',
      volumePerMonth: modelEstimate(Math.round(ordersPerMonth * 0.7), '70% of orders are new stitching.'),
      sellingPricePerUnit: modelEstimate(avgStitchingCharge, `Avg ₹${avgStitchingCharge} per garment.`),
      costPricePerUnit: modelEstimate(Math.round(avgStitchingCharge * 0.2), 'Thread, notions ~20% of charge.'),
    },
    {
      name: 'Alterations & repairs',
      volumePerMonth: modelEstimate(Math.round(ordersPerMonth * 0.2), '20% of orders are alterations.'),
      sellingPricePerUnit: modelEstimate(Math.round(avgStitchingCharge * 0.4), 'Alterations ~40% of full stitching charge.'),
      costPricePerUnit: modelEstimate(10, 'Minimal material cost.'),
    },
    {
      name: 'School uniforms (bulk seasonal)',
      volumePerMonth: modelEstimate(Math.round(ordersPerMonth * 0.1), '10% of orders — seasonal bulk.'),
      sellingPricePerUnit: modelEstimate(Math.round(avgStitchingCharge * 0.8), 'Slight discount for bulk.'),
      costPricePerUnit: modelEstimate(Math.round(avgStitchingCharge * 0.25), 'Bulk fabric discount.'),
    },
  ];

  return {
    setupCosts,
    monthlyCosts,
    revenueStreams,
    workingCapitalNeeded: modelEstimate(5000, 'Low WC need — mostly cash-on-delivery business.'),
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// 4. POULTRY
// ═══════════════════════════════════════════════════════════════════════════

const poultryModel: BusinessModelTemplate = {
  id: 'poultry-layer',
  name: 'Poultry Farm (Layers — Egg Production)',
  category: 'Poultry',
  description:
    'Layer poultry farm producing eggs for local sale and nearby mandis. Scalable from 100 to 500+ birds. Steady daily revenue.',
  timeToRevenueInDays: modelEstimate(150, '20-week-old point-of-lay pullets start producing; if buying at 16 weeks, first eggs in ~30 days.'),
  seasonality: {
    monthlyMultipliers: [1, 1, 0.95, 0.9, 0.85, 0.85, 0.9, 0.95, 1, 1.1, 1.15, 1.1],
    notes: 'Egg prices drop in summer (lower demand); rise in winter and festive season.',
  },
  tags: ['poultry', 'eggs', 'layers', 'livestock', 'farm'],
  ruralSuitabilityNotes:
    'Suitable if space is available 500m+ from habitation. NABARD provides subsidies for poultry units under allied agriculture schemes.',
  scenarios: {
    low: buildPoultryScenario(100),
    base: buildPoultryScenario(200),
    high: buildPoultryScenario(500),
  },
};

function buildPoultryScenario(birds: number): BusinessScenario {
  const eggsPerDay = Math.round(birds * 0.75); // 75% laying rate
  const eggsPerMonth = eggsPerDay * 30;

  const setupCosts: SetupCostItem[] = [
    {
      name: `Layer shed (${birds} birds capacity)`,
      amount: modelEstimate(birds * 150, '₹150/bird capacity for deep-litter shed.'),
      category: 'Infrastructure',
    },
    {
      name: `Point-of-lay pullets × ${birds}`,
      amount: modelEstimate(birds * 350, '₹350/pullet at 16–18 weeks age.'),
      category: 'Livestock',
    },
    {
      name: 'Feeders & drinkers',
      amount: modelEstimate(Math.round(birds * 30), '₹30/bird for feeding & watering equipment.'),
      category: 'Equipment',
    },
    {
      name: 'Egg trays & storage',
      amount: modelEstimate(2000, 'Plastic egg trays and storage racks.'),
      category: 'Equipment',
    },
  ];

  const monthlyCosts: MonthlyCostItem[] = [
    {
      name: 'Layer feed',
      amount: modelEstimate(Math.round(birds * 110 * 0.12 * 30), `${birds} birds × 110g/day × ₹36/kg.`),
      category: 'raw_materials',
    },
    {
      name: 'Medicines & vaccines',
      amount: modelEstimate(Math.round(birds * 5), '₹5/bird/month for health programme.'),
      category: 'raw_materials',
    },
    {
      name: 'Labour',
      amount: modelEstimate(birds <= 200 ? 3000 : 6000, 'Part-time caretaker; full-time for 500+ birds.'),
      category: 'labor',
    },
    {
      name: 'Electricity & water',
      amount: modelEstimate(birds <= 200 ? 600 : 1200, 'Lighting, water pump.'),
      category: 'utilities',
    },
    {
      name: 'Litter material',
      amount: modelEstimate(Math.round(birds * 3), 'Rice husk / sawdust for bedding.'),
      category: 'raw_materials',
    },
    {
      name: 'Egg transport to market',
      amount: modelEstimate(birds <= 200 ? 1000 : 2500, 'Transport cost to nearby town.'),
      category: 'transport',
    },
  ];

  const pricePerEgg = 5.5;
  const revenueStreams: RevenueStream[] = [
    {
      name: 'Table egg sales',
      volumePerMonth: modelEstimate(eggsPerMonth, `${birds} birds × 75% laying rate × 30 days.`),
      sellingPricePerUnit: modelEstimate(pricePerEgg, '₹5.50/egg average farm-gate price.'),
      costPricePerUnit: modelEstimate(3.8, '₹3.80/egg production cost including feed.'),
    },
    {
      name: 'Spent hen sales (annual, amortised)',
      volumePerMonth: modelEstimate(Math.round(birds / 12), '1/12 of flock replaced monthly on average.'),
      sellingPricePerUnit: modelEstimate(250, '₹250 per spent hen.'),
      costPricePerUnit: modelEstimate(0, 'Salvage value — no incremental cost.'),
    },
  ];

  return {
    setupCosts,
    monthlyCosts,
    revenueStreams,
    workingCapitalNeeded: modelEstimate(
      Math.round(eggsPerMonth * pricePerEgg * 0.3),
      '~30% of monthly egg revenue as working capital.',
    ),
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// 5. MOBILE REPAIR
// ═══════════════════════════════════════════════════════════════════════════

const mobileRepairModel: BusinessModelTemplate = {
  id: 'mobile-repair',
  name: 'Mobile Phone Repair & Accessories Shop',
  category: 'Mobile Repair',
  description:
    'Repair cracked screens, replace batteries, fix software issues, and sell accessories (covers, chargers, earphones). High demand in rural India with rising smartphone penetration.',
  timeToRevenueInDays: modelEstimate(1, 'Revenue from day one if skills are in place.'),
  seasonality: {
    ...FLAT_SEASON,
    monthlyMultipliers: [1, 1, 1, 1, 1, 0.9, 0.9, 0.95, 1, 1.1, 1.1, 1.05],
    notes: 'Slight monsoon dip (water damage repairs increase but footfall drops). Festival season spike.',
  },
  tags: ['mobile', 'phone', 'repair', 'accessories', 'electronics', 'skill-based'],
  ruralSuitabilityNotes:
    'Excellent fit — 800M+ smartphone users in India. Rural areas lack authorized service centres, creating strong demand for local repair shops.',
  scenarios: {
    low: buildMobileRepairScenario(80, 200, 5000),
    base: buildMobileRepairScenario(120, 250, 10000),
    high: buildMobileRepairScenario(180, 300, 18000),
  },
};

function buildMobileRepairScenario(
  repairsPerMonth: number,
  avgRepairCharge: number,
  accessorySales: number,
): BusinessScenario {
  const setupCosts: SetupCostItem[] = [
    {
      name: 'Repair toolkit (screwdrivers, spudgers, heat gun)',
      amount: modelEstimate(5000, 'Professional mobile repair kit from Amazon / local electronics market.'),
      category: 'Equipment',
    },
    {
      name: 'Multimeter & soldering station',
      amount: modelEstimate(3000, 'Entry-level soldering station + digital multimeter.'),
      category: 'Equipment',
    },
    {
      name: 'UV LOCA glue & OCA machine (basic)',
      amount: modelEstimate(4000, 'For screen lamination.'),
      category: 'Equipment',
    },
    {
      name: 'Initial spare parts inventory',
      amount: modelEstimate(15000, 'Common screens, batteries, charging ports for popular models.'),
      category: 'Inventory',
    },
    {
      name: 'Accessories stock (covers, chargers, earphones)',
      amount: modelEstimate(10000, 'Initial accessory inventory.'),
      category: 'Inventory',
    },
    {
      name: 'Shop fitting & signboard',
      amount: modelEstimate(8000, 'Glass counter, display hooks, LED signboard.'),
      category: 'Renovation',
    },
  ];

  const monthlyCosts: MonthlyCostItem[] = [
    {
      name: 'Spare parts replenishment',
      amount: modelEstimate(Math.round(repairsPerMonth * 80), '₹80 avg parts cost per repair.'),
      category: 'inventory',
    },
    {
      name: 'Accessories restocking',
      amount: modelEstimate(Math.round(accessorySales * 0.55), '~55% cost of goods for accessories.'),
      category: 'inventory',
    },
    {
      name: 'Shop rent',
      amount: modelEstimate(3000, 'Small shop near bus stand / market.'),
      category: 'rent',
    },
    {
      name: 'Electricity',
      amount: modelEstimate(600, 'Lighting, fan, charging stations.'),
      category: 'utilities',
    },
    {
      name: 'Transport (parts procurement)',
      amount: modelEstimate(1000, 'Monthly trip to town for parts.'),
      category: 'transport',
    },
    {
      name: 'Helper / apprentice',
      amount: modelEstimate(repairsPerMonth > 150 ? 4000 : 0, 'Apprentice for high-volume shop.'),
      category: 'labor',
    },
  ];

  const revenueStreams: RevenueStream[] = [
    {
      name: 'Phone repairs (screen, battery, software)',
      volumePerMonth: modelEstimate(repairsPerMonth, `${repairsPerMonth} repairs/month.`),
      sellingPricePerUnit: modelEstimate(avgRepairCharge, `Avg ₹${avgRepairCharge} per repair.`),
      costPricePerUnit: modelEstimate(80, 'Parts cost per repair.'),
    },
    {
      name: 'Accessories sales (covers, chargers, earphones)',
      volumePerMonth: modelEstimate(Math.round(repairsPerMonth * 1.5), 'Walk-in accessory customers > repair count.'),
      sellingPricePerUnit: modelEstimate(Math.round(accessorySales / (repairsPerMonth * 1.5)), 'Avg accessory price.'),
      costPricePerUnit: modelEstimate(Math.round((accessorySales * 0.55) / (repairsPerMonth * 1.5)), '55% COGS.'),
    },
    {
      name: 'SIM / recharge / UPI setup services',
      volumePerMonth: modelEstimate(Math.round(repairsPerMonth * 0.3), '30% of repair customers also need SIM/recharge.'),
      sellingPricePerUnit: modelEstimate(20, 'Small service charge or commission.'),
      costPricePerUnit: modelEstimate(0, 'No material cost — pure service.'),
    },
  ];

  return {
    setupCosts,
    monthlyCosts,
    revenueStreams,
    workingCapitalNeeded: modelEstimate(
      Math.round((repairsPerMonth * avgRepairCharge + accessorySales) * 0.2),
      '~20% of monthly revenue as WC for parts inventory cycle.',
    ),
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// 6. AGRICULTURAL INPUTS
// ═══════════════════════════════════════════════════════════════════════════

const agriInputsModel: BusinessModelTemplate = {
  id: 'agri-inputs',
  name: 'Agricultural Inputs Store (Seeds, Fertilizers, Pesticides)',
  category: 'Agricultural Inputs',
  description:
    'Retail store selling seeds, fertilizers (DAP, urea, NPK), pesticides, farm tools, and drip irrigation supplies. Revenue is highly seasonal, peaking around sowing seasons.',
  timeToRevenueInDays: modelEstimate(5, 'Revenue starts with season if timed well.'),
  seasonality: {
    monthlyMultipliers: [0.6, 0.7, 0.8, 1, 1.4, 1.6, 1.5, 1.2, 1, 1.1, 0.8, 0.5],
    notes: 'Kharif prep (May-Jul) and Rabi prep (Oct-Nov) are peak seasons. Very lean in Dec-Feb.',
  },
  tags: ['agriculture', 'seeds', 'fertilizer', 'pesticide', 'farm-inputs'],
  ruralSuitabilityNotes:
    'Best in agricultural villages with irrigated land. Requires dealership / license for fertilizer & pesticide sales. Strong demand but seasonal cash flow.',
  scenarios: {
    low: buildAgriInputsScenario(80000, 0.08),
    base: buildAgriInputsScenario(150000, 0.10),
    high: buildAgriInputsScenario(250000, 0.12),
  },
};

function buildAgriInputsScenario(
  monthlyTurnover: number,
  avgMargin: number,
): BusinessScenario {
  const setupCosts: SetupCostItem[] = [
    {
      name: 'Shop setup (shelving, storage)',
      amount: modelEstimate(30000, 'Heavy-duty shelves for bags, locked pesticide cabinet.'),
      category: 'Renovation',
    },
    {
      name: 'Initial inventory (seeds, fertilizer, pesticides)',
      amount: modelEstimate(Math.round(monthlyTurnover * 0.5), '50% of monthly turnover as opening stock.'),
      category: 'Inventory',
    },
    {
      name: 'Fertilizer dealer licence',
      amount: officialData(5000, 'State fertilizer dealer licence fee — varies by state.'),
      category: 'Licensing',
    },
    {
      name: 'Pesticide dealer licence',
      amount: officialData(3000, 'Insecticide Act licence — state-level fee.'),
      category: 'Licensing',
    },
    {
      name: 'Weighing scale (100 kg)',
      amount: modelEstimate(5000, 'Platform scale for fertilizer bags.'),
      category: 'Equipment',
    },
  ];

  const monthlyCosts: MonthlyCostItem[] = [
    {
      name: 'Inventory replenishment',
      amount: modelEstimate(Math.round(monthlyTurnover * (1 - avgMargin)), 'COGS.'),
      category: 'inventory',
    },
    {
      name: 'Shop rent',
      amount: modelEstimate(4000, 'Larger shop needed for storage — 200–300 sq ft.'),
      category: 'rent',
    },
    {
      name: 'Labour (loading/unloading)',
      amount: modelEstimate(3000, 'Helper for heavy bags.'),
      category: 'labor',
    },
    {
      name: 'Transport (stock from distributor)',
      amount: modelEstimate(2500, 'Freight for fertilizer bags from district warehouse.'),
      category: 'transport',
    },
    {
      name: 'Electricity',
      amount: modelEstimate(500, 'Lighting, fan.'),
      category: 'utilities',
    },
  ];

  const revenueStreams: RevenueStream[] = [
    {
      name: 'Fertilizers (urea, DAP, NPK)',
      volumePerMonth: modelEstimate(Math.round(monthlyTurnover * 0.5 / 300), '50% of turnover; avg bag ₹300.'),
      sellingPricePerUnit: modelEstimate(300, 'Average bag price (MRP controlled for urea).'),
      costPricePerUnit: modelEstimate(Math.round(300 * (1 - avgMargin)), 'Thin controlled margins on urea.'),
    },
    {
      name: 'Seeds',
      volumePerMonth: modelEstimate(Math.round(monthlyTurnover * 0.25 / 200), '25% of turnover.'),
      sellingPricePerUnit: modelEstimate(200, 'Average seed packet / kg price.'),
      costPricePerUnit: modelEstimate(Math.round(200 * (1 - avgMargin - 0.05)), 'Seeds carry slightly better margins.'),
    },
    {
      name: 'Pesticides & crop protection',
      volumePerMonth: modelEstimate(Math.round(monthlyTurnover * 0.2 / 500), '20% of turnover.'),
      sellingPricePerUnit: modelEstimate(500, 'Average pesticide bottle / packet.'),
      costPricePerUnit: modelEstimate(Math.round(500 * (1 - avgMargin - 0.05)), '10–15% margin on pesticides.'),
    },
    {
      name: 'Farm tools & accessories',
      volumePerMonth: modelEstimate(Math.round(monthlyTurnover * 0.05 / 150), '5% of turnover.'),
      sellingPricePerUnit: modelEstimate(150, 'Sprayer nozzles, sickles, ropes.'),
      costPricePerUnit: modelEstimate(Math.round(150 * 0.75), '~25% margin on tools.'),
    },
  ];

  return {
    setupCosts,
    monthlyCosts,
    revenueStreams,
    workingCapitalNeeded: modelEstimate(
      Math.round(monthlyTurnover * 0.4),
      '~40% of turnover — high WC due to seasonal buildup and farmer credit.',
    ),
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// 7. FOOD PROCESSING
// ═══════════════════════════════════════════════════════════════════════════

const foodProcessingModel: BusinessModelTemplate = {
  id: 'food-processing',
  name: 'Small Food Processing Unit (Pickles, Papad, Spice Grinding)',
  category: 'Food Processing',
  description:
    'Cottage-scale food processing — making pickles, papads, masala powders, snacks (murukku, mixture). Can sell locally and in nearby town markets.',
  timeToRevenueInDays: modelEstimate(14, 'Product preparation takes 1–2 weeks before first sale.'),
  seasonality: {
    monthlyMultipliers: [0.9, 0.9, 1.1, 1.2, 1.3, 0.8, 0.8, 0.9, 1, 1.1, 1.2, 1.1],
    notes: 'Pickle season peaks in summer (mango, lemon). Festival season (Oct-Nov) boosts snack sales.',
  },
  tags: ['food-processing', 'pickle', 'papad', 'masala', 'cottage-industry', 'women'],
  ruralSuitabilityNotes:
    'Excellent for women SHGs. Government support available under PMFME (PM Formalisation of Micro Food Processing Enterprises). Low-tech, leverages local produce.',
  scenarios: {
    low: buildFoodProcessingScenario(200, 80, 50),
    base: buildFoodProcessingScenario(400, 100, 80),
    high: buildFoodProcessingScenario(700, 120, 120),
  },
};

function buildFoodProcessingScenario(
  kgPerMonth: number,
  avgSellingPricePerKg: number,
  avgCostPerKg: number,
): BusinessScenario {
  const setupCosts: SetupCostItem[] = [
    {
      name: 'Grinding machine (dry masala grinder)',
      amount: modelEstimate(15000, '5 HP commercial grinder.'),
      category: 'Equipment',
    },
    {
      name: 'Sealing & packaging machine',
      amount: modelEstimate(5000, 'Hand sealer + weighing scale.'),
      category: 'Equipment',
    },
    {
      name: 'Vessels, containers, cutting tools',
      amount: modelEstimate(8000, 'Stainless steel vessels, knives, mixing bowls.'),
      category: 'Equipment',
    },
    {
      name: 'FSSAI registration',
      amount: officialData(2000, 'FSSAI state licence for manufacturing.'),
      category: 'Licensing',
    },
    {
      name: 'Packaging material (initial stock)',
      amount: modelEstimate(3000, 'Pouches, labels, jars for first batch.'),
      category: 'Inventory',
    },
    {
      name: 'Work area setup',
      amount: modelEstimate(10000, 'Tiling, exhaust fan, handwash, storage racks.'),
      category: 'Renovation',
    },
  ];

  const monthlyCosts: MonthlyCostItem[] = [
    {
      name: 'Raw materials (vegetables, spices, oil)',
      amount: modelEstimate(Math.round(kgPerMonth * avgCostPerKg * 0.6), '60% of COGS is raw materials.'),
      category: 'raw_materials',
    },
    {
      name: 'Packaging materials',
      amount: modelEstimate(Math.round(kgPerMonth * 5), '₹5/kg for pouches / jars / labels.'),
      category: 'raw_materials',
    },
    {
      name: 'Labour (helpers)',
      amount: modelEstimate(kgPerMonth > 400 ? 6000 : 3000, '1–2 helpers for cutting, mixing, packing.'),
      category: 'labor',
    },
    {
      name: 'Electricity (grinder, sealer)',
      amount: modelEstimate(800, 'Grinder motor consumption.'),
      category: 'utilities',
    },
    {
      name: 'Transport to markets',
      amount: modelEstimate(1500, 'Delivery to town shops, weekly markets.'),
      category: 'transport',
    },
    {
      name: 'Rent (if separate unit)',
      amount: modelEstimate(2000, 'May be home-based (₹0).'),
      category: 'rent',
    },
  ];

  const revenueStreams: RevenueStream[] = [
    {
      name: 'Pickles (mango, lemon, mixed)',
      volumePerMonth: modelEstimate(Math.round(kgPerMonth * 0.4), '40% of production is pickles.'),
      sellingPricePerUnit: modelEstimate(Math.round(avgSellingPricePerKg * 1.1), 'Pickles sell at slight premium.'),
      costPricePerUnit: modelEstimate(avgCostPerKg, 'Raw material + packaging.'),
    },
    {
      name: 'Masala powders (chilli, turmeric, sambar)',
      volumePerMonth: modelEstimate(Math.round(kgPerMonth * 0.35), '35% of production.'),
      sellingPricePerUnit: modelEstimate(avgSellingPricePerKg, 'Standard pricing per kg.'),
      costPricePerUnit: modelEstimate(Math.round(avgCostPerKg * 0.9), 'Slightly lower cost for dry grinding.'),
    },
    {
      name: 'Papad & snacks',
      volumePerMonth: modelEstimate(Math.round(kgPerMonth * 0.25), '25% of production.'),
      sellingPricePerUnit: modelEstimate(Math.round(avgSellingPricePerKg * 1.2), 'Snacks carry higher margin.'),
      costPricePerUnit: modelEstimate(Math.round(avgCostPerKg * 0.8), 'Lower raw material cost for papad.'),
    },
  ];

  return {
    setupCosts,
    monthlyCosts,
    revenueStreams,
    workingCapitalNeeded: modelEstimate(
      Math.round(kgPerMonth * avgSellingPricePerKg * 0.25),
      '~25% of monthly revenue — raw material procurement cycle.',
    ),
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// 8. LOCAL SERVICES
// ═══════════════════════════════════════════════════════════════════════════

const localServicesModel: BusinessModelTemplate = {
  id: 'local-services',
  name: 'Multi-Service Point (Xerox, Printing, CSC, Banking Correspondent)',
  category: 'Local Services',
  description:
    'Common Service Centre (CSC) type setup offering photocopying, printing, lamination, Aadhaar services, banking correspondent services, bill payments, and government form filling.',
  timeToRevenueInDays: modelEstimate(7, 'After setup and CSC / BC registration.'),
  seasonality: {
    monthlyMultipliers: [1.1, 1, 0.95, 1, 1, 0.9, 0.9, 1, 1, 1, 1.1, 1.1],
    notes: 'Peaks around admission season (Jan, Nov-Dec). Slight dip during monsoon fieldwork.',
  },
  tags: ['services', 'xerox', 'CSC', 'banking', 'digital', 'government'],
  ruralSuitabilityNotes:
    'Strong fit for villages 5+ km from a town. Government CSC scheme provides infrastructure support. Banking correspondent (BC) adds steady commission income.',
  scenarios: {
    low: buildLocalServicesScenario(15, 800),
    base: buildLocalServicesScenario(25, 1200),
    high: buildLocalServicesScenario(40, 2000),
  },
};

function buildLocalServicesScenario(
  customersPerDay: number,
  bcTransactionsPerMonth: number,
): BusinessScenario {
  const setupCosts: SetupCostItem[] = [
    {
      name: 'Computer / laptop',
      amount: modelEstimate(25000, 'Basic desktop with monitor.'),
      category: 'Equipment',
    },
    {
      name: 'Printer (multifunction — print, scan, copy)',
      amount: modelEstimate(12000, 'Inkjet MFP with low running cost.'),
      category: 'Equipment',
    },
    {
      name: 'Lamination machine',
      amount: modelEstimate(3000, 'A4 hot laminator.'),
      category: 'Equipment',
    },
    {
      name: 'Biometric device (Aadhaar/BC)',
      amount: modelEstimate(5000, 'UIDAI-certified fingerprint scanner.'),
      category: 'Equipment',
    },
    {
      name: 'Inverter / UPS',
      amount: modelEstimate(8000, 'For power backup in rural areas.'),
      category: 'Equipment',
    },
    {
      name: 'Furniture (desk, chair, customer bench)',
      amount: modelEstimate(5000, 'Basic office furniture.'),
      category: 'Infrastructure',
    },
    {
      name: 'Internet connection setup',
      amount: modelEstimate(2000, 'Router + first month broadband / 4G dongle.'),
      category: 'Equipment',
    },
    {
      name: 'CSC registration fee',
      amount: officialData(0, 'CSC VLE registration is free; only documentation needed.'),
      category: 'Licensing',
    },
  ];

  const monthlyCosts: MonthlyCostItem[] = [
    {
      name: 'Internet / data plan',
      amount: modelEstimate(700, 'Broadband / unlimited 4G plan.'),
      category: 'utilities',
    },
    {
      name: 'Printer consumables (ink, paper)',
      amount: modelEstimate(Math.round(customersPerDay * 30 * 3), '₹3 per customer for consumables.'),
      category: 'raw_materials',
    },
    {
      name: 'Electricity',
      amount: modelEstimate(800, 'Computer, printer, fan, lights.'),
      category: 'utilities',
    },
    {
      name: 'Shop rent',
      amount: modelEstimate(2500, 'Small shop near panchayat office or bus stand.'),
      category: 'rent',
    },
    {
      name: 'Stationery (lamination pouches, folders)',
      amount: modelEstimate(500, 'Lamination sheets, binding materials.'),
      category: 'raw_materials',
    },
  ];

  const revenueStreams: RevenueStream[] = [
    {
      name: 'Xerox / printing / scanning',
      volumePerMonth: modelEstimate(customersPerDay * 30, `${customersPerDay} customers/day × 30 days.`),
      sellingPricePerUnit: modelEstimate(15, 'Avg ₹15/customer for copies & prints.'),
      costPricePerUnit: modelEstimate(3, 'Paper + ink cost.'),
    },
    {
      name: 'Government form filling & applications',
      volumePerMonth: modelEstimate(Math.round(customersPerDay * 30 * 0.2), '20% of customers need form filling.'),
      sellingPricePerUnit: modelEstimate(50, '₹30–100 per application (caste cert, income cert, etc.).'),
      costPricePerUnit: modelEstimate(5, 'Paper + print cost.'),
    },
    {
      name: 'Banking correspondent commissions',
      volumePerMonth: modelEstimate(bcTransactionsPerMonth, 'Monthly BC transactions.'),
      sellingPricePerUnit: modelEstimate(8, '₹5–15 commission per transaction (deposits, withdrawals, transfers).'),
      costPricePerUnit: modelEstimate(0, 'No material cost.'),
    },
    {
      name: 'Aadhaar & other biometric services',
      volumePerMonth: modelEstimate(Math.round(customersPerDay * 30 * 0.1), '10% need Aadhaar update / enrollment.'),
      sellingPricePerUnit: modelEstimate(30, '₹30 per Aadhaar service.'),
      costPricePerUnit: modelEstimate(2, 'Minimal print cost.'),
    },
  ];

  return {
    setupCosts,
    monthlyCosts,
    revenueStreams,
    workingCapitalNeeded: modelEstimate(
      10000,
      'Low WC — mostly cash-and-carry; some float needed for BC cash management.',
    ),
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════════════════

/** All available business model templates, keyed by ID. */
export const BUSINESS_MODELS: Record<string, BusinessModelTemplate> = {
  [dairyModel.id]: dairyModel,
  [groceryModel.id]: groceryModel,
  [tailoringModel.id]: tailoringModel,
  [poultryModel.id]: poultryModel,
  [mobileRepairModel.id]: mobileRepairModel,
  [agriInputsModel.id]: agriInputsModel,
  [foodProcessingModel.id]: foodProcessingModel,
  [localServicesModel.id]: localServicesModel,
};

/** Ordered list of all business models for UI display. */
export const BUSINESS_MODEL_LIST: BusinessModelTemplate[] = [
  dairyModel,
  groceryModel,
  tailoringModel,
  poultryModel,
  mobileRepairModel,
  agriInputsModel,
  foodProcessingModel,
  localServicesModel,
];

/** All categories for filtering. */
export const BUSINESS_CATEGORIES: BusinessCategory[] = [
  'Dairy',
  'Grocery / Kirana',
  'Tailoring',
  'Poultry',
  'Mobile Repair',
  'Agricultural Inputs',
  'Food Processing',
  'Local Services',
];

/**
 * Compute derived totals (revenue, cost, profit) for a scenario.
 * Mutates the scenario in place for convenience and returns it.
 */
export function computeScenarioTotals(scenario: BusinessScenario): BusinessScenario {
  scenario.totalMonthlyCost = scenario.monthlyCosts.reduce(
    (sum, c) => sum + c.amount.value,
    0,
  );

  scenario.totalMonthlyRevenue = scenario.revenueStreams.reduce(
    (sum, r) => sum + r.volumePerMonth.value * r.sellingPricePerUnit.value,
    0,
  );

  scenario.netMonthlyProfit =
    scenario.totalMonthlyRevenue - scenario.totalMonthlyCost;

  // Also compute gross margin on each stream
  for (const rs of scenario.revenueStreams) {
    if (rs.sellingPricePerUnit.value > 0) {
      rs.grossMarginPercent = Math.round(
        ((rs.sellingPricePerUnit.value - rs.costPricePerUnit.value) /
          rs.sellingPricePerUnit.value) *
          100,
      );
    }
  }

  return scenario;
}

/**
 * Return total one-time setup cost for a scenario.
 */
export function totalSetupCost(scenario: BusinessScenario): number {
  return scenario.setupCosts.reduce((sum, c) => sum + c.amount.value, 0);
}
