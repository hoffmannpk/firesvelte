<script lang="ts">
	import Header from '$lib/components/Header.svelte';
	import { page } from '$app/stores'; // För att hämta data från föregående sida
	import { goto } from '$app/navigation';
	import { writable } from 'svelte/store'; // Importera writable

	// Hämta data från URL-parametrar (från "Vad kan jag spara?")
	$: monthlyContribution = Number($page.url.searchParams.get('monthlyContribution') || 5000); // Default 5000
	$: years = Number($page.url.searchParams.get('years') || 20); // Default 20
	$: annualRate = Number($page.url.searchParams.get('annualRate') || 0.07); // Default 0.07 (7%)
	$: annualRatePercent = annualRate * 100;

	let selectedMarket: string = 'Sverige'; // Standardmarknad
	let amount: number = 0;
	let recommendedFund: string = 'Swedbank Robur Access Sverige'; // Default

	//Definera en typ för fonder
	interface Fund {
		market: string;
		name: string;
		amount: number;
	}
	// Använd en writable store för funds och remainingAmount
	const funds = writable<Fund[]>([]);
	const remainingAmount = writable<number>(0);
	$: remainingAmount.set(monthlyContribution); // Initialisera remainingAmount


	//Funktion för att lägga till en fond
	function addFund() {
		if (amount > 0 && amount <= $remainingAmount) {
			//Ny logik: Kontrollera om fonden REDAN finns.
			const existingFundIndex = $funds.findIndex(
				(f) => f.name === getRecommendedFund(selectedMarket) && f.market === selectedMarket
			);

			if (existingFundIndex === -1) {
				// Om fonden INTE finns
				$funds = [
					...$funds,
					{
						market: selectedMarket,
						name: getRecommendedFund(selectedMarket),
						amount: amount,
					},
				];
				remainingAmount.update((value) => value - amount); //Använd update
				amount = 0; //Återställ belopp efter tillägg.
			} else {
				alert('Fonden finns redan i listan.'); // Visa felmeddelande
				return; //Avbryt funktionen.
			}
		} else {
			alert('Beloppet är ogiltigt eller överstiger återstående belopp.');
		}
		updateRecommendedFund(); // Uppdatera rekommenderad fond *efter* tillägg/borttag
	}

	function removeFund(index: number) {
		remainingAmount.update((value) => value + $funds[index].amount); //Återför belopp. Använd update.
		$funds = $funds.filter((_, i) => i !== index); // Ta bort fonden. Använd filter för immutable update
		updateRecommendedFund();
	}

	function getRecommendedFund(market: string): string {
		switch (market) {
			case 'Sverige':
				return 'Handelsbanken Sverige Index Criteria'; // Ändrad till korrekt fond
			case 'Global':
				return 'Handelsbanken Global Index Criteria';
			case 'USA':
				return 'Handelsbanken USA Index Criteria'; // Ändrad till korrekt fond
			case 'Norden':
				return 'Handelsbanken Norden Index Criteria';
			case 'Europa':
				return 'Handelsbanken USA Index Criteria'; // Ändrad till korrekt fond.
			default:
				return 'Ingen rekommenderad fond';
		}
	}

	function updateRecommendedFund() {
		// Kontrollera om det finns NÅGON fond med den valda marknaden.
		if ($funds.some((fund) => fund.market === selectedMarket)) {
			recommendedFund = 'Fonden finns redan i listan';
		} else {
			recommendedFund = getRecommendedFund(selectedMarket);
		}
	}
	// Uppdatera rekommenderad fond när marknad ändras
	$: {
		updateRecommendedFund();
	}

	// Funktion för att navigera till Varukorg-sidan
	function goToCart() {
		//Skapa en sträng för URL med fonder
		const fundString = $funds.map((fund) => `${fund.name}:${fund.amount}`).join(';');

		goto(`/varukorg?funds=${fundString}&total=${monthlyContribution}`); //Skicka data till Varukorg.
	}

	//Reaktiv variabel som uppdaterar remainingAmount och tar bort alla fonder.
	$: if (monthlyContribution > 0) {
		// Återställ remainingAmount.  Använd update för att vara säker.
		remainingAmount.set(monthlyContribution);

		//Ta bort alla fonder. Viktigt att använda en immutable metod, här sätter vi den till en tom array.
		funds.set([]); // Använd .set([]) för att nollställa
	}
</script>

<Header />

