import { QueryParser } from "../OrmTypes";

export interface PC_Migration
{
    timeStamp:number,
    up:MigrationStepFunction,
    down:MigrationStepFunction,
}

export type MigrationStepFunction=()=> string | QueryParser;

