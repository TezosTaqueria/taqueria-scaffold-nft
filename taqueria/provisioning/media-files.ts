import { promisify } from 'util';
import ImageSize from 'image-size';
import { mimeTypes } from './mime-types';
const sizeOfImage = promisify(ImageSize);

export const getMediaFileFormat = async (filePath: string) => {
    try {
        const dimensions = await sizeOfImage(filePath);
        if (!dimensions) { return; }

        const mimeType = mimeTypes.find(x => filePath.endsWith(x.extension))?.mimeType;

        return {
            mimeType,
            width: dimensions.width,
            height: dimensions.height,
        };
    } catch {
        return;
    }
};