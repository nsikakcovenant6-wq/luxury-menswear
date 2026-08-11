import { NextResponse } from "next/server";
import { BANK_DETAILS } from "@/lib/bank";

export async function GET() {
  return NextResponse.json({
    success: true,
    paymentMethod: "Bank Transfer",
    bank: BANK_DETAILS,
    instructions: [
      "Transfer the exact amount to the account above.",
      "Click 'I've Made Payment' after payment.",
      "Your payment will be verified by our team.",
      "Tailoring begins after payment is confirmed."
    ]
  });
}