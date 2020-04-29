import { DB_Instance } from "./DB_Instance";
import * as mysqlUtils from './MysqlUtils';
import * as mysql from 'mysql';


export class MySqlClient
{
    private db_instance: DB_Instance;

    constructor(i: DB_Instance)
    {
        this.db_instance = i;
    }

    public getConnection(): Promise<mysqlUtils.SQLCustomConnection>
    {
        return new Promise((resolve, reject) =>
        {
            const pool = this.db_instance.getPool();
            pool.getConnection(function (err, connection)
            {
                if (err)
                {
                    reject(err);
                }
                else
                {
                    resolve(connection);
                }
            })
        })
    }

    public getConnectionAndBeginTransaction(): Promise<mysqlUtils.SQLCustomConnection>
    {
        return new Promise((resolve, reject) =>
        {
            const pool = this.db_instance.getPool();
            pool.getConnection(function (err, connection)
            {
                if (err)
                {
                    reject(err);
                    return;
                }
                connection.beginTransaction((err: mysql.MysqlError) =>
                {
                    if (err)
                    {
                        connection.release();
                        reject("Failed to begin Transaction,err:" + err);
                    }
                    else
                    {
                        resolve(connection);
                    }
                })
            })
        })
    }

    public runQuery(query: string, params: Array<string | number | boolean>, dbConnection?: mysqlUtils.SQLCustomConnection): Promise<any>
    {
        return new Promise((resolve, reject) =>
        {
            try 
            {
                const START = Date.now();
                const QUERY = (dbConnection ? dbConnection : this.db_instance.getPool()).query(query, params, function (err: any, rows)
                {
                    const END = Date.now();
                    let txnConnectionId=``;
                    if(dbConnection)
                    {
                        txnConnectionId=`,txnConnectionId:${dbConnection.threadId}`;
                    }
                    console.log(`Query :  ${QUERY.sql} , ${(END-START)} ms =${txnConnectionId}`);
                    if (err)
                    {
                        console.error(`runQuery ERROR`, err);
                        reject(err);
                    }
                    else
                    {
                        resolve(rows);
                        return
                    }
                })

            }
            catch (error)
            {
                reject(error);
            }
        })
    }

    public commit(connection: mysqlUtils.SQLCustomConnection): Promise<void>
    {
        return new Promise((resolve, reject) =>
        {
            connection.commit((err) =>
            {
                if (err)
                {
                    reject(err);
                }
                else
                {
                    resolve();
                }
            })
        });
    }
    
    /***
     * It will always resolve
     */
    public rollback(connection: mysqlUtils.SQLCustomConnection): Promise<void>
    {
        return new Promise((resolve, reject) =>
        {
            connection.rollback((err) =>
            {
                if (err)
                {
                    console.error("Error in Rollback", err);
                }
                resolve();
            })
        });
    }
}