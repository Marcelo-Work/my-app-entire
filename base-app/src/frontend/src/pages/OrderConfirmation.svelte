<script>
    import { onMount } from "svelte";
    export let navigate;

    let orderId = null;
    let loading = true;

    onMount(() => {
        const urlParams = new URLSearchParams(window.location.search);
        orderId = urlParams.get("id");

        if (!orderId) {
            navigate("home");
            return;
        }

        loading = false;
    });
</script>

<div class="container py-5 text-center" data-testid="order-confirmed">
    {#if loading}
        <div class="spinner-border"></div>
    {:else}
        <div
            class="alert alert-success shadow-sm"
            data-testid="order-success-message"
        >
            <h1 class="display-4">✅ Order Confirmed!</h1>
            <p class="lead">Thank you for your purchase.</p>
            <hr class="my-4" />
            <p>Your order has been placed successfully.</p>
            <h3 class="text-primary">Order ID: #{orderId}</h3>
            <p class="text-muted mt-2">
                A confirmation email has been sent to your inbox.
            </p>

            <div class="mt-4">
                <button
                    class="btn btn-primary btn-lg me-2"
                    on:click={() => navigate("home")}
                >
                    Continue Shopping
                </button>
                <a href="/email-logs" class="btn btn-outline-secondary btn-lg">
                    View Email Logs
                </a>
            </div>
        </div>
    {/if}
</div>
