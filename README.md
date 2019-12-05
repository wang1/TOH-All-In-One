# Nestjs, Angular 全栈开发记录

本文记录了使用Nestjs, Fastify, Graphql, MongoDB, Angular, Material等工具, 进行Angular官网的英雄之旅demo的开发过程.

以上工具请参见各自的官网进行学习. 对应的中文网站如下:

1. 后台框架 [Nestjs](https://docs.nestjs.cn)
2. Web框架 [Fastify](https://lavyun.gitbooks.io/fastify/content/) [其它](https://github.com/fastify/docs-chinese)
3. 查询框架 [Graphql](https://graphql.cn/) [Nestjs-Graphql](https://docs.nestjs.cn/6/graphql)
4. 数据库框架 [Mongoose](https://mongoosedoc.top/docs/guide.html)
5. 前端框架 [Angular](https://angular.cn)
6. 样式框架 [Material](https://material.angular.cn)

## 前期准备

1. `Nodejs, MongoDB, @nestjs/cli, @angular/cli`等先全局安装, 在合适目录下新建`MongoDB`数据文件存放目录`mongodb-data`, 且以 `mongod --dbpath mongodb-data` 命令启动好数据库并保持一直运行
2. 新建项目: `nest new toh-all-in-one` 且进入目录
3. 安装依赖包: `yarn add @nestjs/platform-fastify fastify-static apollo-server-fastify @nestjs/graphql graphql-tools graphql type-graphql @nestjs/mongoose mongoose`
4. 使用`vscode`打开该项目文件夹, 进行git的初始提交(以后我们将不再提及git的提交)

---

## 后台开发

---

### 使用快速的 fastify 引擎

Nestjs默认使用Express引擎, 我们改用更快速的Fastify引擎. 打开 `src/main.ts` 文件, 修改如下:

```TS
import { NestFactory } from '@nestjs/core';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter(),
  );
  await app.listen(3000);
}
bootstrap();
```

以命令 `yarn run start:dev` 启动应用, 打开浏览器导航到`localhost:3000`, 看到 `Hello World`则项目构建成功.

此时可删除`src`目录下的`app.controller.ts, app.controller.spec.ts, app.service.ts`这以后将不再使用的3个文件, 并删除`app.module.ts`文件对这些文件的引用.

### 构建 hero 模块

运行以下命令将生成 hero 目录且新建模块, 服务, 解析器 3 个文件, 服务和解析器文件将自动导入 hero 模块文件, hero 模块将自动导入根模块以供使用:

```bash
nest generate module hero --no-spec
nest generate service hero --no-spec
nest generate resolver hero --no-spec
```

### 添加并配置 Graphql 模块

在根模块文件 `src/app.module.ts`中导入 Graphql模块, 并配置为 `code first` 模式(当服务器启动时将自动生成该 `gql` 文件供使用)

```ts
import { GraphQLModule } from '@nestjs/graphql';
@Module({
 imports: [
  GraphQLModule.forRoot(
    {autoSchemaFile: 'schema.gql',}
  )
]
```

### 连接 MongoDB, 构建相关文件

在根模块文件 `src/app.module.ts`中导入数据库模块, 并配置将在服务启动时自动连接并生成 `tohallinone` 数据库

```ts
import { MongooseModule } from '@nestjs/mongoose';
@Module({
 imports: [
  MongooseModule.forRoot('mongodb://localhost/tohallinone', {useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false})
 ],
})
```

此时, `src/app.module.ts` 文件如下:

```ts
import { Module } from '@nestjs/common';
import { HeroModule } from './hero/hero.module';
import { GraphQLModule } from '@nestjs/graphql';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports: [
    GraphQLModule.forRoot({
      autoSchemaFile: 'schema.gql',
    }),
    MongooseModule.forRoot('mongodb://localhost/tohallinone', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useFindAndModify: false,
    }),
    HeroModule,
  ],
})
export class AppModule {}
```

### 数据库 schema (架构)文件

在 `hero` 目录新建 `hero.schema.ts` 文件如下:

```ts
import * as mongooge from 'mongoose';

export const HeroSchema = new mongooge.Schema({
  no: { type: String, required: true },
  name: { type: String, required: true },
  salary: { type: Number, default: 0 },
  description: { type: String, default: '暂无介绍' },
  isTop: { type: Boolean, default: false },
});

```

该 `schema` 文件规定了数据表模式的架构, 供后面 `mongoose` 生成数据库时使用
>说明:
>
> `Schema` ： 一种以文件形式存储的数据库模型骨架，**不具备数据库的操作能力**
  
### 接口 interface 文件

在 `hero` 目录新建 `hero.interface.ts` 文件如下:

```ts
import { Document } from 'mongoose';

export interface Hero extends Document {
  readonly no: string;
  readonly name: string;
  readonly salary?: number;
  readonly description?: string;
  readonly isTop?: boolean;
}
```

该接口文件用于进行类型检查和约束, 一般用于项目的服务(`hero.service.ts`)中.

### 数据传输对象 DTO (Data Transfer Object)文件

在 `hero` 目录新建 `hero.dto.ts` 文件如下:

```ts
import { ObjectType, Field, ID, Float } from 'type-graphql';
import { IsString, IsNotEmpty, IsNumber, IsBoolean } from 'class-validator';

@ObjectType()
export class HeroDto {
  @Field(() => ID)
  @IsString()
  readonly id?: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  readonly no: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  readonly name: string;

  @Field({ nullable: true })
  @Field(() => Float)
  @IsNumber()
  readonly salary?: number;

  @Field({ nullable: true })
  @IsString()
  readonly description?: string;

  @Field({ nullable: true })
  @IsBoolean()
  readonly isTop?: boolean;
}
```

该 `DTO` 文件进行了 `ObjectType` 类型装饰, 用于定义在网络中传输的对象结构, 一般用在项目的解析器中.

在代码优先的开发模式中, `Graphql` 将以此文件生成 `Object Type`.

### 输入 Input 类型文件

在 `hero` 目录新建 `hero.input.ts` 文件如下:

```ts
import { InputType, Field, Float } from 'type-graphql';

@InputType()
export class HeroInput {
  @Field()
  readonly no: string;

  @Field()
  readonly name: string;

  @Field({ nullable: true })
  @Field(() => Float)
  readonly salary?: number;

  @Field({ nullable: true })
  readonly description?: string;

  @Field({ nullable: true })
  readonly isTop?: boolean;
}
```

该 `input` 文件进行了`InputType` 类型装饰, 用于定义在网络中上传数据的对象结构, 一般用在项目的解析器中.

在代码优先的开发模式中, `Graphql` 将以此文件生成 `Input Type`.
> 说明:
>
> 该文件与前面的`DTO`文件非常类似, 为什么不直接使用 `Object Type` 呢？因为 `Object` 的字段可能存在循环引用，或者字段引用了不能作为查询输入对象的接口和联合类型。

### 导入 schema

在`hero.module.ts` 文件中导入 `schema` 以生成 `model` 供服务中使用, 如下:

```ts
import { Module } from '@nestjs/common';
import { HeroService } from './hero.service';
import { HeroResolver } from './hero.resolver';
import { MongooseModule } from '@nestjs/mongoose';
import { HeroSchema } from './hero.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'HeroModel', schema: HeroSchema }]),
  ],
  providers: [HeroService, HeroResolver],
})
export class HeroModule {}
```

> `Model` ： 由 `Schema` 发布生成的模型，具有**抽象**属性和行为的数据库操作
> `forFeature` 方法定义哪些模式架构在本模块内注册, 并给出对应的 `Model` 名称

## 实现 Graphql 的 CRUD

### 服务 Service

打开 `hero/hero.service.ts` 文件, 实现 `CRUD` 功能, 如下:

```ts
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Hero } from './hero.interface';
import { HeroInput } from './hero.input';

@Injectable()
export class HeroService {
  constructor(@InjectModel('HeroModel') private heroModel: Model<Hero>) {}

  async create(newHero: HeroInput): Promise<Hero> {
    return await this.heroModel(newHero).save();
  }

  async findAll(): Promise<Hero[]> {
    return await this.heroModel.find().exec();
  }

  async findOne(id: string): Promise<Hero> {
    return await this.heroModel.findOne({ _id: id });
  }

  async findTop(): Promise<Hero[]> {
    return await this.heroModel.find({ isTop: true });
  }

  async searchByName(stringInName: string): Promise<Hero[]> {
    return await this.heroModel.find({ name: new RegExp(stringInName) }, 'name');
  }

  async delete(id: string): Promise<Hero> {
    return await this.heroModel.findByIdAndRemove(id);
  }

  async update(id: string, updateHero: HeroInput): Promise<Hero> {
    return await this.heroModel.findByIdAndUpdate(id, updateHero, {
      new: true,
    });
  }
}
```

>说明:
>
> `Entity` ： 由 `Model` 创建的实体，他的操作直接影响数据库数据

### 解析器 Resolver

打开 `hero/hero.resolver.ts` 文件, 实现 `Graphql` 的解析功能, 如下:

```ts
import { Resolver, Query, Args, Mutation } from '@nestjs/graphql';
import { HeroService } from './hero.service';
import { HeroDto } from './hero.dto';
import { HeroInput } from './hero.input';

@Resolver('Hero')
export class HeroResolver {
  constructor(private readonly heroService: HeroService) {}
  // 查询所有英雄
  @Query(() => [HeroDto])
  async heroes() {
    return this.heroService.findAll();
  }
  // 查询顶级英雄
  @Query(() => [HeroDto])
  async topHeroes() {
    return this.heroService.findTop();
  }
  // 通过id得到一个英雄
  @Query(() => HeroDto)
  async hero(@Args('id') id: string) {
    return this.heroService.findOne(id);
  }
  // 通过某些字符模糊查询英雄
  @Query(() => [HeroDto])
  async searchHeroByName(@Args('stringInName') stringInName: string) {
    return this.heroService.searchByName(stringInName);
  }
  // 新建英雄
  @Mutation(() => HeroDto)
  async createHero(@Args('input') input: HeroInput) {
    return this.heroService.create(input);
  }
  // 更新英雄
  @Mutation(() => HeroDto)
  async updateHero(@Args('id') id: string, @Args('input') input: HeroInput) {
    return this.heroService.update(id, input);
  }
  // 删除英雄
  @Mutation(() => HeroDto)
  async deleteHero(@Args('id') id: string) {
    return this.heroService.delete(id);
  }
}
```

此时, 如果应用正在运行, 则可看到项目根目录中有定义的`schema.gql`文件生成, 这是`Graphql`提供服务的核心文件.

如果`resolver`文件有更改, 则该文件将自动更新.

> 各 装饰器说明:
>
> `@Resolver('Hero')`: 告诉`Nestjs`, 这个类知道该如何解析与处理对`Hero`的各种请求. 上例中, 这些请求都委派给了`heroService`去具体处理.
>
> `@Query()`: 是`Graphql`的三大操作(`query, mutation, subcribe, 即查询, 变更, 订阅`)之一. 上例中, 我们定义了三种查询方式即获取所有英雄, 顶级英雄以及单个英雄
>
> `@Mutation()`: 类似于查询,  上例中, 我们定义了三种变更方式即新建, 更新和删除英雄
>
> `@Args()`: 是一个辅助装饰器, 用于在`url`中获取相关的参数数据

## 运行后台服务器

至此, 后台开发完毕, 如果应用没启动, 请使用 `yarn run start:dev` 进行开发模式运行.

可打开 `Graphql`的控制台 `localhost:3000/graphql` 进行相关的操作.

---

## 前端开发

---

### 新建 Angular 项目

在当前目录下新建 `Angular` 项目, 命名为`client`, 请选择自动生成路由和使用 scss

```bash
ng new client --skip-tests
cd client
ng server -o
```

此时, `localhost:4200` 应该看到 Angular 的 demo 页面.

> 注意:
>
> 以下操作请在前端项目目录`client`中进行!

### 添加 Graphql 客户端 apollo-angular

因为后台提供的是`Graphql`方式的查询, 所以前端也需要能发出`Graphql`方式的请求, 我们使用`apollo`提供的`graphql`模块.

在项目目录`client`中执行 `ng add apollo-angular` 安装该模块.

然后在`src/app/graphql.module.ts`文件中添加`Graphql Server`的 `URL`, 并配置选项如下:

```ts
import { NgModule } from '@angular/core';
import { ApolloModule, APOLLO_OPTIONS } from 'apollo-angular';
import { HttpLinkModule, HttpLink } from 'apollo-angular-link-http';
import { InMemoryCache } from 'apollo-cache-inmemory';

const uri = 'http://localhost:3000/graphql'; // <-- add the URL of the GraphQL server here
export function createApollo(httpLink: HttpLink) {
  return {
    link: httpLink.create({ uri }),
    cache: new InMemoryCache(),
  };
}

@NgModule({
  exports: [ApolloModule, HttpLinkModule],
  providers: [
    {
      provide: APOLLO_OPTIONS,
      useFactory: createApollo,
      deps: [HttpLink],
    },
  ],
})
export class GraphQLModule {}
```

### 添加 Angular Material 样式库并配置

使用`ng add @angular/material`命令添加`material`样式库, 如下回答问题:

```bash
? Choose a prebuilt theme name, or "custom" for a custom theme: deeppurple-amber
? Set up HammerJS for gesture recognition? Yes
? Set up browser animations for Angular Material? Yes
```

打开`style.scss`文件, 修正如下:

```css
/* You can add global styles to this file, and also import other style files */
@import '@angular/material/prebuilt-themes/deeppurple-amber.css';

html, body { height: 100%; }
body { margin: 0; font-family: Roboto, "Helvetica Neue", sans-serif; }

.container {
  position: relative;
  padding: 5px;
}

.loading-shade {
  position: absolute;
  top: 0;
  left: 0;
  bottom: 56px;
  right: 0;
  background: rgba(0, 0, 0, 0.15);
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}

.flat-button {
  margin: 5px;
}
```

打开根模块文件`app.module.ts`导入并注册`Form`模块和`Material`模块, 修改后的根模块文件如下:

```ts
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
  MatAutocompleteModule,
} from '@angular/material';

@NgModule({
  declarations: [
    AppComponent,
    HeroListComponent,
    HeroAddComponent,
    HeroDetailComponent,
    HeroTopComponent,
    HeroEditComponent,
    HeroSearchComponent,
  ],
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
    MatAutocompleteModule,
  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
```

我们打算在页面路由时使用动画过渡, 动画模块`BrowserAnimationsModule`默认在`app.module.ts`中已经导入, 因此在项目根目录生成动画文件`app-animations.ts`如下:

```ts
import {
  trigger,
  transition,
  style,
  query,
  animateChild,
  group,
  animate,
  keyframes,
} from '@angular/animations';
// 动画可以直接在组件中定义。我们在独立的文件中定义动画，导入到app.component.ts组件中, 同时也让我们可以复用这些动画。
// 在转场期间，新视图将直接插入在旧视图后面，并且这两个元素会同时出现在屏幕上。
// 要防止这种情况，就要为宿主视图以及要删除和插入的子视图指定一些额外的样式。
// 宿主视图必须使用相对定位模式，而子视图则必须使用绝对定位模式。
// query(":enter") 语句会返回已插入的视图，query(":leave") 语句会返回已移除的视图
// optional: true 参数允许查找不到视图而不报错
// 使用 group() 函数来并行运行内部动画
export const slideInAnimation = trigger('routeAnimations', [
  transition('* <=> *', [
    style({ position: 'relative' }),
    query(':enter, :leave', [
      style({
        position: 'absolute',
        top: 20,
        left: 20,
        width: '100%',
      }),
    ], { optional: true }),
    // query(':enter', [
    //   style({ left: '-100%' })
    // ]),
    group([
      query(':enter', [
        animate(
          '1000ms ease',
          keyframes([
            style({ transform: 'scale(0) translateX(100%)' }),
            style({ transform: 'scale(0.5) translateX(50%)' }),
            style({ transform: 'scale(1) translateX(0%)' }),
          ]),
        ),
      ],{ optional: true }),
      query(':leave', [animate('500ms ease-in', style({ left: '-200%' }))], { optional: true }),
      // query(':leave', [
      //   animate('2000ms ease', keyframes([
      //     style({ transform: 'scale(1)', offset: 0 }),
      //     style({ transform: 'scale(0.5) translateX(-25%) rotate(0)', offset: 0.35 }),
      //     style({ opacity: 0, transform: 'translateX(-50%) rotate(-180deg) scale(6)', offset: 1 }),
      //   ])),
      // ])
    ]),
    // Required only if you have child animations on the page
    // query(':leave', animateChild()),
    // group([
    //   query(':leave', [
    //     animate('500ms ease-in', style({ left: '100%' }))
    //   ]),
    //   query(':enter', [
    //     animate('500ms 200ms ease-in', style({ left: '0%' }))
    //   ]),
    // ]),
    // Required only if you have child animations on the page
    // query(':enter', animateChild()),
  ]),
]);
```

更新根组件模板文件`app.component.html`如下:

```html
<mat-toolbar class="mat-elevation-z6 TOH-nav" color="primary">
  <mat-icon class="icon">person</mat-icon><span> {{title}}</span>
  <a mat-button routerLink="/hero-list">
    <mat-icon class="icon">list</mat-icon>所有英雄
  </a>
  <a mat-button routerLink="/hero-top">
    <mat-icon class="icon">thumb_up</mat-icon>顶级英雄
  </a>
  <a mat-button routerLink="/hero-add">
    <mat-icon class="icon">person_add</mat-icon>添加英雄
  </a>
  <a mat-button>
    <mat-icon class="icon">search</mat-icon>查找英雄
    <app-hero-search></app-hero-search>
  </a>
  <span class="spacer"></span>
  <a mat-button href="https://github.com">
    <mat-icon class="icon">star</mat-icon>GitHub
  </a>
</mat-toolbar>
<!-- 
  定义了一个可以检测视图何时发生变化的方法，该方法会基于路由配置的 data 属性值，
  将动画状态值赋值给动画触发器（@routeAnimation）
  prepareRoute() 方法会获取这个 outlet 指令的值（通过 #outlet="outlet"），
  并根据当前活动路由的自定义数据返回一个表示动画状态的字符串值。
  你可以使用这个数据来控制各个路由之间该执行哪个转场。
-->
<div class="container" [@routeAnimations]="prepareRoute(outlet)">
  <router-outlet #outlet="outlet"></router-outlet>
</div>
```

修改`app.component.ts`文件如下:

```ts
import { Component } from '@angular/core';
import { slideInAnimation } from './app-animations';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  animations: [slideInAnimation]
})
export class AppComponent {
  title = 'TOH-英雄之旅';

  prepareRoute(outlet: RouterOutlet) {
    return outlet && outlet.activatedRouteData && outlet.activatedRouteData['animation'];
  }
}
```

打开`app.component.scss`文件, 添加样式如下:

```css
.container {
  padding: 20px;
  margin: 60px 20px;
}

.TOH-nav {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  //原来设了个8964, 但导航上增加"查找英雄"后有个自动完成面板,
  // angular默认设该自动完成面板z-index: 1000. 故改为89
  z-index: 89;
}

.icon {
  padding: 0 5px;
}

.spacer {
  flex: 1 1 auto;
}

```

### 生成组件

执行以下命令, 生成英雄列表, 顶级英雄, 英雄详情, 添加英雄, 编辑英雄以及查找英雄等组件.

该项目今后还应该有其它类型的组件, 因此归类到 `hero` 目录下, 同时注册在根模块中

```bash
ng g c hero/hero-list --module=app
ng g c hero/hero-add --module=app
ng g c hero/hero-detail --module=app
ng g c hero/hero-top --module=app
ng g c hero/hero-edit --module=app
ng g c hero/hero-search --module=app
```

### 生成Hero类

为保证一致性, 在`hero`目录下生成`Hero`类如下:

```ts
export class Hero {
  id: string;
  no: string;
  name: string;
  description?: string;
  salary?: number;
  isTop?: boolean;
}
```

### 更新路由

配置`app-routing.module.ts`文件中的路由如下:

```ts
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
    resolve: { result: HeroDetailResolverService}
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
```

### 生成英雄服务

组件中需要与后台交互的数据我们都委派给服务去完成, 因此使用`ng g s hero/hero`新建服务如下:

```ts
import { Injectable } from '@angular/core';
import { Apollo } from 'apollo-angular';
import gql from 'graphql-tag';

@Injectable({
  providedIn: 'root',
})
export class HeroService {
  private getHeroesGql = gql`
    {
      heroes {
        id
        no
        name
        salary
        description
        isTop
      }
    }
  `;
  private getTopHeroesGql = gql`
  {
    topHeroes {
      id
      no
      name
      salary
      description
      isTop
    }
  }
`;
  private getHeroGql = gql`
    query getHeroGql($id: String!) {
      hero(id: $id) {
        id
        no
        name
        salary
        description
        isTop
      }
    }
  `;
  private getSomeHeroGql = gql`
    query getSomeHeroGql($termInName: String!) {
      searchHeroByName(stringInName: $termInName) {
        name
        id
      }
    }
  `;
  private deleteHeroGql = gql`
    mutation deleteHeroGql($id: String!) {
      deleteHero(id: $id) {
        id
      }
    }
  `;
  private addHeroGql = gql`
    mutation addHeroGql(
      $no: String!
      $name: String!
      $salary: Float
      $description: String
      $isTop: Boolean
    ) {
      createHero(
        input: {
          no: $no
          name: $name
          salary: $salary
          description: $description
          isTop: $isTop
        }
      ) {
        id
      }
    }
  `;
  private updateHeroGql = gql`
    mutation updateHeroGql(
      $id: String!
      $no: String!
      $name: String!
      $salary: Float
      $description: String
      $isTop: Boolean
    ) {
      updateHero(
        id: $id,
        input: {
          no: $no
          name: $name
          salary: $salary
          description: $description
          isTop: $isTop
        }
      ) {
        id
      }
    }
  `;

  constructor(private apollo: Apollo) {}
  // 由于apollo.watchQuery以及mutate返回的是一个{data:{}}格式的对象, 不能指定其类型, 故此处使用any类型
  // TODO: 在保证类型一致性方面需要再思考
  getHeroes() {
    return this.apollo.watchQuery<any>({
      query: this.getHeroesGql,
    }).valueChanges;
  }

  getTopHeroes() {
    return this.apollo.watchQuery<any>({
      query: this.getTopHeroesGql,
    }).valueChanges;
  }

  getHeroById(heroId: string) {
    return this.apollo.watchQuery<any>({
      query: this.getHeroGql,
      variables: { id: heroId }, // 带参数查询
    }).valueChanges;
  }

  searchHeroesByName(term: string) {
    // if not search term, return empty data object.非常重要, 否则组件将阻塞
    if (!term.trim()) {
      return of({ data: {} });
    }
    return this.apollo.watchQuery<any>({
      query: this.getSomeHeroGql,
      variables: { termInName: term }, // 带参数查询
    }).valueChanges;
  }

  deleteHero(heroId: string) {
    return this.apollo.mutate<any>({
      mutation: this.deleteHeroGql,
      variables: { id: heroId },
      // 删除英雄后,使用refetchQueries执行查询以更新apollo的数据缓存,保证其它组件显示数据的正常
      refetchQueries: [{
        query: this.getHeroesGql,
      }],
    });
  }

  addHero(hero: any) {
    return this.apollo.mutate<any>({
      mutation: this.addHeroGql,
      variables: {
        no: hero.no,
        name: hero.name,
        salary: hero.salary,
        description: hero.description,
        isTop: hero.isTop,
      },
      // 添加英雄后,使用refetchQueries执行查询以更新apollo的数据缓存, 保证其它组件显示数据的正常
      refetchQueries: [{
        query: this.getHeroesGql,
      }],
    });
  }
  // 更新英雄. 似乎它将自动更新apollo的数据缓存
  updateHero(heroId: string, hero: any) {
    return this.apollo.mutate<any>({
      mutation: this.updateHeroGql,
      variables: {
        id: heroId,
        no: hero.no,
        name: hero.name,
        salary: hero.salary,
        description: hero.description,
        isTop: hero.isTop,
      },
    });
  }
}
```

> 说明:
>
> 该服务也使用了`apollo-angular`的客户端模块服务, 请仔细分析其用法!

### 英雄列表组件

修改 `hero-list.component.ts` 文件如下:

```ts
import { Component, OnInit } from '@angular/core';
import { HeroService } from '../hero.service';

@Component({
  selector: 'app-hero-list',
  templateUrl: './hero-list.component.html',
  styleUrls: ['./hero-list.component.scss'],
})
export class HeroListComponent implements OnInit {
  // 决定表格中要显示的列和顺序
  displayedColumns: string[] = ['no', 'name', 'salary', 'description', 'isTop'];
  heroes: Hero[] = [];
  isLoading = true;
  constructor(private heroService: HeroService) {}

  ngOnInit() {
    this.heroService.getHeroes().subscribe(result => {
      this.heroes = result.data && result.data.heroes;
      this.isLoading = result.loading;
    });
  }
}
```

修改 `hero-list.component.html` 文件如下:

```html
<div class="container mat-elevation-z4">
  <div class="loading-shade" *ngIf="isLoading">
    <mat-spinner *ngIf="isLoading"></mat-spinner>
  </div>
  <h2>
    <div style="text-align:center">英雄列表</div>
  </h2>

  <div class="mat-elevation-z4">
    <mat-table [dataSource]="heroes">
      <ng-container matColumnDef="no">
        <mat-header-cell *matHeaderCellDef> 编号 </mat-header-cell>
        <mat-cell *matCellDef="let row"> {{row.no}} </mat-cell>
      </ng-container>
      <ng-container matColumnDef="name">
        <mat-header-cell *matHeaderCellDef> 姓名 </mat-header-cell>
        <mat-cell *matCellDef="let row"> {{row.name}} </mat-cell>
      </ng-container>
      <ng-container matColumnDef="salary">
        <mat-header-cell *matHeaderCellDef> 薪水 </mat-header-cell>
        <mat-cell *matCellDef="let row"> {{row.salary}} </mat-cell>
      </ng-container>
      <ng-container matColumnDef="description">
        <mat-header-cell *matHeaderCellDef> 简介 </mat-header-cell>
        <mat-cell *matCellDef="let row"> {{row.description}} </mat-cell>
      </ng-container>
      <ng-container matColumnDef="isTop">
        <mat-header-cell *matHeaderCellDef> 顶级英雄 </mat-header-cell>
        <mat-cell *matCellDef="let row"> {{row.isTop?'是':'否'}} </mat-cell>
      </ng-container>
      <mat-header-row *matHeaderRowDef="displayedColumns"></mat-header-row>
      <mat-row *matRowDef="let row; columns: displayedColumns;"
                [routerLink]="['/hero-detail/', row.id]"
                class="row-hover">
      </mat-row>
    </mat-table>
  </div>
</div>
```

修改 `hero-list.component.scss` 文件如下:

```css
.row-hover:hover {
  background-color: rgba(0, 0, 0, .05);
  cursor: pointer;
}
```

### 英雄详情组件

在 `hero-detail` 中，它必须等待路由激活, 然后才能去获取对应的英雄。

这种方式一般没有问题，但是如果你在使用真实 `api`，很有可能数据返回有延迟，导致无法即时显示。
在这种情况下，直到数据到达前，显示一个空的组件不是最好的用户体验(且浏览器控制台将出现`undefined`错误, 虽然最后得以成功显示)。

其次, 到该组件的转场动画将不会生效.

再者, 如果当前页面是**英雄详情**页面, 那么在搜索框中点击搜出的某个英雄本应导航到该英雄的详情页面(相同URL, 不同id), 但不会发生跳转!!!因为默认导航方式是: `onsameurlnavigation: ignore`, 而非 `reload` !

因此, 它还有进步的空间。

最好预先从服务器上获取完数据，这样在路由激活的那一刻数据就准备好了。
总之，你希望的是只有当所有必要数据都已经拿到之后，才渲染这个路由组件。

我们需要 `Resolve` 守卫。

使用`ng g s hero/hero-detail/hero-detail-resolver`命令在`hero-detail`目录下新建`hero-detail-resolver`服务文件如下:

```ts
import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot } from '@angular/router';
import { HeroService } from '../hero.service';
import { of, Observable } from 'rxjs';
import { take, switchMap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
// 实现 resolve() 方法。 该方法可以返回一个 Promise、一个 Observable 来支持异步方式，或者直接返回一个值来支持同步方式。
// heroService.getHeroById 方法返回一个可观察对象，以防止在数据获取完之前加载本路由。
// Router 守卫要求这个可观察对象必须可结束（complete），也就是说它已经发出了所有值。
// 你可以为 take 操作符传入一个参数 1，以确保这个可观察对象会在从 heroService.getHeroById 方法所返回的可观察对象中取到第一个值之后就会结束。
// 将取得的数据重新包装为Observable供 hero-detail 组件使用
export class HeroDetailResolverService implements Resolve<any> {
  constructor(private heroService: HeroService) {}
  resolve(activatedRouteSnapshot: ActivatedRouteSnapshot): Observable<any> {
    return this.heroService
      .getHeroById(activatedRouteSnapshot.paramMap.get('id'))
      .pipe(
        take(1),
        switchMap(data => of(data)),
      );
  }
}
```

更改英雄详情组件类文件`hero-detail.component.ts`如下:

```ts
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HeroService } from '../hero.service';
import { MatSnackBar } from '@angular/material';
import { Location } from '@angular/common';
import { Hero } from '../hero';

@Component({
  selector: 'app-hero-detail',
  templateUrl: './hero-detail.component.html',
  styleUrls: ['./hero-detail.component.scss'],
})
export class HeroDetailComponent implements OnInit {
  // 以前生成空的Hero对象, 由于取数据的延迟, 可能导致undefined错误
  // 现在使用resolve方式, 不存在该问题了
  hero: Hero;
  isLoading = true;
  constructor(
    private activatedRoute: ActivatedRoute,
    private location: Location,
    private heroService: HeroService,
    private snackBar: MatSnackBar,
  ) {}

  ngOnInit() {
    //该路由激活时已预取了某英雄的数据, 按路由模块中该路由的设定, 命名为result
    this.activatedRoute.data.subscribe(({ result }) => {
      this.hero = result.data.hero;
      this.isLoading = result.loading;
    });
  }

  deleteHero() {
    this.isLoading = true;
    this.heroService.deleteHero(this.hero.id).subscribe(() => {
      this.isLoading = false;
      this.snackBar.open(`${this.hero.name}成功删除!`, '关闭', {
        duration: 2000,
      });
      this.location.back();
    });
  }
}
```

更改英雄详情组件模板文件`hero-detail.component.html`如下:

```html
<div class="container mat-elevation-z4">
  <div class="loading-shade" *ngIf="isLoading">
    <mat-spinner *ngIf="isLoading"></mat-spinner>
  </div>
  <h2>
    <div style="text-align: center;">英雄详情</div>
  </h2>
  <mat-card class="card">
    <mat-card-header>
      <mat-card-title>
        <h2>{{hero.name}}-{{hero.no}}</h2>
      </mat-card-title>
      <mat-card-subtitle>
        薪水:{{hero.salary}} {{hero.isTop?"| 顶级英雄":""}}
      </mat-card-subtitle>
    </mat-card-header>
    <mat-card-content>
      <p>{{hero.description}}</p>
    </mat-card-content>
    <mat-card-actions style="text-align: center;">
      <span class="flat-button">
        <a mat-flat-button color="primary" [routerLink]="['/hero-edit/', hero.id]">
          <mat-icon>edit</mat-icon>编辑
        </a>
      </span>
      <span class="flat-button">
        <a mat-flat-button color="warn" (click)="deleteHero()">
          <mat-icon>delete</mat-icon>删除
        </a>
      </span>
    </mat-card-actions>
  </mat-card>
</div>
```

### 英雄编辑组件

编辑英雄使用了`material form`, 对表单数据进行了错误控制, 因此新建`hero/myErrorStateMatcher.ts`文件如下:

```ts
import { ErrorStateMatcher } from '@angular/material/core';
import { FormControl, FormGroupDirective, NgForm } from '@angular/forms';

export class MyErrorStateMatcher implements ErrorStateMatcher {
  isErrorState(
    control: FormControl | null,
    form: FormGroupDirective | NgForm | null,
  ): boolean {
    const isSubmitted = form && form.submitted;
    return !!(
      control &&
      control.invalid &&
      (control.dirty || control.touched || isSubmitted)
    );
  }
}
```

更改英雄编辑组件类文件`hero-edit.component.ts`如下:

```ts
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HeroService } from '../hero.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MyErrorStateMatcher } from '../myErrorStateMatcher';
import { Location } from '@angular/common';
import { MatSnackBar } from '@angular/material';

@Component({
  selector: 'app-hero-edit',
  templateUrl: './hero-edit.component.html',
  styleUrls: ['./hero-edit.component.scss'],
})
export class HeroEditComponent implements OnInit {
  heroForm: FormGroup;
  id = '';
  no = '';
  name = '';
  salary = 0;
  description = '';
  isTop = false;
  matcher = new MyErrorStateMatcher();
  isLoading = false;

  constructor(
    private activatedRoute: ActivatedRoute,
    private heroService: HeroService,
    private formBuilder: FormBuilder,
    private location: Location,
    private snackBar: MatSnackBar,
  ) {}

  ngOnInit() {
    this.heroForm = this.formBuilder.group({
      no: ['', Validators.required],
      name: ['', Validators.required],
      salary: [0],
      description: [''],
      isTop: [false],
    });
    this.heroService
      .getHeroById(this.activatedRoute.snapshot.paramMap.get('id'))
      .subscribe(({ data }) => {
        this.id = data.hero.id;
        this.heroForm.setValue({
          no: data.hero.no,
          name: data.hero.name,
          salary: data.hero.salary,
          description: data.hero.description,
          isTop: data.hero.isTop,
        });
      });
  }

  onFormSubmit() {
    this.isLoading = true;
    this.heroService.updateHero(this.id, this.heroForm.value).subscribe(() => {
      this.isLoading = false;
      this.snackBar.open(`${this.heroForm.value.name}保存成功!`, '关闭', {
        duration: 2000,
      });
      this.goBack();
    });
  }

  goBack() {
    this.location.back();
  }
}
```

更改英雄编辑组件模板文件`hero-edit.component.html`如下:

```html
<div class="container mat-elevation-z4">
  <div class="loading-shade" *ngIf="isLoading">
    <mat-spinner *ngIf="isLoading"></mat-spinner>
  </div>
  <h2>
    <div style="text-align: center;">编辑英雄</div>
  </h2>

  <mat-card class="card">
    <form [formGroup]="heroForm" (ngSubmit)="onFormSubmit()">
      <mat-form-field class="full-width">
        <input matInput placeholder="编号" formControlName="no"
               required [errorStateMatcher]="matcher">
        <mat-error>
          <span *ngIf="!heroForm.get('no').valid && heroForm.get('no').touched">
            请输入编号
          </span>
        </mat-error>
      </mat-form-field>
      <mat-form-field class="full-width">
        <input matInput placeholder="英雄姓名" formControlName="name"
               required [errorStateMatcher]="matcher">
        <mat-error>
          <span *ngIf="!heroForm.get('name').valid && heroForm.get('name').touched">
            英雄请留名
          </span>
        </mat-error>
      </mat-form-field>
      <mat-form-field class="full-width">
        <input type="number" min="0" matInput placeholder="薪水" formControlName="salary">
      </mat-form-field>
      <mat-form-field class="full-width">
        <textarea matInput placeholder="简介" formControlName="description"></textarea>
      </mat-form-field>
      <!-- 不能使用form-field包含checkbox!! -->
      <div class="full-width">
        <mat-checkbox formControlName="isTop" color="primary">顶级英雄?</mat-checkbox>
      </div>
      <div style="text-align: center;">
        <span class="flat-button">
          <button type="submit" [disabled]="!heroForm.valid"
                  mat-raised-button color="primary" matTooltip="保存英雄">
            <mat-icon>save</mat-icon>保 存
          </button>
        </span>
        <!-- 注意不能使用button, 一个form中只能有一个button!! -->
        <span class="flat-button">
          <a mat-raised-button color="warn" matTooltip="放弃" (click)="goBack()">
            <mat-icon>transit_enterexit</mat-icon>放 弃
          </a>
        </span>
      </div>
    </form>
  </mat-card>
</div>
```

更改英雄编辑组件样式文件`hero-edit.component.scss`如下:

```css
.form {
  min-width: 150px;
  max-width: 500px;
  width: 100%;
  display: flex;
  flex-direction: column;
}

.full-width {
  width: 100%;
}

.full-width:nth-last-child(0) {
  margin-bottom: 10px;
}
```

### 添加英雄组件

更改添加英雄组件类文件`hero-add.component.ts`如下:

```ts
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { HeroService } from '../hero.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material';
import { MyErrorStateMatcher } from '../myErrorStateMatcher';
import { Location } from '@angular/common';

@Component({
  selector: 'app-hero-add',
  templateUrl: './hero-add.component.html',
  styleUrls: ['./hero-add.component.scss'],
})
export class HeroAddComponent implements OnInit {
  heroForm: FormGroup;
  no = '';
  name = '';
  salary = 0;
  description = '';
  isTop = false;
  matcher = new MyErrorStateMatcher();
  isLoading = false;
  constructor(
    private router: Router,
    private heroService: HeroService,
    private formBuilder: FormBuilder,
    private snackBar: MatSnackBar,
    private location: Location,
  ) {}

  ngOnInit() {
    this.heroForm = this.formBuilder.group({
      no: ['', Validators.required],
      name: ['', Validators.required],
      salary: [0],
      description: [''],
      isTop: [false],
    });
  }

  onFormSubmit() {
    this.isLoading = true;
    this.heroService.addHero(this.heroForm.value).subscribe(({ data }) => {
      this.isLoading = false;
      this.snackBar.open(`${this.heroForm.value.name}添加成功!`, '关闭', {
        duration: 2000,
      });
      this.router.navigate(['/hero-detail', data.createHero.id]);
    });
  }

  goBack() {
    this.location.back();
  }
}
```

更改添加英雄组件模板文件`hero-add.component.html`如下:

```html
<div class="container mat-elevation-z4">
  <div class="loading-shade" *ngIf="isLoading">
    <mat-spinner *ngIf="isLoading"></mat-spinner>
  </div>
  <h2>
    <div style="text-align: center;">添加英雄</div>
  </h2>
  <mat-card class="card">
    <form [formGroup]="heroForm" (ngSubmit)="onFormSubmit()">
      <mat-form-field class="full-width">
        <input matInput placeholder="编号" formControlName="no" required [errorStateMatcher]="matcher">
        <mat-error>
          <span *ngIf="!heroForm.get('no').valid && heroForm.get('no').touched">请输入编号</span>
        </mat-error>
      </mat-form-field>
      <mat-form-field class="full-width">
        <input matInput placeholder="英雄姓名" formControlName="name" required [errorStateMatcher]="matcher">
        <mat-error>
          <span *ngIf="!heroForm.get('name').valid && heroForm.get('name').touched">英雄请留名</span>
        </mat-error>
      </mat-form-field>
      <mat-form-field class="full-width">
        <input type="number" min="0" matInput placeholder="薪水" formControlName="salary">
      </mat-form-field>
      <mat-form-field class="full-width">
        <textarea matInput placeholder="简介" formControlName="description"></textarea>
      </mat-form-field>
      <!-- 不能使用form-field包含checkbox!! -->
      <div class="full-width">
        <mat-checkbox formControlName="isTop" color="primary">顶级英雄?</mat-checkbox>
      </div>
      <div style="text-align: center;">
        <span class="flat-button">
          <button type="submit" [disabled]="!heroForm.valid" mat-raised-button color="primary" matTooltip="保存英雄">
            <mat-icon>save</mat-icon>保 存
          </button>
        </span>
        <span class="flat-button">
          <a mat-raised-button color="warn" matTooltip="放弃" (click)="goBack()">
            <mat-icon>transit_enterexit</mat-icon>放 弃
          </a>
        </span>
      </div>
    </form>
  </mat-card>
</div>
```

更改添加英雄组件样式文件`hero-add.component.scss`如下:

```css
.form {
  min-width: 150px;
  max-width: 500px;
  width: 100%;
  display: flex;
  flex-direction: column;
}

.full-width {
  width: 100%;
}

.full-width:nth-last-child(0) {
  margin-bottom: 10px;
}
```

### 顶级英雄组件

更改顶级英雄组件类文件`hero-top.component.ts`如下:

```ts
import { Component, OnInit } from '@angular/core';
import { HeroService } from '../hero.service';

@Component({
  selector: 'app-hero-top',
  templateUrl: './hero-top.component.html',
  styleUrls: ['./hero-top.component.scss'],
})
export class HeroTopComponent implements OnInit {
  topHeroes: Hero[] = [];
  isLoading = true;
  constructor(private heroService: HeroService) {}

  ngOnInit() {
    this.heroService.getTopHeroes().subscribe(({ data }) => {
      this.topHeroes = data.topHeroes;
      this.isLoading = false;
    });
  }
}
```

更改顶级英雄组件模板文件`hero-top.component.html`如下:

```html
<div class="container mat-elevation-z4">
  <div class="loading-shade" *ngIf="isLoading">
    <mat-spinner *ngIf="isLoading"></mat-spinner>
  </div>
  <h2>
    <div style="text-align:center">顶级英雄</div>
  </h2>
  <mat-grid-list cols="4" rowHeight="2:1">
    <mat-grid-tile *ngFor="let topHero of topHeroes">
      <mat-card [routerLink]="['/hero-detail', topHero.id]">
        <mat-card-header>
          <div mat-card-avatar class="hero-image"></div>
          <mat-card-title>{{topHero.name}}</mat-card-title>
          <mat-card-subtitle>$ {{topHero.salary}}</mat-card-subtitle>
        </mat-card-header>
      </mat-card>
    </mat-grid-tile>
  </mat-grid-list>
</div>
```

更改顶级英雄组件样式文件`hero-top.component.scss`如下:

```css
.mat-card {
  width: 80%;
  cursor: pointer;
}
.hero-image {
  background-image: url('https://material.angular.io/assets/img/examples/shiba1.jpg');
  background-size: cover;
}
```

### 查找英雄组件

更改查找英雄组件文件`hero-search.component.ts`如下:

```ts
import { Component, OnInit } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { HeroService } from '../hero.service';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';

@Component({
  selector: 'app-hero-search',
  templateUrl: './hero-search.component.html',
  styleUrls: ['./hero-search.component.scss'],
})
export class HeroSearchComponent implements OnInit {
  heroes: Hero[] = [];
  // Subject 既是可观察对象的数据源，本身也是 Observable。
  // 你可以像订阅任何 Observable 一样订阅 Subject。
  // 你还可以通过调用它的 next(value) 方法往 Observable 中推送一些值

  private searchTerms = new Subject<string>();

  constructor(private heroService: HeroService) {}
  // 每当用户在文本框中输入时，这个事件绑定就会使用文本框的值（搜索词）调用 search() 函数。
  // searchTerms 变成了一个能发出搜索词的稳定的流。
  search(term: string): void {
    this.searchTerms.next(term);
  }

  ngOnInit() {
    // 如果每当用户击键后就直接调用 heroService.searchHeroesByName将导致创建海量的 HTTP 请求，浪费服务器资源并消耗大量网络流量。
    // 往 searchTerms 这个可观察对象的处理管道中加入了一系列 RxJS 操作符, 缩减对 heroService.searchHeroesByName 的调用次数
    this.searchTerms
      .pipe(
        // 在传出最终字符串之前，debounceTime(300) 将会等待，直到新增字符串的事件暂停了 300 毫秒
        debounceTime(300),
        // 确保只在过滤词变化时才发送请求
        distinctUntilChanged(),
        // 为每个从 debounce 和 distinctUntilChanged 中通过的搜索词调用搜索服务。
        // 它会取消并丢弃以前的搜索可观察对象，只保留最近的
        switchMap((term: string) => this.heroService.searchHeroesByName(term)),
      )
      .subscribe(({ data }) => (this.heroes = data && data.searchHeroByName));
  }
}
```

更改查找英雄组件模板文件`hero-search.component.html`如下:

```html
<mat-form-field>
  <!-- (input)是该输入框的键入事件 -->
  <!-- [matAutocomplete]="heroName"与自动完成面板关联 -->
  <input matInput type="type" #searchBox placeholder="英雄大名"
        (input)="search(searchBox.value)"
        [matAutocomplete]="heroName" />
  <mat-autocomplete #heroName="matAutocomplete">
    <mat-option *ngFor="let hero of heroes"
                [routerLink]="[ '/hero-detail', hero.id ]">
      {{hero.name}}
    </mat-option>
  </mat-autocomplete>
</mat-form-field>
```

> 该组件我们已经添加到根组件的导航栏中了

## 前端运行

至此, 前端开发完毕. 如果应用没有运行, 请使用`ng serve -o`命令, 打开浏览器`localhost:4200`可进行**CRUD**操作.

## 前后端集成及运行

先终止前后端程序的运行.

### 编译前端

在`client`目录下运行`ng build --prod`后, 将生成`client/dist/client`目录, 该目录下即为前端的所有经过优化和压缩后的文件.

### 集成前端到后台

打开**Nestjs**项目下的`src/main.ts`文件, 修改如下:

```ts
import { NestFactory } from '@nestjs/core';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import { AppModule } from './app.module';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter(),
  );
  app.useStaticAssets({
    root: join(__dirname, '..', 'client/dist/client'),
    prefix: '/',
  });
  await app.listen(3000);
}
bootstrap();
```

## 运行

在**Nestjs**项目根目录下运行`yarn run start`即可打开浏览器`localhost:3000`看到项目的运行.

如果出现**404**, 可使用命令`ts-node -r tsconfig-paths/register src/main.ts`试试.

## 收工

---

## 改进记录

### 添加Search框

### 添加转场动画

### Resolve: 预先获取组件数据

在 `hero-detail` 中，它必须等待路由激活, 然后才能去获取对应的英雄。

这种方式一般没有问题，但是如果你在使用真实 `api`，很有可能数据返回有延迟，导致无法即时显示。
在这种情况下，直到数据到达前，显示一个空的组件不是最好的用户体验(且浏览器控制台将出现`undefined`错误, 虽然最后得以成功显示)。

其次, 到该组件的转场动画将不会生效.

再者, 如果当前页面是**英雄详情**页面, 那么在搜索框中点击搜出的某个英雄本应导航到该英雄的详情页面(相同URL, 不同id), 但不会发生跳转!!!因为默认导航方式是: `onsameurlnavigation: ignore`, 而非 `reload` !

因此, 它还有进步的空间。

最好预先从服务器上获取完数据，这样在路由激活的那一刻数据就准备好了。
总之，你希望的是只有当所有必要数据都已经拿到之后，才渲染这个路由组件。

我们需要 `Resolve` 守卫。在`hero-detail`目录下新建`hero-detail-resolver`服务文件.

实现 resolve() 方法。 该方法可以返回一个 Promise、一个 Observable 来支持异步方式，或者直接返回一个值来支持同步方式。

heroService.getHeroById 方法返回一个可观察对象，以防止在数据获取完之前加载本路由。

Router 守卫要求这个可观察对象必须可结束（complete），也就是说它已经发出了所有值。

你可以为 take 操作符传入一个参数 1，以确保这个可观察对象会在从 heroService.getHeroById 方法所返回的可观察对象中取到第一个值之后就会结束。

将取得的数据重新包装为Observable

将该服务导入hero-detail的路由中, 修改hero-detail组件获取数据的方式

### Apollo-angular Cache

### Guard 及 验证

### errors 处理

### Ngrx

### 图片


---

<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo_text.svg" width="320" alt="Nest Logo" /></a>
</p>

[travis-image]: https://api.travis-ci.org/nestjs/nest.svg?branch=master
[travis-url]: https://travis-ci.org/nestjs/nest
[linux-image]: https://img.shields.io/travis/nestjs/nest/master.svg?label=linux
[linux-url]: https://travis-ci.org/nestjs/nest
  
  <p align="center">A progressive <a href="http://nodejs.org" target="blank">Node.js</a> framework for building efficient and scalable server-side applications, heavily inspired by <a href="https://angular.io" target="blank">Angular</a>.</p>
    <p align="center">
<a href="https://www.npmjs.com/~nestjscore"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/~nestjscore"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
<a href="https://www.npmjs.com/~nestjscore"><img src="https://img.shields.io/npm/dm/@nestjs/core.svg" alt="NPM Downloads" /></a>
<a href="https://travis-ci.org/nestjs/nest"><img src="https://api.travis-ci.org/nestjs/nest.svg?branch=master" alt="Travis" /></a>
<a href="https://travis-ci.org/nestjs/nest"><img src="https://img.shields.io/travis/nestjs/nest/master.svg?label=linux" alt="Linux" /></a>
<a href="https://coveralls.io/github/nestjs/nest?branch=master"><img src="https://coveralls.io/repos/github/nestjs/nest/badge.svg?branch=master#5" alt="Coverage" /></a>
<a href="https://gitter.im/nestjs/nestjs?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=body_badge"><img src="https://badges.gitter.im/nestjs/nestjs.svg" alt="Gitter" /></a>
<a href="https://opencollective.com/nest#backer"><img src="https://opencollective.com/nest/backers/badge.svg" alt="Backers on Open Collective" /></a>
<a href="https://opencollective.com/nest#sponsor"><img src="https://opencollective.com/nest/sponsors/badge.svg" alt="Sponsors on Open Collective" /></a>
  <a href="https://paypal.me/kamilmysliwiec"><img src="https://img.shields.io/badge/Donate-PayPal-dc3d53.svg"/></a>
  <a href="https://twitter.com/nestframework"><img src="https://img.shields.io/twitter/follow/nestframework.svg?style=social&label=Follow"></a>
</p>
  <!--[![Backers on Open Collective](https://opencollective.com/nest/backers/badge.svg)](https://opencollective.com/nest#backer)
  [![Sponsors on Open Collective](https://opencollective.com/nest/sponsors/badge.svg)](https://opencollective.com/nest#sponsor)-->

## Description

[Nest](https://github.com/nestjs/nest) framework TypeScript starter repository.

## Installation

```bash
$ npm install
```

## Running the app

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Test

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## Support

Nest is an MIT-licensed open source project. It can grow thanks to the sponsors and support by the amazing backers. If you'd like to join them, please [read more here](https://docs.nestjs.com/support).

## Stay in touch

- Author - [Kamil Myśliwiec](https://kamilmysliwiec.com)
- Website - [https://nestjs.com](https://nestjs.com/)
- Twitter - [@nestframework](https://twitter.com/nestframework)

## License

  Nest is [MIT licensed](LICENSE).

// "graphql-codegen": "gql-gen --schema https://localhost:3000/graphql --template graphql-codegen-typescript-template --out ./src/app/graphql-types.ts \"./src/**/*.ts\""
Note: You are using the old API of graphql-code-generator. You can easily migrate by creating "codegen.yml" file in your project with the following content:
  
schema:
  - "https://localhost:3000/graphql"
documents:
  - "./src/**/*.ts"
config: {}
generates:
  ./src/app/graphql-types.ts:
    config: {}
    plugins:
      - "typescript-common"
      - "typescript-client"
      - "typescript-server"
require: []


  Then, make sure that your script is executing just "gql-gen" (without any cli flags).