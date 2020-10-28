import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';

import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {LayoutModule} from '@angular/cdk/layout';

import {MatFormFieldModule} from '@angular/material/form-field';
import {MatToolbarModule} from '@angular/material/toolbar';
import {MatButtonModule} from '@angular/material/button';
import {MatSidenavModule} from '@angular/material/sidenav';
import {MatIconModule} from '@angular/material/icon';
import {MatListModule} from '@angular/material/list';
import {MatGridListModule} from '@angular/material/grid-list';
import {MatCardModule} from '@angular/material/card';
import {MatMenuModule} from '@angular/material/menu';
import {MatCheckboxModule} from '@angular/material/checkbox';

// import {MatAutocompleteModule} from '@angular/material/autocomplete';
// import {MatTooltipModule} from '@angular/material/tooltip';
// import {MatExpansionModule} from '@angular/material/expansion';
// import {MatDialogModule} from '@angular/material/dialog';
// import {MatButtonToggleModule} from '@angular/material/button-toggle';
// import {MatInputModule} from '@angular/material/input';
// import {MatSelectModule} from '@angular/material/select';
// import {MatRadioModule} from '@angular/material/radio';
// import {MatTableModule} from '@angular/material/table';
// import {MatPaginatorModule} from '@angular/material/paginator';
// import {MatSortModule} from '@angular/material/sort';
// import {MatTreeModule} from '@angular/material/tree';
// import {DragDropModule} from '@angular/cdk/drag-drop';
// import {MatStepperModule} from '@angular/material/stepper';

import {AppRoutingModule} from './app-routing.module';
import {FhComponent} from './charts/fh/fh.component';
import {AppComponent} from './app.component';
import {SidebarComponent} from './sidebar/sidebar.component';
import {DataService} from './data/DataService';
import {GenericChartComponent} from './charts/generic/generic-chart.component';

@NgModule({
  declarations: [
    AppComponent,
    SidebarComponent,
    FhComponent,
    GenericChartComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    LayoutModule,
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    AppRoutingModule,
    MatToolbarModule,
    MatButtonModule,
    MatSidenavModule,
    MatIconModule,
    MatListModule,
    MatGridListModule,
    MatCardModule,
    MatMenuModule,
    MatCheckboxModule
  ],
  providers: [
    DataService
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
}
