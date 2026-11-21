/**
 * Client-side security deterrents for NutriSense.
 * Blocks right-click context menu, DevTools/source/save/print shortcuts,
 * and non-input text selection/copying while preserving normal form input usability.
 */

const isEditableElement = (target: EventTarget | null): boolean => {
  if (!(target instanceof HTMLElement)) return false;
  const tag = target.tagName;
  return tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || target.isContentEditable;
};

export function initClientSecurity(): void {
  if (typeof window === 'undefined' || typeof document === 'undefined') return;

  // Silence non-error console output in production builds
  if (import.meta.env.PROD) {
    const noop = () => {};
    console.log = noop;
    console.info = noop;
    console.debug = noop;
    console.warn = noop;
  }

  // Disable right-click context menu
  document.addEventListener(
    'contextmenu',
    (e) => {
      e.preventDefault();
    },
    { capture: true }
  );

  // Disable dragging elements/images/text
  document.addEventListener(
    'dragstart',
    (e) => {
      e.preventDefault();
    },
    { capture: true }
  );

  // Disable text selection outside form inputs
  document.addEventListener(
    'selectstart',
    (e) => {
      if (!isEditableElement(e.target)) {
        e.preventDefault();
      }
    },
    { capture: true }
  );

  // Disable DevTools, View Source, Save, Print, and non-input Copy/Cut/Select-All shortcuts
  document.addEventListener(
    'keydown',
    (e) => {
      const key = e.key.toLowerCase();
      const ctrlOrMeta = e.ctrlKey || e.metaKey;
      const inInput = isEditableElement(e.target);

      // F12 (DevTools)
      if (e.key === 'F12') {
        e.preventDefault();
        e.stopPropagation();
        return;
      }

      // DevTools / Inspector combos (Ctrl+Shift+I/J/C/K/M, Cmd+Opt+I/J/C)
      if (ctrlOrMeta && e.shiftKey && ['i', 'j', 'c', 'k', 'm'].includes(key)) {
        e.preventDefault();
        e.stopPropagation();
        return;
      }
      if (e.metaKey && e.altKey && ['i', 'j', 'c', 'u'].includes(key)) {
        e.preventDefault();
        e.stopPropagation();
        return;
      }

      // View Source (Ctrl/Cmd+U), Save Page (Ctrl/Cmd+S), Print (Ctrl/Cmd+P)
      if (ctrlOrMeta && ['u', 's', 'p'].includes(key)) {
        e.preventDefault();
        e.stopPropagation();
        return;
      }

      // Copy / Cut / Select All blocked outside editable inputs
      if (!inInput && ctrlOrMeta && ['c', 'x', 'a'].includes(key)) {
        e.preventDefault();
        e.stopPropagation();
      }
    },
    { capture: true }
  );
}

