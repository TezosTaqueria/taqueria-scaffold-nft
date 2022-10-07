let into_some (type a) (p: a): a option = Some p

(*
    UTILS functions reserved for admin
*)

(* Updates the admin's address *)
let update_admin (p, s: address * storage): storage =
    if Tezos.get_sender () <> s.admin
    then (failwith "NOT_AN_ADMIN": storage)
    else { s with admin = p }

(* Updates the metadata *)
let update_metadata (p, s: bytes * storage): storage =
    if Tezos.get_sender () <> s.admin
    then (failwith "NOT_AN_ADMIN": storage)
    else { s with metadata = Big_map.update "contents" (Some (p)) s.metadata }

(* Updates the token metadata *)
let update_token_metadata (p, s: (token_id * bytes) * storage): storage =
    if Tezos.get_sender () <> s.admin
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

(* Pauses/Unpauses the contract *)
let pause (s: storage): storage =
    if Tezos.get_sender () <> s.admin
    then (failwith "NOT_AN_ADMIN": storage)
    else { s with paused = not s.paused }