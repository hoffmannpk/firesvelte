<script lang="ts">
	import { page } from '$app/stores';
	import { onMount, onDestroy } from 'svelte'; // Importera onMount, onDestroy

	let isMobileMenuOpen = false;
	let screenWidth: number; // Deklarera variabeln här

	// Funktion för att uppdatera skärmbredden (körs bara i webbläsaren)
	function updateScreenWidth() {
		screenWidth = window.innerWidth; // Använd window här INNE i funktionen
		//Stäng menyn om skärmen blir större än 768
		if (screenWidth > 768) {
			isMobileMenuOpen = false;
		}
	}

	// Körs när komponenten skapas (men bara i webbläsaren!)
	onMount(() => {
		updateScreenWidth(); // Kör funktionen vid start
		window.addEventListener('resize', updateScreenWidth); // Lyssna på resize events

		// Körs när komponenten tas bort
		return () => {
			window.removeEventListener('resize', updateScreenWidth); // Ta bort event listener - VIKTIGT
		};
	});

	function toggleMobileMenu() {
		isMobileMenuOpen = !isMobileMenuOpen;
	}
</script>

<header>
	<div class="header-content">
		<div class="logo">FIRE 🔥</div>
		<button class="mobile-menu-button" on:click={toggleMobileMenu}>
			{#if isMobileMenuOpen}
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
					class="lucide lucide-x"
				>
					<path d="M18 6 6 18" />
					<path d="m6 6 12 12" />
				</svg>
			{:else}
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
				>
					<line x1="3" y1="12" x2="21" y2="12" />
					<line x1="3" y1="6" x2="21" y2="6" />
					<line x1="3" y1="18" x2="21" y2="18" />
				</svg>
			{/if}
		</button>
		<nav class:open={isMobileMenuOpen}>
			<a href="/" class:active={$page.url.pathname === '/'}>Varför spara?</a>
			<a
				href="/vad-kan-jag-spara"
				class:active={$page.url.pathname.startsWith('/vad-kan-jag-spara')}
			>
				Vad kan jag spara?
			</a>
			<a
				href="/vad-vill-jag-spara-i"
				class:active={$page.url.pathname.startsWith('/vad-vill-jag-spara-i')}
			>
				Vad vill jag spara i?
			</a>
			<a href="/varukorg" class:active={$page.url.pathname.startsWith('/varukorg')}>Varukorg</a>
		</nav>
	</div>
</header>

<style>
	header {
		display: flex;
		justify-content: center; /* Centrera horisontellt */
		align-items: center;
		padding: 1rem;
		background-color: #f8f8f8;
		border-bottom: 1px solid #ddd;
	}

	.header-content {
		display: flex;
		align-items: center;
		gap: 1rem; /* Justerat gap */
		max-width: 800px;
		width: 100%;
		justify-content: space-between; /* Fördela utrymmet mellan logo och meny/knapp */
	}

	.logo {
		font-size: 1.5rem;
		font-weight: bold;
	}

	/* Mobilmenyknapp - grundläggande stil */
	.mobile-menu-button {
		display: none; /* Dölj som standard */
		background: none;
		border: none;
		cursor: pointer;
		padding: 0; /* Ta bort standard padding */
		font-size: 1.5rem;
	}
	.mobile-menu-button svg {
		display: block; /*Se till att SVG tar upp rätt plats*/
	}

	nav {
		display: flex; /* Använd flexbox som standard (för större skärmar) */
	}

	nav a {
		text-decoration: none;
		color: #333;
		margin-left: 1rem;
		padding: 0.5rem;
		border-radius: 4px;
	}

	nav a:hover,
	nav.open a:hover,
	nav a.active,
	nav.open a.active {
		background-color: orange;
		color: white;
	}

	/* Media Query för mobil */
	@media (max-width: 768px) {
		.header-content {
			gap: 0.5rem; /* Mindre gap på mobil */
		}

		.mobile-menu-button {
			display: block; /* Visa hamburgarknappen */
		}

		nav {
			display: none; /* Dölj menyn som standard på mobil */
			flex-direction: column; /* Stapla länkar vertikalt */
			position: absolute; /* Absolut positionering */
			top: 65px; /*  Justera efter headerns höjd */
			left: 0;
			width: 100%; /* Full bredd */
			background-color: #f8f8f8; /* Samma bakgrund som headern */
			box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1); /* Skugga (valfritt) */
			z-index: 10; /*Se till att menyn hamnar över annat innehåll*/
		}

		nav.open {
			display: flex; /* Visa menyn när den är öppen */
		}

		nav a {
			margin-left: 0; /* Ta bort marginalen på mobil */
			padding: 1rem; /* Mer padding på mobil */
			border-bottom: 1px solid #ddd; /* Avdelare (valfritt) */
			text-align: center; /* Centrera texten i menyn */
		}
		nav a:last-child {
			border-bottom: none; /* Ta bort den sista linjen*/
		}
	}
</style>