import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppComponent } from './app.component';
import { NgxWithVirtualScrollModule } from 'ngx-with-virtual-scroll';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

@NgModule({
    declarations: [
        AppComponent,
    ],
    imports: [
        BrowserModule,
        BrowserAnimationsModule,
        NgxWithVirtualScrollModule,
    ],
    providers: [],
    bootstrap: [AppComponent],
})
export class AppModule {}
