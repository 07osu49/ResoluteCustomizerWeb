import {app} from '@azure/functions';
import sql from 'mssql';

const config = {
 server: process.env.AZURE_SQL_SERVER,
 database: process.env.AZURE_SQL_DATABASE,
 user: process.env.AZURE_SQL_USER,
 password: process.env.AZURE_SQL_PASSWORD,
 options: { encrypt: true, trustServerCertificate: false },
 pool: { max: 5, min: 0, idleTimeoutMillis: 30000 }
};
let pool;
async function database() {
 if (!pool) pool = new sql.ConnectionPool(config).connect();
 try { return await pool; } catch(e) { pool = undefined; throw e; }
}
function protectedRequest(req) {
 // Azure App Service Authentication must be set to Require authentication,
 // with unauthenticated requests rejected before invoking this function.
 // Require the identity header to guard against accidentally exposing the function.
 return Boolean(req.headers.get('x-ms-client-principal-id'));
}
const headers = {'Cache-Control':'no-store'};
app.http('inventory', { methods:['GET','POST'], authLevel:'anonymous', route:'inventory',
 handler: async(req,context) => {
   if(!protectedRequest(req)) return {status:401,jsonBody:{error:'Authentication required'},headers};
   try {
     const db=await database();
     if(req.method==='GET') {
       const result=await db.request().query('SELECT sku, item_name, category, quantity_on_hand, reorder_level, unit, updated_at FROM dbo.Inventory ORDER BY item_name');
       return {status:200,jsonBody:{items:result.recordset,asOf:new Date().toISOString()},headers};
     }
     const body=await req.json();
     const sku=String(body?.sku||'').trim();
     const delta=body?.delta;
     const reason=String(body?.reason||'').trim();
     if(!sku||sku.length>80||!Number.isSafeInteger(delta)||delta===0||Math.abs(delta)>100000||!reason||reason.length>250)
       return {status:400,jsonBody:{error:'Valid SKU, nonzero integer delta, and reason required'},headers};
     const actor=req.headers.get('x-ms-client-principal-id');
     const transaction=new sql.Transaction(db);
     await transaction.begin(sql.ISOLATION_LEVEL.SERIALIZABLE);
     try {
       const update=await new sql.Request(transaction)
        .input('sku',sql.NVarChar(80),sku)
        .input('delta',sql.Int,delta)
        .query('UPDATE dbo.Inventory SET quantity_on_hand=quantity_on_hand+@delta, updated_at=SYSUTCDATETIME() OUTPUT INSERTED.sku, INSERTED.quantity_on_hand WHERE sku=@sku AND quantity_on_hand+@delta>=0');
       if(update.recordset.length!==1){await transaction.rollback();return {status:409,jsonBody:{error:'SKU missing or insufficient stock'},headers};}
       await new sql.Request(transaction).input('sku',sql.NVarChar(80),sku).input('delta',sql.Int,delta)
         .input('reason',sql.NVarChar(250),reason).input('actor',sql.NVarChar(200),actor)
         .query('INSERT INTO dbo.InventoryAdjustments(sku,delta,reason,actor) VALUES(@sku,@delta,@reason,@actor)');
       await transaction.commit();
       return {status:200,jsonBody:{item:update.recordset[0]},headers};
     } catch(e){await transaction.rollback();throw e;}
   } catch(e){context.error(e);return {status:500,jsonBody:{error:'Inventory request failed'},headers};}
 }});
