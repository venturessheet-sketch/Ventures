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

  // Helper: upload a single base64 image to ImgBB, returns the URL
  async function uploadToImgBB(base64Data: string): Promise<string> {
    const imgbbKey = process.env.IMGBB_API_KEY;
    if (!imgbbKey) {
      throw new Error("Server missing IMGBB_API_KEY for image uploads.");
    }

    const formData = new URLSearchParams();
    const cleanBase64 = base64Data.replace(/^data:image\/[a-z]+;base64,/, "");
    formData.append("image", cleanBase64);
    formData.append("key", imgbbKey);

    const imgbbResponse = await fetch("https://api.imgbb.com/1/upload", {
      method: "POST",
      body: formData,
    });

    if (!imgbbResponse.ok) {
      console.error("ImgBB Upload Failed:", await imgbbResponse.text());
      throw new Error("Failed to upload image to ImgBB.");
    }

    const imgbbData = await imgbbResponse.json();
    return imgbbData.data.url;
  }

  try {
    if (method === "POST") {
      const body = await req.json();
      
      let { id, name, description, details, price, category, imageBase64, imageBase64List, inStock, quantity, isVisible } = body;

      // Upload images to ImgBB
      let imageUrls: string[] = [];

      // Support both single (legacy) and multi-image upload
      const base64Items: string[] = imageBase64List || (imageBase64 ? [imageBase64] : []);

      if (base64Items.length > 0) {
        // Upload all images in parallel
        imageUrls = await Promise.all(base64Items.map(b64 => uploadToImgBB(b64)));
      }

      if (imageUrls.length === 0) {
        return Response.json({ message: "At least one image is required." }, { status: 400 });
      }

      // Store as pipe-delimited string
      const imageUrlField = imageUrls.join("|");

      // Append row
      await sheets.spreadsheets.values.append({
        spreadsheetId: sheetId,
        range: "Sheet1!A1:J1", 
        valueInputOption: "USER_ENTERED",
        requestBody: {
          values: [
             [id, name, description, price, category, imageUrlField, inStock ? "TRUE" : "FALSE", quantity, isVisible ? "TRUE" : "FALSE", details || ""]
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
      let { id, name, description, details, price, category, imageBase64, imageBase64List, existingImageUrls, inStock, quantity, isVisible } = body;

      // Find the row to update
      const getResponse = await sheets.spreadsheets.values.get({
        spreadsheetId: sheetId,
        range: "Sheet1!A:A",
      });
      const rows = getResponse.data.values || [];
      const rowIndex = rows.findIndex(row => row[0] === String(id));
      if (rowIndex === -1) return Response.json({ message: "Product not found" }, { status: 404 });
      const actualRowNumber = rowIndex + 1;

      // Start with existing images the user chose to keep
      let finalImageUrls: string[] = existingImageUrls || [];

      // Upload new images if provided
      const base64Items: string[] = imageBase64List || (imageBase64 ? [imageBase64] : []);

      if (base64Items.length > 0) {
        const newUrls = await Promise.all(base64Items.map(b64 => uploadToImgBB(b64)));
        finalImageUrls = [...finalImageUrls, ...newUrls];
      }

      // Fallback: if no images at all, try to keep the old value from the sheet
      if (finalImageUrls.length === 0) {
        const currentRow = await sheets.spreadsheets.values.get({
          spreadsheetId: sheetId,
          range: `Sheet1!F${actualRowNumber}`,
        });
        const currentImageUrl = currentRow.data.values?.[0]?.[0] || "";
        finalImageUrls = currentImageUrl ? currentImageUrl.split("|") : [];
      }

      const imageUrlField = finalImageUrls.join("|");

      await sheets.spreadsheets.values.update({
        spreadsheetId: sheetId,
        range: `Sheet1!A${actualRowNumber}:J${actualRowNumber}`,
        valueInputOption: "USER_ENTERED",
        requestBody: {
          values: [
             [id, name, description, price, category, imageUrlField, inStock ? "TRUE" : "FALSE", quantity, isVisible ? "TRUE" : "FALSE", details || ""]
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
