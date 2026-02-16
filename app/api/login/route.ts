import { NextResponse } from "next/server";

export async function POST(req: Request) {
    const { id, pass } = await req.json();

    if (
        id === process.env.APP_LOGIN_ID &&
        pass === process.env.APP_LOGIN_PASS
    ) {
        const res = NextResponse.json({ ok: true });

        res.cookies.set("session", "loggedin", {
            httpOnly: true,
            secure: true,
            path: "/",
            maxAge: 60 * 60 * 24,
        });

        return res;
    }

    return NextResponse.json(
        { ok: false, message: "Invalid credentials" },
        { status: 401 }
    );
}