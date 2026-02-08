"use client";

import { ChangeEvent, useState } from "react";

export function ReceiptInput() {
    const [input, setInput] = useState("");
    const [output, setOutput] = useState("");


    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        setInput(e.target.value)
    }

    const handleSubmit = async () => {

        const params = {
            prompt: input,
            model: "gemini-3-flash-preview"
        };

        const response = await fetch(
            "/api/gemini",
            {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(params),
            }
        )
        
        const data = await response.json();
        setOutput(String(data.message));
    }

    return (
        <div className="flex flex-col gap-5 p-5">
            <h1 className="text-3xl">レシート構造化 by gemini API</h1>
            <input
                className="border w-1/2"
                onChange={handleChange}
            />
            <button
                onClick={handleSubmit}
                className="border border-2 rounded w-20 bg-gray-200 hover:bg-gray-300 cursor-pointer"
            >送信</button>
            <div>{output}</div>
        </div>
    );
}