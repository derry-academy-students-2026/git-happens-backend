resource "azurerm_log_analytics_workspace" "application" {
  name                = "${var.project_name}-${var.environment}-logs"
  location            = module.resource_group.location
  resource_group_name = module.resource_group.name
  sku                 = "PerGB2018"

  tags = merge(var.tags, {
    environment = var.environment
  })
}

resource "azurerm_container_app_environment" "application" {
  name                       = "${var.project_name}-${var.environment}-environment"
  location                   = module.resource_group.location
  resource_group_name        = module.resource_group.name
  log_analytics_workspace_id = azurerm_log_analytics_workspace.application.id

  tags = merge(var.tags, {
    environment = var.environment
  })
}

resource "azurerm_user_assigned_identity" "backend" {
  name                = "${var.project_name}-${var.environment}-backend-identity"
  location            = module.resource_group.location
  resource_group_name = module.resource_group.name

  tags = merge(var.tags, {
    environment = var.environment
  })
}