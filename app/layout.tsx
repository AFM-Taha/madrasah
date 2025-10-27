import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import MUIThemeProvider from "@/lib/theme";
import { AuthProvider } from "@/contexts/AuthContext";
import HydrationProvider from "@/components/HydrationProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Madrasah Management System",
  description: "A comprehensive management system for madrasah administration",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <meta
          name="format-detection"
          content="telephone=no, date=no, email=no, address=no"
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="robots" content="noindex, nofollow" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <style dangerouslySetInnerHTML={{
          __html: `
            #pronounceRootElement,
            .pronounceRootElementItem {
              display: none !important;
              visibility: hidden !important;
              opacity: 0 !important;
              position: absolute !important;
              left: -9999px !important;
              top: -9999px !important;
              width: 0 !important;
              height: 0 !important;
            }
          `
        }} />
        <script dangerouslySetInnerHTML={{
          __html: `
            (function() {
              // Prevent browser extensions from injecting elements that cause hydration issues
              const originalAppendChild = Element.prototype.appendChild;
              const originalInsertBefore = Element.prototype.insertBefore;
              const originalRemoveChild = Element.prototype.removeChild;
              
              // Block specific extension elements
              const blockedIds = ['pronounceRootElement'];
              const blockedClasses = ['pronounceRootElementItem'];
              
              function isBlockedElement(element) {
                if (!element || !element.nodeType) return false;
                return blockedIds.includes(element.id) || 
                       (element.classList && blockedClasses.some(cls => element.classList.contains(cls)));
              }
              
              Element.prototype.appendChild = function(child) {
                if (isBlockedElement(child)) {
                  // Create a dummy element to prevent errors
                  const dummy = document.createElement('div');
                  dummy.style.display = 'none';
                  return dummy;
                }
                return originalAppendChild.call(this, child);
              };
              
              Element.prototype.insertBefore = function(newNode, referenceNode) {
                if (isBlockedElement(newNode)) {
                  // Create a dummy element to prevent errors
                  const dummy = document.createElement('div');
                  dummy.style.display = 'none';
                  return dummy;
                }
                return originalInsertBefore.call(this, newNode, referenceNode);
              };
              
              // Suppress hydration warnings for extension-related elements
              if (typeof window !== 'undefined') {
                const originalConsoleError = console.error;
                console.error = function(...args) {
                  const message = args[0];
                  if (typeof message === 'string' && 
                      (message.includes('Hydration failed') || 
                       message.includes('pronounceRootElement') ||
                       message.includes('Text content does not match'))) {
                    return; // Suppress hydration errors related to browser extensions
                  }
                  return originalConsoleError.apply(console, args);
                };
              }
            })();
          `
        }} />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        suppressHydrationWarning={true}
      >
        <HydrationProvider>
          <MUIThemeProvider>
            <AuthProvider>
              {children}
            </AuthProvider>
          </MUIThemeProvider>
        </HydrationProvider>
      </body>
    </html>
  );
}
