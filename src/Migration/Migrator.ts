import * as mysql from 'mysql';
import { DBConnectionUtilI, MySqlClient } from '../SqlClient';
import { PC_Migration } from './MigrationTypes';
import * as migrationTable from './MigrationTable';

export function makeCommand(command:"up"|"down",migrationList:PC_Migration[],client:MySqlClient):Promise<void>
{
    return new Promise(async (resolve, reject) =>
    {
        let connection:DBConnectionUtilI.SQLCustomConnection|undefined;
        try
        {
            const orm = await migrationTable.init(client);
            const lastTimeStamp:number=await migrationTable.getLastTimeStamp(orm);
            validateMigrationList(migrationList);
            connection= await client.getConnectionAndBeginTransaction();

          
            let count:number,startIndex:number;
            switch(command)
            {
                case "up":
                startIndex=getUpIndex(migrationList,lastTimeStamp);
                count= startIndex==-1 ? 0 : migrationList.length - startIndex ;
                console.log(`Found ${count} up migrations to Do`);

                while(--count>=0)
                {
                    const script= migrationList[startIndex++];

                    let upScript = script.up();
                    const upScriptStr:string= typeof upScript=="string" ? upScript : mysql.format(upScript.query,upScript.params);
                    await client.runQuery(upScriptStr,[],connection);
                    await migrationTable.upMigrate(orm,script.timeStamp,connection);
    
                    console.log(`${count} more up migrations remaining`);
                };
                break;

                case "down":
                startIndex=getDownIndex(migrationList,lastTimeStamp);
                count= startIndex+1;
                console.log(`Found ${count} down migrations to Do`);

                while(--count>=0)
                {
                    const script= migrationList[startIndex--];
    
                    let upScript = script.down();
                    const upScriptStr:string= typeof upScript=="string" ? upScript : mysql.format(upScript.query,upScript.params);
                    await client.runQuery(upScriptStr,[],connection);
                    await migrationTable.downMigrate(orm,script.timeStamp,connection);
    
                    console.log(`${count} more down migrations remaining`);
                };
                break;
            }

            await client.commit(connection);
            resolve();
        }
        catch(e)
        {
            if(connection)
            {
                await client.rollback(connection);
            }
            reject(e);
        }
        finally
        {
            if(connection)
            {
                connection.release();
            }
        }
    });
}


export function validateMigrationList(migrationList:PC_Migration[])
{
    let temp=0;

    for(let i=0;i<migrationList.length;++i)
    {
        const script=migrationList[i];

        if(script.timeStamp<=temp)
        {
            throw new Error(`Migration Script Validation Failed,Must be in strictly ASC order of timeStamp`);
        }
        temp=script.timeStamp;
    }
    console.log('Migration List validated');
}

function getUpIndex(migrationList:PC_Migration[],lastTimeStampDb:number):number
{
    for(let i=0;i<migrationList.length;++i)
    {
        const script=migrationList[i];
        if(script.timeStamp>lastTimeStampDb)
        {
            return i;
        }
    }
    return -1;
}

function getDownIndex(migrationList:PC_Migration[],lastTimeStampDb:number):number
{
    for(let i=0;i<migrationList.length;++i)
    {
        const script=migrationList[i];
        if(script.timeStamp>lastTimeStampDb)
        {
            return i - 1;
        }
    }
    return migrationList.length - 1 ;
};