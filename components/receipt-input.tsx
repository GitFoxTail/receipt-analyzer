"use client";

import React, { useState } from "react";
import { ImagePlus, Camera, Trash2 } from "lucide-react";

interface Item {
    name: string;
    amount: number;
    category: string;
}

export function ReceiptInput() {
    const defaultPrompt = `出力は、提供された JSON スキーマに厳密に従うこと
割引は、金額がマイナスの品目として表現すること
消費税は、type が "tax" の独立した品目として含めること
金額は、**通貨記号を含まない日本円の数値（number）**で出力すること
家計簿区分は、購入店舗と品名から判断し選択すること
消費税、割引のcategoryは、それが適用されている品目に合わせる、otherは使用しない`

    const [base64, setBase64] = useState<string>("");
    const [previewUrl, setPreviewUrl] = useState<string>("");
    const [output, setOutput] = useState("");
    const [model, setModel] = useState("gemini-3-flash-preview")
    const [isLoading, setIsLoading] = useState(false);
    const [isSending, setIsSending] = useState(false);

    const [store, setStore] = useState<string | null>(null);
    const [totalPrice, setTotalPrice] = useState<number | null>(null);
    const [calculatedTotalPrice, setCalculatedTotalPrice] = useState<number | null>(null);
    const [items, setItems] = useState<Array<Item> | []>([]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();

        reader.onload = () => {
            const img = new Image();
            img.onload = () => {
                const MAX_WIDTH = 1024;
                const scale = Math.min(1, MAX_WIDTH / img.width);

                const canvas = document.createElement("canvas");
                canvas.width = img.width * scale;
                canvas.height = img.height * scale;

                const ctx = canvas.getContext("2d");
                if (!ctx) return;
                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

                const jpegDataUrl = canvas.toDataURL("image/jpeg", 0.8);

                setPreviewUrl(jpegDataUrl);
                setBase64(jpegDataUrl.split(",")[1]);
            }
            img.src = reader.result as string;
        }
        reader.readAsDataURL(file);
    }

    const handleFileSubmit = async (e: React.SyntheticEvent) => {
        e.preventDefault();

        if (base64 === "") {
            setOutput("ファイルがアップロードされていません");
            return;
        } else {
            setOutput("");
        }

        setIsLoading(true);

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

            if (!response.ok) {
                throw new Error(data.error || "server error");
            }

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
            setIsLoading(false);
        } catch (error) {
            console.error(error);
            setOutput(error instanceof Error ? error.message : "unknown error");
            setIsLoading(false);
        }
    }

    const handleChangeModelSelector = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setModel(e.target.value);
    }

    const handleRemoveImage = () => {
        setBase64("");
        setPreviewUrl("");
    }

    const handleSave = async () => {
        setIsSending(true);
        await fetch("/api/save-receipt", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(items),
        });
        setIsSending(false);
    }

    return (
        <div className="flex flex-col gap-3">
            <h1 className="text-2xl p-2 bg-gray-700 text-white px-3">レシート構造化<span className="text-base ml-5">by Gemini API</span></h1>
            <p ></p>

            <h2 className="bg-gray-700 text-white px-3">モデル選択</h2>
            <select
                value={model}
                onChange={handleChangeModelSelector}
                className="border border-gray-300 mx-3"
            >
                <option value="gemini-3-flash-preview">Gemini 3 flash preview</option>
                <option value="gemini-2.5-pro">Gemini 2.5 pro</option>
                <option value="gemini-2.5-flash">Gemini 2.5 flash</option>
                <option value="gemini-2.5-flash-preview-09-2025">Gemini 2.5 flash preview</option>
                <option value="gemini-2.5-flash-lite">Gemini 2.5 flash lite</option>
                <option value="gemini-2.5-flash-lite-preview-09-2025">Gemini 2.5 flash lite preview</option>
                <option value="gemma-3-27b-it">Gemma 3</option>
            </select>

            <h2 className="bg-gray-700 text-white px-3">レシート入力</h2>
            <form onSubmit={handleFileSubmit} className="grid grid-cols-4">
                <div className="flex col-span-3 mx-3">
                    {!previewUrl && (
                        <div className="flex w-full">
                            <input
                                id="file-upload"
                                className="hidden"
                                type="file"
                                accept="image/*"
                                onChange={handleFileChange}
                            />

                            <label
                                htmlFor="file-upload"
                                className="
                                    flex items-center justify-center gap-3
                                    w-full h-14
                                    bg-gradient-to-r from-gray-100 to-gray-200
                                    border border-gray-200
                                    rounded-2xl
                                    shadow-md
                                    font-semibold text-gray-800
                                    cursor-pointer
                                    transition-all duration-150
                                    active:scale-95
                                "
                            >
                                <Camera className="w-5 h-5 text-gray-700" />
                                写真を追加
                            </label>

                        </div>

                    )}
                    {previewUrl && (
                        <div className="relative w-full flex justify-center">
                            <div className="h-32 overflow-y-auto rounded-xl border shadow-sm">
                                <img
                                    src={previewUrl}
                                    alt="Preview"
                                    className="max-w-full h-auto" />
                            </div>
                            <button
                                type="button"
                                className="
                                    absolute top-2 right-2
                                    bg-black/60 text-white rounded-full p-2
                                    backdrop-blur-sm
                                    hover:bg-black/80
                                    active:scale-90
                                    transition"
                                onClick={handleRemoveImage}
                            >
                                <Trash2 size={18} />
                            </button>
                        </div>
                    )}

                </div>
                <div className="flex flex-col gap-3 mx-2">
                    <button
                        type="submit"
                        className={`
                            border border-2
                            rounded-2xl w-full h-12 text-sm font-bold
                            cursor-pointer
                            hover:bg-gray-300
                            transition-all duration-150    
                            ${base64 === "" ? "border-gray-300 bg-gray-200 text-gray-400" : "border-gray-500 bg-gray-200 text-gray-600 shadow-md active:scale-95"}
                        `}
                    >
                        {isLoading
                            ? <div className="flex">
                                <span className="w-4 h-4 mx-1 border-4 border-gray-300 border-t-gray-700 rounded-full animate-spin" />
                                <span>生成中</span>
                            </div>
                            : <span>送信</span>
                        }
                    </button>
                </div>
            </form>

            <h2 className="bg-gray-700 text-white px-3">出力</h2>
            <div className="text-red-500 ml-2 text-sm">{output}</div>
            <div className="p-2">
                {store && <p>購入店舗: <span>{store}</span></p>}
                <p>合計: <span>{totalPrice}</span>円</p>
                <p>計算値: <span>{calculatedTotalPrice}</span>円</p>
                {
                    totalPrice != null && calculatedTotalPrice != null && (
                        totalPrice === calculatedTotalPrice
                            ? <p className="text-red-500">〇 一致</p>
                            : <p className="text-blue-700">× 不一致</p>
                    )
                }

                <table className="w-full text-xs table-fixed">
                    <thead className="w-full">
                        <tr className="bg-gray-500 text-white h-8">
                            <th className="w-1/4">カテゴリ</th>
                            <th className="w-1/2">項目名</th>
                            <th className="w-1/4">金額</th>
                        </tr>
                    </thead>
                    <tbody className="w-full">
                        {items.map((item: Item, index: number) => {
                            return (
                                <tr key={index} className="border-b border-gray-300 h-12">
                                    <td className="text-start w-1/4">
                                        <select
                                            value={item.category}
                                            onChange={(e) => {
                                                const newItems: Array<Item> | [] = [...items];
                                                newItems[index].category = e.target.value;
                                                setItems(newItems);
                                            }}
                                            className="h-10 mx-1 border rounded border-gray-300"
                                        >
                                            <option value="food">🔴食費</option>
                                            <option value="restaurant">🔴外食</option>
                                            <option value="goods">🟢日用品</option>
                                            <option value="child goods">🟢子育て</option>
                                            <option value="other">⚪その他</option>
                                        </select>
                                    </td>
                                    <td className="w-1/2 px-1">
                                        <input
                                            className="h-10 w-full border rounded border-gray-300"
                                            value={item.name}
                                            onChange={(e) => {
                                                const newItems: Array<Item> | [] = [...items];
                                                newItems[index].name = e.target.value;
                                                setItems(newItems);
                                            }}
                                        />
                                    </td>
                                    <td className="w-1/4 px-1">
                                        <input
                                            className="h-10 w-full border rounded border-gray-300"
                                            value={item.amount}
                                            onChange={(e) => {
                                                const newItems: Array<Item> | [] = [...items];
                                                newItems[index].amount = Number(e.target.value);
                                                setItems(newItems);
                                                setCalculatedTotalPrice(
                                                    items.reduce(
                                                        (
                                                            sum: number,
                                                            item: { name: string, amount: number }
                                                        ) => sum + item.amount, 0));
                                                console.log(items)
                                            }}
                                        />
                                    </td>
                                </tr>
                            )
                        })}
                    </tbody>
                </table>
                <button
                    onClick={handleSave}
                    className="border bg-gray-300 px-3 py-1 rounded-xl m-2"
                >
                    {isSending ? "送信中" : "送信"}
                </button>
                <a href="https://docs.google.com/spreadsheets/d/1aTr7avv72mkBYwP0WDauJBHw5DglyRThkQboFQGLzCs/edit?gid=0#gid=0" target="_blank" className="text-blue-700 underline">保存先リンク：Google Sheets</a>
            </div>
        </div>
    );
}
