export const createProvisioner = <TInputState>({
    getInputState,
    addProvisionTaskOutputToState,
}: {
    getInputState: () => Promise<TInputState>,
    addProvisionTaskOutputToState: (provisionName: string, provisionOutput: unknown) => Promise<void>,
}) => {

    type ProvisionDefinition = {
        name: string;
        after?: string[];
        task?: (state: TInputState) => Promise<unknown>;
        when?: (state: TInputState) => Promise<boolean>;

        _order?: string;
        _defaultOrder?: string;
        _isActive?: boolean;
        _afterProvisions?: ProvisionDefinition[];
    };
    const provisions = [] as ProvisionDefinition[];

    const provision = (name: string) => {

        const def = { name } as ProvisionDefinition;
        provisions.push(def);

        const task = (taskCallback: (state: TInputState) => Promise<unknown[] | null | undefined>) => {
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
            p._afterProvisions = [];
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

            p._afterProvisions = p.after
                ?.map(x => pMap.get(x)!);

            const parentOrders = p._afterProvisions
                ?.map(x => getOrder(x))
                .filter(x => x)
                .sort()
                .reverse() ?? [];

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

        for (const p of provisions) {
            const depsRan = !p._afterProvisions?.length || p._afterProvisions.some(p2 => p2._isActive);
            p._isActive = depsRan && (await p.when?.(inputState) ?? true);
        }

        // : ${p._order}
        const report = provisions
            .map(p => `${p._isActive ? '▶' : '🆗'} ${p.name.padEnd(32, ' ')}`)
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

            const depsRan = !p._afterProvisions?.length || p._afterProvisions.some(p2 => p2._isActive);
            const isActive = depsRan && (await p.when?.(inputState) ?? true);
            if (!isActive) {
                console.log(`🆗 skip '${p.name}'`);
                continue;
            }

            p._isActive = isActive;

            console.log(`▶ run '${p.name}'`);

            const pOutput = await p.task?.(inputState);

            // Save provision output
            await addProvisionTaskOutputToState(p.name, pOutput);
        }
    };

    return {
        provision,
        apply,
        plan,
        getState: () => getInputState(),
    };
};

