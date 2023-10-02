import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppComponent } from './app.component';
import { NgxVirtualScrollKitModule } from 'ngx-virtual-scroll-kit';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

@NgModule({
    declarations: [
        AppComponent,
    ],
    imports: [
        BrowserModule,
        BrowserAnimationsModule,
        NgxVirtualScrollKitModule,
    ],
    providers: [],
    bootstrap: [AppComponent],
})
export class AppModule {}
