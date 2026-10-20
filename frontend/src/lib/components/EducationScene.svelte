<script lang="ts">
  let { selected = 'water' }: { selected?: 'water' | 'sanitation' | 'digital' } = $props();
</script>

<svg viewBox="0 0 600 430" role="img" aria-label="Ilustrasi lingkungan sekolah dengan fasilitas air, sanitasi, dan akses digital, bukan data sekolah nyata">
  <defs>
    <pattern id="eq-school-windows" width="30" height="38" patternUnits="userSpaceOnUse">
      <rect x="6" y="8" width="17" height="22" rx="2" class="window" />
      <path d="M14.5 8V30M6 19H23" class="window-line" />
    </pattern>
  </defs>
  <path d="M56 286C50 195 96 94 195 71C285 50 357 75 419 124C481 173 546 201 545 277C544 352 452 378 319 378C179 378 61 359 56 286Z" class="backdrop" />
  <ellipse cx="303" cy="328" rx="216" ry="35" class="lawn" />
  <path d="M275 302L224 380H388L337 302Z" class="pathway" />
  <path d="M112 176L199 147V302H112Z" class="wing-side" />
  <path d="M112 176H218V302H112Z" class="wing" />
  <path d="M389 176H493V302H389Z" class="wing" />
  <path d="M493 176L515 160V286L493 302Z" class="wing-side" />
  <path d="M105 176H220V166H105ZM388 166H500V176H388Z" class="ledge" />
  <rect x="127" y="188" width="76" height="83" fill="url(#eq-school-windows)" />
  <rect x="404" y="188" width="76" height="83" fill="url(#eq-school-windows)" />
  <path d="M216 139L307 85L399 139V306H216Z" class="school" />
  <path d="M209 140L307 79L406 140" class="roof-outline" />
  <path d="M222 139L307 87L392 139Z" class="roof" />
  <rect x="277" y="244" width="60" height="62" rx="5" class="door" />
  <path d="M307 249V306" class="door-line" />
  <path d="M210 306H405L416 316H199Z" class="steps" />
  <rect x="243" y="177" width="26" height="37" rx="3" class="window" />
  <rect x="345" y="177" width="26" height="37" rx="3" class="window" />
  <path d="M256 177V214M243 195H269M358 177V214M345 195H371" class="window-line" />
  <rect x="282" y="151" width="50" height="43" rx="9" class="book-sign" />
  <path d="M291 164Q299 160 307 166Q315 160 323 164V181Q315 177 307 183Q299 177 291 181ZM307 166V183" class="book" />
  <path d="M307 80V43" class="pole" />
  <path d="M309 44H341L333 54L341 64H309Z" class="flag" />
  <path d="M85 322V264M75 281L85 289L98 276M532 315V256M521 273L532 281L544 268" class="tree" />
  <path d="M64 264C48 247 63 228 69 222C66 198 100 194 108 218C130 231 117 263 103 268Z" class="leaves" />
  <path d="M511 256C495 239 510 220 516 214C513 190 547 186 555 210C577 223 564 255 550 260Z" class="leaves" />
  <g transform="translate(49 108) rotate(-7 38 38)">
    <g class="facility-icon" class:selected={selected === 'water'}>
    <rect width="76" height="76" rx="20" class="resource-card" />
    <path d="M38 17C31 28 23 36 23 44A15 15 0 0 0 53 44C53 36 45 28 38 17Z" class="drop" />
    <path d="M31 44Q31 51 38 52" class="drop-detail" />
    </g>
  </g>
  <g transform="translate(439 59) rotate(8 43 37)">
    <g class="facility-icon" class:selected={selected === 'digital'}>
    <rect width="88" height="74" rx="20" class="resource-card" />
    <path d="M23 40V24H65V50H23V40M16 57H72M38 50V57M51 50V57" class="computer" />
    <path d="M36 34Q44 27 52 34M41 39Q44 36 47 39" class="signal" />
    </g>
  </g>
  <g transform="translate(450 306) rotate(5 38 38)">
    <g class="facility-icon" class:selected={selected === 'sanitation'}>
      <rect width="76" height="76" rx="20" class="resource-card" />
      <path d="M18 37H58L53 49H23ZM38 49V59M28 59H48M35 37V23H46V28M31 23H40" class="computer" />
    </g>
  </g>
  <path d="M146 347Q169 331 192 344L192 381Q169 367 146 380Z" class="open-book-left" />
  <path d="M192 344Q216 331 240 347V380Q216 367 192 381Z" class="open-book-right" />
  <path d="M155 351Q169 343 183 350M155 361Q169 353 183 360M202 350Q216 343 231 351M202 360Q216 353 231 361" class="book-lines" />
</svg>

<style>
  svg { display: block; width: 100%; height: auto; }
  .backdrop { fill: var(--eq-primary-tint); }
  .lawn { fill: var(--eq-chart-blue-light); opacity: 0.18; }
  .pathway, .wing, .school, .open-book-right { fill: var(--eq-surface); }
  .wing, .school { stroke: var(--eq-chart-blue-light); stroke-width: 1.5; stroke-linejoin: round; }
  .wing-side, .steps, .book-sign, .open-book-left { fill: var(--eq-primary-tint); stroke: var(--eq-chart-blue-light); stroke-width: 1.5; }
  .roof, .door, .flag, .drop { fill: var(--eq-primary); }
  .roof-outline, .pole { fill: none; stroke: var(--eq-primary-hover); stroke-width: 3; stroke-linecap: round; stroke-linejoin: round; }
  .ledge { fill: var(--eq-primary-hover); }
  .window, .leaves { fill: var(--eq-chart-blue-light); }
  .window-line, .door-line, .drop-detail { fill: none; stroke: var(--eq-surface); stroke-width: 1.5; stroke-linecap: round; }
  .tree { fill: none; stroke: var(--eq-chart-blue); stroke-width: 3; stroke-linecap: round; }
  .resource-card { fill: var(--eq-surface); stroke: var(--eq-border); stroke-width: 1.5; }
  .facility-icon { transform-box: fill-box; transform-origin: center; transition: transform 220ms ease, filter 220ms ease; }
  .selected { transform: translateY(-8px); filter: drop-shadow(0 8px 6px rgb(14 79 175 / 14%)); }
  .selected .resource-card { stroke: var(--eq-primary); stroke-width: 2.5; }
  @media (prefers-reduced-motion: reduce) { .facility-icon { transition: none; } .selected { transform: none; } }
  .computer, .signal, .book, .book-lines { fill: none; stroke: var(--eq-primary-hover); stroke-width: 2; stroke-linecap: round; stroke-linejoin: round; }
  .open-book-left, .open-book-right { stroke: var(--eq-chart-blue); stroke-width: 1.5; stroke-linejoin: round; }
</style>
