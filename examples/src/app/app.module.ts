import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppComponent } from './app.component';
import { NgxWithVirtualScrollModule } from 'ngx-with-virtual-scroll';
import { MinimalComponent } from './minimal/minimal.component';
import { RouterModule } from '@angular/router';
import { routes } from './routes';
import { BlocksComponent } from './blocks/blocks.component';
import { OneViewportSeveralScrollsComponent } from './one-viewport-several-scrolls/one-viewport-several-scrolls.component';
import { MultiColumnsComponent } from './multi-columns/multi-columns.component';
import { SizesComponent } from './sizes/sizes.component';
import { ScrollComponent } from './scroll/scroll.component';

@NgModule({
    declarations: [
        AppComponent,
        MinimalComponent,
        BlocksComponent,
        OneViewportSeveralScrollsComponent,
        MultiColumnsComponent,
        SizesComponent,
        ScrollComponent,
    ],
    imports: [
        BrowserModule,
        NgxWithVirtualScrollModule,
        RouterModule.forRoot(routes),
    ],
    providers: [],
    bootstrap: [AppComponent],
})
export class AppModule {}
