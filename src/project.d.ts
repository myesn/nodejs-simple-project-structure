// import { Document } from "bson";
// import {
//   Filter,
//   FindOptions,
//   ObjectId,
//   OptionalUnlessRequiredId,
//   UpdateFilter,
// } from "mongodb";
//
// declare interface Service {
//   list(filter: Filter<Document>, options?: FindOptions): Promise<Document[]>;
//
//   findById(id: string | ObjectId): Promise<Document | null>;
//
//   create(body: OptionalUnlessRequiredId<Document>): Promise<void>;
//
//   updateById(
//     id: string | ObjectId,
//     update: UpdateFilter<Document> | Partial<Document>
//   ): Promise<void>;
//
//   deleteById(id: string | ObjectId): Promise<void>;
// }
//
// declare interface Controller {}

import Koa from "koa";
import { ObjectSchema } from "joi";

declare type DefaultSchema = {
  find?: ObjectSchema;
  create?: ObjectSchema;
  update?: ObjectSchema;
  delete?: ObjectSchema;
};

declare type PagingParam = {
  skip: number;
  limit: number;
};

declare type PagingResult<TEntity> = {
  total: number;
  items: TEntity[];
};

declare type MongoDBAggregationLookupStage = {
  /** 指定要执行联接的同一数据库中的集合 */
  from: string;
  /** 当前集合中的字段名称 */
  localField: string;
  /** from 集合中的字段名称 */
  foreignField: string;
  /** 输出的数组字段名称 */
  as: string;
};

declare type MongoDBAggregationMapOperator = {
  /** 解析为数组的表达式 */
  input: string;
  /** 可选的。表示输入数组中每个单独元素的变量的名称。如果没有指定名称，变量名默认为 this */
  as?: string;
  /** 应用于输入数组的每个元素的表达式。该表达式使用 as 中指定的变量名称单独引用每个元素 */
  in: Document;
};

declare interface KoaCustomAppStateUser {
  id: ObjectId;
}

// https://stackoverflow.com/questions/43160598/adding-properties-to-koa2s-context-in-typescript
declare interface KoaCustomAppState {
  user: KoaCustomAppStateUser;
}

declare interface KoaCustomAppContext extends Koa.ExtendableContext {
  state: KoaCustomAppState;
}

