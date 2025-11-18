import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const data = await req.json();

  const orderId = data?.id;
  const totalKg = calculateKgFromOrder(data);

  if (totalKg >= 10) {
    await saveEligibleOrder(orderId);
  }

  return NextResponse.json({ ok: true });
}

function calculateKgFromOrder(order: any): number {
  let kg = 0;
  for (const item of order.line_items) {
    const title = item.title.toLowerCase();
    const match = title.match(/(\d+)\s*kg/);
    if (match) kg += parseInt(match[1]);
  }
  return kg;
}

async function saveEligibleOrder(orderId: number) {
  // salva su tuo DB/file/firebase ecc.
}
