// Accordion component system for collapsible content panels
import type { ReactNode } from "react";
import React, { createContext, useContext, useState } from "react";
import { cn } from "~/lib/utils";

// Context type for Accordion state and actions
interface AccordionContextType {
  activeItems: string[]; // Currently open item IDs
  toggleItem: (id: string) => void; // Toggle open/close for an item
  isItemActive: (id: string) => boolean; // Check if item is open
}

// Create Accordion context
const AccordionContext = createContext<AccordionContextType | undefined>(
  undefined
);

// Custom hook to access Accordion context
const useAccordion = () => {
  const context = useContext(AccordionContext);
  if (!context) {
    throw new Error("Accordion components must be used within an Accordion");
  }
  return context;
};

// Props for Accordion root component
interface AccordionProps {
  children: ReactNode;
  defaultOpen?: string; // ID of item to open by default
  allowMultiple?: boolean; // Allow multiple items open at once
  className?: string;
}

// Accordion root: provides context and manages open state
export const Accordion: React.FC<AccordionProps> = ({
  children,
  defaultOpen,
  allowMultiple = false,
  className = "",
}) => {
  // State: array of open item IDs
  const [activeItems, setActiveItems] = useState<string[]>(
    defaultOpen ? [defaultOpen] : []
  );

  // Toggle open/close for an item
  const toggleItem = (id: string) => {
    setActiveItems((prev) => {
      if (allowMultiple) {
        // If multiple allowed, add/remove from array
        return prev.includes(id)
          ? prev.filter((item) => item !== id)
          : [...prev, id];
      } else {
        // Only one open at a time
        return prev.includes(id) ? [] : [id];
      }
    });
  };

  // Check if item is open
  const isItemActive = (id: string) => activeItems.includes(id);

  return (
    <AccordionContext.Provider
      value={{ activeItems, toggleItem, isItemActive }}
    >
      {/* Container for accordion items */}
      <div className={`space-y-2 ${className}`}>{children}</div>
    </AccordionContext.Provider>
  );
};

// Props for each Accordion item
interface AccordionItemProps {
  id: string; // Unique item ID
  children: ReactNode;
  className?: string;
}

// Accordion item: wraps header/content, provides border
export const AccordionItem: React.FC<AccordionItemProps> = ({
  id,
  children,
  className = "",
}) => {
  return (
    <div className={`overflow-hidden border-b border-gray-200 ${className}`}>
      {children}
    </div>
  );
};

// Props for Accordion header (clickable area)
interface AccordionHeaderProps {
  itemId: string; // ID of the item this header controls
  children: ReactNode;
  className?: string;
  icon?: ReactNode; // Optional custom icon
  iconPosition?: "left" | "right"; // Icon placement
}

// Accordion header: clickable button to toggle item open/close
export const AccordionHeader: React.FC<AccordionHeaderProps> = ({
  itemId,
  children,
  className = "",
  icon,
  iconPosition = "right",
}) => {
  const { toggleItem, isItemActive } = useAccordion();
  const isActive = isItemActive(itemId);

  // Default chevron icon, rotates when open
  const defaultIcon = (
    <svg
      className={cn("w-5 h-5 transition-transform duration-200", {
        "rotate-180": isActive,
      })}
      fill="none"
      stroke="#98A2B3"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M19 9l-7 7-7-7"
      />
    </svg>
  );

  // Handle click to toggle item
  const handleClick = () => {
    toggleItem(itemId);
  };

  return (
    <button
      onClick={handleClick}
      className={`
        w-full px-4 py-3 text-left
        focus:outline-none
        transition-colors duration-200 flex items-center justify-between cursor-pointer
        ${className}
      `}
    >
      {/* Header content and icon (left or right) */}
      <div className="flex items-center space-x-3">
        {iconPosition === "left" && (icon || defaultIcon)}
        <div className="flex-1">{children}</div>
      </div>
      {iconPosition === "right" && (icon || defaultIcon)}
    </button>
  );
};

// Props for Accordion content (collapsible area)
interface AccordionContentProps {
  itemId: string; // ID of the item this content belongs to
  children: ReactNode;
  className?: string;
}

// Accordion content: shows/hides children based on open state
export const AccordionContent: React.FC<AccordionContentProps> = ({
  itemId,
  children,
  className = "",
}) => {
  const { isItemActive } = useAccordion();
  const isActive = isItemActive(itemId);

  return (
    <div
      className={`
        overflow-hidden transition-all duration-300 ease-in-out
        ${isActive ? "max-h-fit opacity-100" : "max-h-0 opacity-0"}
        ${className}
      `}
    >
      {/* Collapsible content area */}
      <div className="px-4 py-3 ">{children}</div>
    </div>
  );
};