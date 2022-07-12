import { getDirectoryFiles, getFileInfo } from "./helpers";
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

export const provisionHaveFilesChanged = (dirPath: string, filter: (absFilePath: string) => boolean) => {

    const getFileInfos = async () => {
        const files = await getDirectoryFiles(dirPath);
        const filesFiltered = files.filter(x => filter(x));
        const fileInfos = await Promise.all(filesFiltered.map(async x => ({
            filePath: x,
            changeTimeMs: (await getFileInfo(x)).ctimeMs
        })));

        return fileInfos;
    };

    return provision(`haveFilesChanged ${dirPath} ${filter ?? ''}`)
        .task(async state => await getFileInfos())
        .when(async state => {
            const fileInfos = await getFileInfos();

            const last = await state.getLatestProvisionOutput<typeof fileInfos>(`haveFilesChanged ${dirPath} ${filter ?? ''}`);
            const lastFileInfosMap = new Map(last?.output?.map(x => [x.filePath, x.changeTimeMs]) ?? []);

            // Are there any new files or file changes
            return fileInfos.some(x =>
                !lastFileInfosMap.has(x.filePath)
                || x.changeTimeMs > (lastFileInfosMap.get(x.filePath) ?? 0));
        });
};

