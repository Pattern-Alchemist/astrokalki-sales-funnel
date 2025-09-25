"use client";

import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

type Lead = { id: number; email: string; createdAt: string };
type Booking = { id: number; name: string; email: string; phone?: string | null; topic: string; preferredDate?: string | null; status: string; createdAt: string };
type Order = { id: number; razorpayOrderId: string; amount: number; currency: string; status: string; product: string; receipt: string; createdAt: string };
type Payment = { id: number; razorpayPaymentId: string; orderId: number; amount: number; currency: string; status: string; method?: string | null; email?: string | null; contact?: string | null; createdAt: string };

type FetchState<T> = { data: T[]; total: number; loading: boolean; error: string | null };

function useAuthedFetch<T>(path: string) {
  const [state, setState] = useState<FetchState<T>>({ data: [], total: 0, loading: true, error: null });

  useEffect(() => {
    let mounted = true;
    const run = async () => {
      setState((s) => ({ ...s, loading: true, error: null }));
      try {
        const token = typeof window !== "undefined" ? localStorage.getItem("bearer_token") : null;
        const res = await fetch(`${path}?page=1&pageSize=10`, {
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        });
        if (!res.ok) throw new Error(`${res.status}: ${await res.text()}`);
        const json = await res.json();
        // Infer array key
        const key = Object.keys(json).find((k) => Array.isArray((json as any)[k])) as keyof typeof json;
        const arr = (json as any)[key] as T[];
        if (mounted) setState({ data: arr || [], total: json.total || arr?.length || 0, loading: false, error: null });
      } catch (e: any) {
        if (mounted) setState((s) => ({ ...s, loading: false, error: e?.message || "Failed to load" }));
      }
    };
    run();
    return () => { mounted = false; };
  }, [path]);

  return state;
}

function Amount({ value, currency }: { value: number; currency: string }) {
  const formatted = useMemo(() => {
    // Razorpay amounts come in smallest unit
    const major = value / 100;
    return new Intl.NumberFormat(undefined, { style: "currency", currency }).format(major);
  }, [value, currency]);
  return <span>{formatted}</span>;
}

export default function AdminPage() {
  const leads = useAuthedFetch<Lead>("/api/admin/leads");
  const bookings = useAuthedFetch<Booking>("/api/admin/bookings");
  const orders = useAuthedFetch<Order>("/api/admin/orders");
  const payments = useAuthedFetch<Payment>("/api/admin/payments");

  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Admin Dashboard</h1>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>Fetched with Bearer token</span>
          <Badge variant="secondary">v1</Badge>
        </div>
      </div>

      <Tabs defaultValue="leads">
        <TabsList className="mb-4">
          <TabsTrigger value="leads">Leads</TabsTrigger>
          <TabsTrigger value="bookings">Bookings</TabsTrigger>
          <TabsTrigger value="orders">Orders</TabsTrigger>
          <TabsTrigger value="payments">Payments</TabsTrigger>
        </TabsList>

        <TabsContent value="leads">
          <DataCard title="Leads" state={leads} columns={["ID", "Email", "Created At"]} renderRow={(l: Lead) => (
            <tr key={l.id} className="border-b last:border-0">
              <td className="py-2">{l.id}</td>
              <td className="py-2">{l.email}</td>
              <td className="py-2 text-muted-foreground">{new Date(l.createdAt).toLocaleString()}</td>
            </tr>
          )} />
        </TabsContent>

        <TabsContent value="bookings">
          <DataCard title="Bookings" state={bookings} columns={["ID", "Name", "Email", "Topic", "Date", "Status"]} renderRow={(b: Booking) => (
            <tr key={b.id} className="border-b last:border-0">
              <td className="py-2">{b.id}</td>
              <td className="py-2">{b.name}</td>
              <td className="py-2">{b.email}</td>
              <td className="py-2">{b.topic}</td>
              <td className="py-2">{b.preferredDate ? new Date(b.preferredDate).toLocaleDateString() : "-"}</td>
              <td className="py-2"><Badge>{b.status}</Badge></td>
            </tr>
          )} />
        </TabsContent>

        <TabsContent value="orders">
          <DataCard title="Orders" state={orders} columns={["ID", "Order ID", "Product", "Amount", "Status", "Created"]} renderRow={(o: Order) => (
            <tr key={o.id} className="border-b last:border-0">
              <td className="py-2">{o.id}</td>
              <td className="py-2 font-mono text-xs">{o.razorpayOrderId}</td>
              <td className="py-2">{o.product}</td>
              <td className="py-2"><Amount value={o.amount} currency={o.currency} /></td>
              <td className="py-2"><Badge variant={o.status === 'paid' ? 'default' : o.status === 'failed' ? 'destructive' : 'secondary'}>{o.status}</Badge></td>
              <td className="py-2 text-muted-foreground">{new Date(o.createdAt).toLocaleString()}</td>
            </tr>
          )} />
        </TabsContent>

        <TabsContent value="payments">
          <DataCard title="Payments" state={payments} columns={["ID", "Payment ID", "Order", "Amount", "Status", "Method"]} renderRow={(p: Payment) => (
            <tr key={p.id} className="border-b last:border-0">
              <td className="py-2">{p.id}</td>
              <td className="py-2 font-mono text-xs">{p.razorpayPaymentId}</td>
              <td className="py-2">#{p.orderId}</td>
              <td className="py-2"><Amount value={p.amount} currency={p.currency} /></td>
              <td className="py-2"><Badge variant={p.status === 'captured' ? 'default' : p.status === 'failed' ? 'destructive' : 'secondary'}>{p.status}</Badge></td>
              <td className="py-2">{p.method || '-'}</td>
            </tr>
          )} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function DataCard<T>({ title, state, columns, renderRow }: { title: string; state: FetchState<T>; columns: string[]; renderRow: (item: T) => React.ReactNode }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>{title}</CardTitle>
        <div className="text-sm text-muted-foreground">Total: {state.total}</div>
      </CardHeader>
      <CardContent>
        {state.loading ? (
          <div className="py-10 text-center text-sm text-muted-foreground">Loading…</div>
        ) : state.error ? (
          <div className="flex items-center justify-between gap-4 rounded-md border p-4">
            <div className="text-sm text-destructive">{state.error}</div>
            <Button size="sm" onClick={() => location.reload()}>Retry</Button>
          </div>
        ) : state.data.length === 0 ? (
          <div className="py-10 text-center text-sm text-muted-foreground">No data</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-muted-foreground">
                  {columns.map((c) => (
                    <th key={c} className="py-2 font-medium">{c}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {state.data.map((item) => renderRow(item))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}