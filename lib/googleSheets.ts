import { google } from "googleapis";

export async function appendItemsToSheet(items: any[]) {
    const auth = new google.auth.GoogleAuth({
        credentials: JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_JSON!),
        scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });

    const sheets = google.sheets({ version: "v4", auth});

    // 配列 → 行データへ変換
    const rows = items.map((item) => [
        item.store,
        item.date,
        item.payer,
        item.category,
        item.name,
        item.amount,
    ]);

    await sheets.spreadsheets.values.append({
        spreadsheetId: process.env.SPREADSHEET_ID!,
        range: "シート1!A:F",
        valueInputOption: "USER_ENTERED",
        requestBody: {
            values: rows,
        },
    });
}
