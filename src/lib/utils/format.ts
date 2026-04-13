/**
 * Format a number as US currency (e.g. $1,234.56)
 */
export function formatCurrency(value: number, decimals = 0): string {
	return new Intl.NumberFormat('en-US', {
		style: 'currency',
		currency: 'USD',
		minimumFractionDigits: decimals,
		maximumFractionDigits: decimals,
	}).format(value);
}

/**
 * Format a number as a percentage (e.g. 8.5%)
 */
export function formatPercent(value: number, decimals = 1): string {
	return new Intl.NumberFormat('en-US', {
		style: 'percent',
		minimumFractionDigits: decimals,
		maximumFractionDigits: decimals,
	}).format(value / 100);
}

/**
 * Format a large number with commas (e.g. 1,234,567)
 */
export function formatNumber(value: number, decimals = 0): string {
	return new Intl.NumberFormat('en-US', {
		minimumFractionDigits: decimals,
		maximumFractionDigits: decimals,
	}).format(value);
}

/**
 * Format months as human-readable duration (e.g. "2 years 3 months")
 */
export function formatMonths(months: number): string {
	const years = Math.floor(months / 12);
	const remainingMonths = months % 12;
	const parts: string[] = [];
	if (years > 0) parts.push(`${years} year${years !== 1 ? 's' : ''}`);
	if (remainingMonths > 0) parts.push(`${remainingMonths} month${remainingMonths !== 1 ? 's' : ''}`);
	return parts.join(' ') || '0 months';
}

/**
 * Add months to a date and return a formatted string (e.g. "March 2027")
 */
export function addMonthsToDate(date: Date, months: number): string {
	const result = new Date(date);
	result.setMonth(result.getMonth() + months);
	return result.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}

/**
 * Clamp a number between min and max
 */
export function clamp(value: number, min: number, max: number): number {
	return Math.min(Math.max(value, min), max);
}

/**
 * Parse a currency string to number (removes $, commas)
 */
export function parseCurrency(str: string): number {
	const cleaned = str.replace(/[$,]/g, '');
	const num = parseFloat(cleaned);
	return isNaN(num) ? 0 : num;
}
