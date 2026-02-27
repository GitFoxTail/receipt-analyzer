import React, { useState } from "react";
import { Item } from "./receipt-input";
import { HardDriveUpload } from "lucide-react";

type Props = {
    items: Item[];
    store: string;
    date: string;
    totalPrice: number;
    calculatedTotalPrice: number;
};

export function ReceiptSummary({ items, store, date, totalPrice, calculatedTotalPrice }: Props) {

    const [payer, setPayer] = useState<string>(process.env.NEXT_PUBLIC_PAYER_1 || "");
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
        <div className="flex flex-col gap-2">
            {store && <div className="text-3xl font-bold">{store}</div>}
            {date && <div className=""><span className="text-xs bg-gray-200 px-2 rounded-full">{date.replace(/-/g, "/")}</span></div>}
            <div className="">
                <select className="border-t border-b border-gray-300" onChange={(e) => setPayer(e.target.value)}>
                    <option>{process.env.NEXT_PUBLIC_PAYER_1}</option>
                    <option>{process.env.NEXT_PUBLIC_PAYER_2}</option>
                    <option>{process.env.NEXT_PUBLIC_PAYER_3}</option>
                    <option>{process.env.NEXT_PUBLIC_PAYER_4}</option>
                </select>
            </div>
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
                                    ? <p className="text-red-500 font-bold">OK</p>
                                    : <p className="text-blue-500 font-bold">NG</p>
                            )
                        }
                    </div>
                </div>

            </div>

            <div className="flex items-center">
                <button
                    onClick={handleSave}
                    className="border bg-gray-300 px-3 py-1 rounded-xl m-2"
                >
                    {isSending ? <div className="w-6 h-6 rounded-full border border-4 border-t-white brder-gray-200 animate-spin" /> : <HardDriveUpload />}
                </button>
                <a href="https://docs.google.com/spreadsheets/d/1aTr7avv72mkBYwP0WDauJBHw5DglyRThkQboFQGLzCs/edit?gid=0#gid=0" target="_blank" className="text-blue-700 underline">保存先リンク：Google Sheets</a>
            </div>
        </div>
    )
}