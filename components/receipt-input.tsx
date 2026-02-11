"use client";

import React, { useState } from "react";
import { ImagePlus } from "lucide-react";

interface Item {
    name: string;
    amount: number;
    type: string;
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
            setOutput(String(error));
        }
    }

    const handleChangeModelSelector = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setModel(e.target.value);
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
                <option value="gemini-2.0-flash">✖ Gemini 2.0 flash</option>
                <option value="gemini-2.0-flash-lite">✖ Gemini 2.0 flash lite</option>
                <option value="gemma-3-27b-it">Gemma 3</option>
            </select>

            <h2 className="bg-gray-700 text-white px-3">レシート入力</h2>
            <form onSubmit={handleFileSubmit} className="flex flex-col gap-1">
                <div className="flex justify-end mr-3 mb-3">
                    <button
                        type="submit"
                        className="border border-2 rounded w-30 h-12 bg-gray-200 hover:bg-gray-300 cursor-pointer"
                    >
                        {isLoading ? <div className="flex ml-3"><div className="w-6 h-6 mr-2 border-4 border-gray-300 border-t-gray-700 rounded-full animate-spin" />生成中</div>
                            : "送信"}
                    </button>
                </div>
                <div className="flex mx-3">
                    <div className={`flex justify-center ${previewUrl ? "w-1/2" : "w-full"}`}>
                        <input
                            id="file-upload"
                            className="hidden"
                            type="file"
                            accept="image/*"
                            onChange={handleFileChange}
                        />
                        <label
                            htmlFor="file-upload"
                            className="flex items-center justify-center w-3/4 h-16 border border-gray-300 border-3 rounded cursor-pointer"
                        >
                            <ImagePlus />
                        </label>
                    </div>
                    {previewUrl && (
                        <div className="flex justify-center border w-1/2">
                            <div className="h-20 overflow-y-auto border">
                                <img
                                    src={previewUrl}
                                    alt="Preview"
                                    className="max-w-full h-auto" />
                            </div>
                        </div>
                    )}
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

                <table className="w-full text-xs">
                    <thead className="">
                        <tr>
                            <th className="border">タイプ</th>
                            <th className="border">項目名</th>
                            <th className="border">金額</th>
                            <th className="border">カテゴリ</th>
                        </tr>
                    </thead>
                    <tbody>
                        {items.map((item: Item, index: number) => {
                            return (
                                <tr key={index}>
                                    <td className="border text-start px-2">
                                        <select
                                            value={item.type}
                                            onChange={(e) => {
                                                const newItems: Array<Item> | [] = [...items];
                                                newItems[index].type = e.target.value;
                                                setItems(newItems);
                                            }}
                                            className="border border-gray-300 w-12"
                                        >
                                            <option value="item">item</option>
                                            <option value="discount">discount</option>
                                            <option value="tax">tax</option>
                                        </select>
                                    </td>
                                    <td className="border text-start p-2">
                                        <input
                                            className="w-full border-gray-300 border"
                                            value={item.name}
                                            onChange={(e) => {
                                                const newItems: Array<Item> | [] = [...items];
                                                newItems[index].name = e.target.value;
                                                setItems(newItems);
                                            }}
                                        />
                                    </td>
                                    <td className="border text-end px-2 w-12">
                                        <input
                                            className="w-full border-gray-300 border"
                                            value={item.amount}
                                            onChange={(e) => {
                                                const newItems: Array<Item> | [] = [...items];
                                                newItems[index].amount = Number(e.target.value);
                                                setItems(newItems);
                                                setCalculatedTotalPrice(
                                                    items.reduce(
                                                        (
                                                            sum: number,
                                                            item: { name: string, amount: number, type: string }
                                                        ) => sum + item.amount, 0))
                                            }}
                                        />
                                    </td>
                                    <td className="border text-start px-1">
                                        <select
                                            value={item.category}
                                            onChange={(e) => {
                                                const newItems: Array<Item> | [] = [...items];
                                                newItems[index].category = e.target.value;
                                                setItems(newItems);
                                            }}
                                            className="border border-gray-300 w-14"
                                        >
                                            <option value="food">食費</option>
                                            <option value="restaurant">外食</option>
                                            <option value="goods">日用品</option>
                                            <option value="child goods">子育て</option>
                                            <option value="other">その他</option>
                                        </select>
                                    </td>
                                </tr>
                            )
                        })}
                    </tbody>
                </table>
            </div>

        </div>
    );
}