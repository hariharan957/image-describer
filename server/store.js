// In-memory history of described images. Reset on server restart.
const items = new Map();

export function addItem(item) {
  const id = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
  const stored = { id, createdAt: new Date().toISOString(), ...item };
  items.set(id, stored);
  // Cap history so memory doesn't grow forever in a long-running demo.
  if (items.size > 100) {
    const oldest = [...items.entries()].sort(
      (a, b) => new Date(a[1].createdAt) - new Date(b[1].createdAt)
    )[0];
    if (oldest) items.delete(oldest[0]);
  }
  return stored;
}

export function listItems() {
  return [...items.values()].sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
  );
}

export function getItem(id) {
  return items.get(id) || null;
}

export function clearItems() {
  items.clear();
}
