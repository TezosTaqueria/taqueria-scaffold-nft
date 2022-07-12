import { getFileInfo } from "./helpers";
import { provisionerInstance, tasks } from "./mock-provision-tasks-and-state";
const { provision } = provisionerInstance;

export const provisionHasFileChanged = (filePath: string) => {
    return provision(`hasFileChanged ${filePath}`)
        .task(async state => true)
        .when(async state => {
            const fileInfo = await getFileInfo(filePath);
            const last = await state.getLatestProvisionOutput(`hasFileChanged ${filePath}`);
            return fileInfo.ctimeMs > (last?.time ?? 0);
        });
};