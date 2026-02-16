import { NextResponse, NextRequest } from "next/server";

export function proxy(req: NextRequest) {
    const loggedIn = req.cookies.get("session")?.value === "loggedin";

    const isLoginPage = req.nextUrl.pathname.startsWith("/login");
    const isApi = req.nextUrl.pathname.startsWith("/api/login");

    if (loggedIn || isLoginPage || isApi) {
        return NextResponse.next();
    }

    return NextResponse.redirect(new URL("/login", req.url));
}

export const config = {
    matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};