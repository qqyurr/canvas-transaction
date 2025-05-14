<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { CanvasRenderer } from '$lib/canvas/CanvasRenderer';
	import { fetchData } from '../../examples/api-usage';
	import { CANVAS_CONFIG } from '$lib/canvas/config';

	let canvas: HTMLCanvasElement;
	let renderer: CanvasRenderer | undefined;
	let intervalId: ReturnType<typeof setInterval> | undefined;
	let loading = false;
	let error: string | null = null;
	let isComponentMounted = true;
	const interval = 1000;

	const fetchAndUpdateRenderer = async () => {
		if (!isComponentMounted) return;

		loading = true;
		try {
			const newData = await fetchData();
			if (renderer && isComponentMounted) {
				renderer.updateFetchedData(newData);
			}
		} catch (err) {
			error = err instanceof Error ? err.message : 'An error occurred';
		} finally {
			loading = false;
		}
	};

	onMount(() => {
		isComponentMounted = true;

		renderer = new CanvasRenderer(canvas);

		renderer.start();

		fetchAndUpdateRenderer();
		intervalId = setInterval(fetchAndUpdateRenderer, interval);
	});

	onDestroy(() => {
		isComponentMounted = false;
		if (intervalId) {
			clearInterval(intervalId);
			intervalId = null as any;
		}
		if (renderer) {
			console.log('cleanup');
			renderer.cleanup();
			renderer = null as any;
		}
	});
</script>

<div class="canvas-container">
	<canvas id="main" width={CANVAS_CONFIG.width} height={CANVAS_CONFIG.height} bind:this={canvas}
	></canvas>
</div>

<style>
	.canvas-container {
		position: relative;
		max-width: 1200px;
		margin: 0 auto;
		border-radius: 8px;
		box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
		overflow: hidden;
	}

	canvas {
		display: block;
		width: 100%;
	}
</style>
