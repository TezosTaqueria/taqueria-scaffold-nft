#include "main.mligo"

let init_storage: storage = { 
    ledger          = (Big_map.empty: ledger);
    operators       = (Big_map.empty: (operator, unit) big_map);
    metadata        = (Big_map.empty: (string, bytes) big_map);
    token_metadata  = (Big_map.empty: (token_id, token_metadata) big_map);
    total_supply    = 0n;
    admin           = ("tz1KqTpEZ7Yob7QbPE4Hy4Wo8fHG8LhKxZSx" : address);
    paused          = false;
}