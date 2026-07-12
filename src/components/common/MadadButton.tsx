import React, { useState } from 'react';
import { HelpCircle, Phone, MessageCircle, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

const SUPPORT_PHONE = '03149388513';
const SUPPORT_WHATSAPP = '923149388513';

/**
 * Phase 7 — Persistent floating "Madad" (help) button.
 * Single tap → call or WhatsApp support. Works for low-literacy users.
 */
const MadadButton: React.FC = () => {
  const [open, setOpen] = useState(false);

  return (
    <div className="fixed bottom-4 right-4 z-40 flex flex-col items-end gap-2">
      {open && (
        <div className="flex flex-col gap-2 animate-fadeIn">
          <a
            href={`tel:${SUPPORT_PHONE}`}
            className="flex items-center gap-2 bg-card border border-border shadow-lg rounded-full px-4 py-3 min-h-[48px] hover:bg-accent"
          >
            <Phone className="w-5 h-5 text-primary" />
            <span className="font-poppins text-sm font-semibold">
              کال کریں / Call
            </span>
          </a>
          <a
            href={`https://wa.me/${SUPPORT_WHATSAPP}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 bg-card border border-border shadow-lg rounded-full px-4 py-3 min-h-[48px] hover:bg-accent"
          >
            <MessageCircle className="w-5 h-5 text-green-500" />
            <span className="font-poppins text-sm font-semibold">
              واٹس ایپ / WhatsApp
            </span>
          </a>
        </div>
      )}
      <Button
        onClick={() => setOpen((v) => !v)}
        size="lg"
        aria-label={open ? 'Close help' : 'Open help'}
        className="rounded-full w-14 h-14 shadow-lg bg-yellow-300 hover:bg-yellow-400 text-black"
      >
        {open ? <X className="w-6 h-6" /> : <HelpCircle className="w-6 h-6" />}
      </Button>
      {!open && (
        <span className="absolute -top-2 -left-14 bg-card border border-border shadow-md rounded-full px-2 py-1 text-[10px] font-poppins font-semibold pointer-events-none">
          مدد
        </span>
      )}
    </div>
  );
};

export default MadadButton;