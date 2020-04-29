import * as mysql from 'mysql';


export interface SQLCustomConnection extends mysql.PoolConnection { }

export interface SQLPoolConnection extends mysql.Pool { }

export interface InsertResult
{
    insertId: number
}

export interface UpdateResult
{
    affectedRows: number,//affectedRows by default will be the found (matched) rows
    changedRows: number,//rows with actual changed data,
    message: string, //'(Rows matched: 1  Changed: 0  Warnings: 0'
}

export interface SQLConfig
{
    port:number,
    host:string,
    password:string,
    database:string,
    user:string,
    poolSize?:number
}


export function isCheckConsraintError(err:any)
{
    if (err && err.errno == DB_ERROR_CODES.CHECK_CONSTRAINT_ERROR_CODE)
    {
       return true;
    }
    return false;
}

export function isDuplicateError(err:any)
{
    if (err && err.errno == DB_ERROR_CODES.DATABASE_DUPLICATE_ERROR_CODE)
    {
        return true;
    }
     return false;
}

const DB_ERROR_CODES=
{
    DATABASE_DUPLICATE_ERROR_CODE : 1062,
    CHECK_CONSTRAINT_ERROR_CODE: 3819
}