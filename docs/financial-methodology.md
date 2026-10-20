# GramVenture AI — Financial Calculation Methodology

**Target Geography:** Rural and Semi-Urban Tamil Nadu, India  
**Standard Notation:** Indian Numbering System (`₹1,40,000`, `₹10,00,000`, `₹45,00,000`)  
**Core Principles:** 100% Deterministic Arithmetic • Zero LLM Intervention in Numbers • Safe Debt Sizing  

---

## 1. Concessional Scheme Architecture

GramVenture AI implements the following concessional loan scheme parameters derived from rural micro-lending specifications:

| Parameter | Micro Finance Scheme | Term Loan Scheme |
| :--- | :--- | :--- |
| **Project Cost Eligibility** | ₹1 to ₹1,40,000 | ₹1,40,001 to ₹50,00,000 |
| **Max Permitted Funding** | 90% of Project Cost | 90% of Project Cost |
| **Statutory Loan Cap** | ₹1,25,000 | ₹45,00,000 |
| **Annual Interest Rate** | 6.5% p.a. (Fixed nominal) | 8.0% p.a. (Fixed nominal) |
| **Repayment Basis** | Reducing Balance Amortization | Reducing Balance Amortization |
| **Tenure** | 36 Months (3 Years) | 84 Months (7 Years) |
| **Moratorium Period** | 3 Months | 6 Months |
| **Default Frequency** | Quarterly (with Monthly Equivalent) | Quarterly (with Monthly Equivalent) |
| **Moratorium Interest** | Capitalised into Principal | Capitalised into Principal |

---

## 2. Step-by-Step Calculation Engine

### 2.1 Project Sizing from Margin Capital
Rural entrepreneurs typically know how much money they have saved, rather than the total project cost. The engine sizes the theoretical project by applying the standard **10% promoter equity requirement**:

$$\text{Theoretical Project Cost} = \frac{\text{Available Margin Capital}}{0.10}$$

$$\text{Theoretical Loan Amount} = \text{Theoretical Project Cost} \times 0.90$$

*Example:*  
An entrepreneur with ₹1,00,000 savings sizes at:
$$\text{Project Cost} = \frac{1,00,000}{0.10} = ₹10,00,000$$
$$\text{Theoretical Loan} = 10,00,000 \times 0.90 = ₹9,00,000$$

### 2.2 Boundary Routing & Statutory Cap Binding
1. **Routing:**
   - If $\text{Project Cost} \le ₹1,40,000 \implies$ **Micro Finance Scheme**
   - If $₹1,40,000 < \text{Project Cost} \le ₹50,00,000 \implies$ **Term Loan Scheme**
   - If $\text{Project Cost} > ₹50,00,000 \implies$ **Rejection (`SchemeLimitExceededError`)**
2. **Cap Enforcement:**
   $$\text{Sanctioned Loan} = \min(\text{Project Cost} \times 0.90, \text{Scheme Max Loan Amount})$$
3. **True Required Promoter Equity:**
   $$\text{Required Contribution} = \text{Project Cost} - \text{Sanctioned Loan}$$
   *Critical Edge Case:* At ₹1,40,000 project cost under Micro Finance:
   $1,40,000 \times 0.90 = ₹1,26,000$. Since the scheme cap is ₹1,25,000, the sanctioned loan is capped at ₹1,25,000. The entrepreneur must contribute $1,40,000 - 1,25,000 = ₹15,000$ (10.71% equity). The engine automatically enforces this and rejects the proposal if the borrower only has ₹14,000.

### 2.3 Reducing Balance Amortization Formula
During the active repayment phase, the periodic instalment $A$ is calculated using the standard annuity formula:

$$A = P \times \frac{r(1+r)^n}{(1+r)^n - 1}$$

Where:
- $P$ = Outstanding loan principal at the start of repayment (including capitalised moratorium interest)
- $r$ = Periodic interest rate ($\frac{\text{Annual Rate}}{m}$, where $m=4$ for quarterly or $m=12$ for monthly)
- $n$ = Number of active repayment periods ($\text{Total Periods} - \text{Moratorium Periods}$)

For each period $t$:
$$\text{Interest Component}_t = \text{Opening Balance}_t \times r$$
$$\text{Principal Component}_t = A - \text{Interest Component}_t$$
$$\text{Closing Balance}_t = \text{Opening Balance}_t - \text{Principal Component}_t$$

### 2.4 Debt Service Coverage Ratio (DSCR) & Cash Flow Cushion
$$\text{Cash Available for Debt Service (CADS)} = \text{Monthly Revenue} - \text{Operating Expenses} - \text{Household Living Costs}$$

$$\text{DSCR} = \frac{\text{CADS}}{\text{Scheduled Monthly Debt Obligation (EMI)}}$$

- **$\text{DSCR} \ge 1.25$:** Safe / Adequate Buffer. Enterprise easily covers debt service while sustaining household livelihood.
- **$1.0 \le \text{DSCR} < 1.25$:** Tight / Vulnerable. Vulnerable to seasonal shocks or price inflation.
- **$\text{DSCR} < 1.0$:** Cash Flow Deficit. Operating cash flow is insufficient to service debt. Requires mandatory project downsizing or capital restructuring.

---

## 3. Boundary & Verification Test Suite

All financial logic is verified with 63 automated tests covering:
- Exact boundaries: ₹1, ₹14,000, ₹1,40,000, ₹1,40,001, ₹50,00,000, ₹50,00,001.
- Exact quarterly amortization with capitalised moratorium.
- Zero interest rate handling ($A = P / n$ to prevent division by zero).
- Negative margin, cost, or interest rate rejection.
- Zero debt handling ($\text{DSCR} = \infty$ without runtime error).
