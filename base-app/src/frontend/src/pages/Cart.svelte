<script>
  import { onMount } from "svelte";
  export let navigate;

  let cart = null;
  let loading = true;
  let couponCode = "";
  let couponError = "";
  let applying = false;
  let errorMessage = "";
  export let currentUser = null;
  onMount(async () => {
    if (currentUser) {
      await fetchCart();
    } else {
      const stored = localStorage.getItem("cart");
      if (stored) {
        const items = JSON.parse(stored);
        // Calculate total manually for display
        const total = items.reduce(
          (sum, item) => sum + item.price * item.quantity,
          0,
        );
        cart = {
          items,
          final_total: total,
          raw_total: total,
          discount_amount: 0,
          applied_coupon: null,
        };
      } else {
        cart = {
          items: [],
          final_total: 0,
          raw_total: 0,
          discount_amount: 0,
          applied_coupon: null,
        };
      }
    }
    loading = false;
    const handleCartUpdate = async () => {
      if (currentUser) {
        await fetchCart(); // Re-fetch from backend
      } else {
        // Re-load from localStorage for guests
        const stored = localStorage.getItem("cart");
        if (stored) {
          const items = JSON.parse(stored);
          const total = items.reduce(
            (sum, item) => sum + item.price * item.quantity,
            0,
          );
          cart = { items, final_total: total };
        }
      }
    };
    window.addEventListener("cart-updated", handleCartUpdate);

    // Cleanup on destroy
    return () => {
      window.removeEventListener("cart-updated", handleCartUpdate);
    };
  });

  async function fetchCart() {
    loading = true;
    try {
      const res = await fetch("/api/cart/", { credentials: "include" });
      if (res.ok) cart = await res.json();
    } catch (e) {
      console.error(e);
    } finally {
      loading = false;
    }
  }
  async function handleCheckout() {
    loading = true;
    errorMessage = "";

    try {
      const res = await fetch("/api/orders/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        credentials: "include",
        body: JSON.stringify({}),
      });

      const data = await res.json();

      if (res.ok) {
        navigate(`order-confirmation?id=${data.order_id}`);
      } else {
        errorMessage = data.error || "Failed to place order";
        alert("❌ Error: " + errorMessage);
      }
    } catch (e) {
      console.error("Network Error:", e);
      errorMessage = "Network error. Is the backend running?";
      alert("❌ Network Error: " + e.message);
    } finally {
      loading = false;
    }
  }
  async function applyCoupon() {
    couponError = "";
    if (!couponCode) return;
    applying = true;
    try {
      const res = await fetch("/api/cart/", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ action: "apply_coupon", code: couponCode }),
      });
      const data = await res.json();
      if (res.ok) {
        cart = data;
        couponCode = "";
      } else {
        couponError = data.error || "Failed to apply coupon";
      }
    } catch (e) {
      couponError = "Network error";
    } finally {
      applying = false;
    }
  }

  async function removeCoupon() {
    try {
      const res = await fetch("/api/cart/", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ action: "remove_coupon" }),
      });
      if (res.ok) cart = await res.json();
    } catch (e) {
      console.error(e);
    }
  }
</script>

<div class="container py-5">
  <h2>Shopping Cart</h2>
  {#if loading}
    <div class="spinner-border"></div>
  {:else if !cart || cart.items.length === 0}
    <p>Your cart is empty.</p>
    <button class="btn btn-primary" on:click={() => navigate("home")}
      >Browse Products</button
    >
  {:else}
    <ul class="list-group mb-4">
      {#each cart.items as item}
        <li class="list-group-item">
          Product ID: {item.product_id} (Qty: {item.quantity})
        </li>
      {/each}
    </ul>
    {#if errorMessage}
      <div class="alert alert-danger mb-3">{errorMessage}</div>
    {/if}
    <!-- Coupon Section -->
    <div class="card p-3 mb-4 bg-light">
      <label class="form-label">Have a coupon?</label>
      <div class="input-group">
        <input
          type="text"
          class="form-control {couponError ? 'is-invalid' : ''}"
          placeholder="Enter code (e.g., WELCOME10)"
          bind:value={couponCode}
          data-testid="coupon-input"
          disabled={!!cart.applied_coupon}
        />
        <button
          class="btn btn-outline-secondary"
          type="button"
          on:click={applyCoupon}
          disabled={applying || !!cart.applied_coupon}
          data-testid="coupon-apply">{applying ? "..." : "Apply"}</button
        >
      </div>
      {#if couponError}
        <div class="invalid-feedback d-block" data-testid="coupon-error">
          {couponError}
        </div>
      {/if}
      {#if cart.applied_coupon}
        <div class="mt-2 text-success">
          Coupon <strong>{cart.applied_coupon}</strong> applied!
          <button class="btn btn-sm btn-link" on:click={removeCoupon}
            >Remove</button
          >
        </div>
      {/if}
    </div>

    <!-- Totals -->
    <div class="d-flex justify-content-end flex-column align-items-end">
      <p>Subtotal: ${(cart.raw_total || cart.final_total)?.toFixed(2)}</p>
      {#if cart.discount_amount > 0}
        <p class="text-success" data-testid="discount-amount">
          Discount: -${cart.discount_amount.toFixed(2)}
        </p>
      {/if}
      <h3 class="display-6 text-primary mt-2" data-testid="cart-total">
        Total: ${cart.final_total?.toFixed(2)}
      </h3>
      {#if currentUser}
        <!-- Registered User Checkout -->
        <button
          class="btn btn-success btn-lg w-100 mt-3"
          on:click={handleCheckout}
        >
          Checkout
        </button>
      {:else}
        <div class="w-100 mt-3">
          <p class="text-muted mb-2">Not logged in? You have two options:</p>
          <button
            class="btn btn-primary btn-lg w-100 mb-2"
            on:click={() => navigate("guest/checkout")}
            data-testid="guest-checkout"
          >
            Checkout as Guest
          </button>

          <button
            class="btn btn-outline-secondary btn-lg w-100"
            on:click={() => navigate("login")}
          >
            Login to Checkout
          </button>
        </div>
      {/if}
    </div>
  {/if}
</div>
