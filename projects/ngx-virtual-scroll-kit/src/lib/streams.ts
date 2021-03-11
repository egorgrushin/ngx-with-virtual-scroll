import { distinctUntilChanged, map, shareReplay, startWith, switchMap } from 'rxjs/operators';
import {
    buildDefaultScrollToFn,
    buildFrame,
    buildKeys,
    buildMeasurements,
    buildRange,
    buildRecalcSizeFnFactoryForItem,
    buildVirtualItems,
    isBoundariesEqual,
} from './utils';
import { BehaviorSubject, combineLatest, fromEvent, Observable } from 'rxjs';
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
import observeRect from '@reach/observe-rect';

export const buildElementRectObserver$ = (
    elementRef$: Observable<HTMLElement>,
): Observable<DOMRect> => elementRef$.pipe(
    switchMap((elementRef) => new Observable<DOMRect>((observer) => {
        const rectObserver = observeRect(elementRef, (rect) => observer.next(rect));
        rectObserver.observe();
        return () => rectObserver.unobserve();
    }).pipe(
        startWith(elementRef.getBoundingClientRect()),
    )),
);

export const buildKeys$ = (horizontal$: Observable<boolean>) => horizontal$.pipe(
    map((horizontal) => buildKeys(horizontal)),
    distinctUntilChanged(),
);

export const buildMeasurements$ = (
    count$: Observable<number>,
    estimateSizeFn$: Observable<VirtualEstimateSizeFn | undefined>,
    measuredCache$: Observable<VirtualMeasuredCache>,
): Observable<VirtualMeasurement[]> => combineLatest([count$, estimateSizeFn$, measuredCache$]).pipe(
    map(([count, estimateSizeFn, measuredCache]) => buildMeasurements(count, estimateSizeFn, measuredCache)),
    distinctUntilChanged(),
);

export const buildDefaultScrollToFn$ = (
    viewportRef$: Observable<HTMLElement>,
    keys$: Observable<VirtualKeys>,
): Observable<VirtualScrollToFn> => combineLatest([
    viewportRef$,
    keys$,
]).pipe(
    map(([viewportRef, keys]) => buildDefaultScrollToFn(viewportRef, keys)),
    distinctUntilChanged(),
);

export const buildScrollOffset$ = (
    viewportRef$: Observable<HTMLElement>,
    keys$: Observable<VirtualKeys>,
    count$: Observable<number>,
    viewportRect$: Observable<DOMRect>,
): Observable<number> => combineLatest([viewportRef$, keys$, count$, viewportRect$]).pipe(
    switchMap(([viewportRef, keys, count, viewportRect]) => {
        // @ts-ignore
        const initialScrollOffset = viewportRef[keys.scrollKey] as number;
        return fromEvent(viewportRef, 'scroll', { passive: true }).pipe(
            // @ts-ignore
            map(() => viewportRef[keys.scrollKey] as number),
            /**
             * imitate initial scroll event
             */
            startWith(initialScrollOffset),
        );
    }),
    distinctUntilChanged(),
    shareReplay(),
);

export const buildTotalSize$ = (
    measurements$: Observable<VirtualMeasurement[]>,
): Observable<number> => measurements$.pipe(
    map((measurements) => measurements[measurements.length - 1]?.end || 0),
    distinctUntilChanged(),
);

export const buildFrame$ = (
    viewportRef$: Observable<HTMLElement>,
    scrollOffset$: Observable<number>,
    keys$: Observable<VirtualKeys>,
    totalSize$: Observable<number>,
    containerRef$: Observable<HTMLElement | undefined>,
): Observable<VirtualBoundaries> => combineLatest([
    viewportRef$,
    scrollOffset$,
    keys$,
    totalSize$,
    containerRef$,
]).pipe(
    map(([viewportRef, scrollOffset, keys, totalSize, containerRef]) => buildFrame(
        viewportRef,
        keys,
        scrollOffset,
        totalSize,
        containerRef,
    )),
    distinctUntilChanged(isBoundariesEqual),
);

export const buildRange$ = (
    measurements$: Observable<VirtualMeasurement[]>,
    frame$: Observable<VirtualBoundaries>,
    bufferLength$: BehaviorSubject<number>,
) => combineLatest([measurements$, frame$, bufferLength$]).pipe(
    map(([measurements, frame, bufferLength]) => buildRange(measurements, frame, bufferLength)),
    distinctUntilChanged(isBoundariesEqual),
);

export const buildRecalcSizeFactory$ = (
    keys$: Observable<VirtualKeys>,
    defaultScrollToFn$: Observable<VirtualScrollToFn>,
    scrollOffset$: Observable<number>,
    measuredCache$: BehaviorSubject<VirtualMeasuredCache>,
): Observable<VirtualRecalcSizeFnFactory> => combineLatest([
    keys$,
    defaultScrollToFn$,
    scrollOffset$,
]).pipe(
    map(([keys, defaultScrollToFn, scrollOffset]) => buildRecalcSizeFnFactoryForItem(
        keys,
        defaultScrollToFn,
        scrollOffset,
        measuredCache$,
    )),
    distinctUntilChanged(),
);

export const buildVirtualItems$ = (
    range$: Observable<VirtualBoundaries>,
    measurements$: Observable<VirtualMeasurement[]>,
    recalcSizeFactory$: Observable<VirtualRecalcSizeFnFactory>,
): Observable<VirtualItem[]> => combineLatest([
    range$,
    measurements$,
    recalcSizeFactory$,
]).pipe(
    map(([range, measurements, recalcSizeFactory]) => buildVirtualItems(range, measurements, recalcSizeFactory)),
    distinctUntilChanged(),
);
