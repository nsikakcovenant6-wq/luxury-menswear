"use client";

import Image from "next/image";
import { useState } from "react";

export interface Order {
  id: string;
  date: string;
  status: "Delivered" | "Processing" | "Shipped" | "Cancelled";
  total: number;
  itemName: string;
  image: string;
}

const statusStyles: Record<Order["status"], string> = {
  Delivered: "bg-green-500/15 text-green-400",
  Processing: "bg-yellow-500/15 text-yellow-400",
  Shipped: "bg-blue-500/15 text-blue-400",
  Cancelled: "bg-red-500/15 text-red-400",
};

const mockOrders: Order[] = [
  {
    id: "BK-10231",
    date: "July 28, 2026",
    status: "Delivered",
    total: 65000,
    itemName: "Midnight Navy Pinstripe Senator",
    image: "/images/products/senator-1.jpg",
  },
  {
    id: "BK-10214",
    date: "July 12, 2026",
    status: "Shipped",
    total: 92000,
    itemName: "Charcoal Agbada Set",
    image: "/images/products/agbada-1.jpg",
  },
  {
    id: "BK-10198",
    date: "June 30, 2026",
    status: "Processing",
    total: 78000,
    itemName: "Ivory Wedding Suit",
    image: "/images/products/wedding-suit-1.jpg",
  },
];

export default function OrderHistory() {
  const [orders] = useState<Order[]>(mockOrders);

  if (orders.length === 0) {
    return (
      <div className="rounded-2xl border border-white/10 bg-white/5 p-8 text-center text-white/50 backdrop-blur-xl">
        You have no orders yet.
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl">
      <table className="w-full text-left text-sm">
        <thead className="border-b border-white/10 text-white/50">
          <tr>
            <th className="px-4 py-3 font-normal">Item</th>
            <th className="hidden px-4 py-3 font-normal sm:table-cell">Order ID</th>
            <th className="hidden px-4 py-3 font-normal md:table-cell">Date</th>
            <th className="px-4 py-3 font-normal">Status</th>
            <th className="px-4 py-3 text-right font-normal">Total</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => (
            <tr key={order.id} className="border-b border-white/5 last:border-0">
              <td className="flex items-center gap-3 px-4 py-4">
                <div className="relative h-12 w-10 flex-shrink-0 overflow-hidden rounded-md bg-[#0B0B0B]">
                  <Image src={order.image} alt={order.itemName} fill sizes="40px" className="object-cover" />
                </div>
                <span className="text-white">{order.itemName}</span>
              </td>
              <td className="hidden px-4 py-4 text-white/60 sm:table-cell">{order.id}</td>
              <td className="hidden px-4 py-4 text-white/60 md:table-cell">{order.date}</td>
              <td className="px-4 py-4">
                <span className={`rounded-full px-3 py-1 text-xs font-medium ${statusStyles[order.status]}`}>
                  {order.status}
                </span>
              </td>
              <td className="px-4 py-4 text-right font-medium text-white">
                ₦{order.total.toLocaleString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}