import { SIZE } from './constants';

export const generateItems = (
    count: number,
    label: string,
    size: number = SIZE,
) => [...Array(count)].map((i, index) => ({
    id: index,
    name: `${label} ${index}`,
    size,
}));
