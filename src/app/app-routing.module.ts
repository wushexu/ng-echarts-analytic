import {NgModule} from '@angular/core';
import {Routes, RouterModule} from '@angular/router';
import {FhComponent} from './charts/fh/fh.component';


const routes: Routes = [
  {path: 'fh', component: FhComponent}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {
}
