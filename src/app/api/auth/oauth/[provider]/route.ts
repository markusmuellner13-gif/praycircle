import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { buildAuthUrl, providerEnabled, type Provider } from "@/lib/oauth";

export const dynamic = "force-dynamic";

/** Starts the OAuth flow: sets a state cookie and redirects to the provider. */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ provider: string }> }
) {
  const { provider } = await params;
  if (provider !== "google" && provider !== "apple") {
    return NextResponse.json({ error: "unknown_provider" }, { status: 404 });
  }
  if (!providerEnabled(provider as Provider)) {
    return NextResponse.json({ error: "provider_disabled" }, { status: 503 });
  }
  const origin = new URL(request.url).origin;
  const state = crypto.randomUUID();
  const store = await cookies();
  store.set("praycircle_oauth_state", state, {
    httpOnly: true,
    secure: true,
    // Apple returns via cross-site form POST; None is required for the
    // cookie to accompany it. Requires HTTPS (fine: prod + OAuth testing).
    sameSite: "none",
    path: "/",
    maxAge: 600,
  });
  return NextResponse.redirect(buildAuthUrl(provider as Provider, origin, state));
}
