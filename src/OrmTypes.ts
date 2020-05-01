export interface CreateEntry
{
    columnName: string,
    type: SQLTypes,
    isNull: boolean,
    isPrimaryKey?: boolean | false,
    isAutoIncrement?: boolean | undefined,
    isUnique?: boolean | undefined,
    default?: any | undefined,
    maxSize?: number | undefined,
    enumObj?: Object | undefined,
    decimalPoints?: number | undefined,
    check?: { op: '=' | '<=' | '>=' | '>' | '<', value: any }
}

export type C = CreateEntry[];


export interface IndexEntry
{
    indexType:"INDEX"|"UNIQUE",
    indexName:string,
    columnsList:string[]
}

export type CI=IndexEntry[];

export enum SQLTypes
{
    INT = "INT",
    VARCHAR = "VARCHAR",
    BIGINT = "BIGINT",
    ENUM = "ENUM",
    DOUBLE = "DOUBLE",
    BOOLEAN = "BOOLEAN",
    TEXT = "TEXT"
};


export interface PC_ORM_Config
{
    disableDefaultTimeStamp: boolean,
    disableDefaultPk: boolean
}

export enum ORM_DEFAULT_COLUMNS
{
    _createdAt = "_createdAt",
    _updatedAt = "_updatedAt",
    _id = "_id"
}

export type addMinus = "+" | "-";

export type InsertEntry = [string, any];
export type I = InsertEntry[];

export type UpdateEntry = [string, any, addMinus?];
export type U = UpdateEntry[];

export type OrderEntry = [string, 'DESC' | 'ASC'];
export type O = OrderEntry[];



export type OP = '=' | '<' | '>' | '>=' | '<=' | 'IN' | 'NOT IN' | '!=';

export type WhereEntry1 = '(' | ')' | 'AND' | 'OR';
export interface WhereEntry2
{
    colName: string,
    value: any,
    op?: OP
};
export type W = Array<WhereEntry1 | WhereEntry2>;

export type SELECT = '*' | string | string[];

export interface QueryParser
{
    query: string,
    params: any[]
}

export interface ExtendedSelect
{
    rows: any | any[],
    totalRecordsCount: number,
    totalPages: number,
    hasMore: boolean,
}
