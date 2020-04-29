
import * as mysql from 'mysql';
import { SQLConfig } from './MysqlUtils';


export class DB_Instance
{
    private pool:mysql.Pool|undefined;

    public initialise(config:SQLConfig):Promise<undefined>
    {
        return new Promise((resolve, reject) =>
        {
            console.log(`Initailising MySql`,config);
            const { port, host, password,user,database,poolSize}= config;

            if(this.pool)
            {
                reject("Pool is already initailzed");
                return;
            }

            this.pool= mysql.createPool(
            {
                host,
                user,
                password,
                database,
                port,
                multipleStatements: true,
                connectionLimit: poolSize || 10
            });

            this.pool.getConnection((err,connection)=>
            {
                if(err)
                {
                    reject(err);
                }
                else
                {
                    connection.release();
                    resolve();
                }
            });

            this.pool.on('acquire', function (connection) {
                // console.log('Connection %d acquired', connection.threadId);
            });
            
            /**
            * The pool will emit a release event when a connection is released back to the pool.
            */
            this.pool.on('release', function (connection) {
                console.log('Connection %d released', connection.threadId);
            });
            
            /**
            * The pool will emit an enqueue event when a callback has been queued to wait for an available connection.
            */
            this.pool.on('enqueue', function () {
                console.log('Waiting for available connection slot');
            });
            
            /**
            * The pool will emit a connection event when a new connection is made within the pool.
            */
            this.pool.on('connection', function (connection) {
                // console.log('New connection is created bt the pool');
            });
        })
    }

    public getPool():mysql.Pool
    {
        if(!this.pool)
        {
            throw new Error("Sql Pool not yet initailsed");
        }
        return this.pool;
    }
}