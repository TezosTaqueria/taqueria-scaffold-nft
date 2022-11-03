#include "../interface.mligo"

let test =
    let _ = Test.reset_state 3n [] in
    let admin_address = Test.nth_bootstrap_account 1 in
    let user_address = Test.nth_bootstrap_account 2 in
    let _ = Test.set_source admin_address in
    let initial_storage = 
    { 
        ledger = Big_map.literal [
            ((admin_address, 0n), 30n) ;
            ((admin_address, 1n), 50n) ;
            ((user_address, 2n), 30n) ;
            ((user_address, 3n), 50n) ;
        ];
        operators = (Big_map.empty: (operator, unit) big_map);
        metadata = (Big_map.empty: (string, bytes) big_map);
        token_metadata = Big_map.literal [
            (0n, { token_id = 0n ; token_info = Map.literal [ ("", Bytes.pack "This is a test") ]}) ;
            (1n, { token_id = 1n ; token_info = Map.literal [ ("", Bytes.pack "This is a test") ]}) ;
            (2n, { token_id = 2n ; token_info = Map.literal [ ("", Bytes.pack "This is a test") ]}) ;
            (3n, { token_id = 3n ; token_info = Map.literal [ ("", Bytes.pack "This is a test") ]}) ;
        ];
        total_supply = 3n;
        admin = admin_address;
        paused = false;
    } in
    let contract_addr, _, _ = Test.originate_from_file "../main.mligo" "main" [] (Test.eval initial_storage) 0tez in
    let contract_typed_addr: (parameter, storage) typed_address = Test.cast_address contract_addr in
    let storage: storage = Test.get_storage_of_address contract_addr |> Test.decompile in
    let _ = assert (storage.admin = admin_address) in
    let _ = assert (storage.paused = false) in
    let _ = assert (storage.total_supply = 3n) in

    // TESTING TRANSFERS
    let transfer_token_id = 0n in
    let transfer_token_amount = 1n in
    let valid_transfer_params = [ 
        { from_ = admin_address ; txs = [ { to_ = user_address ; token_id = transfer_token_id ; amount = transfer_token_amount } ]}
    ] in

    // fails when user transfers XTZ with the operation
    let _ = 
        (match Test.transfer_to_contract (Test.to_contract contract_typed_addr) (Transfer valid_transfer_params) 100mutez with
        | Success _ -> false
        | Fail err ->
            (match err with
            | Rejected (msg, _) -> msg = Test.eval "NO_XTZ_AMOUNT"
            | _ -> false))
        |> assert 
    in

    // fails for inexisting token ids
    let transfer_params = [ 
        { from_ = admin_address ; txs = [ { to_ = user_address ; token_id = 222n ; amount = 1n } ]}
    ] in
    let _ = 
        (match Test.transfer_to_contract (Test.to_contract contract_typed_addr) (Transfer transfer_params) 0mutez with
        | Success _ -> false
        | Fail err ->
            (match err with
            | Rejected (msg, _) -> msg = Test.eval "FA2_TOKEN_UNDEFINED"
            | _ -> false))
        |> assert 
    in

    // fails when user doesn't own the token
    let transfer_params = [ 
        { from_ = admin_address ; txs = [ { to_ = user_address ; token_id = 2n ; amount = 1n } ]}
    ] in
    let _ = 
        (match Test.transfer_to_contract (Test.to_contract contract_typed_addr) (Transfer transfer_params) 0mutez with
        | Success _ -> false
        | Fail err ->
            (match err with
            | Rejected (msg, _) -> msg = Test.eval "FA2_NOT_OWNER"
            | _ -> false))
        |> assert 
    in
    
    // fails when user doesn't own enough tokens
    let transfer_params = [ 
        { from_ = admin_address ; txs = [ { to_ = user_address ; token_id = 0n ; amount = 69n } ]}
    ] in
    let _ = 
        (match Test.transfer_to_contract (Test.to_contract contract_typed_addr) (Transfer transfer_params) 0mutez with
        | Success _ -> false
        | Fail err ->
            (match err with
            | Rejected (msg, _) -> msg = Test.eval "FA2_INSUFFICIENT_BALANCE"
            | _ -> false))
        |> assert 
    in

    // passes when user owns enough tokens
    let storage: storage = Test.get_storage_of_address contract_addr |> Test.decompile in
    let admin_initial_balance = 
        match Big_map.find_opt (admin_address, transfer_token_id) storage.ledger with
        | None -> Test.failwith "A balance is expected for admin to test transfers"
        | Some blnc -> blnc
    in
    let _ = 
        match Big_map.find_opt (user_address, transfer_token_id) storage.ledger with
        | None -> 0n
        | Some _ -> Test.failwith "No balance is expected for user to test transfers"
    in

    let _ = 
        (match Test.transfer_to_contract (Test.to_contract contract_typed_addr) (Transfer valid_transfer_params) 0mutez with
        | Success _ -> true
        | Fail _ -> false)
        |> assert 
    in
    let storage: storage = Test.get_storage_of_address contract_addr |> Test.decompile in
    // verifies that the token has switched hands
    let _ = 
        (match Big_map.find_opt (admin_address, transfer_token_id) storage.ledger with
        | None -> false
        | Some blnc ->
            if blnc + transfer_token_amount = admin_initial_balance
            then true
            else false)
        |> assert
    in
    let _ = 
        (match Big_map.find_opt (user_address, transfer_token_id) storage.ledger with
        | None -> false
        | Some blnc ->
            if blnc = transfer_token_amount
            then true
            else false)
        |> assert
    in
    // passes for zero token transfers as per the standard
    let admin_initial_balance = 
        match Big_map.find_opt (admin_address, transfer_token_id) storage.ledger with
        | None -> Test.failwith "A balance is expected for admin to test transfers"
        | Some blnc -> blnc
    in
    let user_initial_balance = 
        match Big_map.find_opt (user_address, transfer_token_id) storage.ledger with
        | None -> Test.failwith "A balance is expected for admin to test transfers"
        | Some blnc -> blnc
    in

    let transfer_params = [ 
        { from_ = admin_address ; txs = [ { to_ = user_address ; token_id = 0n ; amount = 0n } ]}
    ] in
    let _ = 
        (match Test.transfer_to_contract (Test.to_contract contract_typed_addr) (Transfer transfer_params) 0mutez with
        | Success _ -> true
        | Fail _ -> false)
        |> assert  
    in

    let storage: storage = Test.get_storage_of_address contract_addr |> Test.decompile in
    let _ = 
        (match Big_map.find_opt (admin_address, transfer_token_id) storage.ledger with
        | None -> false
        | Some blnc -> 
            if blnc = admin_initial_balance
            then true
            else false)
    in
    let _ = 
        (match Big_map.find_opt (user_address, transfer_token_id) storage.ledger with
        | None -> false
        | Some blnc -> 
            if blnc = user_initial_balance
            then true
            else false)
    in

    // passes for self-transfer as per the standard
    let admin_initial_balance = 
        match Big_map.find_opt (admin_address, transfer_token_id) storage.ledger with
        | None -> Test.failwith "A balance is expected for admin to test transfers"
        | Some blnc -> blnc
    in

    let transfer_params = [ 
        { from_ = admin_address ; txs = [ { to_ = admin_address ; token_id = 0n ; amount = 1n } ]}
    ] in
    let _ = 
        (match Test.transfer_to_contract (Test.to_contract contract_typed_addr) (Transfer transfer_params) 0mutez with
        | Success _ -> true
        | Fail _ -> false)
        |> assert  
    in

    let storage: storage = Test.get_storage_of_address contract_addr |> Test.decompile in
    let _ = 
        (match Big_map.find_opt (admin_address, transfer_token_id) storage.ledger with
        | None -> false
        | Some blnc -> 
            if blnc = admin_initial_balance
            then true
            else false)
    in

    // TESTING UPDATE_OPERATORS

    // TESTING BALANCE_OF

    // TESTING MINT

    ()