import { defaultEstimateSize } from './constants';

export const generateItems = (
    count: number,
    label: string,
    sizeFn: () => number = defaultEstimateSize,
) => [...Array(count)].map((i, index) => ({
    id: index,
    name: `${label} ${index}`,
    size: sizeFn(),
}));
