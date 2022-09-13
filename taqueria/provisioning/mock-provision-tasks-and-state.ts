// Use mock provisioner until provisioning system is ready
import { createProvisioner } from "./mock-provision-runtime"
import { exec } from "child_process";
// import type developmentStateJson from "../.taq/development-state.json";
import fs from "fs/promises";
import path from "path";
import { getFileInfo, normalizeProvisionName } from "./helpers";


// Mock tasks and state
const getAllTaskOutput = async <TOutput extends null | unknown[]>(plugin: string, task: string): Promise<{
    time: number,
    output: TOutput
}[]> => {
    // tasks: {
    //        "@taqueria/plugin-ligo.compile.1656818763255": {
    //            "time": 1656818763255,
    //            "output": [
    //                {
    //                    "contract": "example.jsligo",
    //                    "artifact": "artifacts/example.tz"
    //                }
    //            ]
    //        },
    //    }


    const allStateContent = await fs.readFile(developmentStateFilePath, { encoding: 'utf-8' });
    const allState = JSON.parse(allStateContent) as DevelopmentStateJson<TOutput>;

    const items = [...Object.entries(allState.tasks)]
        .filter(([key, value]) => key.startsWith(`${plugin}.${task}`))
        .map(([key, value]) => value);

    items.sort((a, b) => a.time - b.time);
    return items;
};

const getLatestTaskOutput = async <TOutput extends null | unknown[]>(plugin: string, task: string): Promise<undefined | {
    time: number,
    output: TOutput
}> => {
    const allTaskOutput = await getAllTaskOutput<TOutput>(plugin, task);
    const lastTaskResult = allTaskOutput.reverse()[0];
    return lastTaskResult;
};

const runTask = async (plugin: string, task: string, args: string) => {
    const cli = `taq ${task} ${args}`;
    const result = await new Promise((resolve, reject) => {
        console.log(`runTask: ${cli}`);
        exec(cli, (error, stdout, stderr) => {
            if (error) {
                reject(error);
            }

            if (stderr) {
                console.error(stderr);
            }

            console.log(stdout);
            resolve(stdout);
        });
    });

    const runResult = await getLatestTaskOutput(plugin, task);
    return runResult?.output;
};

export const tasks = {
    ligo: {
        compile: async (args: {
            contract: string,
        }) => { return runTask('@taqueria/plugin-ligo', 'compile', `${args.contract}`) },
    },
    taquito: {
        originate: async (args: {
            contract: string,
        }) => { return runTask('@taqueria/plugin-taquito', 'originate', `${args.contract}`) }
    },
    'contract-types': {
        'generate types': async (args: {
        }) => { return runTask('@taqueria/plugin-contract-types', 'generate types', ``) },
    },
    'ipfs-pinata': {
        publish: async (args: {
            fileOrDirectoryPath: string;
        }) => { return runTask('@taqueria/plugin-ipfs-pinata', 'publish', `${args.fileOrDirectoryPath}`) },
    },
};


type DevelopmentStateJson<TOutput> = {
    tasks: {
        [name: string]: {
            task: string,
            plugin: string,
            time: number,
            output: TOutput
        }
    }
};

const developmentStateFilePath = path.resolve(process.cwd(), './.taq/development-state.json');

export const provisionerInstance = createProvisioner({
    getInputState: async () => {

        return {
            getAllTaskOutput,
            getLatestTaskOutput,
            getAllProvisionOutput: async <TOutput extends null | unknown[]>(provisionName: string) => {
                return await getAllTaskOutput<TOutput>('custom', normalizeProvisionName(provisionName))
            },
            getLatestProvisionOutput: async <TOutput extends null | unknown[]>(provisionName: string) => {
                return await getLatestTaskOutput<TOutput>('custom', normalizeProvisionName(provisionName))
            },
            // custom: {} as { [provisionName: string]: unknown },

            // TODO: Not sure how state will be structured
            // Assuming this is part of the new contract special state
            "main.mligo": {
                hasChanged: async () => {
                    const fileInfo = await getFileInfo(`./contracts/main.mligo`);
                    const last = await getLatestTaskOutput('@taqueria/plugin-ligo', 'compile');
                    return fileInfo.ctimeMs > (last?.time ?? 0);
                },
                artifactAbspath: path.resolve(process.cwd(), './contracts/main.tz'),
                abspath: path.resolve(process.cwd(), './contracts/main.mligo'),
                relpath: 'main.mligo',
            },
            // State for the last output
            '@taqueria/plugin-ligo': {
                compile: await getLatestTaskOutput<[{
                    contract: string;
                    artifact: string;
                }]>('@taqueria/plugin-ligo', 'compile'),
            },
            '@taqueria/plugin-taquito': {
                originate: await getLatestTaskOutput<[{
                    contract: string;
                    artifact: string;
                }]>('@taqueria/plugin-taquito', 'originate'),
            },
            '@taqueria/plugin-contract-types': {
                'generate types': await getLatestTaskOutput<null>(
                    '@taqueria/plugin-contract-types', 'generate types'),
            },
            '@taqueria/plugin-ipfs-pinata': {
                publish: await getLatestTaskOutput<null>(
                    '@taqueria/plugin-ipfs-pinata', 'publish'),
            },
        };
    },
    addProvisionTaskOutputToState: async (provisionName, provisionOutput) => {
        const allStateContent = await fs.readFile(developmentStateFilePath, { encoding: 'utf-8' });
        const allState = JSON.parse(allStateContent) as DevelopmentStateJson<unknown>;

        const timestamp = Date.now();
        allState.tasks[`custom.${normalizeProvisionName(provisionName)}.${timestamp}`] = {
            task: `custom.${normalizeProvisionName(provisionName)}`,
            plugin: 'custom',
            time: timestamp,
            output: provisionOutput
        };

        await fs.writeFile(developmentStateFilePath, JSON.stringify(allState, null, 4));
    },
});
