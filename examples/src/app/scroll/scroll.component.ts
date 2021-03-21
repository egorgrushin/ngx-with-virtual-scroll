import { ChangeDetectionStrategy, Component } from '@angular/core';
import { VirtualItem } from 'ngx-with-virtual-scroll';
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

    scrollToFn: VirtualCustomScrollToFn = (offset: number) => {
        console.log(offset);
    };

    trackByRows() {
        return (index: number, item: VirtualItem) => this.rows[item.index].id;
    }

}
