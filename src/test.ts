import {I,CI,U,C,W, QueryParser} from './OrmTypes';
import {ORMUtils} from './ORMUtils';
import * as mysql from 'mysql';

let ormUtils=new ORMUtils();



const testCases:QueryParser[]=
[
    ormUtils.create("table1",[],
    [
        {indexType:'INDEX',indexName:"index1",columnsList:["name","age"]},
        {indexType:'UNIQUE',indexName:"index2",columnsList:["score"]}
    ],true),
];


let i=0;
for(let tc of testCases)
{
    console.log(`TEST ${i++} of ${testCases.length}`);
    console.log(mysql.format(tc.query,tc.params));
    console.log('');
};