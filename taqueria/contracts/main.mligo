# 1 "./contracts/main.mligo"

# 1 "./contracts/./interface.mligo" 1
type token_id = nat
type ipfs_hash = bytes

(*
    TRANSFER PARAMS
*)

type transfer_to =
[@layout:comb]
{
    to_     : address;
    token_id: token_id;
    amount  : nat;
}

type transfer_param = 
[@layout:comb]
{
    from_   : address;
    txs     : transfer_to list
}

(*
    UPDATE OPERATORS PARAMS
*)

type operator =
[@layout:comb]
{
    owner   : address;
    operator: address;
    token_id: token_id
}

type update_operators_param =
| Add_operator of operator
| Remove_operator of operator

(*
    BALANCE OF PARAMS
*)

type balance_of_request =
[@layout:comb]
{
    owner   : address;
    token_id: token_id;
}

type balance_of_callback_param =
[@layout:comb]
{
    request: balance_of_request;
    balance: nat;
}

type balance_of_param =
[@layout:comb]
{
    requests: balance_of_request list;
    callback: (balance_of_callback_param list) contract;
}

(*
    MINT
*)

type mint_param =
[@layout:comb]
{
    token_id    : token_id;
    ipfs_hash   : ipfs_hash;
    owner       : address;
}

(*
    STORAGE AND PARAMETER
*)

// parameter type
type parameter = 
    | Transfer of transfer_param list
    | Update_operators of update_operators_param list
    | Balance_of of balance_of_param
    | Mint of mint_param list
    | Update_admin of address
    | Update_metadata of bytes
    | Update_token_metadata of (token_id * bytes)

// storage type
type ledger = ((address * token_id), nat) big_map
type token_metadata = 
[@layout:comb]
{
    token_id: nat;
    token_info: (string, bytes) map
}
type storage =
{
    ledger              : ledger;
    operators           : (operator, unit) big_map;
    metadata            : (string, bytes) big_map;
    token_metadata      : (token_id, token_metadata) big_map;
    total_supply        : nat;
    admin               : address;
}

type return = (operation list) * storage
# 2 "./contracts/main.mligo" 2

# 1 "./contracts/./utils.mligo" 1
(*
    UTILS functions reserved for admin
*)

