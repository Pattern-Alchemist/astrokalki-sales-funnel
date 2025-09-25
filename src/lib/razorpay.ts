// Utility to load Razorpay Checkout script on demand in the browser

let razorpayScriptPromise: Promise<void> | null = null;

export const loadRazorpay = (): Promise<void> => {
  if (typeof window === "undefined") return Promise.resolve();

  if ((window as any).Razorpay) {
    // Already loaded
    return Promise.resolve();
  }

  if (razorpayScriptPromise) return razorpayScriptPromise;

  razorpayScriptPromise = new Promise((resolve, reject) => {
    const existing = document.querySelector(
      'script[src="https://checkout.razorpay.com/v1/checkout.js"]'
    ) as HTMLScriptElement | null;

    if (existing) {
      existing.addEventListener("load", () => resolve());
      existing.addEventListener("error", () => reject(new Error("Razorpay script failed to load")));
      // If it was already loaded before listeners
      if ((window as any).Razorpay) return resolve();
      return;
    }

    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Razorpay script failed to load"));
    document.body.appendChild(script);
  });

  return razorpayScriptPromise;
};

export type RazorpayOptions = {
  key: string;
  amount: number;
  currency: string;
  name?: string;
  description?: string;
  order_id: string;
  notes?: Record<string, string>;
  handler?: (response: any) => void;
  prefill?: Record<string, any>;
  theme?: { color?: string };
  modal?: { ondismiss?: () => void };
};

export const openRazorpayCheckout = async (options: RazorpayOptions) => {
  await loadRazorpay();
  const RazorpayCtor = (window as any).Razorpay;
  if (!RazorpayCtor) throw new Error("Razorpay not available on window");
  const rzp = new RazorpayCtor(options);
  rzp.open();
  return rzp;
};