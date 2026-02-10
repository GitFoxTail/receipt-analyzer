"use client";

import React, { useState } from "react";
import Markdown from "react-markdown";
import { ImagePlus } from "lucide-react";

export function ReceiptInput() {
    const defaultPrompt = `出力は、提供された JSON スキーマに厳密に従うこと
割引は、金額がマイナスの品目として表現すること
消費税は、type が "tax" の独立した品目として含めること
金額は、**通貨記号を含まない日本円の数値（number）**で出力すること`

    // const [input, setInput] = useState(defaultPrompt);
    // const [sendedPrompt, setSendedPrompt] = useState("");
    const [base64, setBase64] = useState<string>("");
    const [previewUrl, setPreviewUrl] = useState<string>("");
    const [output, setOutput] = useState("");
    const [model, setModel] = useState("gemini-3-flash-preview")

    const [store, setStore] = useState<string | null>(null);
    const [totalPrice, setTotalPrice] = useState<number | null>(null);
    const [calculatedTotalPrice, setCalculatedTotalPrice] = useState<number | null>(null);
    const [items, setItems] = useState([]);

    // const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    //     setInput(e.target.value)
    // }

    // const handleSubmit = async (e: React.SyntheticEvent) => {
    //     e.preventDefault();
    //     const prompt = input;
    //     setSendedPrompt(prompt);
    //     setInput("");
    //     setOutput("生成中...");

    //     const params = {
    //         prompt: input,
    //         model: model,
    //     };

    //     const response = await fetch(
    //         "/api/gemini-text",
    //         {
    //             method: "POST",
    //             headers: { "Content-Type": "application/json" },
    //             body: JSON.stringify(params),
    //         }
    //     )

    //     const data = await response.json();
    //     setOutput(String(data.message));
    // }


    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();

        reader.onload = () => {
            const result = reader.result as string;
            const base64Data = result.split(",")[1];
            setBase64(base64Data);
            setPreviewUrl(result);
        }

        reader.readAsDataURL(file);
    }

    const handleFileSubmit = async (e: React.SyntheticEvent) => {
        e.preventDefault();
        // const prompt = input;
        // setSendedPrompt(prompt);
        setOutput("生成中...");

        const params = {
            // prompt: input,
            prompt: defaultPrompt,
            model: model,
            image: {
                data: base64,
                mimeType: "image/jpeg"
            }
        };

        try {
            const response = await fetch(
                "/api/gemini-image",
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(params),
                }
            );

            const data = await response.json();         // json
            setOutput(data.message);                    // string
            const message = JSON.parse(data.message);   // json
            setStore(message.store_name);
            setItems(message.items);
            setTotalPrice(message.total);
            setCalculatedTotalPrice(
                message.items.reduce(
                    (
                        sum: number,
                        item: { name: string, amount: number, type: string }
                    ) => sum + item.amount, 0))

        } catch (error) {
            console.error(error);
            setOutput(String(error));
        }
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

            <h2 className="bg-blue-500 text-white">レシート入力</h2>
            {/* <form onSubmit={handleSubmit} className="flex flex-col gap-1">
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
            </form> */}
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
                        className="flex items-center justify-center w-3/4 h-20 border border-gray-300 border-3 rounded cursor-pointer"
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
                        className="border border-2 rounded w-30 h-12 bg-gray-200 hover:bg-gray-300 cursor-pointer"
                    >送信</button>
                </div>
            </form>
            {/* <h2 className="bg-blue-500 text-white">送信した文章</h2>
            <div className="border bg-gray-100 p-2">
                {sendedPrompt}
            </div> */}
            <h2 className="bg-blue-500 text-white">出力</h2>
            {/* <div className="border min-h-40 bg-gray-100 p-2">{output}</div> */}
            <div className="p-2">
                <p>購入店舗: <span>{store}</span></p>
                <p>合計: <span>{totalPrice}</span>円</p>
                <p>計算値: <span>{calculatedTotalPrice}</span>円</p>
                {
                    totalPrice != null && calculatedTotalPrice != null && (
                        totalPrice === calculatedTotalPrice
                            ? <p className="text-red-500">〇 一致</p>
                            : <p className="text-blue-700">× 不一致</p>
                    )
                }

                <table className="w-full">
                    <thead>
                        <tr>
                            <th className="border">type</th>
                            <th className="border">name</th>
                            <th className="border">amount</th>
                        </tr>
                    </thead>
                    <tbody>
                        {items.map((item: { name: string, amount: number, type: string }, index: number) => {
                            return (
                                <tr key={index}>
                                    <td className="border text-start px-2"><input className="w-full box-border" value={item.type}/></td>
                                    <td className="border text-start px-2"><input className="w-full box-border" value={item.name}/></td>
                                    <td className="border text-end px-2"><input className="w-full box-border" value={item.amount}/></td>
                                </tr>
                            )
                        })}
                    </tbody>
                </table>
            </div>

        </div>
    );
}