"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
    const [id, setId] = useState("");
    const [pass, setPass] = useState("");
    const [error, setError] = useState("");
    const router = useRouter();

    async function handleLogin(e: React.FormEvent) {
        e.preventDefault();

        const res = await fetch("/api/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id, pass }),
        });

        if (res.ok) {
            router.push("/");
        } else {
            setError("IDまたはパスワードが違います")
        }
    }

    return (
        <div className="flex h-screen items-center justify-center">
            <form onSubmit={handleLogin} className="border p-6 rounded w-80 space-y-3">
                <h1 className="text-xl font-bold">Login</h1>

                <input
                    className="border p-2 w-full"
                    placeholder="ID"
                    value={id}
                    onChange={(e) => setId(e.target.value)}
                />

                <input
                    className="border p-2 w-full"
                    type="password"
                    placeholder="Password"
                    value={pass}
                    onChange={(e) => setPass(e.target.value)}
                />

                {error && <p className="text-red-500 text-sm">{error}</p>}

                <button className="bg-black text-white w-full py-2">
                    Login
                </button>
            </form>
        </div>
    );
}