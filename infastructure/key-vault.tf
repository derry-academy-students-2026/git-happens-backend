resource "random_id" "key_vault_suffix" {
  byte_length = 3
}

resource "azurerm_key_vault" "application" {
  name                       = "${var.key_vault_name_prefix}${var.environment}${random_id.key_vault_suffix.hex}"
  location                   = module.resource_group.location
  resource_group_name        = module.resource_group.name
  tenant_id                  = data.azurerm_client_config.current.tenant_id
  sku_name                   = "standard"
  enable_rbac_authorization  = true
  soft_delete_retention_days = 7

  tags = merge(var.tags, {
    environment = var.environment
  })
}