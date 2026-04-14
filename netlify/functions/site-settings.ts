import type { Config, Context } from "@netlify/functions";
import { google } from "googleapis";

// Defaults used if the sheet has no data yet
const DEFAULTS = {
  navMarquee: "HOUSE OF STREETWEAR // 🔥 NEW COLLECTION DROPPING SOON 🔥 // HOUSE OF STREETWEAR",
  heroMarquee: "VENTURES CLOTHING // MOROCCO // QUALITY STREETWEAR //",
};

async function getSheets() {
  const sheetId = process.env.GOOGLE_SHEET_ID;
  const credsRaw = process.env.GOOGLE_SERVICE_ACCOUNT_CREDENTIALS;
  if (!sheetId || !credsRaw) throw new Error("Missing sheet config");
  let credentials = JSON.parse(credsRaw);
  if (credentials.private_key) credentials.private_key = credentials.private_key.replace(/\\n/g, "\n");
  const auth = new google.auth.GoogleAuth({ credentials, scopes: ["https://www.googleapis.com/auth/spreadsheets"] });
  return { sheets: google.sheets({ version: "v4", auth }), sheetId };
}

export default async (req: Request, context: Context) => {
  const headers = { "Access-Control-Allow-Origin": "*", "Content-Type": "application/json" };

  try {
    const { sheets, sheetId } = await getSheets();

    if (req.method === "GET") {
      const res = await sheets.spreadsheets.values.get({ spreadsheetId: sheetId, range: "Settings!A2:B3" });
      const rows = res.data.values || [];
      
      let heroMarquee = DEFAULTS.heroMarquee;
      let navMarquee = DEFAULTS.navMarquee;

      for (const row of rows) {
        if (row[0] === "marqueeText") heroMarquee = row[1] || DEFAULTS.heroMarquee;
        if (row[0] === "navbarText") navMarquee = row[1] || DEFAULTS.navMarquee;
      }

      return Response.json({ navMarquee, heroMarquee }, { headers });
    }

    if (req.method === "POST") {
      const token = req.headers.get("Authorization")?.replace("Bearer ", "");
      if (!token) return Response.json({ message: "Unauthorized" }, { status: 401, headers });

      const { navMarquee, heroMarquee } = await req.json();

      // Write keys in A, values in B
      await sheets.spreadsheets.values.update({
        spreadsheetId: sheetId,
        range: "Settings!A1:B3",
        valueInputOption: "USER_ENTERED",
        requestBody: { 
          values: [
            ["key", "value"], 
            ["marqueeText", heroMarquee ?? DEFAULTS.heroMarquee],
            ["navbarText", navMarquee ?? DEFAULTS.navMarquee]
          ] 
        },
      });

      return Response.json({ message: "Settings saved!" }, { headers });
    }

    return Response.json({ message: "Method not allowed" }, { status: 405, headers });
  } catch (err: any) {
    console.error("site-settings error:", err.message);
    return Response.json(DEFAULTS, { headers }); // fallback to defaults on error
  }
};

export const config: Config = { path: "/api/site-settings" };
