import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { HeroListComponent } from './hero/hero-list/hero-list.component';
import { HeroTopComponent } from './hero/hero-top/hero-top.component';
import { HeroDetailComponent } from './hero/hero-detail/hero-detail.component';
import { HeroAddComponent } from './hero/hero-add/hero-add.component';
import { HeroEditComponent } from './hero/hero-edit/hero-edit.component';

const routes: Routes = [
  {
    path: 'hero-list',
    component: HeroListComponent,
    data: { title: '英雄列表' },
  },
  {
    path: 'hero-top',
    component: HeroTopComponent,
    data: { title: '顶级英雄' },
  },
  {
    path: 'hero-detail/:id',
    component: HeroDetailComponent,
    data: { title: '英雄详情' },
  },
  {
    path: 'hero-add',
    component: HeroAddComponent,
    data: { title: '添加英雄' },
  },
  {
    path: 'hero-edit/:id',
    component: HeroEditComponent,
    data: { title: '添加英雄' },
  },
  {
    path: '',
    redirectTo: 'hero-list',
    pathMatch: 'full',
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
