import type { Order } from '@/types/order';

export const CANCELLABLE_STATUSES: readonly string[] = [
  'PENDING',
  'PENDING_PAYMENT',
  'PAID',
  'CONFIRMED',
  'PROCESSING',
];

export const isOrderCancellable = (status?: string | null): boolean => {
  if (!status) return false;
  return CANCELLABLE_STATUSES.includes(status.trim().toUpperCase());
};

export const FINAL_ORDER_STATUSES: readonly string[] = [
  'DELIVERED',
  'COMPLETED',
  'CANCELLED',
];

export const isFinalOrderStatus = (status?: string | null): boolean => {
  if (!status) return false;
  return FINAL_ORDER_STATUSES.includes(status.trim().toUpperCase());
};

export const getOrderStatusLabel = (status?: string | null): string => {
  if (!status) return 'Unknown';
  switch (status.trim().toUpperCase()) {
    case 'PENDING':
    case 'PENDING_PAYMENT':
      return 'Pending payment';
    case 'PROCESSING':
      return 'Processing';
    case 'PAID':
    case 'CONFIRMED':
      return 'Confirmed';
    case 'SHIPPED':
    case 'IN_TRANSIT':
      return 'In Transit';
    case 'DELIVERED':
    case 'COMPLETED':
      return 'Delivered';
    case 'CANCELLED':
      return 'Cancelled';
    default:
      return status;
  }
};

export const formatCurrency = (val?: number | null, fallback = '—'): string => {
  if (val === undefined || val === null || isNaN(val)) return fallback;
  return `$${val.toFixed(2)}`;
};

export const formatOrderDate = (
  dateStr?: string | Date | null,
  includeTime = true
): string => {
  if (!dateStr) return '';
  const date = typeof dateStr === 'string' ? new Date(dateStr) : dateStr;
  if (isNaN(date.getTime())) return '';

  return date.toLocaleDateString('en-US', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    ...(includeTime
      ? {
          hour: '2-digit',
          minute: '2-digit',
        }
      : {}),
  });
};

export const formatOrderPrice = (price?: number | null): string => {
  return formatCurrency(price, '$0.00');
};

export const sortOrdersNewestFirst = (orders: Order[]): Order[] => {
  return [...orders].sort((a, b) => {
    const timeA = new Date(a.createdAt).getTime();
    const timeB = new Date(b.createdAt).getTime();
    return timeB - timeA;
  });
};

export const getEstimatedDeliveryDate = (
  order: Order,
  deliveryDays = 4
): string => {
  if (order.estimatedDeliveryDate) {
    const parsed = formatOrderDate(order.estimatedDeliveryDate, false);
    if (parsed) return parsed;
  }

  const created = new Date(order.createdAt);
  if (isNaN(created.getTime())) return '3–5 business days';

  const estimated = new Date(created);
  estimated.setDate(estimated.getDate() + deliveryDays);

  return formatOrderDate(estimated, false);
};

export const getOrderTrackingInfo = (order: Order) => {
  const year = new Date(order.createdAt).getFullYear() || 2026;
  const defaultTrackingNumber = `VRD-${year}-${String(order.orderId).padStart(6, '0')}`;
  const trackingNumber = order.trackingNumber || defaultTrackingNumber;
  const carrier = order.carrier || 'Nova Poshta Express';
  const trackingUrl =
    order.trackingUrl ||
    `https://tracking.novaposhta.ua/#/orders/${encodeURIComponent(trackingNumber)}`;

  return {
    carrier,
    trackingNumber,
    trackingUrl,
  };
};

