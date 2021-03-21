import { ChangeDetectionStrategy, Component } from '@angular/core';
import { VirtualItem } from 'ngx-with-virtual-scroll';
import { generateItems } from '../utils';
import { defaultEstimateSize } from '../constants';

@Component({
    selector: 'multi-columns',
    templateUrl: './multi-columns.component.html',
    styleUrls: ['./multi-columns.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MultiColumnsComponent {
    rows = generateItems(100000, 'row');

    columns = generateItems(3, 'column');

    estimateSizeFn = defaultEstimateSize;

    trackByRows() {
        return (index: number, item: VirtualItem) => this.rows[item.index].id;
    }

}
