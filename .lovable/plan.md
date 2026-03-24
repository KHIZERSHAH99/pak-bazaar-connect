strict note: do it if you think it right. if you thinks its not in our case you can chose whatever you think best  
  
Update Liability Clause in Terms & Conditions

Based on the Gemini legal advice, the current fixed PKR 10,000 liability cap could be challenged as unconscionable under Pakistan's Contract Act Section 74. This is a single-file text update.

### Change

**File: `src/pages/TermsAndConditions.tsx` (lines 249-252)**

Replace the current liability cap:

> "In no event shall our total liability exceed PKR 10,000 or the amount paid by you to us in the last 12 months, whichever is less."

With a fee-based limit and fraud/negligence carve-out:

> "In no event shall our total aggregate liability exceed the total fees paid by you to us during the 12 months immediately preceding the event giving rise to such liability. Nothing in these Terms shall limit or exclude our liability for: (a) death or personal injury caused by our negligence; (b) fraud or fraudulent misrepresentation; (c) gross negligence or willful misconduct; or (d) any liability that cannot be excluded or limited under applicable Pakistani law, including the Electronic Transactions Ordinance, 2002 and Section 74 of the Contract Act, 1872."

### Why this matters

- A fixed PKR 10,000 cap is legally weak -- courts can override it under Section 74 of the Contract Act
- Fee-based caps (12 months of fees) are the industry standard for B2B platforms
- Explicitly excluding gross negligence and fraud from the cap is essential -- without this, the entire limitation clause could be voided
- This protects you better while being legally defensible

### Files to edit

- `src/pages/TermsAndConditions.tsx` -- update lines 249-252  
  
