import { NgModule } from '@angular/core';
import { WithVirtualScrollDirective } from './with-virtual-scroll.directive';
import { MeasureSizeForDirective } from './measure-size-for.directive';

@NgModule({
    declarations: [WithVirtualScrollDirective, MeasureSizeForDirective],
    imports: [],
    exports: [WithVirtualScrollDirective, MeasureSizeForDirective],
})
export class NgxWithVirtualScrollModule {}
