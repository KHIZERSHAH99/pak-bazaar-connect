
import React from 'react';

// Demo accounts removed for security in production
const demoAccounts = process.env.NODE_ENV === 'development' ? [
  {
    role: "Development Testing",
    email: "Contact administrator",
    note: "Demo accounts only available in development mode."
  }
] : [
  {
    role: "Production Account",
    email: "Contact Support",
    note: "Please contact support for account access in production."
  }
];

const DemoAccounts: React.FC = () => (
  <div className="mt-8">
    <div className="rounded-lg bg-muted/40 dark:bg-gray-900/90 p-4 border border-border dark:border-gray-800 text-gray-800 dark:text-gray-100">
      <div className="mb-2 font-semibold text-sm text-foreground dark:text-gray-100">
        <span>Demo Accounts:</span>
      </div>
      <ul className="space-y-2">
        {demoAccounts.map((acc) => (
          <li
            key={acc.email}
            className="flex flex-col sm:flex-row sm:justify-between items-start gap-1 sm:gap-0 rounded-md p-2 bg-card dark:bg-gray-800 text-foreground dark:text-gray-100 shadow-sm"
          >
            <span className="font-medium">{acc.role}:</span>
            <span className="font-mono text-xs break-all">{acc.email}</span>
            <span className="text-xs text-muted-foreground dark:text-gray-400">{acc.note}</span>
          </li>
        ))}
      </ul>
    </div>
  </div>
);

export default DemoAccounts;
