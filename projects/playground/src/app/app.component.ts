import { Component } from '@angular/core';
import { VirtualItem, WithVirtualScrollDirective } from 'ngx-virtual-scroll-kit';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss'],
    animations: [],
})
export class AppComponent {
    title = 'playground';

    rows = [...Array(1000)].map((i, index) => ({
        id: index,
        name: `row ${index}`,
        // height: Math.random() * (100 - 20) + 20,
        height: 50,
    }));

    columns = [...Array(1000)].map((i, index) => ({
        id: index,
        name: `column ${index}`,
        // height: Math.random() * (100 - 20) + 20,
        width: 50,
    }));
    isCollapsed: boolean = true;

    trackByRows() {
        return (index: number, item: VirtualItem) => this.rows[item.index].id;
    }

    trackByColumns() {
        return (index: number, item: VirtualItem) => this.columns[item.index].id;
    }

    removeItem() {
        this.rows = this.rows.filter((el, index) => index !== 1);
    }

    addItem() {
    }

    scrollTo(rowsScroll: WithVirtualScrollDirective, rowIndex: number) {
        rowsScroll.scrollToFn?.(rowIndex * 50);
    }
}
