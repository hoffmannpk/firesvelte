// utils.js
export function calculateCompoundInterest(
	principal: number,
	rate: number,
	years: number,
	monthlyContribution: number
): { results: number[]; resultsWithoutContribution: number[] } {
	let total = principal;
	let totalWithoutContribution = principal;
	const results: number[] = [];
	const resultsWithoutContribution: number[] = [];

	for (let year = 1; year <= years; year++) {
		for (let month = 1; month <= 12; month++) {
			total += monthlyContribution;
			total *= 1 + rate / 12;
		}
		totalWithoutContribution = principal * Math.pow(1 + rate, year);
		results.push(parseFloat(total.toFixed(0))); // Avrunda till 2 decimaler
		resultsWithoutContribution.push(parseFloat(totalWithoutContribution.toFixed(0)));
	}

	return {
		results,
		resultsWithoutContribution,
	};
}
