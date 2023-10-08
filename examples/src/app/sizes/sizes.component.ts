import { ChangeDetectionStrategy, Component } from '@angular/core';
import { VirtualItem } from 'ngx-with-virtual-scroll';
import { generateItems } from '../utils';

const getRandomArbitrary = (min: number, max: number) => Math.random() * (max - min) + min;

@Component({
    selector: 'sizes',
    templateUrl: './sizes.component.html',
    styleUrls: ['./sizes.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SizesComponent {
    rows = generateItems(100000, 'row', () => getRandomArbitrary(20, 80));

    trackByRows() {
        return (index: number, item: VirtualItem) => this.rows[item.index].id;
    }

}
