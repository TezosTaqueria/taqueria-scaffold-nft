// Use mock provisioner until provisioning system is ready
import { createProvisioner } from "./mock-provisioner"
import { exec } from "child_process";
// import type developmentStateJson from "../.taq/development-state.json";
import fs from "fs/promises";
import path from "path";

// Mock tasks and state
const runTask = async (cli: string) => {
    return new Promise((resolve, reject) => {
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
};

const tasks = {
    ligo: {
        compile: async (args: {
            contract: string,
        }) => { return runTask(`taq compile ${args.contract}`) },
    },
    'contract-types': {
        'generate types': async (args: {
        }) => { return runTask(`taq generate types`) },
    },
    taquito: {
        originate: async (args: {
            contract: string,
        }) => { return runTask(`taq originate ${args.contract}`) }
    }
};

const { provision, apply, plan } = createProvisioner(async () => {

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
        type DevelopmentStateJson = {
            tasks: {
                [name: string]: {
                    time: number,
                    output: TOutput
                }
            }
        };

        const allStateContent = await fs.readFile(path.join(__dirname, '../.taq/development-state.json'), { encoding: 'utf-8' });
        const allState = JSON.parse(allStateContent) as DevelopmentStateJson;

        // @taqueria/plugin-ligo.compile
        const taskRunKeys = Object.keys(allState.tasks)
            .filter(x => x.startsWith(`${plugin}.${task}`));
        const lastTaskRunKey = taskRunKeys.sort().reverse()[0];

        const lastTaskResult = allState.tasks[lastTaskRunKey];

        // console.log(`getLatestTaskOutput`, { plugin, task, lastTaskResult });
        return lastTaskResult;
    };

    const getFileInfo = async (filePath: string) => {
        return await fs.stat(path.join(__dirname, `${filePath}`))
    }

    return {
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
        '@taqueria/plugin-contract-types': {
            'generate types': await getLatestTaskOutput<null>(
                '@taqueria/plugin-contract-types', 'generate types'),
        },
        // @taqueria/plugin-contract-types.generate types
    };
});


// Provision
const pCompile =
    provision("compile contract")
        .task(state => tasks.ligo.compile({
            contract: state["main.mligo"].relpath,
        }))
        .when(state => state["main.mligo"].hasChanged())
    ;

const pTypes =
    provision("generate types")
        .task(state => tasks['contract-types']['generate types']({
        }))
        .when(async state =>
            (state["@taqueria/plugin-ligo"].compile?.time ?? 0)
            > (state["@taqueria/plugin-contract-types"]['generate types']?.time ?? 0))
        .after([pCompile])
    ;

// const pOriginate =
//     provision("originate")
//         .task(state => tasks.taquito.originate({
//             contract: state["main.mligo"].artifactAbspath
//         }))
//         .after([pCompile]);



// Run
if (process.argv.join('').includes('plan')) {
    console.log(`Running plan`);
    void plan();
} else if (process.argv.join('').includes('apply')) {
    console.log(`Running apply`);
    void apply();
} else {
    console.log(`Unknown command ${process.argv}`);
}