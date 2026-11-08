# Checkout delivery and server totals

Verified against the deployed `/v3/api-docs` on 2026-11-08.

`POST /orders` currently has no request body or delivery parameters. It creates
an order from the current cart. The frontend can show free pickup, but cannot
communicate that selection, the pickup location, or a courier address to the
server through the documented API. Server and checkout totals therefore cannot
yet be guaranteed to match for pickup.

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
