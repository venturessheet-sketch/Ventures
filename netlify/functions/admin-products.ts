import type { Config, Context } from "@netlify/functions";
import jwt from "jsonwebtoken";
import { google } from "googleapis";

export default async (req: Request, context: Context) => {
  // 1. Authenticate the request
  const authHeader = req.headers.get("Authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return Response.json({ message: "Unauthorized" }, { status: 401 });
  }

  const token = authHeader.split(" ")[1];
  const jwtSecret = process.env.JWT_SECRET || "fallback_secret_for_local_dev";

  try {
    jwt.verify(token, jwtSecret);
  } catch (error) {
    return Response.json({ message: "Invalid or expired token" }, { status: 403 });
  }

  // 2. Google Sheets Setup
  const method = req.method;
  const sheetId = process.env.GOOGLE_SHEET_ID;
  const credsRaw = process.env.GOOGLE_SERVICE_ACCOUNT_CREDENTIALS;

  if (!sheetId || !credsRaw) {
    return Response.json({ message: "Server missing Google configuration (Sheet ID or Credentials)." }, { status: 500 });
  }

  let credentials;
  try {
    credentials = JSON.parse(credsRaw);
    // Fix: Sometimes .env parser loads literal "\n" instead of actual newline strings
    if (credentials.private_key) {
      credentials.private_key = credentials.private_key.replace(/\\n/g, '\n');
    }
  } catch (e) {
    return Response.json({ message: "Invalid JSON in GOOGLE_SERVICE_ACCOUNT_CREDENTIALS." }, { status: 500 });
  }

  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });

  const sheets = google.sheets({ version: "v4", auth });

  try {
    if (method === "POST") {
      const body = await req.json();
      
      let { id, name, description, price, category, imageUrl, imageBase64, inStock } = body;

      // 3. Upload Image to ImgBB if base64 data was provided
      if (imageBase64) {
        const imgbbKey = process.env.IMGBB_API_KEY;
        if (!imgbbKey) {
          return Response.json({ message: "Server missing IMGBB_API_KEY for image uploads." }, { status: 500 });
        }

        const formData = new URLSearchParams();
        // Remove the data:image/jpeg;base64, prefix if present
        const cleanBase64 = imageBase64.replace(/^data:image\/[a-z]+;base64,/, "");
        formData.append("image", cleanBase64);
        formData.append("key", imgbbKey);

        const imgbbResponse = await fetch("https://api.imgbb.com/1/upload", {
          method: "POST",
          body: formData,
        });

        if (!imgbbResponse.ok) {
          console.error("ImgBB Upload Failed:", await imgbbResponse.text());
          return Response.json({ message: "Failed to upload image to ImgBB." }, { status: 500 });
        }

        const imgbbData = await imgbbResponse.json();
        imageUrl = imgbbData.data.url; // Overwrite the placeholder url with the real newly hosted one
      }

      // Append row
      await sheets.spreadsheets.values.append({
        spreadsheetId: sheetId,
        range: "Sheet1!A1:G1", // Adjust to match the sheet name if changed.
        valueInputOption: "USER_ENTERED",
        requestBody: {
          values: [
             [id, name, description, price, category, imageUrl, inStock ? "TRUE" : "FALSE"]
          ],
        },
      });
      
      return Response.json({ message: "Product added successfully!" });
    }

    if (method === "DELETE") {
       const url = new URL(req.url);
       const id = url.searchParams.get("id");
       if (!id) return Response.json({ message: "Missing ID for deletion" }, { status: 400 });

       // Find the row
       const response = await sheets.spreadsheets.values.get({
         spreadsheetId: sheetId,
         range: "Sheet1!A:A",
       });
       const rows = response.data.values || [];
       const rowIndex = rows.findIndex(row => row[0] === String(id));
       if (rowIndex === -1) return Response.json({ message: "Product not found" }, { status: 404 });

       const meta = await sheets.spreadsheets.get({ spreadsheetId: sheetId });
       const activeSheetId = meta.data.sheets?.[0]?.properties?.sheetId;

       await sheets.spreadsheets.batchUpdate({
         spreadsheetId: sheetId,
         requestBody: {
           requests: [
             {
               deleteDimension: {
                 range: {
                   sheetId: activeSheetId,
                   dimension: "ROWS",
                   startIndex: rowIndex,
                   endIndex: rowIndex + 1
                 }
               }
             }
           ]
         }
       });

       return Response.json({ message: "Product deleted successfully." });
    }

    if (method === "PUT") {
      const body = await req.json();
      let { id, name, description, price, category, imageUrl, imageBase64, inStock } = body;

      // Find the row to update
      const getResponse = await sheets.spreadsheets.values.get({
        spreadsheetId: sheetId,
        range: "Sheet1!A:A",
      });
      const rows = getResponse.data.values || [];
      const rowIndex = rows.findIndex(row => row[0] === String(id));
      if (rowIndex === -1) return Response.json({ message: "Product not found" }, { status: 404 });
      const actualRowNumber = rowIndex + 1;

      // Upload Image to ImgBB if base64 data was provided
      if (imageBase64) {
        const imgbbKey = process.env.IMGBB_API_KEY;
        if (!imgbbKey) {
          return Response.json({ message: "Server missing IMGBB_API_KEY for image uploads." }, { status: 500 });
        }
        const formData = new URLSearchParams();
        const cleanBase64 = imageBase64.replace(/^data:image\/[a-z]+;base64,/, "");
        formData.append("image", cleanBase64);
        formData.append("key", imgbbKey);

        const imgbbResponse = await fetch("https://api.imgbb.com/1/upload", {
          method: "POST", body: formData,
        });

        if (!imgbbResponse.ok) {
          return Response.json({ message: "Failed to upload image to ImgBB." }, { status: 500 });
        }

        const imgbbData = await imgbbResponse.json();
        imageUrl = imgbbData.data.url;
      }

      await sheets.spreadsheets.values.update({
        spreadsheetId: sheetId,
        range: `Sheet1!A${actualRowNumber}:G${actualRowNumber}`,
        valueInputOption: "USER_ENTERED",
        requestBody: {
          values: [
             [id, name, description, price, category, imageUrl, inStock ? "TRUE" : "FALSE"]
          ],
        },
      });
      return Response.json({ message: "Product updated successfully!" });
    }

    return Response.json({ message: "Method not allowed" }, { status: 405 });

  } catch (error: any) {
    console.error("API Error interacting with Sheets:", error.message || error);
    return Response.json({ 
      message: `Google Sheets Error: ${error.message || "Unknown API Error"}` 
    }, { status: 500 });
  }
};

export const config: Config = {
  path: "/api/admin/products",
};
