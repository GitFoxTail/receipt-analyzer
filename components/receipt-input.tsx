"use client";

import React, { useState, useRef } from "react";
import { Camera, Trash2, StopCircle } from "lucide-react";

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

    const abortControlerRef = useRef<AbortController | null>(null);


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
                const b64 = jpegDataUrl.split(",")[1];

                setPreviewUrl(jpegDataUrl);
                setBase64(b64);

                submitImage(b64);
            }
            img.src = reader.result as string;
        }
        reader.readAsDataURL(file);
    };

    const submitImage = async (imageBase64: string) => {
        setOutput("");
        setIsLoading(true);

        const controller = new AbortController();
        abortControlerRef.current = controller;

        const params = {
            prompt: defaultPrompt,
            model,
            image: {
                data: imageBase64,
                mimeType: "image/jpeg"
            },
        };

        try {
            const response = await fetch("/api/gemini-image", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(params),
                signal: controller.signal,
            });

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
        } catch (error) {
            if (error instanceof Error && error.name === "AbortError") {
                setOutput("");
            } else {
                console.error(error);
                setOutput(error instanceof Error ? error.message : "unknown error");
            }
        } finally {
            setIsLoading(false);
            abortControlerRef.current = null;
        }
    };

    const handleAbort = () => {
        abortControlerRef.current?.abort();
    }

    const handleRemoveImage = () => {
        abortControlerRef.current?.abort();
        setBase64("");
        setPreviewUrl("");
        setItems([]);
        setOutput("");
    }

    return (
        <div className="flex flex-col px-4 text-gray-600">
            <h1 className="text-3xl my-4 font-bold bg-blue-500 text-white p-2 rounded-xl text-center">
                Receipt Analyzer !
            </h1>

            <ModelSelector model={model} setModel={setModel} />

            <div className="py-2">
                <h2 className="font-bold mb-2">Receipt Input</h2>
                <div className="flex justify-center gap-2">
                    {!previewUrl && (
                        <div className="flex w-full h-32">
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
                                    w-full h-full
                                    border border-3 border-gray-400
                                    bg-gradient-to-b from-gray-100 to-gray-300
                                    rounded-3xl
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
                            {isLoading && (
                                <div className="
                                    absolute inset-0
                                    flex flex-col items-center justify-center gap-2
                                    bg-black/40 rounded-3xl backdrop-blur-sm
                                ">
                                    <span className="w-6 h-6 border-4 border-white/40 border-t-white rounded-full animate-spin" />
                                    <button
                                        type="button"
                                        onClick={handleAbort}
                                        className="
                                            flex items-center gap-1
                                            bg-red-500 hover:bg-red-600
                                            text-white text-xs font-semibold
                                            px-3 py-1.5 rounded-full
                                            transition active:scale-95
                                        "
                                    >
                                        <StopCircle size={14} />
                                        中断
                                    </button>
                                </div>
                            )}
                            {!isLoading && (
                                <button
                                    type="button"
                                    className="
                                        absolute top-2 right-2
                                        bg-black/60 text-white rounded-full p-2
                                        backdrop-blur-sm hover:bg-black/80
                                        active:scale-90 transition
                                    "
                                    onClick={handleRemoveImage}
                                >
                                    <Trash2 size={18} />
                                </button>
                            )}
                        </div>
                    )}
                    </div>

                    {output && <p className="mt-2 text-red-500 text-sm">{output}</p>}
            </div>

            {items.length > 0 &&
                <>
                    <h2 className="font-bold mb-2">Result</h2>
                    <div className="px-2">
                        <ReceiptSummary items={items} store={store} date={date} totalPrice={totalPrice} calculatedTotalPrice={calculatedTotalPrice} />
                        <ItemsTable items={items} setItems={setItems} setCalculatedTotalPrice={setCalculatedTotalPrice} />
                    </div>
                </>
            }
        </div>
    );
}
