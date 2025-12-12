export const ADDON_ID = "addon-version"
export const ADDON_NAME = "Latest version"
export const TOOL_ID = `${ADDON_ID}/tool`
export const LINK_URL = "https://github.com/commercelayer/app-elements/releases"

import lernaJson from "../../../../lerna.json" with { type: "json" }

export const VERSION = lernaJson.version
