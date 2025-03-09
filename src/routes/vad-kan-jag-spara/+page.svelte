<script lang="ts">
	import { calculateCompoundInterest } from '$lib/utils';
	import Header from '$lib/components/Header.svelte';
	import { onMount } from 'svelte';
	import Chart from 'chart.js/auto';
	import type { ChartData, ChartDataset, ChartOptions } from 'chart.js';

	let principal: number = 0; // Startkapital behövs inte på den här sidan
	let annualRate: number = 0.07;
	let years: number = 20;
	let monthlyContribution: number = 5000;
	let myChart: Chart | undefined;
	let chartData: number[] | undefined; //För att kunna dölja grafen
	let chartDataNoContribution: number[] | undefined; //För att kunna dölja grafen
	let showChart: boolean = false; //Kontrollerar om grafen ska visas
	let totalContributions: number = 0;
	let totalInterest: number = 0;

	onMount(() => {
		// Ingen initial beräkning här.  Väntar på knapptryck.
		return () => {
			if (myChart) {
				myChart.destroy();
			}
		};
	});

	function calculateAndDrawChart() {
		showChart = true; // Visa grafen

		const calcData = calculateCompoundInterest(principal, annualRate, years, monthlyContribution);
		chartData = calcData.results;
        //chartDataNoContribution = calcData.resultsWithoutContribution; //Fel, använd inte denna.

        // --- Korrekt beräkning för chartDataNoContribution ---
        chartDataNoContribution = [];
        let accumulated = 0;
        for (let year = 1; year <= years; year++) {
            accumulated += monthlyContribution * 12; // Ackumulera för varje år
            chartDataNoContribution.push(roundToNearestHundred(accumulated)); //Avrunda och lägg till
        }
        // --------------------------------------------------------

		//Beräkna total insättning
		totalContributions = roundToNearestHundred(years * 12 * monthlyContribution);
		totalInterest = roundToNearestHundred(
			(chartData && chartData[years - 1] ? chartData[years - 1] : 0) - totalContributions
		);

		// Fördröj uppdateringen av diagrammet för att säkerställa att showChart = true har propagerat.
		setTimeout(() => {
			if (myChart) {
				myChart.destroy(); // Förstör den gamla instansen om den finns
			}
			const ctx = document.getElementById('myChart') as HTMLCanvasElement;
			if (!ctx) {
				console.error('Canvas element not found!');
				return;
			}

			const datasets: ChartDataset<'line'>[] = [
				{
					label: 'Insättningar', //Tydligare label
					data: chartDataNoContribution, // Använd den korrekt beräknade datan
					borderColor: 'lightblue',
					backgroundColor: 'lightblue',
					fill: true,
					tension: 0,
					pointRadius: 0,
				},
				{
					label: 'Avkastning',
					data: chartData,
					borderColor: 'orange',
					backgroundColor: 'rgba(255, 165, 0, 0.7)',
					fill: true,
					tension: 0.4,
				},
			];
			myChart = new Chart(ctx, {
				type: 'line',
				data: {
					labels: Array.from({ length: years }, (_, i) => (i + 1).toString()),
					datasets: datasets,
				} as ChartData<'line'>,
				options: {
					responsive: true,
					maintainAspectRatio: false,
					plugins: {
						tooltip: {
							mode: 'index',
							intersect: false,
							callbacks: {
								label: function (context) {
									let label = context.dataset.label || '';
									if (label) {
										label += ': ';
									}
									if (context.parsed.y !== null) {
										label += formatNumberWithSpaces(
											roundToNearestHundred(context.parsed.y)
										) + ' kr'; //Avrunda i tooltip OCH formatera med mellanslag
									}
									return label;
								},
							},
						},
						legend: {
							//Lägg till legend
							display: true,
							position: 'bottom', //Placera legend under
						},
					},
					scales: {
						x: {
							title: {
								display: true,
								text: 'År',
							},
						},
						y: {
							title: {
								display: true,
								text: 'Värde (SEK)',
							},
							beginAtZero: true,
							ticks: {
								callback: function (value) {
									return formatNumberWithSpaces(value / 1000) + 'k';
								},
							},
						},
					},
				} as ChartOptions<'line'>,
			});
		}, 0);
	}
	
	function roundToNearestHundred(value: number): number {
		return Math.round(value / 100) * 100;
	}

	// Funktion för att formatera tal med mellanslag som tusentalsavgränsare
	function formatNumberWithSpaces(number: number): string {
		return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
	}
</script>

<Header />

