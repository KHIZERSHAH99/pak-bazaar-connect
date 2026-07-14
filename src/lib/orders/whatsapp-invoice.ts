import { Order } from '@/lib/types';

// Normalize a Pakistani phone number to international format for wa.me
// Accepts "03001234567", "+923001234567", "923001234567" — returns "923001234567"
const normalizePkPhone = (raw?: string | null): string | null => {
  if (!raw) return null;
  const digits = raw.replace(/\D/g, '');
  if (!digits) return null;
  if (digits.startsWith('92')) return digits;
  if (digits.startsWith('0')) return '92' + digits.slice(1);
  if (digits.length === 10) return '92' + digits;
  return digits;
};

export const buildInvoiceText = (order: Order): string => {
  const shopName = order.shops?.name || 'PakMandi Shop';
  const shortId = order.id.slice(0, 8).toUpperCase();
  const lines: string[] = [];

  lines.push(`السلام علیکم ${order.buyer_name || ''}`.trim());
  lines.push('');
  lines.push(`🧾 *${shopName}* — Invoice`);
  lines.push(`Order #${shortId}`);
  lines.push('');

  if (order.order_items?.length) {
    lines.push('*Items:*');
    order.order_items.forEach((it) => {
      lines.push(`• ${it.quantity} x ${it.product_name} — Rs. ${Number(it.total_price).toLocaleString()}`);
    });
    lines.push('');
  }

  lines.push(`*Total: Rs. ${Number(order.total_amount || 0).toLocaleString()}*`);

  if (order.payment_method) {
    lines.push(`Payment: ${order.payment_method.replace(/_/g, ' ').toUpperCase()}`);
  }
  if (order.estimated_delivery) {
    lines.push(`Delivery: ${new Date(order.estimated_delivery).toLocaleDateString()}`);
  }

  lines.push('');
  lines.push('Shukriya! — PakMandi');

  return lines.join('\n');
};

export const buildWhatsappInvoiceUrl = (order: Order): string | null => {
  const phone = normalizePkPhone(order.buyer_phone);
  const text = encodeURIComponent(buildInvoiceText(order));
  if (!phone) return `https://wa.me/?text=${text}`;
  return `https://wa.me/${phone}?text=${text}`;
};

export const buildTelUrl = (raw?: string | null): string | null => {
  const phone = normalizePkPhone(raw);
  if (!phone) return null;
  return `tel:+${phone}`;
};