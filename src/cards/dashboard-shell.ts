// Bounded compatibility adapter for the HA Lovelace shell. No frontend imports,
// service calls, stored configuration changes or document-wide styles.
export function dashboardShell(element: HTMLElement): HTMLElement | undefined {
  let node: Node | null = element;
  while (node) {
    if (node instanceof HTMLElement && node.localName === "hui-root") return node;
    node = node.parentNode ?? (node instanceof ShadowRoot ? node.host : null);
  }
  return undefined;
}

const owners = new WeakMap<ShadowRoot, { users: Set<HTMLElement>; dispose: () => void }>();

export function attachKiosk(element: HTMLElement): () => void {
  const root = dashboardShell(element)?.shadowRoot;
  const query = new URLSearchParams(location.search);
  const header = root?.querySelector<HTMLElement>(".header");
  if (!root || !header || query.has("disable_km") || query.has("edit")) return () => {};
  let entry = owners.get(root);
  if (!entry) {
    const style = document.createElement("style");
    style.dataset.homeDashboardKiosk = "";
    style.textContent = ":host{--header-height:0px!important;--tab-bar-height:0px!important}.header{display:none!important}";
    const wrapper = header.parentElement;
    const sync = (): void => {
      if (wrapper?.classList.contains("edit-mode")) style.remove();
      else if (!style.isConnected) root.append(style);
    };
    const observer = new MutationObserver(sync);
    if (wrapper) observer.observe(wrapper, { attributes: true, attributeFilter: ["class"] });
    sync();
    entry = { users: new Set(), dispose: () => { observer.disconnect(); style.remove(); } };
    owners.set(root, entry);
  }
  entry.users.add(element);
  return () => {
    const current = owners.get(root);
    if (!current) return;
    current.users.delete(element);
    if (current.users.size === 0) {
      current.dispose();
      owners.delete(root);
    }
  };
}
