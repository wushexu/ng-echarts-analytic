import {NgModule} from '@angular/core';
import {Routes, RouterModule} from '@angular/router';
import {FhComponent} from './charts/fh/fh.component';
import {InvoiceAnalyzeComponent} from './charts/invoice/invoice-analyze.component';
import {BlankComponent} from './sidebar/blank.component';


const routes: Routes = [
  {path: '', component: BlankComponent},
  {path: 'iv', component: InvoiceAnalyzeComponent},
  {path: 'fh', component: FhComponent}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {
}
