import { ChangeDetectionStrategy, Component } from '@angular/core';
import { VirtualItem, WithVirtualScrollDirective } from 'ngx-with-virtual-scroll';
import { generateItems } from '../utils';
import { VirtualCustomScrollToFn } from 'ngx-with-virtual-scroll/lib/types';

@Component({
    selector: 'scroll',
    templateUrl: './scroll.component.html',
    styleUrls: ['./scroll.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ScrollComponent {
    rows = generateItems(100000, 'row');

    scrollToFn: VirtualCustomScrollToFn = (offset: number, viewportRef: HTMLElement) => {
        viewportRef.scrollTo({
            top: offset,
            behavior: 'smooth',
        });
    };

    trackByRows() {
        return (index: number, item: VirtualItem) => this.rows[item.index].id;
    }

    scrollToOffset(scrolls: WithVirtualScrollDirective[], offset: number) {
        scrolls.forEach((scroll) => scroll.scrollToOffset(offset));
    }

    scrollToIndex(scrolls: WithVirtualScrollDirective[], offset: number) {
        scrolls.forEach((scroll) => scroll.scrollToIndex(offset));
    }
}
