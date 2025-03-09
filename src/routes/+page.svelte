<script lang="ts">
	import { calculateCompoundInterest } from '$lib/utils';
	import Header from '$lib/components/Header.svelte';
	import { onMount } from 'svelte';
	import Chart from 'chart.js/auto';
	import type { ChartData, ChartDataset, ChartOptions } from 'chart.js';

	let principal: number = 0;
	let annualRate: number = 0.07;
	let years: number = 20;
	let monthlyContribution: number = 100;
	let myChart: Chart | undefined;

	onMount(() => {
		// Data UTAN avkastning (ackumulerat sparande)
		const dataWithoutInterest: number[] = [];
		let accumulatedSavings = 0;
		for (let year = 1; year <= years; year++) {
			accumulatedSavings += monthlyContribution * 12;
			dataWithoutInterest.push(accumulatedSavings);
		}

		const calcData = calculateCompoundInterest(principal, annualRate, years, monthlyContribution);

		// Definiera datasets med typer
		const datasets: ChartDataset<'line'>[] = [
			{
				label: 'Utan avkastning',
				data: dataWithoutInterest, // Använd det korrekt beräknade värdet
				borderColor: 'lightblue',
				backgroundColor: 'lightblue',
				fill: true,
				tension: 0.0, // Rak linje för "utan avkastning"
				pointRadius: 0, // Ta bort punkter
			},
			{
				label: 'Med avkastning',
				data: calcData.results,
				borderColor: 'orange',
				backgroundColor: 'rgba(255, 165, 0, 0.7)',
				fill: true,
				tension: 0.4,
			},
		];

		const ctx = document.getElementById('myChart') as HTMLCanvasElement;
		if (!ctx) {
			console.error('Canvas element not found!');
			return; // Viktigt: Avbryt om canvas-elementet inte finns
		}

		myChart = new Chart(ctx, {
			type: 'line',
			data: {
				labels: Array.from({ length: years }, (_, i) => (i + 1).toString()),
				datasets: datasets,
			} as ChartData<'line'>,
			options: {
				responsive: true,
				maintainAspectRatio: false, //VIKTIG, annars kan problem uppstå.
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
									label += context.parsed.y + ' kr';
								}
								return label;
							},
						},
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
								return value + ' kr';
							},
						},
					},
				},
			} as ChartOptions<'line'>,
		});

		return () => {
			if (myChart) {
				myChart.destroy();
			}
		};
	});
</script>

<Header />

<main>
	<h1>Varför spara?</h1>
	<p>Om du sparar bara 100 kr i månaden under 20 år, kommer du att ha:</p>

	<div class="results">
		<div class="result-box">
			<h2>Utan avkastning</h2>
			<p class="amount">{years * 12 * monthlyContribution} kr</p>
			<p>Bara insättningar</p>
		</div>
		<div class="result-box">
			{#if true}
				{@const calcData = calculateCompoundInterest(principal, annualRate, years, monthlyContribution)}
				<h2>Med 7% avkastning</h2>
				<p class="amount">
					{(calcData && calcData.results[years - 1]) ? calcData.results[years - 1] : 0} kr
				</p>
				<p>
					Varav {(calcData && calcData.results[years - 1])
						? (calcData.results[years - 1] - years * 12 * monthlyContribution).toFixed(0)
						: 0} kr är avkastning
				</p>
			{/if}
		</div>
	</div>

	<h2>Ränta på ränta effekten</h2>
	<p>
		Ränta på ränta effekten är när du inte bara får avkastning på dina egna insättningar, utan
		även på avkastningen på den tidigare avkastningen. Ju längre tid du sparar, desto mer gynnas
		du av denna effekt. Det är därför långsiktigt sparande ofta ger mycket bättre avkastning än
		kortsiktigt.
	</p>

	<div class="chart-container">
		<canvas id="myChart"></canvas>
	</div>
	<p style="text-align: center;">FIRE - Financial Independence, Retire Early</p>
</main>

<style>
	main {
		padding: 1rem;
		max-width: 800px;
		margin: auto;
	}

	h1 {
		text-align: center;
		color: #333;
	}

	h2 {
		color: #333;
	}

	.results {
		display: flex;
		justify-content: space-between;
		gap: 20px;
		width: 100%;
		margin-bottom: 2rem;
        flex-wrap: wrap; /* Tillåt radbrytning på mindre skärmar */
	}

	.result-box {
		border: 1px solid #ddd;
		padding: 1rem;
		text-align: center;
		border-radius: 8px;
		background-color: #f9f9f9;
		/* flex: 1; Ta bort flex: 1, använd flex-basis istället */
        flex-basis: calc(50% - 10px); /*  Bredd på större skärmar */
        box-sizing: border-box;       /* Inkludera padding och border i bredden */
	}

	.result-box:first-child {
		background-color: lightblue;
		order: 2;
	}
	.result-box:nth-child(2) {
		background-color: orange;
		order: 1;
	}

	.amount {
		font-size: 1.5rem;
		font-weight: bold;
		color: #0056b3;
	}

	.chart-container {
		width: 100%;
		position: relative;
		height: 300px;
	}
    /* Responsivitet för resultatrutorna */
    @media (max-width: 768px) {
        .result-box {
            flex-basis: 100%; /* Full bredd på mobil */
        }
    }
</style>