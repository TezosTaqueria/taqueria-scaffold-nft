import "./provisioner";
import { provisionerInstance } from "./mock-provision-tasks-and-state";
const { apply, plan } = provisionerInstance;

// Run with Mock Provision
if (process.argv.join('').includes('plan')) {
    console.log(`Running plan`);
    void plan();
} else if (process.argv.join('').includes('apply')) {
    console.log(`Running apply`);
    void apply();
} else {
    console.log(`Unknown command ${process.argv}`);
}