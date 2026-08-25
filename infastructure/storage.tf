resource "random_id" "tfstate_suffix" {
  byte_length = 4
}

resource "azurerm_storage_account" "tfstate" {
  name                     = "${var.tfstate_storage_account_prefix}${random_id.tfstate_suffix.hex}"
  resource_group_name      = module.resource_group.name
  location                 = module.resource_group.location
  account_tier             = "Standard"
  account_replication_type = "LRS"
  min_tls_version          = "TLS1_2"

  blob_properties {
    versioning_enabled = true
  }

  tags = merge(var.tags, {
    environment = var.environment
  })
}

resource "azurerm_storage_container" "tfstate" {
  name                  = var.tfstate_container_name
  storage_account_name  = azurerm_storage_account.tfstate.name
  container_access_type = "private"
}
