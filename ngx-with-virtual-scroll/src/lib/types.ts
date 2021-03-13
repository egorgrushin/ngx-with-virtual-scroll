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
    measureSize: VirtualMeasureElementSizeFn;
}

export interface VirtualBoundaries {
    start: number;
    end: number;
}

export type VirtualEstimateSizeFn = (index: number) => number;
export type VirtualScrollToFn = (offset: number) => void;
export type VirtualCustomScrollToFn = (offset: number, defaultScrollToFn: VirtualScrollToFn) => void;
export type VirtualMeasureElementSizeFn = (el: HTMLElement) => void;
export type VirtualMeasureItemSizeFn = (item: VirtualItem) => VirtualMeasureElementSizeFn;
export type VirtualMeasureSizeFnFactory = (
    defaultScrollFn: VirtualScrollToFn,
    keys: VirtualKeys,
) => VirtualMeasureItemSizeFn;

export interface VirtualKeys {
    sizeKey: string;
    scrollKey: string
    positionKey: string
}

export type VirtualMeasuredCache = Record<string, number>;

export enum VirtualScrollToAlign {
    Auto = 'auto',
    Start = 'start',
    Center = 'center',
    End = 'end',
}
