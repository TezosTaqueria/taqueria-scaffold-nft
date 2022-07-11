// import type developmentStateJson from "../.taq/development-state.json";
import fs from "fs/promises";
import path from "path";

export const getFileInfo = async (filePath: string) => {
    return await fs.stat(path.join(__dirname, `${filePath}`))
}