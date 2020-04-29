import {SQLTypes} from '../ORMUtils';

import { MySqlClient, DBConnectionUtilI } from '../SqlClient';
import { PC_ORM } from '../ORM';

const F=
{
    lastTime:"lastTime"
}

const MigrationTableName:string="PcplMigRatIoNtAbLekuchbhi";


export function init(client:MySqlClient):Promise<PC_ORM>
{
    return new Promise(async (resolve, reject) =>
    {
        try
        {
            const orm:PC_ORM=new PC_ORM(client,MigrationTableName);
            await orm.create(
            [
                {
                    columnName:F.lastTime,
                    type:SQLTypes.BIGINT,
                    isNull:false,
                    maxSize:20,
                    isUnique:true,
                }
            ],true);

            resolve(orm);
        }
        catch(e)
        {
            reject(e);
        }
    });
}


export function getLastTimeStamp(orm:PC_ORM):Promise<number>
{
    return new Promise(async (resolve, reject) =>
    {
        try
        {
            const rows=await orm.select(`MAX(${F.lastTime}) as lastId`,[],[]);
            console.log(`Last Migration Time Found is:${rows[0].lastId || 0}`);

            resolve(rows[0].lastId || 0);           
        }
        catch(e)
        {
            reject(e);
        }
    });
}



export function upMigrate(orm:PC_ORM,timeStamp:number,dbConnection:DBConnectionUtilI.SQLCustomConnection):Promise<void>
{
    return new Promise(async (resolve, reject) =>
    {
        try
        {
            const rows=await orm.insert([[F.lastTime,timeStamp]],dbConnection);
            resolve();
        }
        catch(e)
        {
            reject(e);
        }
    });
}


export function downMigrate(orm:PC_ORM,timeStamp:number,dbConnection:DBConnectionUtilI.SQLCustomConnection):Promise<void>
{
    return new Promise(async (resolve, reject) =>
    {
        try
        {
            const rows=await orm.delete([{colName:F.lastTime,value:timeStamp}],dbConnection);
            resolve();
        }
        catch(e)
        {
            reject(e);
        }
    });
}
