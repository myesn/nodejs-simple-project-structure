import { Document } from "bson";
import { ClientSession, FindOptions, ObjectId } from "mongodb";
import { toClient, toDb, toCollection } from "../store";
import { mongodbUtils } from "../utils";
import { PagingResult } from "../project";

export default class CommonService<TEntity = any> {
  constructor(protected collectionName: string) {}

  async getClient() {
    return await toClient();
  }

  async getDb() {
    return await toDb();
  }

  async getCollection(collectionName?: string) {
    return await toCollection(collectionName ?? this.collectionName);
  }

  async paging(
    filter: Document,
    options?: FindOptions
  ): Promise<PagingResult<TEntity>> {
    const collection = await this.getCollection();
    const total = await collection.countDocuments(filter);
    const rows = await collection.find(filter, options).toArray();
    const items = rows.map((row) => <any>this.mapRowId(row));

    return {
      total,
      items,
    };
  }

  async list(filter?: Document, options?: FindOptions): Promise<TEntity[]> {
    const collection = await this.getCollection();
    const rows = await collection.find(filter ?? {}, options).toArray();

    return rows.map((row) => <any>this.mapRowId(row));
  }

  async count(filter?: Document): Promise<number> {
    const collection = await this.getCollection();
    return await collection.countDocuments(filter ?? {});
  }

  async exists(filter?: Document): Promise<boolean> {
    const count = await this.count(filter);
    return count > 0;
  }

  async existsById(id: string | ObjectId): Promise<boolean> {
    const count = await this.count({ _id: mongodbUtils.objectId(id) });
    return count > 0;
  }

  async existsExcludeId(
    id: string | ObjectId,
    filter?: Document
  ): Promise<boolean> {
    const excludeId = {
      _id: {
        $ne: mongodbUtils.objectId(id),
      },
    };
    const filterFinally = filter ? { ...excludeId, ...filter } : excludeId;
    const count = await this.count(filterFinally);

    return count > 0;
  }

  async find(filter: Document, options?: FindOptions): Promise<TEntity | null> {
    const collection = await this.getCollection();
    const row = await collection.findOne(filter, options);
    if (!row) {
      return null;
    }

    return <any>this.mapRowId(row);
  }

  async findById(
    id: string | ObjectId,
    options?: FindOptions
  ): Promise<TEntity | null> {
    const collection = await this.getCollection();
    const row = await collection.findOne(
      {
        _id: mongodbUtils.objectId(id),
      },
      options
    );
    if (!row) {
      return null;
    }

    return <any>this.mapRowId(row);
  }

  async getSingleFieldValueById(
    id: string | ObjectId,
    fieldName: string,
    fileValue?: string
  ) {
    const row = await this.findById(id, {
      projection: {
        [fieldName]: fileValue ?? 1,
      },
    });

    if (!row) {
      throw new Error("未能根据 ID 查找到数据");
    }

    return (<any>row)[fieldName];
  }

  async create(
    body: { [key: string]: any },
    options: {
      autoAddCreateTime?: boolean;
      session?: ClientSession;
    } = { autoAddCreateTime: true }
  ): Promise<ObjectId> {
    const collection = await this.getCollection();

    if (options.autoAddCreateTime) {
      body.createTime = new Date();
    }

    const result = await collection.insertOne(body, {
      session: options.session,
    });

    return result.insertedId;
  }

  async createMany(
    bodyArray: { [key: string]: any }[],
    options: {
      autoAddCreateTime?: boolean;
      session?: ClientSession;
    } = { autoAddCreateTime: true }
  ): Promise<void> {
    const collection = await this.getCollection();

    if (options.autoAddCreateTime) {
      const now = new Date();
      bodyArray.forEach((body) => {
        body.createTime = now;
      });
    }

    await collection.insertMany(bodyArray, { session: options.session });
  }

  async updateById(
    id: string | ObjectId,
    update: { [key: string]: any },
    options: {
      autoAddUpdateTime?: boolean;
      session?: ClientSession;
    } = { autoAddUpdateTime: true }
  ): Promise<void> {
    const collection = await this.getCollection();

    if (options.autoAddUpdateTime) {
      update.updateTime = new Date();
    }

    await collection.updateOne(
      { _id: mongodbUtils.objectId(id) },
      {
        $set: update,
      },
      {
        session: options.session,
      }
    );
  }

  async deleteById(
    id: string | ObjectId,
    options: {
      session?: ClientSession;
    } = {}
  ): Promise<void> {
    const collection = await this.getCollection();
    await collection.deleteOne(
      { _id: mongodbUtils.objectId(id) },
      { session: options.session }
    );
  }

  mapRowId(row: any): { id: ObjectId; [key: string]: any } {
    const { _id, ...props } = row;
    return {
      id: _id,
      ...props,
    };
  }
}
