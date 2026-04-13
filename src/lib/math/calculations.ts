/**
 * Pure financial math functions.
 * All calculations are accurate and deterministic.
 */

import { TAX_BRACKETS, STANDARD_DEDUCTION } from '$lib/data/taxBrackets';
import type { FilingStatus } from '$lib/data/taxBrackets';

// ─────────────────────────────────────────────
// Compound Interest
// ─────────────────────────────────────────────

export type CompoundInterestInput = {
	principal: number;
	monthlyContribution: number;
	annualRate: number; // as a percentage, e.g. 8 for 8%
	years: number;
};

export type YearlySnapshot = {
	year: number;
	balance: number;
	contributed: number;
	interest: number;
};

export type CompoundInterestResult = {
	yearlyBalances: YearlySnapshot[];
	finalBalance: number;
	totalContributed: number;
	totalInterest: number;
};

/**
 * Compound interest with optional monthly contributions.
 * Uses standard compound interest formula: A = P(1 + r/n)^(nt) + PMT * [((1 + r/n)^(nt) - 1) / (r/n)]
 * where n = 12 (monthly compounding).
 */
export function compoundInterest(input: CompoundInterestInput): CompoundInterestResult {
	const { principal, monthlyContribution, annualRate, years } = input;
	const monthlyRate = annualRate / 100 / 12;
	const yearlyBalances: YearlySnapshot[] = [];

	let balance = principal;
	let totalContributed = principal;

	for (let year = 0; year <= years; year++) {
		if (year === 0) {
			yearlyBalances.push({
				year: 0,
				balance: principal,
				contributed: principal,
				interest: 0,
			});
			continue;
		}

		// Compound for 12 months
		for (let month = 0; month < 12; month++) {
			balance = balance * (1 + monthlyRate) + monthlyContribution;
			totalContributed += monthlyContribution;
		}

		const interest = balance - totalContributed;
		yearlyBalances.push({ year, balance, contributed: totalContributed, interest });
	}

	const last = yearlyBalances[yearlyBalances.length - 1];
	return {
		yearlyBalances,
		finalBalance: last.balance,
		totalContributed: last.contributed,
		totalInterest: last.interest,
	};
}

// ─────────────────────────────────────────────
// Debt Payoff (Avalanche & Snowball)
// ─────────────────────────────────────────────

export type Debt = {
	id: string;
	name: string;
	balance: number;
	apr: number; // as a percentage
	minimumPayment: number;
};

export type DebtStrategy = 'avalanche' | 'snowball';

export type DebtPayoffInput = {
	debts: Debt[];
	extraPayment: number;
	strategy: DebtStrategy;
};

export type MonthlyDebtSnapshot = {
	month: number;
	balancesByDebt: Record<string, number>;
	totalBalance: number;
};

export type DebtPayoffResult = {
	monthsToPayoff: number;
	totalInterest: number;
	payoffDate: Date;
	schedule: MonthlyDebtSnapshot[];
};

/**
 * Compute debt payoff schedule using either avalanche (highest APR first)
 * or snowball (smallest balance first) strategy.
 */
export function debtPayoff(input: DebtPayoffInput): DebtPayoffResult {
	const { extraPayment, strategy } = input;

	// Deep-copy debts so we don't mutate input
	let debts = input.debts.map((d) => ({ ...d })).filter((d) => d.balance > 0);

	if (debts.length === 0) {
		return {
			monthsToPayoff: 0,
			totalInterest: 0,
			payoffDate: new Date(),
			schedule: [],
		};
	}

	const schedule: MonthlyDebtSnapshot[] = [];
	let totalInterest = 0;
	let month = 0;
	const MAX_MONTHS = 600; // 50 years safety cap

	while (debts.some((d) => d.balance > 0) && month < MAX_MONTHS) {
		month++;

		// Sort by strategy
		const sorted = [...debts].sort((a, b) => {
			if (strategy === 'avalanche') return b.apr - a.apr;
			return a.balance - b.balance;
		});

		// Collect minimum payments
		let remainingExtra = extraPayment;
		for (const debt of debts) {
			if (debt.balance <= 0) continue;
			const monthlyRate = debt.apr / 100 / 12;
			const interest = debt.balance * monthlyRate;
			totalInterest += interest;
			debt.balance += interest;

			const minPay = Math.min(debt.minimumPayment, debt.balance);
			debt.balance -= minPay;
			if (debt.balance < 0) debt.balance = 0;
		}

		// Apply extra payment to priority debt
		for (const sortedDebt of sorted) {
			if (remainingExtra <= 0) break;
			const debt = debts.find((d) => d.id === sortedDebt.id);
			if (!debt || debt.balance <= 0) continue;
			const payment = Math.min(remainingExtra, debt.balance);
			debt.balance -= payment;
			remainingExtra -= payment;
		}

		// Freed-up minimum payments roll into extra (snowball/avalanche effect)
		const freedMinimums = debts
			.filter((d) => d.balance === 0)
			.reduce((sum, d) => sum + d.minimumPayment, 0);

		if (freedMinimums > 0) {
			// Apply freed minimums to priority debt
			for (const sortedDebt of sorted) {
				if (freedMinimums <= 0) break;
				const debt = debts.find((d) => d.id === sortedDebt.id);
				if (!debt || debt.balance <= 0) continue;
				const payment = Math.min(freedMinimums, debt.balance);
				debt.balance -= payment;
			}
		}

		const snapshot: MonthlyDebtSnapshot = {
			month,
			balancesByDebt: {},
			totalBalance: 0,
		};
		for (const d of debts) {
			snapshot.balancesByDebt[d.id] = Math.max(0, d.balance);
			snapshot.totalBalance += Math.max(0, d.balance);
		}
		schedule.push(snapshot);
	}

	const payoffDate = new Date();
	payoffDate.setMonth(payoffDate.getMonth() + month);

	return {
		monthsToPayoff: month,
		totalInterest,
		payoffDate,
		schedule,
	};
}

