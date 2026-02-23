import React, { useState } from "react";
import { Item } from "./receipt-input";

type Props = {
    items: Item[];
    output: string;
    store: string;
    date: string;
    totalPrice: number;
    calculatedTotalPrice: number;
};

export function ReceiptSummary({ items, output, store, date, totalPrice, calculatedTotalPrice }: Props) {

    const [payer, setPayer] = useState<string>("");
    const [isSending, setIsSending] = useState(false);

    const handleSave = async () => {
        const itemsWithMeta = items.map(item => ({
            ...item,
            store,
            date,
            payer
        }));
        setIsSending(true);
        await fetch("/api/save-receipt", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(itemsWithMeta),
        });
        setIsSending(false);
    }

    return (
        <>
            {store && <p>購入店舗: <span>{store}</span></p>}
            {date && <p>日付: <span>{date}</span></p>}
            <select className="border rounded-lg w-3/4 text-black" onChange={(e) => setPayer(e.target.value)}>
                <option>{process.env.NEXT_PUBLIC_PAYER_1}</option>
                <option>{process.env.NEXT_PUBLIC_PAYER_2}</option>
                <option>{process.env.NEXT_PUBLIC_PAYER_3}</option>
                <option>{process.env.NEXT_PUBLIC_PAYER_4}</option>
            </select>
            <div className="bg-gray-800 text-white p-4 flex m-2 rounded-2xl shade">
                <div className="w-3/4">
                    <div className="text-gray-400 text-xs">合計金額</div>
                    <div className="text-2xl p-2">￥ {totalPrice}</div>
                </div>
                <div className="w-1/4">
                    <div className="text-gray-400 text-xs">計算値: ￥{calculatedTotalPrice}</div>
                    <div className="text-base py-3">
                        {
                            totalPrice != null && calculatedTotalPrice != null && (
                                totalPrice === calculatedTotalPrice
                                    ? <p className="text-red-500">〇 一致</p>
                                    : <p className="text-blue-700">× 不一致</p>
                            )
                        }
                    </div>
                </div>

            </div>

            <button
                onClick={handleSave}
                className="border bg-gray-300 px-3 py-1 rounded-xl m-2"
            >
                {isSending ? "送信中" : "送信"}
            </button>
            <a href="https://docs.google.com/spreadsheets/d/1aTr7avv72mkBYwP0WDauJBHw5DglyRThkQboFQGLzCs/edit?gid=0#gid=0" target="_blank" className="text-blue-700 underline">保存先リンク：Google Sheets</a>
        </>
    )
}