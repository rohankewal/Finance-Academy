export type GlossaryTerm = {
	term: string;
	definition: string;
	learnMoreHref?: string;
};

export const GLOSSARY_TERMS: GlossaryTerm[] = [
	// A
	{
		term: 'APR',
		definition: 'Annual Percentage Rate. The yearly cost of borrowing money, including interest and fees. A credit card with 24% APR charges about 2% of your balance each month in interest.',
		learnMoreHref: '/learn/debt-101/credit-cards-explained',
	},
	{
		term: 'APY',
		definition: 'Annual Percentage Yield. Like APR but for savings accounts — it reflects the effect of compounding, so APY is always slightly higher than the stated interest rate.',
	},
	{
		term: 'Amortization',
		definition: 'The process of paying off a debt over time through regular payments. Early payments are mostly interest; later payments are mostly principal. A 30-year mortgage is a classic example.',
		learnMoreHref: '/calculators/debt-payoff',
	},
	{
		term: 'Asset',
		definition: 'Something you own that has financial value — cash, investments, real estate, a car. Net worth = assets minus liabilities.',
	},
	{
		term: 'Asset Allocation',
		definition: 'How your investment portfolio is divided among different asset types (stocks, bonds, cash). A common rule of thumb: hold your age in bonds (e.g., 25% bonds at age 25).',
		learnMoreHref: '/learn/investing-fundamentals/stocks-vs-bonds',
	},
	{
		term: 'Avalanche Method',
		definition: 'A debt payoff strategy where you pay the minimum on all debts but put extra money toward the highest-interest debt first. Mathematically optimal — saves the most money.',
		learnMoreHref: '/calculators/debt-payoff',
	},
	// B
	{
		term: 'Balance Transfer',
		definition: 'Moving debt from a high-interest credit card to a new card with 0% intro APR. Can save a lot of interest if you pay off the balance before the promo period ends.',
	},
	{
		term: 'Bear Market',
		definition: 'A market decline of 20% or more from recent highs. Scary if you\'re new to investing, but historically they end and markets recover.',
	},
	{
		term: 'Bond',
		definition: 'A loan you make to a company or government. They pay you back with interest over time. Lower risk than stocks, but also lower long-term returns.',
		learnMoreHref: '/learn/investing-fundamentals/stocks-vs-bonds',
	},
	{
		term: 'Budget',
		definition: 'A plan for how you\'ll spend your money each month. Not a punishment — it\'s a tool that puts you in control of your money instead of the other way around.',
		learnMoreHref: '/learn/money-basics/budgeting-basics',
	},
	{
		term: 'Bull Market',
		definition: 'A sustained period of rising stock prices (typically 20%+ from recent lows). The US stock market has historically spent more time in bull markets than bear markets.',
	},
	// C
	{
		term: 'Capital Gains',
		definition: 'Profit from selling an investment for more than you paid. Short-term (held < 1 year) is taxed as ordinary income. Long-term (held ≥ 1 year) is taxed at lower rates.',
	},
	{
		term: 'Compound Interest',
		definition: 'Earning interest on your interest. $1,000 at 8% earns $80 in year one — but in year two it earns interest on $1,080, not just $1,000. This snowball effect is the engine of wealth building.',
		learnMoreHref: '/learn/investing-fundamentals/compound-interest',
	},
	{
		term: 'Credit Score',
		definition: 'A number (300–850) that summarizes your creditworthiness. Based on payment history (35%), amounts owed (30%), length of credit history (15%), new credit (10%), and credit mix (10%).',
		learnMoreHref: '/learn/money-basics/credit-scores',
	},
	{
		term: 'Credit Utilization',
		definition: 'The percentage of your available credit you\'re using. If your limit is $5,000 and you owe $1,500, your utilization is 30%. Keeping it below 30% helps your credit score.',
		learnMoreHref: '/learn/money-basics/credit-scores',
	},
	// D
	{
		term: 'Debt-to-Income Ratio (DTI)',
		definition: 'Monthly debt payments divided by monthly gross income. Lenders use this to decide if you can afford a loan. Under 36% is generally considered healthy.',
	},
	{
		term: 'Default',
		definition: 'Failing to repay a loan according to its terms. Damages your credit score significantly and can lead to collections, lawsuits, and wage garnishment.',
	},
	{
		term: 'Diversification',
		definition: 'Spreading investments across different assets, sectors, or geographies to reduce risk. "Don\'t put all your eggs in one basket" — if one investment tanks, others can cushion the blow.',
		learnMoreHref: '/learn/investing-fundamentals/index-funds',
	},
	{
		term: 'Dollar-Cost Averaging (DCA)',
		definition: 'Investing a fixed amount at regular intervals regardless of price. You buy more shares when prices are low and fewer when high. Removes the stress of trying to time the market.',
	},
	// E
	{
		term: 'Emergency Fund',
		definition: 'Liquid savings (typically in a high-yield savings account) covering 3–6 months of essential expenses. Your financial shock absorber for job loss, medical bills, or car repairs.',
		learnMoreHref: '/learn/money-basics/emergency-funds',
	},
	{
		term: 'Equity',
		definition: 'Ownership stake. In a house, equity = market value minus mortgage owed. In a company, equity = shares of stock.',
	},
	{
		term: 'ETF (Exchange-Traded Fund)',
		definition: 'A fund that holds a basket of securities (like stocks or bonds) and trades on an exchange like a stock. Most index funds are structured as ETFs.',
		learnMoreHref: '/learn/investing-fundamentals/index-funds',
	},
	{
		term: 'Expense Ratio',
		definition: 'Annual fee charged by a fund as a percentage of your investment. An expense ratio of 0.03% costs you $3 per year on $10,000. Compare this to actively managed funds charging 1%+.',
		learnMoreHref: '/learn/investing-fundamentals/index-funds',
	},
	// F
	{
		term: 'FICO Score',
		definition: 'The most widely used credit scoring model (from Fair Isaac Corporation). Scores range from 300–850. 670+ is "good", 740+ is "very good", 800+ is "exceptional."',
		learnMoreHref: '/learn/money-basics/credit-scores',
	},
	{
		term: 'Federal Funds Rate',
		definition: 'The interest rate the Federal Reserve sets for banks to lend to each other overnight. It ripples through the economy — affecting mortgage rates, credit cards, and savings account yields.',
	},
	{
		term: '401(k)',
		definition: 'An employer-sponsored retirement account. Contributions reduce your taxable income today. Many employers match contributions — that\'s free money you should never leave on the table.',
	},
	// G
	{
		term: 'Grace Period',
		definition: 'The time (usually 21–25 days) between your credit card statement closing and your payment due date. Pay in full during this period and you pay zero interest.',
		learnMoreHref: '/learn/debt-101/credit-cards-explained',
	},
	{
		term: 'Gross Income',
		definition: 'Your total income before taxes and deductions. If your salary is $60,000, that\'s your gross income. After taxes, your take-home (net) income will be less.',
	},
	// I
	{
		term: 'Index Fund',
		definition: 'A fund that tracks a market index (like the S&P 500) instead of trying to beat it. Lower costs, built-in diversification, and historically better performance than most active funds.',
		learnMoreHref: '/learn/investing-fundamentals/index-funds',
	},
	{
		term: 'Inflation',
		definition: 'The gradual rise in the price of goods and services over time. At 3% annual inflation, $100 today buys about $74 worth of goods in 10 years. Why sitting in cash slowly loses purchasing power.',
		learnMoreHref: '/learn/investing-fundamentals/why-invest',
	},
	{
		term: 'Interest Rate',
		definition: 'The cost of borrowing money, or the reward for saving it — expressed as a percentage. A 5% annual rate on a $10,000 loan means you owe $500 in interest per year.',
	},
	{
		term: 'Income-Driven Repayment (IDR)',
		definition: 'Federal student loan repayment plans that cap monthly payments at 5–10% of discretionary income. Remaining balance may be forgiven after 20–25 years.',
		learnMoreHref: '/learn/debt-101/student-loans',
	},
	// L
	{
		term: 'Liability',
		definition: 'Money you owe — debt, loans, credit card balances, mortgages. Net worth = assets minus liabilities.',
	},
	{
		term: 'Liquidity',
		definition: 'How quickly an asset can be converted to cash without losing value. Cash is perfectly liquid. A house is illiquid — it takes months to sell.',
	},
	// M
	{
		term: 'Marginal Tax Rate',
		definition: 'The tax rate applied to your last dollar of income. Due to progressive brackets, your marginal rate is NOT applied to all your income — only the portion that falls in the top bracket.',
		learnMoreHref: '/calculators/tax-brackets',
	},
	{
		term: 'Market Capitalization',
		definition: 'The total market value of a company\'s outstanding shares (share price × number of shares). Apple\'s market cap has exceeded $3 trillion.',
	},
	{
		term: 'Minimum Payment',
		definition: 'The smallest amount you can pay on a credit card or loan without penalty. Paying only the minimum is the most expensive way to carry debt — it can take decades to pay off a balance.',
		learnMoreHref: '/calculators/credit-card-trap',
	},
	// N
	{
		term: 'Net Worth',
		definition: 'Assets minus liabilities. A simple snapshot of your financial health. Positive net worth means you own more than you owe.',
	},
	// O
	{
		term: 'Opportunity Cost',
		definition: 'The value of the next-best option you give up when making a choice. Spending $200/month on subscriptions you don\'t use has an opportunity cost of ~$500,000 over 40 years if invested at 8%.',
	},
	// P
	{
		term: 'Principal',
		definition: 'The original amount borrowed or invested, before interest. On a $20,000 car loan, the principal is $20,000.',
	},
	{
		term: 'Portfolio',
		definition: 'The collection of all your investments — stocks, bonds, ETFs, real estate, etc. A well-balanced portfolio is diversified across multiple asset types.',
	},
	// R
	{
		term: 'Roth IRA',
		definition: 'A retirement account where you invest after-tax dollars and withdrawals in retirement are tax-free. Ideal if you expect to be in a higher tax bracket later. 2024 contribution limit: $7,000.',
	},
	{
		term: 'Risk Tolerance',
		definition: 'How much investment volatility (ups and downs) you can emotionally and financially handle. Higher risk tolerance generally leads to more stocks in a portfolio.',
	},
	// S
	{
		term: 'S&P 500',
		definition: 'An index tracking the 500 largest publicly traded US companies. Often used as a benchmark for the US stock market. Historically returns about 10% annually before inflation.',
		learnMoreHref: '/learn/investing-fundamentals/index-funds',
	},
	{
		term: 'Snowball Method',
		definition: 'A debt payoff strategy where you pay off the smallest balance first (regardless of interest rate) to build momentum. Less mathematically optimal than avalanche, but psychologically powerful.',
		learnMoreHref: '/calculators/debt-payoff',
	},
	{
		term: 'Stock',
		definition: 'A share of ownership in a company. Stockholders own a slice of the company\'s assets and earnings. Stocks have higher long-term return potential than bonds, with more short-term volatility.',
		learnMoreHref: '/learn/investing-fundamentals/stocks-vs-bonds',
	},
	{
		term: 'Student Loan Forgiveness',
		definition: 'Programs that cancel remaining federal student loan balances after meeting certain conditions — like working in public service for 10 years (PSLF) or completing an IDR plan.',
		learnMoreHref: '/learn/debt-101/student-loans',
	},
	// T
	{
		term: 'Tax-Advantaged Account',
		definition: 'Any account that provides tax benefits — like a 401(k), IRA, or HSA. The tax savings over decades can be enormous.',
	},
	{
		term: 'Time Value of Money',
		definition: 'A dollar today is worth more than a dollar in the future because you can invest it and earn returns. This principle underlies almost all financial decision-making.',
		learnMoreHref: '/learn/investing-fundamentals/compound-interest',
	},
	// V
	{
		term: 'Vesting',
		definition: 'The process of earning full rights to employer-matched 401(k) contributions over time. If you leave before you\'re fully vested, you may forfeit some employer contributions.',
	},
	{
		term: 'Volatility',
		definition: 'How much an asset\'s price fluctuates over time. High volatility (like individual stocks) means bigger swings up and down. Index funds are less volatile than individual stocks.',
	},
	// Y
	{
		term: 'Yield',
		definition: 'The income generated by an investment, expressed as a percentage of its price. A bond with a 4% yield pays $40 annually on a $1,000 face value.',
	},
];

/** Get all unique starting letters present in the glossary */
export function getGlossaryLetters(): string[] {
	const letters = new Set(GLOSSARY_TERMS.map((t) => t.term[0].toUpperCase()));
	return Array.from(letters).sort();
}

/** Get terms starting with a specific letter */
export function getTermsByLetter(letter: string): GlossaryTerm[] {
	return GLOSSARY_TERMS.filter((t) => t.term[0].toUpperCase() === letter.toUpperCase()).sort((a, b) =>
		a.term.localeCompare(b.term),
	);
}
