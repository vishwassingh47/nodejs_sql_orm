
import {SQLConfig,SQLCustomConnection,SQLPoolConnection,InsertResult,UpdateResult} from './MysqlUtils';
import {MySqlClient} from './MySqlClient';
import {DB_Instance} from './DB_Instance';


export declare namespace DBConnectionUtilI
{
    export
    {
        SQLCustomConnection,
        SQLPoolConnection,
        SQLConfig,
        InsertResult,
        UpdateResult
    }
}

export {MySqlClient,DB_Instance};

