import type { Config, Context } from "@netlify/functions";
import { google } from "googleapis";

export default async (req: Request, context: Context) => {
  if (req.method !== "POST") {
    return Response.json({ message: "Method not allowed" }, { status: 405 });
  }

  try {
    const body = await req.json();
    const { fullName, address, phone, items, total } = body;

    // 1. Google Sheets Setup
    const sheetId = process.env.GOOGLE_ORDERS_SHEET_ID || process.env.GOOGLE_SHEET_ID;
    const credsRaw = process.env.GOOGLE_SERVICE_ACCOUNT_CREDENTIALS;

    if (!sheetId || !credsRaw) {
      console.error("Missing GOOGLE_SHEET_ID or credentials");
      return Response.json({ message: "Server configuration error." }, { status: 500 });
    }

    let credentials;
    try {
      credentials = JSON.parse(credsRaw);
      if (credentials.private_key) {
        credentials.private_key = credentials.private_key.replace(/\\n/g, '\n');
      }
    } catch (e) {
      return Response.json({ message: "Invalid Google credentials format." }, { status: 500 });
    }

    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });

    const sheets = google.sheets({ version: "v4", auth });

    // 2. Prepare Rows for Google Sheets
    const timestamp = new Date().toLocaleString("en-GB", { timeZone: "UTC" });

    const rows = items.map((item: any) => {
      const itemTotal = item.price * item.quantity;
      return [
        timestamp,
        fullName,
        phone,
        address,
        item.size || "None",
        `${item.name} (${item.quantity}x)`,
        `${itemTotal.toFixed(2)} DH`
      ];
    });

    // 3. Append to "Orders" Sheet
    await sheets.spreadsheets.values.append({
      spreadsheetId: sheetId,
      range: "Orders!A:G", 
      valueInputOption: "USER_ENTERED",
      requestBody: {
        values: rows,
      },
    });

    return Response.json({ message: "Order saved successfully!" });

  } catch (error: any) {
    console.error("Order API Error:", error.message || error);
    return Response.json({ 
      message: `Failed to save order: ${error.message || "Unknown error"}` 
    }, { status: 500 });
  }
};

export const config: Config = {
  path: "/api/orders",
};
