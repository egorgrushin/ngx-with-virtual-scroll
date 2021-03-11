import { Directive, ElementRef, Input } from '@angular/core';
import { VirtualItem } from './types';

@Directive({
    selector: '[with-unequal-size]',
})
export class WithUnequalSizeDirective {
    /**
     * virtual item connect to
     */
    @Input('with-unequal-size') item?: VirtualItem;

    constructor(private elementRef: ElementRef) {}

    ngAfterViewChecked() {
        this.item?.recalcSize(this.elementRef.nativeElement);
    }
}
