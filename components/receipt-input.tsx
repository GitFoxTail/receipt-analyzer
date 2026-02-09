"use client";

import React, { useState } from "react";
import Markdown from "react-markdown";
import { ImagePlus } from "lucide-react";

export function ReceiptInput() {
    const defaultPrompt = `添付画像のレシート画像から商品の名前、金額を出力して。
ただし、外税・割引等も含む。
出力形式(json配列)：[{"name": 商品名,"price": 金額},...]`

    const [input, setInput] = useState(defaultPrompt);
    const [base64, setBase64] = useState<string>("");
    const [previewUrl, setPreviewUrl] = useState<string>("");
    const [output, setOutput] = useState("");
    const [model, setModel] = useState("gemini-3-flash-preview")
    const [sendedPrompt, setSendedPrompt] = useState("");

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setInput(e.target.value)
    }

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const f = e.target.files?.[0];
        if (!f) return;

        const reader = new FileReader();

        reader.onload = () => {
            const result = reader.result as string;
            const base64Data = result.split(",")[1];
            setBase64(base64Data);
            setPreviewUrl(result);
        }

        reader.readAsDataURL(f);
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
            "/api/gemini-text",
            {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(params),
            }
        )

        const data = await response.json();
        setOutput(String(data.message));
    }

    const handleFileSubmit = async (e: React.SyntheticEvent) => {
        e.preventDefault();
        const prompt = input;
        setSendedPrompt(prompt);
        setOutput("生成中...");

        const params = {
            prompt: input,
            model: model,
            image: {
                data: base64,
                mimeType: "image/jpeg"
            }
        };

        const response = await fetch(
            "/api/gemini-image",
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
        <div className="flex flex-col gap-3 p-5">
            <h1 className="text-2xl p-2 bg-blue-500 text-white">レシート構造化</h1>
            <p className="text-base text-end">by gemini API</p>

            <h2 className="bg-blue-500 text-white">モデル選択</h2>
            <select
                value={model}
                onChange={handleChangeModelSelector}
                className="border border-gray-300"
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

            <h2 className="bg-blue-500 text-white">入力</h2>
            <form onSubmit={handleSubmit} className="flex flex-col gap-1">
                <textarea
                    className="border border-gray-300 h-44 text-sm"
                    value={input ?? ""}
                    onChange={handleChange}
                />
                <div className="flex justify-end">
                    <button
                        type="submit"
                        className="border border-2 rounded w-40 bg-gray-200 hover:bg-gray-300 cursor-pointer"
                    >テキスト送信</button>
                </div>
            </form>
            <form onSubmit={handleFileSubmit} className="flex flex-col gap-1">
                <div className="flex justify-center my-5">
                <input
                    id="file-upload"
                    className="hidden"
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                />
                <label
                    htmlFor="file-upload"
                    className="flex items-center justify-center w-3/4 h-12 border border-gray-300 border-3 rounded cursor-pointer"
                >
                    <ImagePlus />
                </label>
                </div>
                {previewUrl && (
                    <div className="flex justify-center">
                        <img
                            src={previewUrl} 
                            alt="Preview" 
                            className="max-w-md max-h-64 object-contain border border-gray-300 rounded" />
                    </div>
                )}
                <div className="flex justify-end">
                    <button
                        type="submit"
                        className="border border-2 rounded w-40 bg-gray-200 hover:bg-gray-300 cursor-pointer"
                    >テキスト＋画像送信</button>
                </div>
            </form>
            <h2 className="bg-blue-500 text-white">送信した文章</h2>
            <div className="border bg-gray-100 p-2">
                {sendedPrompt}
            </div>
            <h2 className="bg-blue-500 text-white">出力</h2>
            <div className="border min-h-40 bg-gray-100 p-2">
                <Markdown>{output}</Markdown>
            </div>

        </div>
    );
}