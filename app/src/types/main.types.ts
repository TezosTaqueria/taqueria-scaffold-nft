
import { ContractAbstractionFromContractType, WalletContractAbstractionFromContractType } from './type-utils';
import { address, BigMap, bytes, contract, MMap, nat, unit } from './type-aliases';

type Storage = {
    admin: address;
    ledger: BigMap<{
        0: address;
        1: nat;
    }, nat>;
    metadata: BigMap<string, bytes>;
    operators: BigMap<{
        owner: address;
        operator: address;
        token_id: nat;
    }, unit>;
    token_metadata: BigMap<nat, {
        token_id: nat;
        token_info: MMap<string, bytes>;
    }>;
    total_supply: nat;
};

type Methods = {
    balance_of: (
        requests: Array<{
            owner: address;
            token_id: nat;
        }>,
        callback: contract,
    ) => Promise<void>;
    mint: (param: Array<{
            token_id: nat;
            ipfs_hash: bytes;
            owner: address;
        }>) => Promise<void>;
    transfer: (param: Array<{
            from_: address;
            txs: Array<{
                to_: address;
                token_id: nat;
                amount: nat;
            }>;
        }>) => Promise<void>;
    update_admin: (param: address) => Promise<void>;
    update_metadata: (param: bytes) => Promise<void>;
    add_operator: (
        owner: address,
        operator: address,
        token_id: nat,
    ) => Promise<void>;
    remove_operator: (
        owner: address,
        operator: address,
        token_id: nat,
    ) => Promise<void>;
    update_token_metadata: (
        _0: nat,
        _1: bytes,
    ) => Promise<void>;
};

type MethodsObject = {
    balance_of: (params: {
        requests: Array<{
            owner: address;
            token_id: nat;
        }>,
        callback: contract,
    }) => Promise<void>;
    mint: (param: Array<{
            token_id: nat;
            ipfs_hash: bytes;
            owner: address;
        }>) => Promise<void>;
    transfer: (param: Array<{
            from_: address;
            txs: Array<{
                to_: address;
                token_id: nat;
                amount: nat;
            }>;
        }>) => Promise<void>;
    update_admin: (param: address) => Promise<void>;
    update_metadata: (param: bytes) => Promise<void>;
    add_operator: (params: {
        owner: address,
        operator: address,
        token_id: nat,
    }) => Promise<void>;
    remove_operator: (params: {
        owner: address,
        operator: address,
        token_id: nat,
    }) => Promise<void>;
    update_token_metadata: (params: {
        0: nat,
        1: bytes,
    }) => Promise<void>;
};

type contractTypes = { methods: Methods, methodsObject: MethodsObject, storage: Storage, code: { __type: 'MainCode', protocol: string, code: object[] } };
export type MainContractType = ContractAbstractionFromContractType<contractTypes>;
export type MainWalletType = WalletContractAbstractionFromContractType<contractTypes>;
