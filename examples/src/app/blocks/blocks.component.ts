import { ChangeDetectionStrategy, Component } from '@angular/core';
import { VirtualItem } from 'ngx-with-virtual-scroll';
import { generateItems } from '../utils';
import { defaultEstimateSize } from '../constants';

@Component({
    selector: 'blocks',
    templateUrl: './blocks.component.html',
    styleUrls: ['./blocks.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BlocksComponent {
    rows = generateItems(100000, 'row');

    estimateSizeFn = defaultEstimateSize;

    trackByRows() {
        return (index: number, item: VirtualItem) => this.rows[item.index].id;
    }

}
