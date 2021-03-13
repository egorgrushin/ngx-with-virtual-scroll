import { ChangeDetectionStrategy, Component } from '@angular/core';
import { VirtualItem, WithVirtualScrollDirective } from 'ngx-with-virtual-scroll';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss'],
    animations: [],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent {
    title = 'playground';

    rows = [...Array(1000)].map((i, index) => ({
        id: index,
        name: `row ${index}`,
        height: 50,
    }));

    trackByRows() {
        return (index: number, item: VirtualItem) => this.rows[item.index].id;
    }

    scrollToIndex(rowsScroll: WithVirtualScrollDirective, index: number) {
        rowsScroll.scrollToIndex(index);
    }

    scrollToOffset(rowsScroll: WithVirtualScrollDirective, offset: number) {
        rowsScroll.scrollToOffset(offset);
    }
}
