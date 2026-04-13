/** 2024 US Federal Income Tax Brackets */

export type FilingStatus = 'single' | 'married_jointly';

export type Bracket = {
	rate: number;
	min: number;
	max: number; // Infinity for the top bracket
};

export const TAX_BRACKETS: Record<FilingStatus, Bracket[]> = {
	single: [
		{ rate: 0.10, min: 0,        max: 11600 },
		{ rate: 0.12, min: 11600,    max: 47150 },
		{ rate: 0.22, min: 47150,    max: 100525 },
		{ rate: 0.24, min: 100525,   max: 191950 },
		{ rate: 0.32, min: 191950,   max: 243725 },
		{ rate: 0.35, min: 243725,   max: 609350 },
		{ rate: 0.37, min: 609350,   max: Infinity },
	],
	married_jointly: [
		{ rate: 0.10, min: 0,        max: 23200 },
		{ rate: 0.12, min: 23200,    max: 94300 },
		{ rate: 0.22, min: 94300,    max: 201050 },
		{ rate: 0.24, min: 201050,   max: 383900 },
		{ rate: 0.32, min: 383900,   max: 487450 },
		{ rate: 0.35, min: 487450,   max: 731200 },
		{ rate: 0.37, min: 731200,   max: Infinity },
	],
};

export const STANDARD_DEDUCTION: Record<FilingStatus, number> = {
	single: 14600,
	married_jointly: 29200,
};

export const FILING_STATUS_LABELS: Record<FilingStatus, string> = {
	single: 'Single',
	married_jointly: 'Married Filing Jointly',
};