// ─────────────────────────────────────────────
// Federal Tax Calculation (2024)
// ─────────────────────────────────────────────

export type FederalTaxInput = {
	income: number;
	filingStatus: FilingStatus;
};

export type BracketBreakdown = {
	rate: number;
	amountInBracket: number;
	taxFromBracket: number;
	min: number;
	max: number;
};

export type FederalTaxResult = {
	totalTax: number;
	effectiveRate: number;
	marginalRate: number;
	bracketBreakdown: BracketBreakdown[];
	takeHome: number;
	taxableIncome: number;
	grossIncome: number;
	standardDeduction: number;
};

/**
 * Calculate 2024 US federal income tax (progressive brackets).
 * Applies standard deduction before calculating tax.
 * This is educational — does not include FICA, state tax, credits, etc.
 */
export function federalTax(input: FederalTaxInput): FederalTaxResult {
	const { income, filingStatus } = input;
	const brackets = TAX_BRACKETS[filingStatus];
	const standardDeduction = STANDARD_DEDUCTION[filingStatus];

	const taxableIncome = Math.max(0, income - standardDeduction);
	let totalTax = 0;
	let marginalRate = 0;
	const bracketBreakdown: BracketBreakdown[] = [];

	for (const bracket of brackets) {
		if (taxableIncome <= bracket.min) break;

		const amountInBracket = Math.min(taxableIncome, bracket.max) - bracket.min;
		const taxFromBracket = amountInBracket * bracket.rate;

		bracketBreakdown.push({
			rate: bracket.rate,
			amountInBracket,
			taxFromBracket,
			min: bracket.min,
			max: bracket.max,
		});

		totalTax += taxFromBracket;
		marginalRate = bracket.rate;
	}

	const effectiveRate = income > 0 ? totalTax / income : 0;

	return {
		totalTax,
		effectiveRate,
		marginalRate,
		bracketBreakdown,
		takeHome: income - totalTax,
		taxableIncome,
		grossIncome: income,
		standardDeduction,
	};
}

// ─────────────────────────────────────────────
// Amortization (Credit Card / Loan Payoff)
// ─────────────────────────────────────────────

export type AmortizeInput = {
	balance: number;
	apr: number; // as a percentage
	monthlyPayment: number;
};

export type AmortizeMonthSnapshot = {
	month: number;
	balance: number;
	interestPaid: number;
	principalPaid: number;
	totalPaid: number;
};

export type AmortizeResult = {
	monthsToPayoff: number;
	totalInterest: number;
	totalPaid: number;
	schedule: AmortizeMonthSnapshot[];
};

/**
 * Standard loan amortization schedule.
 * Handles the case where minimum payment may not cover interest
 * (negative amortization) by capping at 600 months.
 */
export function amortize(input: AmortizeInput): AmortizeResult {
	const { balance: initialBalance, apr, monthlyPayment } = input;

	if (initialBalance <= 0 || monthlyPayment <= 0) {
		return { monthsToPayoff: 0, totalInterest: 0, totalPaid: 0, schedule: [] };
	}

	const monthlyRate = apr / 100 / 12;
	const schedule: AmortizeMonthSnapshot[] = [];
	let balance = initialBalance;
	let totalInterest = 0;
	let totalPaid = 0;
	let month = 0;
	const MAX_MONTHS = 600;

	while (balance > 0 && month < MAX_MONTHS) {
		month++;
		const interest = balance * monthlyRate;
		const payment = Math.min(monthlyPayment, balance + interest);
		const principal = payment - interest;

		if (principal <= 0) {
			// Minimum payment doesn't cover interest — signal negative amortization
			break;
		}

		balance -= principal;
		if (balance < 0.01) balance = 0;

		totalInterest += interest;
		totalPaid += payment;

		schedule.push({
			month,
			balance,
			interestPaid: interest,
			principalPaid: principal,
			totalPaid,
		});
	}

	return {
		monthsToPayoff: month,
		totalInterest,
		totalPaid,
		schedule,
	};
}

/**
 * Calculate the minimum payment for a credit card balance.
 * Typically 2% of balance, minimum $25.
 */
export function creditCardMinPayment(balance: number): number {
	return Math.max(25, balance * 0.02);
}
