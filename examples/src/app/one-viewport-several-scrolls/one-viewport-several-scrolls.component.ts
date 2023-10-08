import { ChangeDetectionStrategy, Component } from '@angular/core';
import { VirtualItem } from 'ngx-with-virtual-scroll';
import { generateItems } from '../utils';
import { defaultEstimateSize } from '../constants';

@Component({
    selector: 'one-viewport-several-scrolls',
    templateUrl: './one-viewport-several-scrolls.component.html',
    styleUrls: ['./one-viewport-several-scrolls.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OneViewportSeveralScrollsComponent {
    rows1 = generateItems(100, 'row1');
    rows2 = generateItems(100, 'row2');

    estimateSizeFn = defaultEstimateSize;

    trackByRows1() {
        return (index: number, item: VirtualItem) => this.rows1[item.index].id;
    }

    trackByRows2() {
        return (index: number, item: VirtualItem) => this.rows2[item.index].id;
    }

}
