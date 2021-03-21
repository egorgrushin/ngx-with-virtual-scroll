import { ChangeDetectionStrategy, Component } from '@angular/core';
import { VirtualItem } from 'ngx-with-virtual-scroll';
import { generateItems } from '../utils';
import { defaultEstimateSize } from '../constants';

@Component({
    selector: 'minimal',
    templateUrl: './minimal.component.html',
    styleUrls: ['./minimal.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MinimalComponent {
    rows = generateItems(100000, 'row');
    columns = generateItems(100000, 'column');

    estimateSizeFn = defaultEstimateSize;

    trackByRows() {
        return (index: number, item: VirtualItem) => this.rows[item.index].id;
    }

    trackByColumns() {
        return (index: number, item: VirtualItem) => this.columns[item.index].id;
    }

}
