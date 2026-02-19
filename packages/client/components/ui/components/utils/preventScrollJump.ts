/**
 * Utility to prevent scroll jumps when dropdowns open/close
 * 
 * When MDUI components (like mdui-select) open their dropdown menus,
 * they may add overflow:hidden to the body to prevent background scrolling.
 * This causes the scrollbar to disappear, which shifts content horizontally.
 * 
 * This utility compensates for the scrollbar width by adding padding
 * when overflow is hidden, preventing the visual jump.
 */

let isInitialized = false;

/**
 * Calculate the current scrollbar width
 */
function getScrollbarWidth(): number {
  const outer = document.createElement('div');
  outer.style.visibility = 'hidden';
  outer.style.overflow = 'scroll';
  outer.style.width = '100px';
  outer.style.position = 'absolute';
  outer.style.top = '-9999px';
  document.body.appendChild(outer);

  const inner = document.createElement('div');
  inner.style.width = '100%';
  outer.appendChild(inner);

  const scrollbarWidth = outer.offsetWidth - inner.offsetWidth;
  document.body.removeChild(outer);

  return scrollbarWidth;
}

/**
 * Check if body has a vertical scrollbar
 */
function hasVerticalScrollbar(): boolean {
  return document.documentElement.scrollHeight > window.innerHeight;
}

/**
 * Initialize scroll jump prevention
 * Call this once when the app starts
 */
export function initPreventScrollJump(): void {
  if (isInitialized) return;
  isInitialized = true;

  // Store the original overflow value
  let originalOverflow = '';
  let scrollbarWidth = 0;

  // Create a MutationObserver to watch for body style changes
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.type === 'attributes' && mutation.attributeName === 'style') {
        const body = document.body;
        const computedStyle = window.getComputedStyle(body);
        const overflow = computedStyle.overflow;
        const overflowY = computedStyle.overflowY;

        // Check if overflow was just set to hidden
        if ((overflow === 'hidden' || overflowY === 'hidden') && !body.style.paddingRight) {
          // Save original overflow if not already saved
          if (!originalOverflow) {
            originalOverflow = body.style.overflow || '';
          }

          // Only add padding if there's a scrollbar to compensate for
          if (hasVerticalScrollbar()) {
            scrollbarWidth = getScrollbarWidth();
            if (scrollbarWidth > 0) {
              // Add padding to compensate for scrollbar width
              const currentPadding = parseInt(computedStyle.paddingRight) || 0;
              body.style.paddingRight = `${currentPadding + scrollbarWidth}px`;
            }
          }
        }
        // Check if overflow was restored (not hidden anymore)
        else if (overflow !== 'hidden' && overflowY !== 'hidden' && body.style.paddingRight && scrollbarWidth > 0) {
          // Remove the compensation padding
          const currentPadding = parseInt(computedStyle.paddingRight) || 0;
          const newPadding = currentPadding - scrollbarWidth;
          
          if (newPadding <= 0) {
            body.style.paddingRight = '';
          } else {
            body.style.paddingRight = `${newPadding}px`;
          }
          
          scrollbarWidth = 0;
          originalOverflow = '';
        }
      }
    });
  });

  // Start observing body element for style changes
  observer.observe(document.body, {
    attributes: true,
    attributeFilter: ['style'],
  });
}
