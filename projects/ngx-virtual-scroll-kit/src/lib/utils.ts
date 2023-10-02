import {
    VirtualBoundaries,
    VirtualEstimateSizeFn,
    VirtualItem,
    VirtualKeys,
    VirtualMeasuredCache,
    VirtualMeasurement,
    VirtualRecalcSizeFnFactory,
    VirtualScrollToFn,
} from './types';
import { defaultEstimateSizeFn } from './constants';
import { BehaviorSubject } from 'rxjs';
import memoizeOne from 'memoize-one';

export const buildKeys = memoizeOne((horizontal: boolean): VirtualKeys => ({
    sizeKey: horizontal ? 'width' : 'height',
    scrollKey: horizontal ? 'scrollLeft' : 'scrollTop',
    positionKey: horizontal ? 'left' : 'top',
}));

export const buildMeasurements = memoizeOne((
    count: number = 0,
    estimateSizeFn: VirtualEstimateSizeFn = defaultEstimateSizeFn,
    measuredCache: VirtualMeasuredCache,
): VirtualMeasurement[] => {
    const measurements: VirtualMeasurement[] = [];
    for (let i = 0; i < count; i++) {
        const measuredSize = measuredCache[i];
        const start = measurements[i - 1] ? measurements[i - 1].end : 0;
        const size = typeof measuredSize === 'number' ? measuredSize : estimateSizeFn(i);
        const end = start + size;
        measurements[i] = { index: i, start, size, end };
    }
    return measurements;
});

export const buildVirtualItems = memoizeOne((
    range: VirtualBoundaries,
    measurements: VirtualMeasurement[],
    recalcSizeFactory: VirtualRecalcSizeFnFactory,
): VirtualItem[] => {
    const virtualItems: VirtualItem[] = [];
    const end = Math.min(range.end, measurements.length - 1);

    for (let i = range.start; i <= end; i++) {
        const measurement = measurements[i];

        const item: VirtualItem = {
            ...measurement,
            recalcSize: (el) => recalcSizeFactory(item)(el),
        };

        virtualItems.push(item);
    }

    return virtualItems;
});

/**
 * it builds boundaries in pixels
 */
export const buildFrame = memoizeOne((
    viewportRef: HTMLElement,
    keys: VirtualKeys,
    scrollOffset: number,
    totalSize: number,
    containerRef?: HTMLElement,
): VirtualBoundaries => {
    const viewportRect = viewportRef.getBoundingClientRect();
    // @ts-ignore
    const viewportOuterSize: number = viewportRect[keys.sizeKey];
    // @ts-ignore
    const viewportOffset = viewportRect[keys.positionKey];
    let startOffset = scrollOffset;

    if (containerRef) {
        const containerRect = containerRef.getBoundingClientRect();
        // @ts-ignore
        const containerOffset = containerRect?.[keys.positionKey] ?? 0;
        startOffset = viewportOffset - containerOffset;
    }

    const endOffset = scrollOffset + viewportOuterSize;

    const minStart = Math.max(startOffset, 0);
    const maxEnd = Math.min(endOffset, totalSize);

    const maxFrame = maxEnd - minStart;

    const frame = Math.min(viewportOuterSize, maxFrame);

    const start = minStart;
    const end = start + frame;

    return { start, end };
});

export const buildDefaultScrollToFn = memoizeOne((
    viewportRef: HTMLElement,
    keys: VirtualKeys,
): VirtualScrollToFn => (offset: number) => {
    // @ts-ignore
    viewportRef[keys.scrollKey] = offset;
});

/**
 * it builds boundaries in indexes
 */
export const buildRange = memoizeOne((
    measurements: VirtualMeasurement[],
    frame: VirtualBoundaries,
    bufferLength: number,
): VirtualBoundaries => {
    const total = measurements.length;
    let start = total - 1;
    while (start > 0 && measurements[start].end >= frame.start) {
        start -= 1;
    }
    let end = 0;
    while (end < total - 1 && measurements[end].start <= frame.end) {
        end += 1;
    }
    start = Math.max(start - bufferLength, 0);
    end = Math.min(end + bufferLength, total - 1);
    return { start, end };
});

export const buildRecalcSizeFnFactoryForItem = memoizeOne((
    keys: VirtualKeys,
    defaultScrollToFn: VirtualScrollToFn,
    scrollOffset: number,
    measuredCache$: BehaviorSubject<VirtualMeasuredCache>,
): VirtualRecalcSizeFnFactory => (item: VirtualItem) => (el: HTMLElement) => {
    if (!el) return;
    // @ts-ignore
    const { [keys.sizeKey]: measuredSize } = el.getBoundingClientRect();
    if (measuredSize !== item.size) {
        if (item.start < scrollOffset) {
            defaultScrollToFn(scrollOffset + (measuredSize - item.size));
        }
        const old = measuredCache$.getValue();
        measuredCache$.next({ ...old, [item.index]: measuredSize });
    }
});

export const isBoundariesEqual = (
    boundary1: VirtualBoundaries | undefined,
    boundary2: VirtualBoundaries,
): boolean => boundary1?.start === boundary2.start && boundary1.end !== boundary2.end;
