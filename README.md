### Compile the sample contract and Run the app

- `npm run setup`
- `npm run start`

### File Structure

- `app`
    
    - Minimal create react app
    - Call contract methods
    - Access contract storage

- `taqueria`

    - Everything related to the contract
    - `taqueria/.taq`
        - taqueria config folder, including setup for all required plugins
    - `taqueria/contracts`
        - the contract .ligo code
    - `taqueria/artifacts`
        - the compiled contract (*.tz file)
    - `taqueria/typings`
        - the contract typescript typing


