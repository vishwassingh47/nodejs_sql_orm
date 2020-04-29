
export interface CreateColumn
{
    columnName: string,
    type: SQLTypes,
    isNull: boolean,
    isPrimaryKey?: boolean | false,
    isAutoIncrement?: boolean | undefined,
    isUnique?: boolean | undefined,
    default?: any | undefined,
    maxSize?: number | undefined,
    enumObj?: Object | undefined,
    decimalPoints?: number | undefined,
    check?: { op: '=' | '<=' | '>=' | '>' | '<', value: any }
}

export enum SQLTypes
{
    INT = "INT",
    VARCHAR = "VARCHAR",
    BIGINT = "BIGINT",
    ENUM = "ENUM",
    DOUBLE = "DOUBLE",
    BOOLEAN = "BOOLEAN",
    TEXT = "TEXT"
};


export interface PC_ORM_Config
{
    disableDefaultTimeStamp: boolean,
    disableDefaultPk: boolean
}

export enum ORM_DEFAULT_COLUMNS
{
    _createdAt = "_createdAt",
    _updatedAt = "_updatedAt",
    _id = "_id"
}

export interface X
{
    columnName: string,
    value: any
}

type addMinus="+"|"-";
export type Y = [string, any];
export type U = [string, any,addMinus?];
export type Z = [string, 'DESC' | 'ASC'];
export type WHERE1 = '(' | ')' | 'AND' | 'OR';
export type OP = '=' | '<' | '>' | '>=' | '<=' | 'IN'| 'NOT IN' | '!=';
export interface WHERE2
{
    colName: string,
    value: any,
    op?: OP
};
export type WHERE_LIST = Array<WHERE1 | WHERE2>;
export type SELECT = '*' | string | string[];


export interface QueryParser
{
    query: string,
    params: any[]
}

export interface ExtendedSelect
{
    rows: any | any[],
    totalRecordsCount: number,
    totalPages: number,
    hasMore: boolean,
}


export class ORMUtils
{
    private config: PC_ORM_Config;

    constructor(config?: PC_ORM_Config)
    {
        if (config)
        {
            this.config = config;
        }
        else
        {
            this.config =
            {
                disableDefaultPk: false,
                disableDefaultTimeStamp: false
            }
        }
    }

    public create(tableName: string, columns: CreateColumn[], skipIfExist?: boolean): QueryParser
    {
        if (!this.config.disableDefaultPk)
        {
            columns.push({ columnName: ORM_DEFAULT_COLUMNS._id, type: SQLTypes.BIGINT, isNull: false, maxSize: 20, isPrimaryKey: true, isAutoIncrement: true });
        }

        if (!this.config.disableDefaultTimeStamp)
        {
            columns.push({ columnName: ORM_DEFAULT_COLUMNS._createdAt, type: SQLTypes.BIGINT, isNull: false, maxSize: 20 });
            columns.push({ columnName: ORM_DEFAULT_COLUMNS._updatedAt, type: SQLTypes.BIGINT, isNull: false, maxSize: 20 });
        }

        let pkStr: string = '';

        let colStr = '';
        for (let col of columns)
        {
            if (colStr.length > 0)
            {
                colStr += ',';
            }
            colStr += getColumnString(col);


            if (col.isPrimaryKey)
            {
                if (pkStr)
                {
                    throw new Error('Cannot have multiple primary keys');
                }
                pkStr = ` ,PRIMARY KEY (${col.columnName}) `;
            }
        }


        const query = skipIfExist ? `CREATE TABLE IF NOT EXISTS ${tableName} ( ${colStr} ${pkStr} )` : `CREATE TABLE ${tableName} ( ${colStr} ${pkStr} )`;

        return { query, params: [] };
    }

    public checkIfExist(tableName: string, fieldAndValueArray: Array<X>): QueryParser
    {
        let s = ``;
        const params = [];
        for (let i of fieldAndValueArray)
        {
            if (s.length > 0)
            {
                s += ' AND '
            }
            s += `${i.columnName} = ?`
            params.push(i.value)
        }
        const query = `SELECT count(*) AS c from ${tableName} WHERE ${s}`;

        return { query, params }
    }

