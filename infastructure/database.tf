resource "random_password" "postgres_admin" {
  length  = 24
  special = false
}

# Burstable B1ms is the cheapest compute tier; 32GB is the Flexible Server storage minimum.
resource "azurerm_postgresql_flexible_server" "application" {
  name                          = "${var.project_name}-${var.environment}-pg"
  resource_group_name           = module.resource_group.name
  location                      = module.resource_group.location
  version                       = "16"
  administrator_login           = var.postgres_admin_login
  administrator_password        = random_password.postgres_admin.result
  sku_name                      = "B_Standard_B1ms"
  storage_mb                    = 32768
  backup_retention_days         = 7
  geo_redundant_backup_enabled  = false
  public_network_access_enabled = true
  zone                          = "1"

  tags = merge(var.tags, {
    environment = var.environment
  })

  lifecycle {
    ignore_changes = [zone]
  }
}

# Lets Azure-hosted resources (the Container App) reach the server without an IP allow-list.
resource "azurerm_postgresql_flexible_server_firewall_rule" "allow_azure_services" {
  name             = "allow-azure-services"
  server_id        = azurerm_postgresql_flexible_server.application.id
  start_ip_address = "0.0.0.0"
  end_ip_address   = "0.0.0.0"
}

resource "azurerm_postgresql_flexible_server_database" "application" {
  name      = var.postgres_database_name
  server_id = azurerm_postgresql_flexible_server.application.id
  collation = "en_US.utf8"
  charset   = "utf8"
}

resource "azurerm_key_vault_secret" "database_url" {
  name         = "database-url"
  key_vault_id = azurerm_key_vault.application.id
  value        = "postgresql://${var.postgres_admin_login}:${random_password.postgres_admin.result}@${azurerm_postgresql_flexible_server.application.fqdn}:5432/${var.postgres_database_name}?sslmode=require"
}

import {
  to = azurerm_key_vault_secret.database_url
  id = "https://githappensdev14454c.vault.azure.net/secrets/database-url/945cb82c6b474350811f637b90e2c2f4"
}
