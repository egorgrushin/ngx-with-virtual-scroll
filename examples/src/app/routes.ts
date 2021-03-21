import { Routes } from '@angular/router';
import { MinimalComponent } from './minimal/minimal.component';
import { BlocksComponent } from './blocks/blocks.component';
import { OneViewportSeveralScrollsComponent } from './one-viewport-several-scrolls/one-viewport-several-scrolls.component';
import { MultiColumnsComponent } from './multi-columns/multi-columns.component';
import { SizesComponent } from './sizes/sizes.component';

export const routes: Routes = [
    { path: '', redirectTo: '/minimal', pathMatch: 'full' },
    { path: 'minimal', component: MinimalComponent },
    { path: 'blocks', component: BlocksComponent },
    { path: 'one-viewport-several-scrolls', component: OneViewportSeveralScrollsComponent },
    { path: 'multi-columns', component: MultiColumnsComponent },
    { path: 'sizes', component: SizesComponent },
];