    public insert(tableName: string, fieldAndValueArray: Array<Y>): QueryParser
    {
        if (!this.config.disableDefaultTimeStamp)
        {
            const createdAt = Date.now();
            fieldAndValueArray.push([ORM_DEFAULT_COLUMNS._createdAt, createdAt]);
            fieldAndValueArray.push([ORM_DEFAULT_COLUMNS._updatedAt, createdAt]);
        }

        let s = '', q = '';
        const params = [];
        for (let i of fieldAndValueArray)
        {
            if (s.length > 0)
            {
                s += ','
                q += ',';
            }
            s += i[0];
            q += '?';
            params.push(i[1])
        };

        const query = `INSERT INTO ${tableName} (${s}) VALUES (${q})`;

        return { query, params };
    }

    public update(tableName: string, fieldAndValueToUpdateArray: Array<U>, whereList: WHERE_LIST): QueryParser
    {
        if (!this.config.disableDefaultTimeStamp)
        {
            fieldAndValueToUpdateArray.push([ORM_DEFAULT_COLUMNS._updatedAt, Date.now()]);
        }
        const params: any[] = [];
        let s = '';
        for (let i of fieldAndValueToUpdateArray)
        {
            if (s.length > 0)
            {
                s += ','
            }
            if(i[2])
            {
                s += ` ${i[0]} = ${i[0]} ${i[2]} ?`;
            }
            else
            {
                s += i[0] + " = ?";
            }
            params.push(i[1])
        };

        const whereQ = parseWhereCondition(whereList, params);

        const query = `UPDATE ${tableName} SET ${s} ${whereQ}`;

        return { params, query };
    }

    public delete(tableName: string, whereList: WHERE_LIST): QueryParser
    {
        const params: any[] = [];
        const whereQ = parseWhereCondition(whereList, params);
        const query = `DELETE FROM ${tableName} ${whereQ}`;
        return { params, query };
    };

    public select(tableName: string, selectQuery: SELECT, whereList: WHERE_LIST, orderByList: Z[], pageNumber?: number, pageSize?: number): QueryParser
    {
        if (typeof selectQuery != "string")
        {
            if (selectQuery.indexOf(ORM_DEFAULT_COLUMNS._createdAt) == -1)
                selectQuery.push(ORM_DEFAULT_COLUMNS._createdAt);

            if (selectQuery.indexOf(ORM_DEFAULT_COLUMNS._updatedAt) == -1)
                selectQuery.push(ORM_DEFAULT_COLUMNS._updatedAt);

            if (selectQuery.indexOf(ORM_DEFAULT_COLUMNS._id) == -1)
                selectQuery.push(ORM_DEFAULT_COLUMNS._id);


            selectQuery = selectQuery.toString();
        }

        const params: [] = []
        const whereQ = parseWhereCondition(whereList, params);

        const orderQ = parseOrderBy(orderByList);

        let limitQ = ``;
        if (pageNumber && pageSize && pageNumber > 0 && pageSize > 0)
        {
            const offset = (pageNumber - 1) * pageSize;
            limitQ = ` LIMIT ${offset},${pageSize}`;
        }

        const query = `SELECT ${selectQuery} FROM ${tableName} ${whereQ} ${orderQ} ${limitQ}`;

        return { query, params };
    }


    public dropTable(tableName: string, skipIfNotExist?: boolean): QueryParser
    {
        const query = skipIfNotExist ? `DROP TABLE IF EXISTS ${tableName}` : `DROP TABLE ${tableName}`;
        return { query, params: [] };
    };

}

