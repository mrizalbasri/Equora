<script lang="ts">
  import SettingsAdjust from 'carbon-icons-svelte/lib/SettingsAdjust.svelte';
  import Warning from 'carbon-icons-svelte/lib/Warning.svelte';
  import ArrowRight from 'carbon-icons-svelte/lib/ArrowRight.svelte';
  import Book from 'carbon-icons-svelte/lib/Book.svelte';
  import ChartBar from 'carbon-icons-svelte/lib/ChartBar.svelte';
  import Checkmark from 'carbon-icons-svelte/lib/Checkmark.svelte';
  import ChevronRight from 'carbon-icons-svelte/lib/ChevronRight.svelte';
  import DataBase from 'carbon-icons-svelte/lib/DataBase.svelte';
  import Download from 'carbon-icons-svelte/lib/Download.svelte';
  import Home from 'carbon-icons-svelte/lib/Home.svelte';
  import Information from 'carbon-icons-svelte/lib/Information.svelte';
  import Map from 'carbon-icons-svelte/lib/Map.svelte';
  import Menu from 'carbon-icons-svelte/lib/Menu.svelte';
  import Compare from 'carbon-icons-svelte/lib/Compare.svelte';
  import Search from 'carbon-icons-svelte/lib/Search.svelte';
  import Security from 'carbon-icons-svelte/lib/Security.svelte';
  import Close from 'carbon-icons-svelte/lib/Close.svelte';
  import Education from 'carbon-icons-svelte/lib/Education.svelte';
  import Group from 'carbon-icons-svelte/lib/Group.svelte';
  import Development from 'carbon-icons-svelte/lib/Development.svelte';
  import RainDrop from 'carbon-icons-svelte/lib/RainDrop.svelte';
  import Wifi from 'carbon-icons-svelte/lib/Wifi.svelte';
  import Laptop from 'carbon-icons-svelte/lib/Laptop.svelte';
  import Clean from 'carbon-icons-svelte/lib/Clean.svelte';
  import Share from 'carbon-icons-svelte/lib/Share.svelte';
  import Renew from 'carbon-icons-svelte/lib/Renew.svelte';
  import Launch from 'carbon-icons-svelte/lib/Launch.svelte';

  const icons = {
    share: Share,
    retry: Renew,
    external: Launch,
    education: Education,
    users: Group,
    development: Development,
    water: RainDrop,
    internet: Wifi,
    computer: Laptop,
    sanitation: Clean,
    compass: Map,
    chart: ChartBar,
    sliders: SettingsAdjust,
    database: DataBase,
    compare: Compare,
    book: Book,
    shield: Security,
    arrow: ArrowRight,
    download: Download,
    search: Search,
    menu: Menu,
    close: Close,
    info: Information,
    chevron: ChevronRight,
    home: Home,
    map: Map,
    check: Checkmark,
    alert: Warning,
  };
  let { name, size = 20 }: { name: keyof typeof icons; size?: number } =
    $props();
  const Glyph = $derived(icons[name]);
</script>

<Glyph {size} aria-hidden="true" />
