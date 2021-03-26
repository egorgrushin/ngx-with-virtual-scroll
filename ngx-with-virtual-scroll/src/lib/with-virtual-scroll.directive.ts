import { ChangeDetectorRef, Directive, Input, NgZone, SimpleChanges } from '@angular/core';
import {
    VirtualBoundaries,
    VirtualCustomScrollToFn,
    VirtualEstimateSizeFn,
    VirtualItem,
    VirtualKeys,
    VirtualMeasuredCache,
    VirtualMeasureItemSizeFn,
    VirtualMeasurement,
    VirtualScrollToAlign,
    VirtualScrollToFn,
} from './types';
import { animationFrameScheduler, BehaviorSubject, fromEvent, Observable, Subject } from 'rxjs';
import { auditTime, distinctUntilChanged, filter, map, startWith, switchMap, takeUntil } from 'rxjs/operators';
import {
    buildDefaultScrollToFn,
    buildElementRectObserver$,
    buildFrame,
    buildKeys,
    buildMeasureItemSizeFactory,
    buildMeasurements,
    buildRange,
    buildResolvedScrollToFn,
    buildTotalSize,
    buildVirtualItems,
    isBoundariesEqual,
} from './utils';

@Directive({
    selector: '[with-virtual-scroll]',
    exportAs: 'with-virtual-scroll',
})
export class WithVirtualScrollDirective {
    /**
     * @Input() items ref
     */
    @Input() items?: unknown[];
    /**
     * @Input() the reference to viewport element ref. Its height / width will be used as items limiter
     */
    @Input() viewportRef?: HTMLElement;
    /**
     * @Input() whether horizontal or vertical scrolling is set
     * default: false
     */
    @Input() horizontal: boolean = false;
    /**
     * @Input() count of additional items before and after virtualItems.
     * It is recommended to add at least one bufferLength item, so focus will work
     * default: 0
     */
    @Input() bufferLength: number = 0;
    /**
     * @Input() the reference to container element ref. This container should contain visible items,
     * but its height / width must be set using totalSize property.
     * This input is optional if viewportRef contains only containerRef, otherwise it must be set.
     */
    @Input() containerRef?: HTMLElement;
    /**
     * @Input() this fn is used for calculating size of item during initial measuring.
     * The value it returns will be overridden by [measure-size-for] directive if it is set
     * default () => 50
     */
    @Input() estimateSize?: VirtualEstimateSizeFn;
    /**
     * @Input() whether to use first measured size by [measure-size-for] directive as a size for all items.
     * It is useful when all of your items have the same size but you don't want to set it using estimateSize input.
     * default: true
     */
    @Input() useFirstMeasuredSize: boolean = true;
    /**
     * @Input() passing this function allows you to override default scrolling behavior.
     * Default scrolling behavior: setting scrollTop / scrollLeft
     */
    @Input() scrollToFn?: VirtualCustomScrollToFn;
    /**
     * this property must be used as height / width setter for containerRef
     */
    totalSize: number = 0;
    /**
     * this property will contain virtual items to render
     */
    virtualItems: VirtualItem[] = [];
    /**
     * current scroll offset
     */
    scrollOffset: number = 0;
    /**
     * current measurements
     */
    measurements: VirtualMeasurement[] = [];
    /**
     * current range in indexes
     */
    range: VirtualBoundaries = { start: 0, end: 0 };

    private viewportRefSubj$ = new BehaviorSubject<HTMLElement | undefined>(undefined);
    private viewportRef$ = this.viewportRefSubj$.pipe(
        filter((viewportRef) => !!viewportRef),
    ) as Observable<HTMLElement>;
    private destroy$ = new Subject<void>();
    private virtualItems$ = new BehaviorSubject<VirtualItem[]>([]);
    private measuredCache: VirtualMeasuredCache = {};
    private totalSize$ = new BehaviorSubject<number>(0);
    private keys: VirtualKeys = buildKeys(this.horizontal);
    private measureSizeFactoryBound = this.measureSizeFactory.bind(this);
    private resolvedScrollToFn?: VirtualScrollToFn;
    private viewportRect?: DOMRect;
    private viewportSize: number = 0;
    private markedCacheDirty: boolean = true;

    constructor(
        private ngZone: NgZone,
        private cdr: ChangeDetectorRef,
    ) {}

    ngOnChanges(changes: SimpleChanges) {
        if ('viewportRef' in changes) {
            this.viewportRefSubj$.next(this.viewportRef);
        }
        if ('items' in changes || 'estimateSize' in changes) {
            this.markedCacheDirty = true;
        }
        this.recalc();
    }

    ngOnInit() {
        this.subscribeToStreams();
    }

    ngOnDestroy() {
        this.destroy$.next();
        this.destroy$.complete();
    }

    /**
     * this allows you to scroll to offset.
     * @param [offset] to scroll
     * @param [align]:
     *  start - offset will be at start of visible viewport area
     *  end - offset will be at end of visible viewport area
     *  center - offset will be at center of visible viewport area
     *  auto - it will try to find closer align for offset.
     *  It will be end if current scroll position is more then offset + viewport size,
     *  otherwise it will be start
     *
     */
    scrollToOffset(offset: number, align = VirtualScrollToAlign.Start) {
        align = this.normalizeAlign(offset, align);

        let offsetToScroll = offset;
        if (align === VirtualScrollToAlign.End) {
            offsetToScroll = offset - this.viewportSize;
        }
        if (align === VirtualScrollToAlign.Center) {
            offsetToScroll = offset - this.viewportSize / 2;
        }
        this.resolvedScrollToFn?.(offsetToScroll);
    }

