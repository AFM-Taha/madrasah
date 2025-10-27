'use client';

import { useEffect } from 'react';

interface HydrationProviderProps {
  children: React.ReactNode;
}

export default function HydrationProvider({ children }: HydrationProviderProps) {
  useEffect(() => {
    // Clean up any browser extension elements that might interfere
    const cleanupExtensionElements = () => {
      const pronounceElement = document.getElementById('pronounceRootElement');
      if (pronounceElement) {
        pronounceElement.remove();
      }
      
      // Remove any elements with pronounce-related classes
      const pronounceElements = document.querySelectorAll('.pronounceRootElementItem');
      pronounceElements.forEach(element => element.remove());
    };

    // Clean up extension elements immediately
    cleanupExtensionElements();
    
    // Set up a mutation observer to handle dynamically added extension elements
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === Node.ELEMENT_NODE) {
            const element = node as Element;
            if (
              element.id === 'pronounceRootElement' ||
              element.classList.contains('pronounceRootElementItem')
            ) {
              element.remove();
            }
          }
        });
      });
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });

    return () => {
      observer.disconnect();
    };
  }, []);

  // Always render children to prevent hydration mismatches
  // The suppressHydrationWarning in layout.tsx handles any browser extension differences
  return <>{children}</>;
}