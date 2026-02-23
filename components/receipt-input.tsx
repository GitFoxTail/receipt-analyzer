"use client";

import React, { useState } from "react";
import { Camera, Trash2 } from "lucide-react";

import { ItemsTable } from "./items-table";
import { ReceiptSummary } from "./receipt-summary";
import { ModelSelector } from "./model-selector";

export interface Item {
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

    const [store, setStore] = useState<string>("");
    const [date, setDate] = useState<string>("");
    const [totalPrice, setTotalPrice] = useState<number>(0);
    const [calculatedTotalPrice, setCalculatedTotalPrice] = useState<number>(0);
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
            setDate(message.date.slice(0, 10));
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

    const handleRemoveImage = () => {
        setBase64("");
        setPreviewUrl("");
    }

    return (
        <div className="flex flex-col gap-3">
            <h1 className="text-2xl p-2 bg-gray-700 text-white px-3">レシート構造化<span className="text-base ml-5">by Gemini API</span></h1>

            <ModelSelector model={model} setModel={setModel} />

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

            {/* <ReceiptOutput /> */}

            <h2 className="bg-gray-700 text-white px-3">出力</h2>
            <div className="text-red-500 ml-2 text-sm">{output}</div>
            <div className="p-2">
                <ReceiptSummary items={items} output={output} store={store} date={date} totalPrice={totalPrice} calculatedTotalPrice={calculatedTotalPrice}/>
                <ItemsTable items={items} setItems={setItems} setCalculatedTotalPrice={setCalculatedTotalPrice} />
            </div>
        </div>
    );
}
