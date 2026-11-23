# Checkout delivery and server totals

Verified against the deployed `/v3/api-docs` on 2026-11-23.

`GET /cart` returns item totals without delivery. Cart and guest cart summaries
keep shipping unknown until delivery details are selected in Checkout.

## Quote and order creation

Both `POST /orders/checkout-summary` and `POST /orders` require the same body:

```json
{
  "deliveryMethod": "COURIER_DELIVERY",
  "deliveryAddress": "Kyiv, Khreshchatyk St, 22"
}
```

or:

```json
{ "deliveryMethod": "STORE_PICKUP", "pickupPointId": 1 }
```

`buildCheckoutPayload` builds both requests from the same form values. Pickup
locations remain in `src/config/checkout.config.ts`, with numeric server IDs and
stable string form IDs so existing checkout drafts still work. The backend
currently stores the numeric ID without validating it against a directory.

The summary endpoint does not create an order or clear the cart. Its response is
an API envelope whose `data` contains `itemsTotal`, `shippingCost` and `totalPrice`.
Checkout displays these values directly, without calculating tariffs. The current
server tariff is free pickup, courier delivery at ₴150, and free courier delivery
for item totals of at least ₴2000.

Address changes are debounced. Delivery details and cart contents are part of the
quote query key; obsolete requests can be aborted and cannot replace a quote for
different delivery details. Confirmation is disabled while the form is invalid,
the quote is being fetched, or calculation has failed. A failed quote shows one
inline retry action without a mutation error toast.

Creating an order sends the same delivery details used by the displayed quote.
The order response is authoritative and includes `itemsTotal`, `shippingCost`,
`totalPrice`, `deliveryMethod`, `deliveryAddress` and `pickupPointId`. The server
recalculates the amount on creation; there is currently no quote ID or price lock
covering concurrent cart or product-price changes between the two requests.

## Order history

`GET /orders` and `GET /orders/{id}` include the saved delivery breakdown. Details,
confirmation and printed invoices display item subtotal, shipping and the final
server total separately. Older orders have `deliveryMethod: null` and
`shippingCost: 0`. Missing fields (for example in admin detail responses) stay
unknown rather than being advertised as free shipping.

Contact details shown in Checkout are not part of `CheckoutRequest`; only delivery
details are sent. An endpoint for pickup locations and contact overrides would
require an additional backend contract.
