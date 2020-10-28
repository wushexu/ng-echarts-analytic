import {NgModule} from '@angular/core';
import {Routes, RouterModule} from '@angular/router';
import {FhComponent} from './charts/fh/fh.component';
import {GenericChartComponent} from './charts/generic/generic-chart.component';


const routes: Routes = [
  {path: 'fh', component: FhComponent},
  {path: 'gc', component: GenericChartComponent}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {
}
