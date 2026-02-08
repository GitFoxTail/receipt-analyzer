import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

export async function POST(req: NextRequest) {
    const body = await req.json();
    console.log(body);
    const response = await fetchGemini(body.prompt, body.model);
    return NextResponse.json({ message: response });
}

async function fetchGemini(prompt: string, model: string): Promise<string | undefined> {
    const ai = new GoogleGenAI({});
    const response = await ai.models.generateContent({
        model: model,
        contents: prompt,
    });
    console.log(response.text);
    return response.text;
};