<main>
	<h1>Vad vill jag spara i?</h1>

	<p class="intro-text">
		<b>Risk och avkastning</b><br />
		Investeringar med högre risk kan ge bättre avkastning över tid, men kan också ha perioder med
		större värdenedgångar. Att sprida investeringar mellan olika marknader kan hjälpa till att
		minska den totala risken i din portfölj.
	</p>

	<div class="input-summary">
		<div>
			<label for="monthly-contribution-summary">Månadsbelopp</label>
			<p id="monthly-contribution-summary">{monthlyContribution} kr</p>
		</div>
		<div>
			<label for="years-summary">Spartid</label>
			<p id="years-summary">{years} år</p>
		</div>
		<div>
			<label for="annual-rate-summary">Förväntad avkastning</label>
			<p id="annual-rate-summary">{annualRatePercent}%</p>
		</div>
	</div>

	<h2>Välj fonder</h2>
	<div class="fund-selection">
		<div class="fund-input">
			<label for="market">Marknad</label>
			<div class="select-wrapper">
				<select id="market" bind:value={selectedMarket}>
					<option value="Sverige">Sverige</option>
					<option value="Global">Global</option>
					<option value="USA">USA</option>
					<option value="Norden">Norden</option>
					<option value="Europa">Europa</option>
				</select>
			</div>
		</div>
		<div class="fund-input">
			<label for="amount">Belopp</label>
			<input type="number" id="amount" bind:value={amount} placeholder="kr" />
		</div>
		<div>
			<button class="add-fund-button" on:click={addFund}>Lägg till fond</button>
		</div>
	</div>
	<p>Återstående: {$remainingAmount} kr</p>

	<p>
		Rekommenderad fond: <b>{recommendedFund}</b>
	</p>
	<p class="small-text">
		Det är bra att sprida dina risker genom att investera i flera olika fonder och marknader.
	</p>

	<h2>Valda fonder</h2>
	{#if $funds.length > 0}
		<ul class="selected-funds">
			{#each $funds as fund, index (fund.name)}
				<li>
					{fund.name} ({fund.market}) - {fund.amount} kr
					<button
						class="remove-button"
						on:click={() => removeFund(index)}
						aria-label="Ta bort {fund.name}"
					>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							width="24"
							height="24"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							stroke-width="2"
							stroke-linecap="round"
							stroke-linejoin="round"
							class="lucide lucide-trash-2"
						>
							<path d="M3 6h18" />
							<path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
							<path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
							<line x1="10" y1="11" x2="10" y2="17" />
							<line x1="14" y1="11" x2="14" y2="17" />
						</svg>
					</button>
				</li>
			{/each}
		</ul>
	{:else}
		<p>Inga fonder valda ännu.</p>
	{/if}

	<button class="go-to-cart-button" on:click={goToCart} disabled={$funds.length === 0}>Nu kör vi!</button>

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
		margin-top: 2rem;
		margin-bottom: 1rem;
	}

	.intro-text {
		background-color: #f0f0f0;
		padding: 1rem;
		border-radius: 8px;
		margin-bottom: 1rem;
		text-align: center; /* Centrera texten */
	}

	/* Sammanfattning av input-värden */
	.input-summary {
		display: grid;
		grid-template-columns: repeat(3, 1fr); /* Tre kolumner */
		gap: 1rem;
		margin-bottom: 2rem;
		text-align: center; /* Centrera texten */
	}

	.input-summary > div {
		background-color: #f9f9f9;
		border: 1px solid #ddd;
		padding: 1rem;
		border-radius: 8px;
	}

	.input-summary label {
		font-weight: bold;
		display: block; /* Labels på egna rader */
		margin-bottom: 0.25rem;
	}

	/* Fondval */
	.fund-selection {
		display: grid;
		grid-template-columns: 2fr 1fr auto; /* Marknad, Belopp, Knapp */
		gap: 1rem;
		align-items: end; /* Justera vertikalt */
		margin-bottom: 1rem;
	}

	.fund-input label {
		display: block;
		margin-bottom: 0.25rem;
	}

	.fund-input input[type='number'],
	.fund-input .select-wrapper {
		/*Ta bort?*/
		padding: 0.5rem;
		border: 1px solid #ddd;
		border-radius: 4px;
		font-size: 1rem;
		width: 100%;
	}
	.select-wrapper {
		position: relative;
	}
	.fund-input select {
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

	.add-fund-button {
		padding: 0.5rem 1rem;
		background-color: orange;
		color: white;
		border: none;
		border-radius: 4px;
		cursor: pointer;
		height: 100%;
	}
	.add-fund-button:hover {
		background-color: darken(orange, 10%);
	}

	/* Lista med valda fonder */
	.selected-funds {
		list-style: none;
		padding: 0;
	}

	.selected-funds li {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 0.5rem;
		border-bottom: 1px solid #ddd;
	}

	.selected-funds li:last-child {
		border-bottom: none;
	}

	.remove-button {
		background: none;
		border: none;
		cursor: pointer;
		color: #999; /* Dämpad färg */
		padding: 0;
		margin-left: 1rem;
	}
	.remove-button svg {
		display: block; /* Se till att SVG:en tar upp plats */
	}
	.remove-button:hover {
		color: red;
	}
	.small-text {
		font-size: small;
	}

	.go-to-cart-button {
		display: block;
		margin: 20px auto;
		padding: 1rem 2rem;
		font-size: 1.2rem;
		color: white;
		background-color: orange;
		border: none;
		border-radius: 8px;
		cursor: pointer;
	}
	.go-to-cart-button:hover,
	.go-to-cart-button:disabled:hover {
		background-color: darken(orange, 10%);
	}
	.go-to-cart-button:disabled {
		opacity: 0.6;
		cursor: not-allowed;
	}

	/* Responsivitet */
	@media (max-width: 768px) {
		.fund-selection {
			grid-template-columns: 1fr; /* En kolumn på mobil */
			gap: 0.5rem;
		}
		.fund-input,
		.add-fund-button {
			margin-bottom: 0.5rem; /* Mindre marginal */
		}
		.input-summary {
			grid-template-columns: 1fr; /*En kolumn på mobil */
		}
		.input-summary > div {
			width: 100%; /*Full bredd på rutorna */
		}
	}
</style>