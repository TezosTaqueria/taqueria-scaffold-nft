#include "./interface.mligo"
#include "./utils.mligo"
#include "./transfer.mligo"
#include "./update_operators.mligo"
#include "./balance_of.mligo"

let main (action, storage : parameter * storage) : return =
    if Tezos.get_amount () <> 0tez
    then (failwith "NO_XTZ_AMOUNT": return)
    else
        match action with
            | Transfer p -> 
                if storage.paused
                then failwith "CONTRACT_IS_PAUSED"
                else ([]: operation list), transfer (p, storage)
            | Update_operators p -> 
                if storage.paused
                then failwith "CONTRACT_IS_PAUSED"
                else ([]: operation list), update_operators (p, storage)
            | Balance_of p -> balance_of (p, storage)
            | Mint p -> 
                if storage.paused
                then failwith "CONTRACT_IS_PAUSED"
                else ([]: operation list), mint (p, storage)
            | Update_admin p -> ([]: operation list), update_admin (p, storage)
            | Update_metadata p -> ([]: operation list), update_metadata (p, storage)
            | Update_token_metadata p -> ([]: operation list), update_token_metadata (p, storage)
            | Pause -> ([]: operation list), pause storage