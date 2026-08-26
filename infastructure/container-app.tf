data "azurerm_container_registry" "shared" {
  name                = var.acr_name
  resource_group_name = var.acr_resource_group_name
}

resource "azurerm_log_analytics_workspace" "backend" {
  count               = var.deploy_backend ? 1 : 0
  name                = "${var.project_name}-${var.environment}-logs"
  location            = module.resource_group.location
  resource_group_name = module.resource_group.name
  sku                 = "PerGB2018"

  tags = merge(var.tags, {
    environment = var.environment
  })
}

resource "azurerm_container_app_environment" "backend" {
  count                      = var.deploy_backend ? 1 : 0
  name                       = "${var.project_name}-${var.environment}-environment"
  location                   = module.resource_group.location
  resource_group_name        = module.resource_group.name
  log_analytics_workspace_id = azurerm_log_analytics_workspace.backend[0].id

  tags = merge(var.tags, {
    environment = var.environment
  })
}

resource "azurerm_user_assigned_identity" "backend" {
  count               = var.deploy_backend ? 1 : 0
  name                = "${var.project_name}-${var.environment}-backend-identity"
  location            = module.resource_group.location
  resource_group_name = module.resource_group.name

  tags = merge(var.tags, {
    environment = var.environment
  })
}

resource "azurerm_role_assignment" "backend_acr_pull" {
  count                            = var.deploy_backend ? 1 : 0
  scope                            = data.azurerm_container_registry.shared.id
  role_definition_name             = "AcrPull"
  principal_id                     = azurerm_user_assigned_identity.backend[0].principal_id
  skip_service_principal_aad_check = true
}

resource "azurerm_role_assignment" "backend_key_vault_secrets" {
  count                            = var.deploy_backend ? 1 : 0
  scope                            = azurerm_key_vault.application.id
  role_definition_name             = "Key Vault Secrets User"
  principal_id                     = azurerm_user_assigned_identity.backend[0].principal_id
  skip_service_principal_aad_check = true
}

resource "azurerm_container_app" "backend" {
  count                        = var.deploy_backend ? 1 : 0
  name                         = "${var.project_name}-${var.environment}-backend"
  container_app_environment_id = azurerm_container_app_environment.backend[0].id
  resource_group_name          = module.resource_group.name
  revision_mode                = "Single"

  identity {
    type         = "UserAssigned"
    identity_ids = [azurerm_user_assigned_identity.backend[0].id]
  }

  registry {
    server   = data.azurerm_container_registry.shared.login_server
    identity = azurerm_user_assigned_identity.backend[0].id
  }

  secret {
    name                = "database-url"
    identity            = azurerm_user_assigned_identity.backend[0].id
    key_vault_secret_id = "${azurerm_key_vault.application.vault_uri}secrets/database-url"
  }

  secret {
    name                = "jwt-secret"
    identity            = azurerm_user_assigned_identity.backend[0].id
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

  depends_on = [
    azurerm_role_assignment.backend_acr_pull,
    azurerm_role_assignment.backend_key_vault_secrets,
  ]
}