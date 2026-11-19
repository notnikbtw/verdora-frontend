# Checkout delivery and server totals

Verified against the deployed `/v3/api-docs` on 2026-11-19.

`CartResponse` contains `cartId`, `items` and `totalPrice` (the total price of all
items). It does not include `shippingCost`. A captured `GET /cart` response also
confirmed that the field is absent. A missing shipping cost must not be displayed
as zero or interpreted as free delivery.

`POST /orders` currently has no request body or delivery parameters. It creates
an order from the current cart. The frontend cannot
communicate that selection, the pickup location, or a courier address to the
server through the documented API.

Until this API is extended, Cart and Checkout preserve the server's
`cart.totalPrice`. When `shippingCost` is absent, delivery options and the summary
show "Not calculated", the amount is labelled "Items total", and the UI explains
that delivery is not included. Guest carts also leave delivery uncalculated.
An explicit numeric shipping cost, including zero, is displayed as returned.
Selecting pickup does not deduct an invented fee or advertise free pickup. A
delivery-specific quote cannot be offered until the backend supports it.

Required backend support:

- Accept a delivery method (`delivery` or `pickup`), contact information, and
  either a pickup location ID or a courier address.
- Validate the location/address for the selected method.
- Calculate item prices and shipping on the server; pickup is free, courier
  delivery uses the applicable server tariff.
- Provide a checkout quote with item subtotal, shipping cost and total before
  confirmation. The frontend must display this quote rather than calculate a
  separate authoritative total.
- Create the order using the selected delivery details and validate the quote.
  If the payable total changed, return the updated quote for the customer to
  confirm before placing the order.
- Return the saved delivery method, location/address, subtotal, shipping cost
  and final total in the created order.

The final endpoint names and request/response field names must be agreed with
the backend and documented in OpenAPI before frontend integration.
