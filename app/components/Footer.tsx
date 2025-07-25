import React from "react";

// Helper to get current year in NZDT (UTC+13 or UTC+12 depending on daylight saving)
function getNZDTYear() {
  // NZDT is UTC+13, but New Zealand switches between NZDT (UTC+13) and NZST (UTC+12)
  // For the purpose of the footer, we want the year to roll over at midnight in New Zealand (Auckland)
  // Intl.DateTimeFormat with 'Pacific/Auckland' gives us the correct local time
  const nowNZ = new Date(
    new Intl.DateTimeFormat("en-US", {
      timeZone: "Pacific/Auckland",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    }).format(new Date())
  );
  // But the above returns a string, so instead, use toLocaleString with timeZone and extract the year
  const year = new Date().toLocaleString("en-US", { timeZone: "Pacific/Auckland" }).split("/")[2].split(",")[0].trim();
  return year;
}

export const Footer: React.FC = () => {
  const year = getNZDTYear();
  return (
    <footer className="w-full py-8 mt-5 flex flex-col items-center justify-center border-t border-gray-200 bg-white dark:bg-gray-950">
      <span className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white mb-1">ResumeAI</span>
      <span className="text-sm text-gray-500 dark:text-gray-400">
        © {year} ResumeAI. All rights reserved.
      </span>
    </footer>
  );
}; 