import { Routes } from '@angular/router';
import { MinimalComponent } from './minimal/minimal.component';
import { BlocksComponent } from './blocks/blocks.component';

export const routes: Routes = [
    { path: '', redirectTo: '/minimal', pathMatch: 'full' },
    { path: 'minimal', component: MinimalComponent },
    { path: 'blocks', component: BlocksComponent },
];
