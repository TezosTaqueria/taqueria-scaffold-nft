let update_operators (operators_list, s: (update_operators_param list) * storage): storage =
    let sender = Tezos.get_sender () in 
    List.fold
        (
            fun ((s, operator_param): storage * update_operators_param) ->
                match operator_param with
                | Add_operator p ->
                    if sender <> p.owner
                    then (failwith "FA2_NOT_OWNER": storage)
                    else
                        { s with operators = Big_map.add p unit s.operators }
                | Remove_operator p ->
                    if sender <> p.owner
                    then (failwith "FA2_NOT_OWNER": storage)
                    else
                        { s with operators = Big_map.remove p s.operators }
        )
        operators_list
        s