import {
    VirtualBoundaries,
    VirtualCustomScrollToFn,
    VirtualEstimateSizeFn,
    VirtualItem,
    VirtualKeys,
    VirtualMeasuredCache,
    VirtualMeasureItemSizeFn,
    VirtualMeasurement,
    VirtualMeasureSizeFnFactory,
    VirtualScrollToFn,
} from './types';
import { defaultEstimateSizeFn } from './constants';
import observeRect from '@reach/observe-rect';
import { startWith, switchMap } from 'rxjs/operators';
import { Observable, of } from 'rxjs';

export const buildKeys = (horizontal: boolean): VirtualKeys => ({
    sizeKey: horizontal ? 'width' : 'height',
    scrollKey: horizontal ? 'scrollLeft' : 'scrollTop',
    positionKey: horizontal ? 'left' : 'top',
});

export const buildTotalSize = (
    measurements: VirtualMeasurement[],
) => measurements[measurements.length - 1]?.end || 0;

export const buildMeasurements = (
    count: number = 0,
    measuredCache: VirtualMeasuredCache,
    useFirstMeasuredSize: boolean,
    estimateSizeFn: VirtualEstimateSizeFn = defaultEstimateSizeFn,
): VirtualMeasurement[] => {
    const measurements: VirtualMeasurement[] = [];
    let forcedSize;
    if (useFirstMeasuredSize) {
        const sizes = Object.values(measuredCache);
        if (sizes.length > 0) {
            forcedSize = sizes[0];
        }
    }
    for (let i = 0; i < count; i++) {
        const measuredSize = forcedSize ?? measuredCache[i];
        const start = measurements[i - 1] ? measurements[i - 1].end : 0;
        const size = typeof measuredSize === 'number' ? measuredSize : estimateSizeFn(i);
        const end = start + size;
        measurements[i] = { index: i, start, size, end };
    }
    return measurements;
};

export const buildMeasureItemSizeFactory = (
    keys: VirtualKeys,
    defaultToScroll: VirtualScrollToFn,
    measureSizeFactory: VirtualMeasureSizeFnFactory,
): VirtualMeasureItemSizeFn => measureSizeFactory(defaultToScroll, keys);

export const buildVirtualItems = (
    range: VirtualBoundaries,
    measurements: VirtualMeasurement[],
    measureItemSizeFactory: VirtualMeasureItemSizeFn,
): VirtualItem[] => {
    const virtualItems: VirtualItem[] = [];
    const end = Math.min(range.end, measurements.length - 1);

    for (let i = range.start; i <= end; i++) {
        const measurement = measurements[i];

        const item: VirtualItem = {
            ...measurement,
            measureSize: (el) => measureItemSizeFactory(item)(el),
        };

        virtualItems.push(item);
    }
    return virtualItems;
};

/**
 * it builds boundaries in pixels
 */
export const buildFrame = (
    viewportRect: DOMRect,
    keys: VirtualKeys,
    scrollOffset: number,
    totalSize: number,
    containerRef?: HTMLElement,
): VirtualBoundaries => {
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
};

export const buildDefaultScrollToFn = (
    viewportRef: HTMLElement,
    keys: VirtualKeys,
): VirtualScrollToFn => (offset: number) => {
    // @ts-ignore
    viewportRef[keys.scrollKey] = offset;
};

/**
 * it builds boundaries in indexes
 */
export const buildRange = (
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
};

export const isBoundariesEqual = (
    boundary1: VirtualBoundaries | undefined,
    boundary2: VirtualBoundaries,
): boolean => boundary1?.start === boundary2.start && boundary1.end === boundary2.end;

export const buildResolvedScrollToFn = (
    viewportRef: HTMLElement,
    defaultScrollToFn: VirtualScrollToFn,
    scrollToFn?: VirtualCustomScrollToFn,
): VirtualScrollToFn => {
    const resolvedScrollToFn = scrollToFn ?? defaultScrollToFn;
    return (offset: number) => resolvedScrollToFn(offset, viewportRef, defaultScrollToFn);
};

export const buildElementRectObserver$ = (
    elementRef$: Observable<HTMLElement | undefined>,
): Observable<DOMRect | undefined> => elementRef$.pipe(
    switchMap((elementRef) => {
        if (!elementRef) return of(undefined);
        return new Observable<DOMRect>((observer) => {
            const rectObserver = observeRect(elementRef, (rect) => observer.next(rect));
            rectObserver.observe();
            return () => rectObserver.unobserve();
        }).pipe(
            startWith(elementRef.getBoundingClientRect()),
        );
    }),
);
