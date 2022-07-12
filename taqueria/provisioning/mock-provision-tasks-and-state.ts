// Use mock provisioner until provisioning system is ready
import { createProvisioner } from "./mock-provision-runtime"
import { exec } from "child_process";
// import type developmentStateJson from "../.taq/development-state.json";
import fs from "fs/promises";
import path from "path";
import { getFileInfo, normalizeProvisionName } from "./helpers";


// Mock tasks and state
const getLatestTaskOutput = async <TOutput extends null | unknown[]>(plugin: string, task: string): Promise<undefined | {
    time: number,
    output: TOutput
}> => {
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

    // @taqueria/plugin-ligo.compile
    const taskRunKeys = Object.keys(allState.tasks)
        .filter(x => x.startsWith(`${plugin}.${task}`));
    const lastTaskRunKey = taskRunKeys.sort().reverse()[0];

    const lastTaskResult = allState.tasks[lastTaskRunKey];

    // console.log(`getLatestTaskOutput`, { plugin, task, lastTaskResult });
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
            time: number,
            output: TOutput
        }
    }
};

const developmentStateFilePath = path.join(__dirname, '../.taq/development-state.json');

export const provisionerInstance = createProvisioner({
    getInputState: async () => {

        return {
            getLatestProvisionOutput: async <TOutput extends null | unknown[]>(provisionName: string) => {
                return await getLatestTaskOutput<TOutput>('custom', normalizeProvisionName(provisionName))
            },
            // custom: {} as { [provisionName: string]: unknown },

            // TODO: Not sure how state will be structured
            // Assuming this is part of the new contract special state
            "main.mligo": {
                hasChanged: async () => {
                    const fileInfo = await getFileInfo(`../contracts/main.mligo`);
                    const last = await getLatestTaskOutput('@taqueria/plugin-ligo', 'compile');
                    return fileInfo.ctimeMs > (last?.time ?? 0);
                },
                artifactAbspath: path.resolve(__dirname, '../contracts/main.tz'),
                abspath: path.resolve(__dirname, '../contracts/main.mligo'),
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
            time: timestamp,
            output: provisionOutput
        };

        await fs.writeFile(developmentStateFilePath, JSON.stringify(allState, null, 4));
    },
});
