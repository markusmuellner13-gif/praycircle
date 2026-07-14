import { NextResponse } from "next/server";
import { googleEnabled, appleEnabled } from "@/lib/oauth";
import { turnstileSiteKey } from "@/lib/turnstile";

export const dynamic = "force-dynamic";

/** Which optional auth features are active (client uses this to render
 *  OAuth buttons and the Turnstile widget). */
export async function GET() {
  return NextResponse.json({
    google: googleEnabled(),
    apple: appleEnabled(),
    turnstileSiteKey: turnstileSiteKey(),
  });
}
