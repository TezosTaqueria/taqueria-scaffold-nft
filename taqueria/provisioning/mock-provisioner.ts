export const createProvisioner = <TInputState>(getInputState: () => Promise<TInputState>) => {

    type ProvisionDefinition = {
        name: string;
        after?: string[];
        task?: (state: TInputState) => Promise<unknown>;
        when?: (state: TInputState) => Promise<boolean>;

        _order?: string;
        _defaultOrder?: string;
        _isActive?: boolean;
    };
    const provisions = [] as ProvisionDefinition[];

    const provision = (name: string) => {

        const def = { name } as ProvisionDefinition;
        provisions.push(def);

        const task = (taskCallback: (state: TInputState) => Promise<unknown>) => {
            def.task = taskCallback;
            return {
                name,
                after,
                when,
            };
        };
        const when = (whenCallback: (state: TInputState) => Promise<boolean>) => {
            def.when = whenCallback;
            return {
                name,
                after
            };
        };
        const after = (dependencies: { name: string }[]) => {
            def.after = dependencies.map(x => x.name);
            return {
                name,
            };
        };
        return { task };
    };

    const sortProvisions = () => {
        // Sort by `after`
        provisions.forEach((p, i) => {
            p._defaultOrder = i.toString().padStart(6, '0');
        });
        const pMap = new Map(provisions.map(p => [p.name, p]));
        const visited = new Set([] as string[]);
        const getOrder = (p: undefined | ProvisionDefinition) => {
            if (!p) { return ''; }
            if (p._order) { return p._order; }
            if (visited.has(p.name)) {
                console.error('Circular reference detected');
                return (p._defaultOrder ?? 0).toString().padStart(6, '0');
            }

            const parentOrders = p.after
                ?.map(x => getOrder(pMap.get(x)))
                .filter(x => x)
                .sort() ?? [];

            p._order = `${parentOrders.map(x => `${x}:`).join('')}${p._defaultOrder}`;
            return p._defaultOrder;
        };

        provisions.forEach((p, i) => {
            getOrder(p);
        });

        provisions.sort((a, b) => (a._order ?? '').localeCompare(b._order ?? ''));
    };

    const plan = async () => {
        sortProvisions();

        const inputState = await getInputState();
        await Promise.all(provisions.map(async x => {
            x._isActive = await x.when?.(inputState) ?? true;
        }));

        const report = provisions
            .map(p => `${p._isActive ? '🟢' : '⚪'} ${p.name.padEnd(32, ' ')} : ${p._order}`)
            .join('\n');
        console.log(report);
        return {
            report,
            provisions,
        };
    };

    const apply = async () => {
        sortProvisions();

        for (const p of provisions) {
            const inputState = await getInputState();
            const isActive = await p.when?.(inputState) ?? true;
            if (!isActive) {
                console.log(`⚪ skip '${p.name}'`);
                continue;
            }

            console.log(`🟢 run '${p.name}'`);

            await p.task?.(inputState);
        }
    };

    return {
        provision,
        apply,
        plan,
    };
};

