import { NgModule } from '@angular/core';
import { WithVirtualScrollDirective } from './with-virtual-scroll.directive';
import { WithUnequalSizeDirective } from './with-unequal-size.directive';

@NgModule({
    declarations: [WithVirtualScrollDirective, WithUnequalSizeDirective],
    imports: [],
    exports: [WithVirtualScrollDirective, WithUnequalSizeDirective],
})
export class NgxVirtualScrollKitModule {}
