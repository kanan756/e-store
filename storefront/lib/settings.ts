import fs from "fs"
import path from "path"

const p = path.join(process.cwd(), "settings.json")

export function getSettings() {
  try {
    if (fs.existsSync(p)) {
      return JSON.parse(fs.readFileSync(p, "utf-8"))
    }
  } catch (e) {}
  return { showCertifications: true }
}

export function saveSettings(s: any) {
  fs.writeFileSync(p, JSON.stringify(s, null, 2))
}
