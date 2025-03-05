import fetch from "node-fetch";

export async function isAuthenticated(): Promise<boolean> {
  try {
    const response = await fetch("http://localhost:3000/api/auth/session");
    const data = await response.json();
    console.log("Authentication check response:", data);
    return data.user !== null;
  } catch (error) {
    console.error("Failed to check authentication:", error);
    return false;
  }
}