function getColumnString(col: CreateColumn): string
{
    let s = ``;
    const t = col.type;
    switch (t)
    {
        case SQLTypes.BIGINT:
            if (col.maxSize == undefined)
                col.maxSize = 20;
            s = `${col.columnName} ${t}(${col.maxSize})`;
            break;

        case SQLTypes.INT:
            if (col.maxSize == undefined)
                col.maxSize = 11;
            s = `${col.columnName} ${t}(${col.maxSize})`;
            break;

        case SQLTypes.VARCHAR:
            if (col.maxSize == undefined)
                throw new Error(`Length must be defined for VARCHAR`);
            s = `${col.columnName} ${t}(${col.maxSize})`;
            break;

        case SQLTypes.ENUM:
            if (!col.enumObj)
                throw new Error(`PC_MYSQL_ORM enum object is missing`);
            s = `${col.columnName} ${t}(${getStringEnumCreateCommand(col.enumObj)})`;
            break;

        case SQLTypes.BOOLEAN:
        case SQLTypes.TEXT:
            s = `${col.columnName} ${t}`;
            break;

        case SQLTypes.DOUBLE:
            if (col.maxSize == undefined)
                col.maxSize = 8;
            if (col.decimalPoints == undefined)
                col.decimalPoints = 4;
            s = `${col.columnName} ${t}(${col.maxSize},${col.decimalPoints})`;
            break;

        default:
            throw new Error(`Unknown PC_MYSQL type :${t}`);
    };

    if (col.isPrimaryKey)
        col.isNull = false;

    if (col.isNull)
    {
        s += ` NULL `
    }
    else
    {
        s += ` NOT NULL `
    }

    if (col.default !== undefined)
    {
        if (typeof col.default === "string")
        {
            s += ` DEFAULT '${col.default}'`;
        }
        else
        {
            s += ` DEFAULT ${col.default}`;
        }
    }

    if (col.isUnique)
    {
        s += ` UNIQUE `;
    }

    if (col.isAutoIncrement)
    {
        if (col.isPrimaryKey)
            s += ` AUTO_INCREMENT `
        else
            throw new Error(`SQL non-primary key cannnot be AUTO_INCREMENT`)
    }

    if (col.check)
    {
        if (typeof col.check.value == "string")
        {
            s += ` CHECK (${col.columnName} ${col.check.op} '${col.check.value}') `;

        }
        else
        {
            s += ` CHECK (${col.columnName} ${col.check.op} ${col.check.value} ) `;
        }
    }
    return s;
}

/***
 * How to use
 * `ENUM(${getStringEnumCreateCommand(enum)})`
 */

function getStringEnumCreateCommand(myEnum: Object)
{
    let s = ``
    const valuesList = Object.values(myEnum);
    if (valuesList.length == 0)
        throw new Error(`PC_MYSQL ENUM object cannot be empty`);

    for (let value of valuesList)
    {
        if (typeof value != "string")
        {
            throw new Error(`PC_MYSQL supports ENUM of type string ONLY`);
        }
        if (s.length > 0)
        {
            s += `,`;
        }

        s += `'${value}'`;
    }

    return s;
}


function parseWhereCondition(whereList: WHERE_LIST, params: any[]): string
{
    if (whereList.length == 0)
        return '';

    let w = '';
    let prevElt: string | WHERE2 | null = null;
    for (let c of whereList)
    {
        if (typeof c == "string")
            w += ` ${c} `;
        else
        {
            if (prevElt && typeof prevElt == "object")
            {
                w += ` AND `;
            }
            if (!(c as WHERE2).op)
            {
                c.op = '=';
            }
            if(Array.isArray(c.value))
            {
                //for IN & NOT IN CLAUSE
                w += ` ${c.colName} ${c.op} (?) `;
            }
            else
            {
                w += ` ${c.colName} ${c.op} ? `;
            }

           

            params.push(c.value);
        }

        prevElt = c;
    }

    return ` WHERE ${w}`;
}


function parseOrderBy(orderByList: Z[]): string
{
    if (orderByList.length == 0)
        return '';

    let w = '';

    for (let c of orderByList)
    {
        if (w.length > 0)
        {
            w += ',';
        }
        w += `${c[0]} ${c[1]}`
    }

    return ` ORDER BY ${w}`;
}