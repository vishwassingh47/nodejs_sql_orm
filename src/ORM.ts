import { MySqlClient, DBConnectionUtilI } from "./SqlClient";
import { ORMUtils} from "./ORMUtils";
import {C, ORM_DEFAULT_COLUMNS, SQLTypes, QueryParser, I, U, W, SELECT, O, CreateEntry, WhereEntry1, WhereEntry2, ExtendedSelect, CI } from "./OrmTypes";

import * as mysql from 'mysql';

export class PC_ORM
{
    private client: MySqlClient;
    private tableName:string;
    private ormUtils:ORMUtils;
    
    constructor(client: MySqlClient,tableName:string)
    {
        this.client = client;
        this.tableName= tableName;
        this.ormUtils=new ORMUtils();
    }

    public create(columns:C,indexesList:CI,skipIfExist?:boolean,dbConnection?: DBConnectionUtilI.SQLCustomConnection): Promise<void>
    {
        return new Promise(async (resolve, reject) =>
        {
            try
            {
                const queryParser= this.ormUtils.create(this.tableName,columns,indexesList,skipIfExist);
                const rows = await this.client.runQuery(queryParser.query,queryParser.params, dbConnection);
                resolve();
            }
            catch (e)
            {
                reject(e);
            }
        });
    }

    public checkIfExist(whereList:W, dbConnection?: DBConnectionUtilI.SQLCustomConnection): Promise<boolean>
    {
        return new Promise(async (resolve, reject) =>
        {
            try
            {
                const queryParser= this.ormUtils.checkIfExist(this.tableName,whereList);
                const rows = await this.client.runQuery(queryParser.query,queryParser.params, dbConnection);
                resolve(rows[0].c > 0);
            }
            catch (e)
            {
                reject(e);
            }
        });
    }

    public insert(fieldAndValueArray:I, dbConnection?: DBConnectionUtilI.SQLCustomConnection): Promise<DBConnectionUtilI.InsertResult>
    {
        return new Promise(async (resolve, reject) =>
        {
            try
            {
                const queryParser= this.ormUtils.insert(this.tableName,fieldAndValueArray);
                const insertResult: DBConnectionUtilI.InsertResult = await this.client.runQuery(queryParser.query, queryParser.params, dbConnection);
                resolve(insertResult);
            }
            catch (e)
            {
                reject(e);
            }
        });
    }

    public update(fieldAndValueToUpdateArray: U, whereList: W, dbConnection?: DBConnectionUtilI.SQLCustomConnection): Promise<DBConnectionUtilI.UpdateResult>
    {
        return new Promise(async (resolve, reject) =>
        {
            try
            {
                const queryParser= this.ormUtils.update(this.tableName,fieldAndValueToUpdateArray,whereList);
                const updateResult: DBConnectionUtilI.UpdateResult = await this.client.runQuery(queryParser.query, queryParser.params, dbConnection);
                resolve(updateResult);
            }
            catch (e)
            {
                reject(e);
            }
        });
    }

    public mustUpdateOne(primaryKey:number,fieldAndValueToUpdateArray: U, whereList: W, dbConnection?: DBConnectionUtilI.SQLCustomConnection): Promise<void>
    {
        return new Promise(async (resolve, reject) =>
        {
            try
            {
                if(whereList.length>0)
                {
                    whereList.push("AND")
                }

                whereList.push({colName:ORM_DEFAULT_COLUMNS._id,value:primaryKey});

                const queryParser= this.ormUtils.update(this.tableName,fieldAndValueToUpdateArray,whereList);
                console.log("queryParser==::::2", queryParser)
                const updateResult: DBConnectionUtilI.UpdateResult = await this.client.runQuery(queryParser.query, queryParser.params, dbConnection);
                console.log("updateResult===::::::::1", updateResult);
                if(updateResult.changedRows===1)
                resolve();
                else
                {
                   reject({message:'mustUpdateOne Failed',sqlQuery:mysql.format(queryParser.query,queryParser.params)});
                }
            }
            catch (e)
            {
                reject(e);
            }
        });
    }

    public delete(whereList: W, dbConnection?: DBConnectionUtilI.SQLCustomConnection): Promise<DBConnectionUtilI.UpdateResult>
    {
        return new Promise(async (resolve, reject) =>
        {
            try
            {
                const queryParser= this.ormUtils.delete(this.tableName,whereList);
                const updateResult: DBConnectionUtilI.UpdateResult = await this.client.runQuery(queryParser.query, queryParser.params, dbConnection);
                resolve(updateResult);
            }
            catch (e)
            {
                reject(e);
            }
        });
    }

    public select(selectQuery:SELECT, whereList: W,orderByList:O,dbConnection?: DBConnectionUtilI.SQLCustomConnection|undefined,pageNumber?:number|undefined,pageSize?:number|undefined): Promise<any[] | any>
    {
        return new Promise(async (resolve, reject) =>
        {
            try
            {
                const queryParser= this.ormUtils.select(this.tableName,selectQuery,whereList,orderByList,pageNumber,pageSize);
                const rows = await this.client.runQuery(queryParser.query,queryParser.params, dbConnection);
                resolve(rows);
            }
            catch (e)
            {
                reject(e);
            }
        });
    }
    public extendedSelect(selectQuery:SELECT, whereList: W,orderByList:O,pageNumber:number,pageSize:number,isCountRequired?:boolean|undefined,dbConnection?: DBConnectionUtilI.SQLCustomConnection|undefined): Promise<ExtendedSelect>
    {
        return new Promise(async (resolve, reject) =>
        {
            try
            {
                const queryParser= this.ormUtils.select(this.tableName,selectQuery,whereList,orderByList,pageNumber,pageSize+1);
                const rows:any[] = await this.client.runQuery(queryParser.query,queryParser.params, dbConnection);

                let result:ExtendedSelect=
                {
                    hasMore:false,
                    rows,
                    totalRecordsCount:0,
                    totalPages:0
                };

                if(result.rows.length===pageSize+1)
                {
                    result.rows.pop();
                    result.hasMore=true;
                }

                if(isCountRequired)
                {
                    const queryParser2= this.ormUtils.select(this.tableName,`COUNT(*) as c`,whereList,[]);
                    const rows2:any[] = await this.client.runQuery(queryParser2.query,queryParser2.params, dbConnection);

                    result.totalRecordsCount= rows2.length;
                    result.totalPages=Math.ceil(result.totalRecordsCount/pageSize);
                }

                resolve(result);
            }
            catch (e)
            {
                reject(e);
            }
        });
    }


    

    public mustSelectOne(primaryKey:number,selectQuery:SELECT, whereList: W,orderByList:O, dbConnection?: DBConnectionUtilI.SQLCustomConnection): Promise<any[]>
    {
        return new Promise(async (resolve, reject) =>
        {
            try
            {
                if(whereList.length>0)
                {
                    whereList.push("AND")
                }
                whereList.push({colName:ORM_DEFAULT_COLUMNS._id,value:primaryKey});
                
                const queryParser= this.ormUtils.select(this.tableName,selectQuery,whereList,orderByList);
                const rows = await this.client.runQuery(queryParser.query,queryParser.params, dbConnection);

                if(rows.length==0)
                reject({message:'mustSelectOne Failed',sqlQuery:mysql.format(queryParser.query,queryParser.params)});
                else
                resolve(rows);
            }
            catch (e)
            {
                reject(e);
            }
        });
    }
}