<script>
  import { onMount } from "svelte";
  import StarRating from "../components/StarRating.svelte";

  export let navigate;
  export let currentUser;

  let product = null;
  let relatedProducts = [];
  let fbtProducts = [];
  let reviews = [];
  let loading = true;
  let error = "";
  let productId = null;

  let newRating = 0;
  let newComment = "";
  let submitError = "";
  let submitSuccess = "";

  onMount(async () => {
    const urlParams = new URLSearchParams(window.location.search);
    productId = urlParams.get("id");

    if (!productId) {
      error = "No product ID specified.";
      loading = false;
      return;
    }

    // Fetch data in parallel or sequence
    await fetchProduct();
    await fetchRecommendations();
  });

  async function fetchProduct() {
    loading = true;
    submitError = "";
    try {
      const res = await fetch(`/api/products/${productId}/`);
      if (res.ok) {
        const data = await res.json();
        product = data;
        reviews = data.reviews || [];
        error = ""; // Clear error on success
      } else {
        error = "Product not found.";
        product = null;
      }
    } catch (e) {
      console.error(e);
      error = "Failed to load product.";
      product = null;
    } finally {
      loading = false;
    }
  }

  async function fetchRecommendations() {
    try {
      const res = await fetch(`/api/products/${productId}/recommendations/`);
      if (res.ok) {
        const data = await res.json();
        relatedProducts = data.related;
        fbtProducts = data.frequently_bought_together;
      }
    } catch (e) {
      console.error("Failed to load recommendations", e);
    }
  }

  async function addToCart() {
    if (!product) return;
    if (currentUser) {
      try {
        const res = await fetch("/api/cart/", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          credentials: "include",
          body: JSON.stringify({ product_id: product.id, quantity: 1 }),
        });
        const data = await res.json();
        if (res.ok) {
          window.dispatchEvent(new CustomEvent("cart-updated"));
          navigate("cart");
          alert("✅ Added to cart successfully!");
        } else alert("❌ Failed: " + (data.error || "Unknown error"));
      } catch (e) {
        console.error(e);
        alert("❌ Network error.");
      }
    } else {
      let cart = JSON.parse(localStorage.getItem("cart") || "[]");
      const existing = cart.find((item) => item.product_id === product.id);
      if (existing) existing.quantity += 1;
      else
        cart.push({
          product_id: product.id,
          quantity: 1,
          price: product.price,
        });
      localStorage.setItem("cart", JSON.stringify(cart));
      alert("Added to guest cart!");
      window.dispatchEvent(new CustomEvent("cart-updated"));
      navigate("cart");
    }
  }

  async function submitReview() {
    submitError = "";
    submitSuccess = "";
    if (!currentUser) {
      submitError = "Please login to review.";
      return;
    }
    if (newRating === 0) {
      submitError = "Please select a star rating.";
      return;
    }
    if (newComment.trim().length < 10) {
      submitError = "Comment must be at least 10 characters.";
      return;
    }
    if (newComment.length > 500) {
      submitError = "Comment must be under 500 characters.";
      return;
    }

    try {
      const res = await fetch("/api/reviews/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          product: product.id,
          rating: newRating,
          comment: newComment,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        submitSuccess = "Review submitted!";
        newRating = 0;
        newComment = "";
        await fetchProduct();
      } else {
        submitError = data.error || data.detail || "Failed to submit review.";
      }
    } catch (e) {
      console.error(e);
      submitError = "Network error.";
    }
  }
</script>

