import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { HeroListComponent } from './hero/hero-list/hero-list.component';
import { HeroTopComponent } from './hero/hero-top/hero-top.component';
import { HeroDetailComponent } from './hero/hero-detail/hero-detail.component';
import { HeroAddComponent } from './hero/hero-add/hero-add.component';
import { HeroEditComponent } from './hero/hero-edit/hero-edit.component';
import { HeroDetailResolverService } from './hero/hero-detail/hero-detail-resolver.service';

// 这些路由的定义顺序是刻意如此设计的。路由器使用先匹配者优先的策略来匹配路由，所以，具体路由应该放在通用路由的前面。
// 在上面的配置中，带静态路径的路由被放在了前面，后面是空路径路由，因此它会作为默认路由。
// 而通配符路由被放在最后面，这是因为它能匹配上每一个 URL，因此应该只有在前面找不到其它能匹配的路由时才匹配它。
// ---------------------------
// 路由定义中的 data 属性也定义了与此路由有关的动画配置。当路由变化时，data 属性的值就会传给 AppComponent。
// data 属性的值必须满足 routeAnimation 中定义的转场动画的要求，稍后我们就会定义它。
// 注意：这个 data 中的属性名可以是任意的。
const routes: Routes = [
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
    // 注意使用了resolve预取数据, 且命名为result供组件使用
    resolve: { result: HeroDetailResolverService},
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