<main>
	<h1>Vad kan jag spara?</h1>

	<div class="input-container">
		<label for="monthly-contribution">Månadsbelopp</label>
		<input
			type="number"
			id="monthly-contribution"
			bind:value={monthlyContribution}
			placeholder="kr"
		/>

		<label for="years">Antal år</label>
		<input type="number" id="years" bind:value={years} />

		<label for="annual-rate">Avkastning %</label>
		<div class="select-wrapper">
			<select id="annual-rate" bind:value={annualRate}>
				{#each [5, 6, 7, 8, 9, 10] as rate}
					<option value={rate / 100}>{rate}%</option>
				{/each}
			</select>
		</div>

		<button class="calculate-button" on:click={calculateAndDrawChart}>Beräkna</button>
	</div>

	{#if showChart}
		<h2>Tillväxt över tid</h2>
		<div class="chart-container">
			<canvas id="myChart"></canvas>  </div>

		<div class="results">
			<div class="result-box">
				<h2>Slutvärde</h2>
				<p class="amount">
					{chartData
						? formatNumberWithSpaces(roundToNearestHundred(chartData[years - 1])) + ' kr'
						: '0 kr'}
				</p>
			</div>
			<div class="result-box">
				<h2>Totala insättningar</h2>
				<p class="amount">{formatNumberWithSpaces(totalContributions)} kr</p>
			</div>
			<div class="result-box">
				<h2>Total avkastning</h2>
				<p class="amount">{formatNumberWithSpaces(totalInterest)} kr</p>
			</div>
		</div>
	{/if}

	<p style="text-align: center;">FIRE - Financial Independence, Retire Early</p>
</main>

<style>
	main {
		padding: 1rem;
		max-width: 800px;
		margin: auto; /* Centrerar main-innehållet */
	}

	h1 {
		text-align: center;
		color: #333;
	}

	h2 {
		color: #333;
	}
	/* Input-fält och knapp */
	.input-container {
		display: grid; /* Använd CSS Grid */
		grid-template-columns: 1fr 1fr; /* Två kolumner */
		grid-template-rows: auto auto auto auto; /* Fyra rader */
		gap: 1rem 2rem; /* Avstånd mellan rader och kolumner */
		margin-bottom: 2rem;
		align-items: center; /* Centrera vertikalt */
		max-width: 600px; /* Maxbredd */
		margin-left: auto; /* Centrera */
		margin-right: auto; /* Centrera */
	}
	.input-container label {
		text-align: right; /* Texten till höger i label */
	}
	.input-container input[type="number"],
	.select-wrapper {
		padding: 0.5rem;
		border: 1px solid #ddd;
		border-radius: 4px;
		font-size: 1rem;
		width: 100%; /* Viktig för responsivitet */
	}
	/* Styla select specifikt */
	.select-wrapper {
		position: relative;
	}
	.input-container select {
		width: 100%; /* Full bredd i föräldern */
		padding: 0.5rem;
		font-size: 1rem;
		border: 1px solid #ddd;
		border-radius: 4px;
		appearance: none; /* Ta bort standardutseendet */
		background-color: white;
		cursor: pointer;
	}
	/* Pil-ikon för select (använder en pseudo-element) */
	.select-wrapper::after {
		content: '▼'; /* Unicode-pil nedåt */
		position: absolute;
		top: 50%;
		right: 1rem;
		transform: translateY(-50%);
		pointer-events: none; /* Gör så att den inte blockerar klick */
		color: #666;
	}

	.calculate-button {
		grid-column: 1 / -1; /* Knappen över hela bredden */
		padding: 0.5rem 1rem; /* Mindre padding */
		background-color: orange;
		color: white;
		border: none;
		border-radius: 4px;
		font-size: 1rem; /* Mindre font-size */
		cursor: pointer;
		transition: background-color 0.2s;
        max-width: 300px;  /*Maxbredd*/
        margin: 0 auto;   /*Centrerar knappen horisontellt*/
	}

	.calculate-button:hover {
		background-color: darken(orange, 10%);
	}

	/* Resultat-rutorna */
	.results {
		display: flex;
		justify-content: space-between;
		gap: 20px;
		width: 100%;
		margin-bottom: 2rem;
		flex-wrap: wrap;
	}

	.result-box {
		border: 1px solid #ddd;
		padding: 1rem;
		text-align: center;
		border-radius: 8px;
		background-color: #f9f9f9;
		flex-basis: calc(33.333% - 14px);
		box-sizing: border-box;
	}
	.result-box:nth-child(2),
	.result-box:nth-child(3) {
		margin-top: 0; /* Ta bort extra marginal på toppen */
	}

	.amount {
		font-size: 1.5rem;
		font-weight: bold;
		color: #0056b3;
	}

	.chart-container {
		width: 100%;
		position: relative;
		height: 300px; /*Fast höjd, Chart.js sköter resten*/
		margin-bottom: 1rem;
	}
	/* Responsivitet för resultatrutorna */
	@media (max-width: 768px) {
		.result-box {
			flex-basis: 100%; /* Full bredd på mobil */
		}
		.input-container {
			grid-template-columns: 1fr; /*En kolumn på mobil */
		}
		.input-container label {
			text-align: left; /*Centrera labels på mobil */
		}
	}
</style>