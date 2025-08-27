CREATE INDEX idx_inventory_ft
  ON "Inventory" USING gin (to_tsvector('simple', coalesce(title,'') || ' ' || coalesce(description,'')));

CREATE INDEX idx_inventory_title_lower ON "Inventory" (LOWER(title));
CREATE INDEX idx_inventory_description_lower ON "Inventory" (LOWER(description));
CREATE INDEX idx_tag_name_lower ON "Tag" (LOWER(name));
CREATE INDEX idx_item_customid_lower ON "Item" (LOWER("customId"));

CREATE INDEX idx_inventory_createdAt ON "Inventory" ("createdAt" DESC);
CREATE INDEX idx_item_createdAt ON "Item" ("createdAt" DESC);
