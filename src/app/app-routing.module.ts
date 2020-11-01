import {NgModule} from '@angular/core';
import {Routes, RouterModule} from '@angular/router';
import {FhComponent} from './charts/fh/fh.component';
import {InvoiceAnalyzeComponent} from './charts/invoice/invoice-analyze.component';
import {BlankComponent} from './sidebar/blank.component';
import {LogisSiteComponent} from './charts/logis-site/logis-site.component';
import {ChinaMapComponent} from './charts/map/china-map.component';
import {LinyiMapComponent} from './charts/map/linyi-map.component';
import {ChinaLine1Component} from './charts/map/china-line1.component';


const routes: Routes = [
  {path: '', component: BlankComponent},
  {path: 'iv', component: InvoiceAnalyzeComponent},
  {path: 'ls', component: LogisSiteComponent},
  {path: 'fh', component: FhComponent},
  {path: 'cn', component: ChinaMapComponent},
  {path: 'ly', component: LinyiMapComponent},
  {path: 'cn-l1', component: ChinaLine1Component}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {
}
