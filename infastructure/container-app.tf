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

resource "azurerm_container_app" "backend" {
  name                         = "${var.project_name}-${var.environment}-backend"
  container_app_environment_id = azurerm_container_app_environment.application.id
  resource_group_name          = module.resource_group.name
  revision_mode                = "Single"

  identity {
    type         = "UserAssigned"
    identity_ids = [azurerm_user_assigned_identity.backend.id]
  }

  registry {
    server   = var.acr_login_server
    identity = azurerm_user_assigned_identity.backend.id
  }

  secret {
    name                = "database-url"
    identity            = azurerm_user_assigned_identity.backend.id
    key_vault_secret_id = "${azurerm_key_vault.application.vault_uri}secrets/database-url"
  }

  secret {
    name                = "jwt-secret"
    identity            = azurerm_user_assigned_identity.backend.id
    key_vault_secret_id = "${azurerm_key_vault.application.vault_uri}secrets/jwt-secret"
  }

  template {
    min_replicas = 1
    max_replicas = 1

    container {
      name   = "backend"
      image  = var.backend_image
      cpu    = 0.25
      memory = "0.5Gi"

      env {
        name        = "DATABASE_URL"
        secret_name = "database-url"
      }

      env {
        name        = "JWT_SECRET"
        secret_name = "jwt-secret"
      }
    }
  }

  ingress {
    external_enabled = false
    target_port      = 4000

    traffic_weight {
      latest_revision = true
      percentage      = 100
    }
  }

  tags = merge(var.tags, {
    environment = var.environment
  })
}