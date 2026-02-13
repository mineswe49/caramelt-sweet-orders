export function formatPrice(amount: number): string {
  return `${amount.toFixed(2)} EGP`;
}

export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat("en-EG", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date(date));
}

export function formatShortDate(date: string | Date): string {
  return new Intl.DateTimeFormat("en-EG", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(date));
}