export const printOrderInvoice = (order: Order): void => {
  if (order.invoiceUrl) {
    window.open(order.invoiceUrl, '_blank', 'noopener,noreferrer');
    return;
  }

  const tracking = getOrderTrackingInfo(order);
  const formattedDate = formatOrderDate(order.createdAt);
  const itemsHtml = (order.items ?? [])
    .map(
      item => `
      <tr>
        <td style="padding: 10px; border-bottom: 1px solid #e5e7eb;">
          <div style="font-weight: 600; color: #111827;">${item.productName}</div>
          <div style="font-size: 12px; color: #6b7280;">Category: ${item.categoryName || 'General Catalog'}</div>
        </td>
        <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; text-align: center;">${item.quantity}</td>
        <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; text-align: right;">${formatOrderPrice(item.priceAtPurchase)}</td>
        <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; text-align: right; font-weight: 600;">${formatOrderPrice(item.subtotal)}</td>
      </tr>
    `
    )
    .join('');

  const invoiceHtml = `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="utf-8" />
        <title>Invoice - Order #${order.orderId}</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; color: #1f2937; margin: 40px; }
          .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 30px; border-bottom: 2px solid #16a34a; padding-bottom: 20px; }
          .logo { font-size: 24px; font-weight: 800; color: #16a34a; }
          .badge { display: inline-block; padding: 4px 10px; border-radius: 9999px; font-size: 12px; font-weight: 600; background-color: #f3f4f6; }
          .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 30px; font-size: 14px; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
          th { text-align: left; padding: 10px; background-color: #f9fafb; font-size: 12px; text-transform: uppercase; color: #4b5563; }
          .totals { margin-left: auto; width: 300px; font-size: 14px; }
          .totals-row { display: flex; justify-content: space-between; padding: 6px 0; }
          .total-bold { font-size: 18px; font-weight: 700; border-top: 2px solid #e5e7eb; padding-top: 10px; color: #16a34a; }
          .footer { margin-top: 50px; text-align: center; font-size: 12px; color: #9ca3af; border-top: 1px solid #e5e7eb; padding-top: 20px; }
          @media print {
            body { margin: 0; }
            .no-print { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="no-print" style="margin-bottom: 20px; text-align: right;">
          <button onclick="window.print()" style="background-color: #16a34a; color: white; border: none; padding: 8px 16px; border-radius: 6px; cursor: pointer; font-weight: 600;">Print / Save PDF</button>
        </div>
        <div class="header">
          <div>
            <div class="logo">Verdora</div>
            <p style="margin: 4px 0 0; color: #6b7280; font-size: 14px;">Eco-friendly online store</p>
          </div>
          <div style="text-align: right;">
            <h1 style="margin: 0; font-size: 20px;">INVOICE #${order.orderId}</h1>
            <p style="margin: 4px 0; color: #6b7280; font-size: 13px;">Date: ${formattedDate}</p>
            <div class="badge">Status: ${order.status}</div>
          </div>
        </div>

        <div class="grid">
          <div>
            <h3 style="margin: 0 0 8px; font-size: 14px; text-transform: uppercase; color: #6b7280;">Shipping & Delivery</h3>
            <p style="margin: 0 0 4px; font-weight: 600;">Address:</p>
            <p style="margin: 0 0 8px; color: #4b5563;">${order.shippingAddress || 'Address specified at checkout'}</p>
            <p style="margin: 0 0 4px; font-weight: 600;">Method & Carrier:</p>
            <p style="margin: 0; color: #4b5563;">${order.deliveryMethod || 'Standard Delivery'} (${tracking.carrier})</p>
            ${order.status === 'SHIPPED' ? `<p style="margin: 4px 0 0; color: #4b5563;">Tracking: <strong>${tracking.trackingNumber}</strong></p>` : ''}
          </div>
          <div>
            <h3 style="margin: 0 0 8px; font-size: 14px; text-transform: uppercase; color: #6b7280;">Payment Details</h3>
            <p style="margin: 0 0 4px; font-weight: 600;">Payment Method:</p>
            <p style="margin: 0 0 8px; color: #4b5563;">${order.paymentMethod || 'Credit / Debit Card'}</p>
            <p style="margin: 0 0 4px; font-weight: 600;">Payment Status:</p>
            <p style="margin: 0; color: #4b5563;">${order.status === 'PAID' || order.status === 'CONFIRMED' || order.status === 'SHIPPED' ? 'Paid in Full' : order.status}</p>
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th>Item</th>
              <th style="text-align: center;">Qty</th>
              <th style="text-align: right;">Unit Price</th>
              <th style="text-align: right;">Subtotal</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHtml}
          </tbody>
        </table>

        <div class="totals">
          <div class="totals-row">
            <span>Subtotal:</span>
            <span>${formatOrderPrice(order.totalPrice)}</span>
          </div>
          <div class="totals-row">
            <span>Shipping:</span>
            <span>$0.00 (Free)</span>
          </div>
          <div class="totals-row total-bold">
            <span>Total:</span>
            <span>${formatOrderPrice(order.totalPrice)}</span>
          </div>
        </div>

        <div class="footer">
          <p>Thank you for shopping with Verdora! For questions, please contact support@verdora.com.</p>
        </div>
        <script>
          window.onload = function() {
            setTimeout(function() { window.print(); }, 400);
          };
        </script>
      </body>
    </html>
  `;

  const printWindow = window.open('', '_blank');
  if (printWindow) {
    printWindow.document.open();
    printWindow.document.write(invoiceHtml);
    printWindow.document.close();
  }
};
