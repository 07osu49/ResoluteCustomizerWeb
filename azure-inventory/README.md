# Resolute Azure SQL Inventory Connector

This folder is a **deployable scaffold**, not a live Azure connection. No Azure credentials or production database have been provided, so inventory will remain disconnected until configured.

## Deploy
1. Create Azure SQL Database (or adapt `schema.sql` to your existing inventory schema); initialize inventory SKUs through an authenticated admin process.
2. Create an Azure Functions app on Node.js 20+ and deploy this folder using Azure Functions Core Tools / your standard CI pipeline.
3. In Azure Function application settings, set `AZURE_SQL_SERVER`, `AZURE_SQL_DATABASE`, `AZURE_SQL_USER`, `AZURE_SQL_PASSWORD`. Store secrets in Azure Key Vault and use Key Vault references; never commit passwords.
4. Turn on **App Service Authentication (Easy Auth)** with Microsoft Entra ID, require authentication, and reject unauthenticated requests. Limit allowed users to your staff. For inventory POST write permission, ensure only appropriately authorized roles have access; this sample checks identity, not roles, so production role enforcement must be added before allowing employee access.
5. Configure HTTPS and CORS only for the exact trusted frontend origin `https://07osu49.github.io`, with credentials enabled if using cross-site cookie auth; modern browser third-party cookie restrictions may make that unreliable. A same-origin authenticated reverse proxy or Entra access-token flow is preferred for production.
6. Set the dashboard's API endpoint to your HTTPS Azure Functions URL ending with `/api/inventory`. Test as an authenticated user.
7. Map your **existing** Azure SQL table schema rather than running `schema.sql` against real inventory tables without review.

## API
- `GET /api/inventory`: returns `{items:[{sku,item_name,category,quantity_on_hand,reorder_level,unit,updated_at}]}`
- `POST /api/inventory` with `{sku,delta,reason}`: adjusts quantity atomically and writes audit history. Restrict write calls to authorized inventory managers in production.

No credentials or customer data are stored in GitHub. The current GitHub Pages tracker stores order data locally in the browser. This integration does not automatically deduct stock when an order is submitted because itemized material quantities and authoritative order confirmation have not been established.