<div class="container py-5">
  <!-- 1. LOADING STATE -->
  {#if loading}
    <div class="text-center"><div class="spinner-border"></div></div>

    <!-- 2. ERROR STATE -->
  {:else if error}
    <div class="alert alert-danger">{error}</div>
    <button class="btn btn-secondary" on:click={() => navigate("home")}
      >Back to Home</button
    >
  {:else if product}
    <div class="row">
      <div class="col-md-6">
        <h1 class="display-4">{product.title}</h1>
        <p class="lead text-muted">{product.description}</p>
        <h2 class="text-primary my-4">${product.price}</h2>

        <div class="mb-3" data-testid="average-rating">
          <StarRating rating={Math.round(product.average_rating) || 0} />
          <span class="ms-2 text-muted"
            >({product.review_count || 0} reviews)</span
          >
        </div>
        <button
          class="btn btn-primary btn-lg"
          on:click={addToCart}
          data-testid="add-to-cart-button"
        >
          Add to Cart
        </button>
      </div>
    </div>

    <hr class="my-5" />

    <div data-testid="review-section">
      <h3 class="mb-4">Customer Reviews</h3>
      <div>
        <StarRating rating={Math.round(product.average_rating) || 0} />
        <span class="ms-2 text-muted"
          >({product.review_count || 0} reviews)</span
        >
      </div>
      {#if currentUser && currentUser.id}
        <div class="card p-3 mb-4 bg-light" data-testid="review-form">
          <h5>Write a Review</h5>
          {#if submitError}<div
              class="alert alert-danger"
              data-testid="review-error"
            >
              {submitError}
            </div>{/if}
          {#if submitSuccess}<div
              class="alert alert-success"
              data-testid="review-success"
            >
              {submitSuccess}
            </div>{/if}

          <div class="mb-2">
            <label>Your Rating:</label>
            <StarRating
              rating={newRating}
              interactive={true}
              onRate={(r) => (newRating = r)}
            />
          </div>
          <textarea
            class="form-control mb-2"
            rows="3"
            bind:value={newComment}
            data-testid="review-comment"
            placeholder="Min 10 chars..."
          ></textarea>
          <button
            class="btn btn-success"
            on:click={submitReview}
            data-testid="review-submit">Submit Review</button
          >
        </div>
      {:else}
        <div class="alert alert-warning">
          Please <a
            href="/login"
            on:click|preventDefault={() => navigate("login")}>login</a
          > to write a review.
        </div>
      {/if}

      <div class="list-group">
        {#each reviews as review}
          <div
            class="list-group-item list-group-item-action"
            data-testid="review-item"
          >
            <div class="d-flex w-100 justify-content-between align-items-start">
              <div>
                <h5 class="mb-1">{review.username || "Anonymous"}</h5>
                <div class="text-warning mb-2">
                  {"★".repeat(review.rating)}{"☆".repeat(5 - review.rating)}
                </div>
                <p class="mb-1">{review.comment}</p>
              </div>
              <small class="text-muted"
                >{new Date(review.created_at).toLocaleDateString()}</small
              >
            </div>
          </div>
        {:else}
          <div class="text-center text-muted py-4">
            <p>No reviews yet. Be the first to review this product!</p>
          </div>
        {/each}
      </div>
    </div>

    <hr class="my-5" />

    {#if fbtProducts.length > 0}
      <section class="mb-5" data-testid="frequently-bought-together">
        <h3>Frequently Bought Together</h3>
        <div class="row">
          {#each fbtProducts as item}
            <div class="col-md-3 col-6 mb-3">
              <div
                class="card h-100"
                data-testid="fbt-product-card"
                on:click={() => navigate(`product?id=${item.id}`)}
                style="cursor:pointer"
              >
                <div class="card-body">
                  <h6 class="card-title">{item.title}</h6>
                  <p class="card-text text-primary">${item.price}</p>
                </div>
              </div>
            </div>
          {/each}
        </div>
      </section>
    {/if}

    <section class="mb-5" data-testid="related-products">
      <h3>Related Products</h3>
      {#if relatedProducts.length === 0}
        <p class="text-muted">No related products found.</p>
      {:else}
        <div class="row">
          {#each relatedProducts as item}
            <div class="col-md-3 col-6 mb-3">
              <div
                class="card h-100"
                on:click={() => navigate(`product?id=${item.id}`)}
                style="cursor:pointer"
                data-testid="related-product-card"
              >
                <div class="card-body">
                  <h6 class="card-title">{item.title}</h6>
                  <p class="small text-muted">{item.category}</p>
                  <p class="card-text text-primary">${item.price}</p>
                </div>
              </div>
            </div>
          {/each}
        </div>
      {/if}
    </section>
  {/if}
</div>
