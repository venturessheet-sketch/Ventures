import type { Config, Context } from "@netlify/functions";
import jwt from "jsonwebtoken";

export default async (req: Request, context: Context) => {
  // Only allow POST requests
  if (req.method !== "POST") {
    return Response.json({ message: "Method not allowed" }, { status: 405 });
  }

  try {
    const body = await req.json();
    const { password } = body;

    // Securely check against the environment variable stored in Netlify
    const adminPassword = process.env.ADMIN_PASSWORD;
    const jwtSecret = process.env.JWT_SECRET || "fallback_secret_for_local_dev";

    if (!adminPassword) {
      console.error("ADMIN_PASSWORD environment variable is not set.");
      return Response.json({ message: "Server configuration error." }, { status: 500 });
    }

    if (password === adminPassword) {
      // Password is correct, issue a JWT token valid for 24 hours
      const token = jwt.sign({ role: "admin" }, jwtSecret, { expiresIn: "24h" });
      
      return Response.json({
        message: "Authentication successful",
        token: token,
      });
    } else {
      return Response.json({ message: "Invalid password" }, { status: 401 });
    }
  } catch (error) {
    return Response.json({ message: "Invalid request payload" }, { status: 400 });
  }
};

export const config: Config = {
  path: "/api/admin/login",
};
