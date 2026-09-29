import { useEffect, useLayoutEffect } from 'react';
import { useLocation } from 'react-router-dom';

const ScrollToTop = () => {
  const { pathname, search } = useLocation();

  // 1. Disable browser's automatic scroll restoration on SPA navigation
  useEffect(() => {
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }
  }, []);

  // 2. Perform instant multi-phase scroll-to-top on route changes
  useLayoutEffect(() => {
    const scrollToTopAll = () => {
      // Reset window & document
      window.scrollTo(0, 0);
      if (document.documentElement) document.documentElement.scrollTop = 0;
      if (document.body) document.body.scrollTop = 0;

      // Reset all layout containers (UserLayout, AdminLayout, etc.)
      const scrollableElements = document.querySelectorAll(
        '#main-scroll-container, #admin-scroll-container, .overflow-y-auto, .overflow-auto, [class*="overflow-y-auto"], [class*="overflow-auto"]'
      );
      scrollableElements.forEach((el) => {
        if (el) {
          el.scrollTop = 0;
        }
      });
    };

    // Phase 1: Instant synchronous reset before paint
    scrollToTopAll();

    // Phase 2: Handle async Suspense / lazy route rendering and dynamic data loading
    const delays = [0, 50, 150, 300];
    const timerIds = delays.map((delay) =>
      setTimeout(scrollToTopAll, delay)
    );

    return () => {
      timerIds.forEach(clearTimeout);
    };
  }, [pathname, search]);

  return null;
};

export default ScrollToTop;
