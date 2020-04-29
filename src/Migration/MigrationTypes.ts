import { QueryParser } from "../ORMUtils";

export interface PC_Migration
{
    timeStamp:number,
    up:MigrationStepFunction,
    down:MigrationStepFunction,
}

export type MigrationStepFunction=()=> string | QueryParser;

