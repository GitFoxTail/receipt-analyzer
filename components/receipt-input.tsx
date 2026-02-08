"use client";

import React, { useState } from "react";
import Markdown from "react-markdown";

export function ReceiptInput() {
    const [input, setInput] = useState("");
    const [output, setOutput] = useState("");
    const [model, setModel] = useState("gemini-3-flash-preview")
    const [sendedPrompt, setSendedPrompt] = useState("");

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setInput(e.target.value)
    }

    const handleSubmit = async (e: React.SyntheticEvent) => {
        e.preventDefault();
        const prompt = input;
        setSendedPrompt(prompt);
        setInput("");
        setOutput("生成中...");

        const params = {
            prompt: input,
            model: model,
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

    const handleChangeModelSelector = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setModel(e.target.value);
    }

    return (
        <div className="flex flex-col gap-5 p-5 w-3/4">
            <h1 className="text-3xl">レシート構造化 by gemini API</h1>
            <h2>モデル選択</h2>
            <select
                value={model}
                onChange={handleChangeModelSelector}
                className="border"
            >
                <option value="gemini-3-flash-preview">Gemini 3 flash preview</option>
                <option value="gemini-2.5-pro">Gemini 2.5 pro</option>
                <option value="gemini-2.5-flash">Gemini 2.5 flash</option>
                <option value="gemini-2.5-flash-preview-09-2025">Gemini 2.5 flash preview</option>
                <option value="gemini-2.5-flash-lite">Gemini 2.5 flash lite</option>
                <option value="gemini-2.5-flash-lite-preview-09-2025">Gemini 2.5 flash lite preview</option>
                <option value="gemini-2.0-flash">✖ Gemini 2.0 flash</option>
                <option value="gemini-2.0-flash-lite">✖ Gemini 2.0 flash lite</option>
                <option value="gemma-3-27b-it">Gemma 3</option>
            </select>
            <h2>入力</h2>
            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                <input
                    className="border"
                    type="text"
                    value={input ?? ""}
                    onChange={handleChange}
                />
                <div className="flex justify-end">
                    <button
                        type="submit"
                        className="border border-2 rounded w-20 bg-gray-200 hover:bg-gray-300 cursor-pointer"
                    >送信</button>
                </div>
            </form>
            <div>
                <h2>送信した文章</h2>
                <div className="border bg-gray-100 p-2">
                    {sendedPrompt}
                </div>
            </div>
            <div>
                <h2>出力</h2>
                <div className="border min-h-40 bg-gray-100 p-2">
                    <Markdown>{output}</Markdown>
                </div>
            </div>

        </div>
    );
}