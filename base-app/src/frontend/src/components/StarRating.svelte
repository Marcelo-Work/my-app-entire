<script>
  export let rating = 0;
  export let maxRating = 5;
  export let interactive = false;
  export let onRate; 
  function clickStar(index) {
    if (!interactive) return;
    if (onRate) onRate(index);
  }
</script>

<div class="star-rating" data-testid="star-rating" style="display: inline-block;">
  {#each Array(maxRating) as _, i}
    <span 
      style="
        cursor: {interactive ? 'pointer' : 'default'}; 
        color: {i < rating ? '#ffc107' : '#e4e5e9'}; 
        font-size: 1.5rem;
        user-select: none;
      "
      data-testid="star-{i}"
      on:click={() => clickStar(i + 1)}
      role="button"
      aria-label="{i + 1} Star"
    >
      ★
    </span>
  {/each}
</div>