let apply_transfer (((from, s), transfer): (address * storage) * transfer_to): address * storage =
    let { to_ = recipient; token_id = token_id; amount = amt } = transfer in
    // checks if token_id is valid
    if not Big_map.mem token_id s.token_metadata
    then (failwith "FA2_TOKEN_UNDEFINED": address * storage)
    else
        // checks if the given owner owns the token id
        let owner_balance = match Big_map.find_opt (from, token_id) s.ledger with
            | None -> failwith "FA2_NOT_OWNER"
            | Some q -> 
                if q = 0n && amt > 0n // as per the standard, transfer of 0 amount must be treated as normal transfers
                then (failwith "FA2_INSUFFICIENT_BALANCE") 
                else if amt > q
                then (failwith "FA2_INSUFFICIENT_BALANCE") 
                else q
        in
        // checks is sender is allowed to request a transfer
        let operator = { owner = from; operator = Tezos.get_sender (); token_id = token_id } in
        if Tezos.get_sender () <> from && not Big_map.mem operator s.operators
        then (failwith "FA2_NOT_OPERATOR": address * storage)
        else
            // updates the token balance of the owner
            let new_ledger: ledger = 
                if owner_balance - amt = 0
                then Big_map.remove (from, token_id) s.ledger
                else Big_map.update (from, token_id) (owner_balance - amt |> abs |> into_some) s.ledger
            in
            // adds the tokens to the recipient's account
            let new_ledger: ledger =
                match Big_map.find_opt (recipient, token_id) new_ledger with
                | None -> Big_map.add (recipient, token_id) amt new_ledger
                | Some prev_amt -> Big_map.update (recipient, token_id) (prev_amt + amt |> into_some) new_ledger
            in

            from, { s with ledger = new_ledger }

let process_transfer (s, transfer: storage * transfer_param): storage =
    let { from_ = from; txs = txs } = transfer in
    let (_, new_storage): address * storage =
        List.fold apply_transfer txs (from, s)
    in new_storage

let transfer (transfer_list, s: (transfer_param list) * storage): storage =
    List.fold process_transfer transfer_list s