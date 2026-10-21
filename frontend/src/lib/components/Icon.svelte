<script lang="ts">
  const paths = {
    compass: 'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18ZM16 8l-2 6-6 2 2-6 6-2Z',
    chart: 'M4 4v16h16M8 15v-4m5 4V7m5 8v-6',
    sliders: 'M4 6h9m4 0h3M4 12h3m4 0h9M4 18h10m4 0h2M13 3v6M7 9v6m7 0v6',
    database:
      'M20 6c0 2-3.6 3-8 3S4 8 4 6s3.6-3 8-3 8 1 8 3ZM4 6v6c0 2 3.6 3 8 3s8-1 8-3V6M4 12v6c0 2 3.6 3 8 3s8-1 8-3v-6',
    compare: 'M8 3 4 7l4 4M4 7h12M16 13l4 4-4 4M20 17H8',
    book: 'M12 6C9 3 5 3 3 4v15c3-1 6-1 9 2m0-15c3-3 7-3 9-2v15c-3-1-6-1-9 2V6Z',
    shield: 'M12 3 4 6v6c0 5 8 9 8 9s8-4 8-9V6l-8-3ZM8 12l3 3 5-6',
    arrow: 'M5 12h14m-5-5 5 5-5 5',
    download: 'M12 3v12m-5-5 5 5 5-5M4 16v5h16v-5',
    search: 'M10 3a7 7 0 1 0 0 14 7 7 0 0 0 0-14Zm5 12 6 6',
    menu: 'M4 6h16M4 12h16M4 18h16',
    close: 'm6 6 12 12M18 6 6 18',
    info: 'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18ZM12 11v6m0-10v.01',
    chevron: 'm9 5 7 7-7 7',
    home: 'm3 10 9-7 9 7v11h-7v-7h-4v7H3V10Z',
    map: 'm3 5 6-2 6 2 6-2v16l-6 2-6-2-6 2V5Zm6-2v16m6-14v16',
  };
  let { name, size = 20 }: { name: keyof typeof paths; size?: number } =
    $props();
</script>

<svg
  width={size}
  height={size}
  viewBox="0 0 24 24"
  fill="none"
  stroke="currentColor"
  stroke-width="1.7"
  stroke-linecap="round"
  stroke-linejoin="round"
  aria-hidden="true"><path d={paths[name]} /></svg
>
