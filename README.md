### Run taqueria provisioner and start app

- Add your pinataJwtToken
    - Create file `./taqueria/.env`
    - Get pinata jwt token form your pinata account on the pinata website:
        - `https://app.pinata.cloud/signin`
    - Add pinata jwt token in file

        ```
        pinataJwtToken=eyJhbGc...
        ```

- `npm run setup`
- `npm run start:taqueria:local`
- `npm run apply`
- `npm run start:app`

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