(* Updates the admin's address *)
let update_admin (p, s: address * storage): storage =
    if Tezos.sender <> s.admin
    then (failwith "NOT_AN_ADMIN": storage)
    else { s with admin = p }

(* Updates the metadata *)
let update_metadata (p, s: bytes * storage): storage =
    if Tezos.sender <> s.admin
    then (failwith "NOT_AN_ADMIN": storage)
    else { s with metadata = Big_map.update "contents" (Some (p)) s.metadata }

(* Updates the token metadata *)
let update_token_metadata (p, s: (token_id * bytes) * storage): storage =
    if Tezos.sender <> s.admin
    then (failwith "NOT_AN_ADMIN": storage)
    else 
        let (token_id, metadata) = p in
        if not Big_map.mem token_id s.token_metadata
        then (failwith "FA2_TOKEN_UNDEFINED": storage)
        else
            let new_token_info = {
                token_id = token_id;
                token_info = Map.literal [ ("", metadata) ]
            } 
            in { s with token_metadata = Big_map.update token_id (Some new_token_info) s.token_metadata }

(* Mints additional tokens *)
let mint (p, s: (mint_param list) * storage): storage =
    if List.length p = 0n
    then (failwith "EMPTY_LIST": storage)
    else
        List.fold
            (
                fun (new_storage, params: storage * mint_param) ->
                    let { token_id = token_id; ipfs_hash = ipfs_hash; owner = owner } = params in
                    // checks that the token id doesn't already exist
                    if Big_map.mem token_id new_storage.token_metadata
                    then (failwith "TOKEN_ID_ALREADY_EXISTS": storage)
                    else
                        let token_metadata: token_metadata = {
                            token_id    = token_id;
                            token_info  = Map.literal [ ("", ipfs_hash) ]
                        } 
                        in {
                            s with 
                                ledger          = Big_map.add (owner, token_id) 1n new_storage.ledger;
                                token_metadata  = Big_map.add token_id token_metadata new_storage.token_metadata;
                                total_supply    = new_storage.total_supply + 1n;
                        }
            )
            p
            s
# 3 "./contracts/main.mligo" 2

# 1 "./contracts/./transfer.mligo" 1
let apply_transfer (((from, s), transfer): (address * storage) * transfer_to): address * storage =
    let { to_ = recipient; token_id = token_id; amount = amt } = transfer in
    // checks if token_id is valid
    if not Big_map.mem token_id s.token_metadata
    then (failwith "FA2_TOKEN_UNDEFINED": address * storage)
    else
        // checks if amount is 1n
        if amt <> 1n
        then (failwith "AMOUNT_CAN_ONLY_BE_1": address * storage)
        else
            // checks is sender is allowed to request a transfer
            let operator = { owner = from; operator = Tezos.sender; token_id = token_id } in
            if Tezos.sender <> from && not Big_map.mem operator s.operators
            then (failwith "FA2_NOT_OPERATOR": address * storage)
            else
                // removes the token from the sender's account
                let new_ledger: ledger = 
                    Big_map.remove (from, token_id) s.ledger in
                // adds the token to the recipient's account
                let new_ledger: ledger =
                    match Big_map.find_opt (recipient, token_id) new_ledger with
                    | None -> Big_map.add (recipient, token_id) 1n new_ledger
                    | Some _ -> Big_map.update (recipient, token_id) (Some 1n) new_ledger
                in

                from, { s with ledger = new_ledger }

let process_transfer (s, transfer: storage * transfer_param): storage =
    let { from_ = from; txs = txs } = transfer in
    let (_, new_storage): address * storage =
        List.fold apply_transfer txs (from, s)
    in new_storage

let transfer (transfer_list, s: (transfer_param list) * storage): storage =
    List.fold process_transfer transfer_list s
# 4 "./contracts/main.mligo" 2

# 1 "./contracts/./update_operators.mligo" 1
let update_operators (operators_list, s: (update_operators_param list) * storage): storage =
    List.fold
        (
            fun ((s, operator_param): storage * update_operators_param) ->
                match operator_param with
                | Add_operator operator ->
                    if Tezos.sender <> operator.owner
                    then (failwith "FA2_NOT_OWNER": storage)
                    else
                        { s with operators = Big_map.add operator unit s.operators }
                | Remove_operator operator->
                    if Tezos.sender <> operator.owner
                    then (failwith "FA2_NOT_OWNER": storage)
                    else
                        { s with operators = Big_map.remove operator s.operators }
        )
        operators_list
        s
# 5 "./contracts/main.mligo" 2

# 1 "./contracts/./balance_of.mligo" 1
let balance_of (p, s: balance_of_param * storage): operation list * storage =
    // creates the list of all requested balances
    let list_of_balances: balance_of_callback_param list =
        List.map
            (
                fun (req: balance_of_request): balance_of_callback_param ->
                    if not Big_map.mem req.token_id s.token_metadata
                    then (failwith "FA2_TOKEN_UNDEFINED": balance_of_callback_param)
                    else
                        match Big_map.find_opt (req.owner, req.token_id) s.ledger with
                        | None -> { request = { owner = req.owner; token_id = req.token_id }; balance = 0n }
                        | Some b -> { request = { owner = req.owner; token_id = req.token_id }; balance = b }
            )
            p.requests
    in
    // forges operation for callback and returns storage
    [Tezos.transaction list_of_balances 0tez p.callback], s
# 6 "./contracts/main.mligo" 2

let main (action, storage : parameter * storage) : return =
    if Tezos.amount <> 0tez
    then (failwith "NO_XTZ_AMOUNT": return)
    else
        match action with
            | Transfer p -> ([]: operation list), transfer (p, storage)
            | Update_operators p -> ([]: operation list), update_operators (p, storage)
            | Balance_of p -> balance_of (p, storage)
            | Mint p -> ([]: operation list), mint (p, storage)
            | Update_admin p -> ([]: operation list), update_admin (p, storage)
            | Update_metadata p -> ([]: operation list), update_metadata (p, storage)
            | Update_token_metadata p -> ([]: operation list), update_token_metadata (p, storage)

