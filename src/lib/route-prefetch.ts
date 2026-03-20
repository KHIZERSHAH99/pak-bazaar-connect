/**
 * Prefetch commonly visited routes during browser idle time.
 * This eliminates the loading spinner on first navigation by
 * downloading the JS chunks before the user clicks.
 */

const HIGH_PRIORITY_ROUTES = [
  () => import('@/pages/Login'),
  () => import('@/pages/Signup'),
  () => import('@/pages/Products'),
  () => import('@/pages/Dashboard'),
  () => import('@/pages/Tutorials'),
  () => import('@/pages/BrowseShops'),
];

const LOW_PRIORITY_ROUTES = [
  () => import('@/pages/ProductDetail'),
  () => import('@/pages/Profile'),
  () => import('@/pages/Contact'),
  () => import('@/pages/AboutUs'),
  () => import('@/pages/Checkout'),
  () => import('@/pages/Features'),
  () => import('@/pages/ShopDetails'),
];

let prefetched = false;

function prefetchBatch(loaders: Array<() => Promise<unknown>>, delayBetween = 200) {
  loaders.forEach((loader, i) => {
    setTimeout(() => {
      loader().catch(() => {
        // Silently ignore — chunk may not exist in dev
      });
    }, i * delayBetween);
  });
}

export function startRoutePrefetch() {
  if (prefetched) return;
  prefetched = true;

  // Use requestIdleCallback where available, otherwise setTimeout
  const schedule = typeof requestIdleCallback === 'function'
    ? requestIdleCallback
    : (cb: () => void) => setTimeout(cb, 2000);

  // High-priority routes: prefetch after initial render settles
  schedule(() => {
    prefetchBatch(HIGH_PRIORITY_ROUTES, 150);
  });

  // Low-priority routes: prefetch a bit later
  setTimeout(() => {
    schedule(() => {
      prefetchBatch(LOW_PRIORITY_ROUTES, 250);
    });
  }, 3000);
}
