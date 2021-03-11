export interface VirtualMeasurement {
    /**
     * index relative to whole collection. Can be used for getting item from collection
     */
    index: number;
    /**
     * pixels to this item relative to container's top
     */
    start: number;
    /**
     * the size of element in pixels
     */
    size: number;
    /**
     * offsetTop + size
     */
    end: number;
}

export interface VirtualItem extends VirtualMeasurement {
    recalcSize: VirtualRecalcSizeFn;
}

export interface VirtualBoundaries {
    start: number;
    end: number;
}

export type VirtualEstimateSizeFn = (index: number) => number;
export type VirtualScrollToFn = (offset: number) => void;
export type VirtualRecalcSizeFn = (el: HTMLElement) => void;
export type VirtualRecalcSizeFnFactory = (item: VirtualItem) => (el: HTMLElement) => void;

export interface VirtualKeys {
    sizeKey: string;
    scrollKey: string
    positionKey: string
}

export type VirtualMeasuredCache = Record<string, number>;
