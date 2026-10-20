# GramVenture AI — System Architecture & Trust Framework

**Problem Statement ID: 26091**  
**Classification:** GovFinTech / Rural Financial Decision Support

---

## 1. Architectural Philosophy: The Zero-Math-Hallucination Mandate

Standard Generative AI applications fail critically in rural micro-lending because Large Language Models (LLMs) are probabilistic and prone to arithmetic hallucinations. In rural debt structuring, an erroneous 1% interest amortization calculation or an unmodeled debt service coverage ratio (DSCR) can lead directly to household insolvency.

**GramVenture AI enforces strict architectural separation:**
1. **Deterministic Financial Engine:** 100% written in strongly-typed TypeScript. Sizing, statutory caps, reducing-balance amortizations, and DSCR stress testing run exclusively through deterministic mathematical algorithms with zero LLM intervention.
2. **Deterministic Business Scoring Engine:** Evaluates business viability via 5 weighted components (Affordability 30%, Local Evidence 25%, Competitive Positioning 20%, Operational Risk 15%, Capital Fit 10%) with full formula inspection.
3. **Evidence Classification Engine:** Stamps every metric with provenance tags (*Official Data, Verified Local Observation, User-Provided Input, Model Estimate, Missing Data*) and computes an *Evidence Coverage Score* (NOT a probability of success).
4. **Context-Grounded Vernacular AI Advisor:** Dual-mode assistant (Live Gemini API with automatic fallback to a deterministic rule-based engine) that interprets financial outputs in plain English and Telugu without the authority to alter numbers.

```
┌────────────────────────────────────────────────────────────────────────┐
│                          PRESENTATION LAYER                            │
│           React 19 + TypeScript + Vite + Tailwind CSS + Recharts       │
│           Bilingual Interface: English & Telugu (తెలుగు)               │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ Reads Reactive State
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                        ZUSTAND CLIENT STORE                            │
│           Persistent LocalStorage • Instant 1-Click Rampur Preset      │
└───────────┬───────────────────────┬────────────────────────┬───────────┘
            │                       │                        │
            ▼                       ▼                        ▼
┌───────────────────────┐ ┌───────────────────┐ ┌────────────────────────┐
│   FINANCIAL ENGINE    │ │  SCORING ENGINE   │ │    EVIDENCE ENGINE     │
│  - Micro Finance Cap  │ │  - 8 Rural Trades │ │  - Provenance Badges   │
│  - Term Loan Cap      │ │  - 5-Pillar Weight│ │  - Coverage % Formula  │
│  - Reducing Amortize  │ │  - Low/Base/High  │ │  - Missing Data Flags  │
│  - DSCR Shock Engine  │ │  - Dynamic SWOT   │ │  - Source Freshness    │
└───────────────────────┘ └───────────────────┘ └────────────────────────┘
            │                       │                        │
            └───────────────────────┼────────────────────────┘
                                    │ Serialized Read-Only Context
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                       GROUNDED ADVISORY SERVICE                        │
│   • Mode 1: Live Gemini 1.5 Flash API (when key present in env)        │
│   • Mode 2: Deterministic Rule-Based Fallback Engine (Zero-API mode)   │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Financial Engineering Specifications

### 2.1 Scheme Routing Logic
The engine implements the two concessional loan schemes specified in Problem Statement 26091:

| Scheme | Project Cost Range | Funding Cap | Maximum Loan | Annual Rate | Tenure | Moratorium |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Micro Finance** | Up to ₹1,40,000 | 90% | ₹1,25,000 | 6.5% p.a. | 36 Months | 3 Months |
| **Term Loan** | ₹1,40,001 to ₹50,00,000 | 90% | ₹45,00,000 | 8.0% p.a. | 84 Months | 6 Months |

### 2.2 Boundary Handling & Cap Recalculation
- **Project Cost = ₹1,40,000 (Exact):** Routes to Micro Finance. Max loan = min(₹1,40,000 × 0.90, ₹1,25,000) = ₹1,25,000. Required contribution = ₹1,40,000 − ₹1,25,000 = ₹15,000 (10.71%).
- **Project Cost = ₹1,40,001:** Routes to Term Loan. Max loan = ₹1,40,001 × 0.90 = ₹1,26,000. Required contribution = ₹14,001 (10.00%).
- **Project Cost > ₹50,00,000:** Throws explicit out-of-bounds error explaining that no configured scheme supports projects above ₹50 Lakhs.

### 2.3 Reducing-Balance Amortization Formula
$$\text{Periodic Payment} = P \times \frac{r(1+r)^n}{(1+r)^n - 1}$$
Where:
- $P$ = Outstanding Principal after Moratorium Interest Capitalization
- $r$ = Periodic Interest Rate ($\frac{\text{Annual Rate}}{\text{Frequency}}$)
- $n$ = Number of Active Repayment Instalments ($\text{Tenure} - \text{Moratorium}$)

*Zero-Rate Special Handling:* If $r = 0$, $\text{Payment} = \frac{P}{n}$ to avoid division by zero.

---

## 3. Debt Service Coverage Ratio (DSCR) & Resizing Algorithm

$$\text{DSCR} = \frac{\text{Net Cash Available for Debt Service (CADS)}}{\text{Scheduled Debt Payments (Instalment)}}$$
$$\text{CADS} = \text{Revenue} - \text{OpEx} - \text{Household Living} - \text{Existing Debt}$$

**Screening Thresholds:**
- **DSCR > 1.25:** Prudent Institutional Coverage Buffer.
- **1.0 ≤ DSCR ≤ 1.25:** Thin Buffer; vulnerable to seasonal slowdown.
- **DSCR < 1.0:** Cash-Flow Deficit; borrower will face default without external subsidy or informal debt.

**Resizing Calculation:**
$$\text{Max Safe Instalment} = \frac{\text{Stressed CADS}}{1.25}$$
$$\text{Recommended Loan} = \text{PV}(\text{Rate}, \text{Tenure}, \text{Max Safe Instalment})$$
This mathematically guarantees that the recommended resized project maintains DSCR ≥ 1.25 even under adverse market stress.
