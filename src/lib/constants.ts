export const BRAND_NAME = "Caramelt";
export const BRAND_TAGLINE = "A Swirl of Caramel, A Heart of Chocolate";

export const ORDER_STATUS_LABELS: Record<string, string> = {
  PENDING_ADMIN_ACCEPTANCE: "Pending Acceptance",
  ACCEPTED: "Accepted",
  PAID_CONFIRMED: "Payment Confirmed",
  DELIVERED: "Delivered",
  NOT_DELIVERED: "Not Delivered",
  RETURNED: "Returned",
  CANCELLED: "Cancelled",
};

export const ORDER_STATUS_COLORS: Record<
  string,
  { bg: string; text: string }
> = {
  PENDING_ADMIN_ACCEPTANCE: { bg: "bg-amber-100", text: "text-amber-700" },
  ACCEPTED: { bg: "bg-blue-100", text: "text-blue-700" },
  PAID_CONFIRMED: { bg: "bg-yellow-100", text: "text-yellow-700" },
  DELIVERED: { bg: "bg-green-100", text: "text-green-700" },
  NOT_DELIVERED: { bg: "bg-orange-100", text: "text-orange-700" },
  RETURNED: { bg: "bg-purple-100", text: "text-purple-700" },
  CANCELLED: { bg: "bg-red-100", text: "text-red-700" },
};

export const MIN_PREP_DAYS = 2;
