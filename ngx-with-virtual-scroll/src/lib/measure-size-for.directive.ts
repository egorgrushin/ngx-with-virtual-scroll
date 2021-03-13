import { Directive, ElementRef, Input } from '@angular/core';
import { VirtualItem } from './types';

@Directive({
    selector: '[measure-size-for]',
})
export class MeasureSizeForDirective {
    /**
     * virtual item connect to
     */
    @Input('measure-size-for') item?: VirtualItem;

    constructor(private elementRef: ElementRef) {}

    ngAfterViewChecked() {
        this.item?.measureSize(this.elementRef.nativeElement);
    }
}
