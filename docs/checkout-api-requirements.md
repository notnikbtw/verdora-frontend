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

Courier checkout has separate city, street, building and optional apartment
fields. City is required for courier delivery and restored from checkout drafts.
The settlement must be chosen from Ukraine-only Photon/OpenStreetMap suggestions;
typing a name alone is not a selection. Suggestions include villages and region
labels. Changing the city clears the old street, house and apartment.
Street suggestions are scoped to the chosen settlement; manual street input is
also accepted because map data can be incomplete. House numbers allow suffixes
and separators such as `15Б`, `15/2` and `15-А`.

The selected settlement label (including available region/county), street, house
and apartment are joined into `deliveryAddress` for both the quote and order;
the backend contract does not have a separate city property. The full address
must fit the API's 512-character limit. Pickup does not require a city.

### Address search

Photon requests are debounced, cached, aborted when obsolete and serialized at
most once per second per browser. They use a separate unauthenticated fetch,
without API session cookies or account details. Search failures offer retry.
Provider URLs can be changed through `.env.example` settings. The public Photon
demo is suitable for moderate demo traffic, has no availability guarantee and
must be replaced with a supported deployment/provider for larger usage.

City selection metadata and coordinates are validated before restoring drafts.
Older free-text drafts retain their text but require settlement re-selection.
Frontend selection is a usability check, not a server security boundary or proof
that a street/house exists or can receive a delivery. Structured address validation
and serviceability checks still require backend support.

Provider references:

- Photon usage: https://github.com/komoot/photon#demo-server
- Photon API: https://github.com/komoot/photon/blob/master/docs/api-v1.md

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
