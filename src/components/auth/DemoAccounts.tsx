
import React from 'react';

const demoAccounts = [
  {
    role: "Admin",
    email: "admin@test.com",
    password: "password123",
    note: "Full platform access."
  },
  {
    role: "Wholesaler",
    email: "wholesaler1@test.com",
    password: "password123",
    note: "Can create shops, products and ads."
  },
  {
    role: "Seller",
    email: "seller1@test.com",
    password: "password123",
    note: "Can browse & order from shops."
  }
];

const DemoAccounts: React.FC = () => (
  <div className="mt-8">
    <div className="rounded-lg bg-muted/40 dark:bg-pakistani_green-950/40 p-4 border border-border dark:border-pakistani_green-900 text-gray-800 dark:text-pakistani_green-100">
      <div className="mb-2 font-semibold text-sm text-foreground dark:text-pakistani_green-200">
        <span>Demo Accounts:</span>
      </div>
      <ul className="space-y-2">
        {demoAccounts.map((acc) => (
          <li
            key={acc.email}
            className="flex flex-col sm:flex-row sm:justify-between items-start gap-1 sm:gap-0 rounded-md p-2 bg-card dark:bg-pakistani_green-900/60 text-foreground shadow-sm"
          >
            <span className="font-medium">{acc.role}:</span>
            <span className="font-mono text-xs break-all">{acc.email} / {acc.password}</span>
            <span className="text-xs text-muted-foreground">{acc.note}</span>
          </li>
        ))}
      </ul>
    </div>
  </div>
);

export default DemoAccounts;
