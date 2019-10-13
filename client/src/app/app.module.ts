import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { GraphQLModule } from './graphql.module';
import { HttpClientModule } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import {
  MatInputModule,
  MatTableModule,
  MatPaginatorModule,
  MatSortModule,
  MatProgressSpinnerModule,
  MatIconModule,
  MatButtonModule,
  MatCardModule,
  MatFormFieldModule,
  MatToolbarModule,
  MatSnackBarModule,
  MatCheckboxModule,
  MatTooltipModule,
  MatGridListModule,
} from '@angular/material';
import { HeroListComponent } from './hero/hero-list/hero-list.component';
import { HeroAddComponent } from './hero/hero-add/hero-add.component';
import { HeroDetailComponent } from './hero/hero-detail/hero-detail.component';
import { HeroTopComponent } from './hero/hero-top/hero-top.component';
import { HeroEditComponent } from './hero/hero-edit/hero-edit.component';

@NgModule({
  declarations: [AppComponent, HeroListComponent, HeroAddComponent, HeroDetailComponent, HeroTopComponent, HeroEditComponent],
  imports: [
    BrowserModule,
    AppRoutingModule,
    GraphQLModule,
    HttpClientModule,
    BrowserAnimationsModule,
    FormsModule, // 以下来自@angular/forms模块
    ReactiveFormsModule,
    MatInputModule, // 以下来自@angular/material模块
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatProgressSpinnerModule,
    MatIconModule,
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatToolbarModule,
    MatSnackBarModule,
    MatCheckboxModule,
    MatTooltipModule,
    MatGridListModule,
  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
