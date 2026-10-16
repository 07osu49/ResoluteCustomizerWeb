-- Apply to a dedicated Azure SQL database using an authorized migration account.
CREATE TABLE dbo.Inventory (
 sku nvarchar(80) NOT NULL PRIMARY KEY,
 item_name nvarchar(200) NOT NULL,
 category nvarchar(100) NULL,
 quantity_on_hand int NOT NULL CONSTRAINT DF_Inventory_qty DEFAULT (0),
 reorder_level int NOT NULL CONSTRAINT DF_Inventory_reorder DEFAULT (0),
 unit nvarchar(30) NOT NULL CONSTRAINT DF_Inventory_unit DEFAULT (N'Each'),
 updated_at datetime2(3) NOT NULL CONSTRAINT DF_Inventory_updated DEFAULT SYSUTCDATETIME(),
 CONSTRAINT CK_Inventory_qty CHECK (quantity_on_hand>=0),
 CONSTRAINT CK_Inventory_reorder CHECK (reorder_level>=0)
);
CREATE TABLE dbo.InventoryAdjustments (
 adjustment_id bigint IDENTITY(1,1) NOT NULL PRIMARY KEY,
 sku nvarchar(80) NOT NULL REFERENCES dbo.Inventory(sku),
 delta int NOT NULL,
 reason nvarchar(250) NOT NULL,
 actor nvarchar(200) NOT NULL,
 created_at datetime2(3) NOT NULL CONSTRAINT DF_Adjust_created DEFAULT SYSUTCDATETIME()
);
-- Grant app runtime SELECT on inventory and narrowly scoped UPDATE/INSERT
-- permissions only. Restrict who may modify quantities with an authorization layer.
