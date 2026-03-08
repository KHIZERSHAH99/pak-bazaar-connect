// Simple order receipt PDF generation using browser print
export const generateOrderReceipt = (order: any) => {
  const items = order.order_items || [];
  const shopName = order.shops?.name || 'Shop';
  const date = new Date(order.created_at).toLocaleDateString('en-PK', {
    year: 'numeric', month: 'long', day: 'numeric',
  });

  const itemRows = items.map((item: any) =>
    `<tr>
      <td style="padding:8px;border-bottom:1px solid #eee">${item.product_name}</td>
      <td style="padding:8px;border-bottom:1px solid #eee;text-align:center">${item.quantity}</td>
      <td style="padding:8px;border-bottom:1px solid #eee;text-align:right">PKR ${Number(item.unit_price).toLocaleString()}</td>
      <td style="padding:8px;border-bottom:1px solid #eee;text-align:right">PKR ${Number(item.total_price).toLocaleString()}</td>
    </tr>`
  ).join('');

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Order Receipt - ${order.id.slice(0, 8)}</title>
      <style>
        body { font-family: 'Segoe UI', sans-serif; margin: 40px; color: #333; }
        .header { display: flex; justify-content: space-between; margin-bottom: 30px; border-bottom: 3px solid #1B5E20; padding-bottom: 20px; }
        .header h1 { color: #1B5E20; margin: 0; font-size: 24px; }
        .meta { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 30px; }
        .meta-box { background: #f8f9fa; padding: 15px; border-radius: 8px; }
        .meta-box h3 { margin: 0 0 8px; color: #1B5E20; font-size: 14px; text-transform: uppercase; }
        .meta-box p { margin: 2px 0; font-size: 13px; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
        th { background: #1B5E20; color: white; padding: 10px 8px; text-align: left; font-size: 13px; }
        th:nth-child(2), th:nth-child(3), th:nth-child(4) { text-align: center; }
        th:last-child { text-align: right; }
        .total-row { font-weight: bold; font-size: 16px; }
        .footer { text-align: center; margin-top: 40px; color: #999; font-size: 12px; }
        @media print { body { margin: 20px; } }
      </style>
    </head>
    <body>
      <div class="header">
        <div>
          <h1>Order Receipt</h1>
          <p style="margin:4px 0;color:#666">Pak Bazaar Connect</p>
        </div>
        <div style="text-align:right">
          <p style="font-size:18px;font-weight:bold;margin:0">Order #${order.id.slice(0, 8)}</p>
          <p style="color:#666;margin:4px 0">${date}</p>
          <p style="margin:4px 0;text-transform:capitalize">Status: ${order.status}</p>
        </div>
      </div>

      <div class="meta">
        <div class="meta-box">
          <h3>Shop</h3>
          <p><strong>${shopName}</strong></p>
        </div>
        <div class="meta-box">
          <h3>Buyer</h3>
          <p><strong>${order.buyer_name || 'N/A'}</strong></p>
          ${order.buyer_phone ? `<p>${order.buyer_phone}</p>` : ''}
          ${order.buyer_city ? `<p>${order.buyer_city}${order.buyer_province ? ', ' + order.buyer_province : ''}</p>` : ''}
        </div>
      </div>

      <table>
        <thead>
          <tr>
            <th>Product</th>
            <th>Qty</th>
            <th>Unit Price</th>
            <th>Total</th>
          </tr>
        </thead>
        <tbody>
          ${itemRows || `<tr><td colspan="4" style="padding:8px;text-align:center;color:#999">No items data available</td></tr>`}
        </tbody>
        <tfoot>
          ${order.shipping_cost ? `<tr><td colspan="3" style="padding:8px;text-align:right">Shipping:</td><td style="padding:8px;text-align:right">PKR ${Number(order.shipping_cost).toLocaleString()}</td></tr>` : ''}
          <tr class="total-row">
            <td colspan="3" style="padding:12px 8px;text-align:right;border-top:2px solid #1B5E20">Total:</td>
            <td style="padding:12px 8px;text-align:right;border-top:2px solid #1B5E20;color:#1B5E20">PKR ${Number(order.total_amount).toLocaleString()}</td>
          </tr>
        </tfoot>
      </table>

      ${order.payment_method ? `<p style="font-size:13px"><strong>Payment Method:</strong> ${order.payment_method.replace('_', ' ').toUpperCase()}</p>` : ''}
      ${order.order_notes ? `<p style="font-size:13px"><strong>Notes:</strong> ${order.order_notes}</p>` : ''}

      <div class="footer">
        <p>Thank you for your order! · Pak Bazaar Connect</p>
      </div>
    </body>
    </html>
  `;

  const printWindow = window.open('', '_blank');
  if (printWindow) {
    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.onload = () => printWindow.print();
  }
};
