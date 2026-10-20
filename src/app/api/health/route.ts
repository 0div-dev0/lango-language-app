import { NextResponse } from "next/server";

/**
 * GET /api/health — liveness endpoint for the /api layer.
 * Routers for future domains (chat, auth, vocabulary) live next to this file
 * under src/app/api/<domain>/route.ts — see AGENTS.md and api conventions in
 * PROJECT_ARCHITECTURE.md.
 */
export async function GET() {
  return NextResponse.json({
    status: "ok",
    service: "lingo",
    version: "1.0.0",
    timestamp: new Date().toISOString(),
  });
}
