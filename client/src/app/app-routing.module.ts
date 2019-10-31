import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { HeroListComponent } from './hero/hero-list/hero-list.component';
import { HeroTopComponent } from './hero/hero-top/hero-top.component';
import { HeroDetailComponent } from './hero/hero-detail/hero-detail.component';
import { HeroAddComponent } from './hero/hero-add/hero-add.component';
import { HeroEditComponent } from './hero/hero-edit/hero-edit.component';
// 路由定义中的 data 属性也定义了与此路由有关的动画配置。当路由变化时，data 属性的值就会传给 AppComponent。
// data 属性的值必须满足 routeAnimation 中定义的转场动画的要求，稍后我们就会定义它。
// 注意：这个 data 中的属性名可以是任意的。
const routes: Routes = [
  {
    path: '',
    redirectTo: 'hero-list',
    pathMatch: 'full',
  },
  {
    path: 'hero-list',
    component: HeroListComponent,
    data: { animation: 'ListPage' },
  },
  {
    path: 'hero-top',
    component: HeroTopComponent,
    data: { animation: 'TopPage' },
  },
  {
    path: 'hero-detail/:id',
    component: HeroDetailComponent,
    data: { animation: 'DetailPage' },
  },
  {
    path: 'hero-add',
    component: HeroAddComponent,
    data: { animation: 'AddPage' },
  },
  {
    path: 'hero-edit/:id',
    component: HeroEditComponent,
    data: { animation: 'EditPage' },
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
