import { Directive, Input, NgZone, SimpleChanges } from '@angular/core';
import {
    VirtualEstimateSizeFn,
    VirtualItem,
    VirtualMeasuredCache,
    VirtualMeasurement,
    VirtualScrollToFn,
} from './types';
import { asapScheduler, BehaviorSubject, merge, Observable, Subject } from 'rxjs';
import { filter, observeOn, takeUntil } from 'rxjs/operators';
import {
    buildDefaultScrollToFn$,
    buildElementRectObserver$,
    buildFrame$,
    buildKeys$,
    buildMeasurements$,
    buildRange$,
    buildRecalcSizeFactory$,
    buildScrollOffset$,
    buildTotalSize$,
    buildVirtualItems$,
} from './streams';

@Directive({
    selector: '[with-virtual-scroll]',
    exportAs: 'with-virtual-scroll',
})
export class WithVirtualScrollDirective {
    /**
     * the total count of items to render
     */
    @Input() count: number = 0;
    /**
     * the reference to viewport element ref. Its height / width will be used as items limiter
     */
    @Input() viewportRef?: HTMLElement;
    /**
     * whether horizontal or vertical scrolling is set
     */
    @Input() horizontal: boolean = false;
    /**
     * count of additional items before and after virtualItems.
     * It is recommended to add at least one bufferLength item, so focus will work
     */
    @Input() bufferLength: number = 0;
    /**
     * the reference to container element ref. This container should contain visible items,
     * but its height / width must be set using totalSize property.
     * This input is optional if viewportRef contains only containerRef
     */
    @Input() containerRef?: HTMLElement;
    /**
     * this fn is used for calculating size of item during initial measuring
     */
    @Input() estimateSize?: VirtualEstimateSizeFn;

    /**
     * this property must be used as height / width setter for containerRef
     */
    totalSize: number = 0;
    /**
     * this property will contain virtual items to render
     */
    virtualItems: VirtualItem[] = [];
    /**
     * this function can be used for scrolling to offset
     */
    scrollToFn?: VirtualScrollToFn;
    /**
     * input subjects
     */
    private count$ = new BehaviorSubject<number>(this.count);
    private horizontal$ = new BehaviorSubject<boolean>(this.horizontal);
    private estimateSizeFn$ = new BehaviorSubject<VirtualEstimateSizeFn | undefined>(undefined);
    private viewportRefSubj$ = new BehaviorSubject<HTMLElement | undefined>(undefined);
    private viewportRef$ = this.viewportRefSubj$.pipe(
        filter((viewportRef) => !!viewportRef),
    ) as Observable<HTMLElement>;
    private containerRef$ = new BehaviorSubject<HTMLElement | undefined>(undefined);
    private bufferLength$ = new BehaviorSubject<number>(this.bufferLength);

    private destroy$ = new Subject<void>();
    private virtualItems$?: Observable<VirtualItem[]>;
    private measuredCache$ = new BehaviorSubject<VirtualMeasuredCache>({});
    private totalSize$?: Observable<number>;
    private defaultScrollToFn$?: Observable<VirtualScrollToFn>;
    private measurements$?: Observable<VirtualMeasurement[]>;
    private measurements?: VirtualMeasurement[];

    constructor(
        private ngZone: NgZone,
    ) {}

    ngOnChanges(changes: SimpleChanges) {
        if ('count' in changes) {
            this.count$.next(this.count);
        }
        if ('estimateSize' in changes) {
            this.estimateSizeFn$.next(this.estimateSize);
        }
        if ('horizontal' in changes) {
            this.horizontal$.next(this.horizontal);
        }
        if ('viewportRef' in changes) {
            this.viewportRefSubj$.next(this.viewportRef);
        }
        if ('containerRef' in changes) {
            this.containerRef$.next(this.containerRef);
        }
        if ('bufferLength' in changes) {
            this.bufferLength$.next(this.bufferLength);
        }
    }

    ngOnInit() {
        this.buildStreams();
        this.subscribeToStreams();
    }

    ngOnDestroy() {
        this.destroy$.next();
        this.destroy$.complete();
    }

    private buildStreams() {
        /**
         * clear measured cache
         */
        merge(this.estimateSizeFn$, this.count$).pipe(
            takeUntil(this.destroy$),
        ).subscribe(() => this.measuredCache$.next({}));

        const viewportRect$ = buildElementRectObserver$(this.viewportRef$);
        const keys$ = buildKeys$(this.horizontal$);
        const scrollOffset$ = buildScrollOffset$(this.viewportRef$, keys$, this.count$, viewportRect$);
        const measurements$ = buildMeasurements$(this.count$, this.estimateSizeFn$, this.measuredCache$);
        const defaultScrollToFn$ = buildDefaultScrollToFn$(this.viewportRef$, keys$);
        const totalSize$ = buildTotalSize$(measurements$);
        const frame$ = buildFrame$(this.viewportRef$, scrollOffset$, keys$, totalSize$, this.containerRef$);
        const range$ = buildRange$(measurements$, frame$, this.bufferLength$);
        const recalcSizeFactory$ = buildRecalcSizeFactory$(
            keys$,
            defaultScrollToFn$,
            scrollOffset$,
            this.measuredCache$,
        );
        const virtualItems$ = buildVirtualItems$(range$, measurements$, recalcSizeFactory$);

        this.totalSize$ = totalSize$;
        this.virtualItems$ = virtualItems$;
        this.defaultScrollToFn$ = defaultScrollToFn$;
        this.measurements$ = measurements$;
    }

    private subscribeToStreams() {
        this.ngZone.runOutsideAngular(() => {
            this.virtualItems$?.pipe(
                takeUntil(this.destroy$),
            ).subscribe((virtualItems) => {
                this.ngZone.run(() => this.virtualItems = virtualItems);
            });

            this.totalSize$?.pipe(
                takeUntil(this.destroy$),
                observeOn(asapScheduler),
            ).subscribe((totalSize) => this.totalSize = totalSize);

            this.defaultScrollToFn$?.pipe(
                takeUntil(this.destroy$),
            ).subscribe((defaultScrollToFn) => this.scrollToFn = defaultScrollToFn);

            this.measurements$?.pipe(
                takeUntil(this.destroy$),
            ).subscribe((measurements) => this.measurements = measurements);
        });

    }

}