    /**
     * this allows you to scroll to specified index.
     * @param [index] to scroll
     * @param [align]:
     *  start - top of the item will be at the top of visible viewport area
     *  end - bottom of the item will be at the top of visible viewport area
     *  center - center of the item will be at the top of visible viewport area
     *  auto - it will try to find closer align for item.
     *  It will be end if item's end at index position is more then offset + viewport size,
     *  otherwise it will be start
     */
    scrollToIndex(index: number, align = VirtualScrollToAlign.Start) {
        const mappedIndex = Math.max(0, Math.min(index, (this.items?.length ?? 0) - 1));
        const measurement = this.measurements[mappedIndex];
        if (!measurement) return;

        align = this.normalizeAlign(measurement.end, align);
        let toOffset = measurement.start;
        if (align == VirtualScrollToAlign.Center) {
            toOffset = measurement.start + measurement.size / 2;
        }
        if (align === VirtualScrollToAlign.End) {
            toOffset = measurement.end;
        }
        this.scrollToOffset(toOffset, align);
    }

    private recalc() {
        if (!this.viewportRef || !this.viewportRect) return;
        this.keys = buildKeys(this.horizontal);
        // @ts-ignore
        this.viewportSize = this.viewportRect[this.keys.sizeKey];
        this.measurements = buildMeasurements(
            this.items?.length,
            this.measuredCache,
            this.useFirstMeasuredSize,
            this.estimateSize,
        );
        const totalSize = buildTotalSize(this.measurements);
        const frame = buildFrame(this.viewportRect, this.keys, this.scrollOffset, totalSize, this.containerRef);
        const range = buildRange(this.measurements, frame, this.bufferLength);
        if (!isBoundariesEqual(this.range, range)) {
            this.range = range;
        }
        const defaultScrollToFn = buildDefaultScrollToFn(this.viewportRef, this.keys);
        this.resolvedScrollToFn = buildResolvedScrollToFn(this.viewportRef, defaultScrollToFn, this.scrollToFn);

        const measureItemSizeFactory = buildMeasureItemSizeFactory(
            this.keys,
            defaultScrollToFn,
            this.measureSizeFactoryBound,
        );
        const virtualItems = buildVirtualItems(this.range, this.measurements, measureItemSizeFactory);
        /**
         * this is entry point for possible change detection.
         * Since it is guarded with distinctUntilChanged it is safety to push the same values each time
         */
        this.virtualItems$.next(virtualItems);
        this.totalSize$.next(totalSize);
    }

    private subscribeToStreams() {
        this.ngZone.runOutsideAngular(() => {
            buildElementRectObserver$(this.viewportRef$).pipe(
                takeUntil(this.destroy$),
            ).subscribe((viewportRect) => {
                this.viewportRect = viewportRect;
                this.recalc();
            });

            this.viewportRef$.pipe(
                switchMap((viewportRef) => fromEvent(viewportRef, 'scroll', { passive: true, capture: false }).pipe(
                    startWith(undefined),
                    auditTime(0, animationFrameScheduler),
                    // @ts-ignore
                    map(() => viewportRef[this.keys.scrollKey]),
                )),
                takeUntil(this.destroy$),
            ).subscribe((scrollOffset) => {
                this.scrollOffset = scrollOffset;
                this.recalc();
            });

            this.virtualItems$.pipe(
                distinctUntilChanged(),
                takeUntil(this.destroy$),
            ).subscribe((virtualItems) => this.ngZone.run(() => {
                this.virtualItems = virtualItems;
                this.cdr.markForCheck();
            }));

            this.totalSize$.pipe(
                distinctUntilChanged(),
                takeUntil(this.destroy$),
            ).subscribe((totalSize) => this.ngZone.run(() => {
                this.totalSize = totalSize;
                this.cdr.markForCheck();
            }));
        });
    }

    measureSizeFactory(
        defaultScrollToFn: VirtualScrollToFn,
        keys: VirtualKeys,
    ): VirtualMeasureItemSizeFn {
        return (item: VirtualItem) => (el: HTMLElement) => {
            if (!el) return;
            if (this.useFirstMeasuredSize) {
                const measuredSizes = Object.values(this.measuredCache);
                const firstMeasuredSize = measuredSizes[0];
                if (this.markedCacheDirty || !firstMeasuredSize) {
                    this.recheckSizeAndRecalc(item, keys, el, firstMeasuredSize);
                    this.markedCacheDirty = false;
                }
                return;
            }
            this.recheckSizeAndRecalc(item, keys, el, item.size);
        };
    }

    private recheckSizeAndRecalc(
        item: VirtualItem,
        keys: VirtualKeys,
        el: HTMLElement,
        size?: number,
    ) {
        // @ts-ignore
        const { [keys.sizeKey]: measuredSize } = el.getBoundingClientRect();
        if (size !== measuredSize) {
            const old = this.useFirstMeasuredSize ? {} : this.measuredCache;
            this.measuredCache = { ...old, [item.index]: measuredSize };
            this.recalc();
        }
    }

    private normalizeAlign(end: number, align: VirtualScrollToAlign): VirtualScrollToAlign {
        if (align === VirtualScrollToAlign.Auto) {
            align = VirtualScrollToAlign.Start;
            if (end >= this.scrollOffset + this.viewportSize) {
                align = VirtualScrollToAlign.End;
            }
        }
        return align;
    }
}
