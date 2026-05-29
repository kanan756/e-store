import { NextResponse } from "next/server"
import { getSettings, saveSettings } from "@/lib/settings"

export async function GET() {
  return NextResponse.json(getSettings())
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const settings = getSettings()
    saveSettings({ ...settings, ...body })
    return NextResponse.json({ success: true })
  } catch (err) {
    return NextResponse.json({ error: "Failed to save settings" }, { status: 500 })
  }
}
