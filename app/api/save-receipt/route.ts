import { NextResponse } from "next/server";
import { appendItemsToSheet } from "@/lib/googleSheets";

export async function POST(req: Request) {
    try {
        const data = await req.json();

        await appendItemsToSheet(data);

        return NextResponse.json({ ok: true });
    } catch (err) {
        console.error(err);
        return NextResponse.json({ ok: false }, { status: 500 });
    }
}
