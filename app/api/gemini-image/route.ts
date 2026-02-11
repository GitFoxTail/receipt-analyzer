import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { z } from "zod";
import { zodToJsonSchema } from "zod-to-json-schema"

interface ImageBase64 {
    data: string;
    mimeType: string;
}

const receiptItemSchema = z.object({
    name: z.string().describe("Item name as printed on the receipt."),
    amount: z.number().describe("Amount in JPY. Discounts should be negative"),
    type: z.enum(["item", "discount", "tax"]).describe("Item: purchased product, discount: discount or coupon, tax: consumption tax"),
    category: z.enum(["food", "restaurant", "goods", "child goods", "other"]).describe("category of items."),
});

const receiptSchema = z.object({
    store_name: z.string().optional().describe("Name of the store"),
    items: z.array(receiptItemSchema).describe("Line items on the receipt."),
    subtotal: z.number().optional().describe("Subtotal before tax and discounts."),
    total: z.number().describe("Final total amount paid."),
    currency: z.literal("JPY"),
});

export async function POST(req: NextRequest) {
    // リクエストの内容をjsonにパース
    const body = await req.json();
    const response = await fetchGemini(body.prompt, body.model, body.image);
    return NextResponse.json({ message: response });
}

async function fetchGemini(prompt: string, model: string, image: ImageBase64): Promise<string | undefined> {
    const ai = new GoogleGenAI({});

    const contents = [
        {
            inlineData: {
                mimeType: image.mimeType,
                data: image.data,
            },
        },
        {
            text: prompt,
        }
    ]

    try {
        const response = await ai.models.generateContent({
            model: model,
            contents: contents,
            config: {
                responseMimeType: "application/json",
                responseJsonSchema: zodToJsonSchema(receiptSchema),
            },
        });

        console.log(response.text);
        return response.text;
    } catch (error) {
        console.error(error);
        return `エラー：${error}`
    }


};