import aj from "../lib/arcjet.js";
import { isSpoofedBot } from "@arcjet/inspect";

export const arcjetProtection = async (request, response, next) => {
  try {
    const decision = await aj.protect(request);
    if (decision.isDenied()) {
      if (decision.reason.isRateLimit()) {
        return response.status(429).json({ message: "Rate Limit exceeded. Please try again later." });
      }
      else if (decision.reason.isBot()) {
        return response.status(403).json({ message: "Bot access denied." });
      } else {
        return response.status(403).json({ message: "Access denied by security policy." });
      }
    }
    // Check for spoofed bots
    if (decision.results.some(isSpoofedBot)) {
      return response.status(403).json({ error: "Spoofed bot detected", message: "Malicious bot activity detected." })
    }
    next();
  } catch (error) {
    console.error("Arcjet Protection Error: ", error);
    next();
  }
}