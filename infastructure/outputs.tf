output "resource_group_name" {
  description = "Name of the application resource group."
  value       = module.resource_group.name
}

output "resource_group_id" {
  description = "ID of the application resource group."
  value       = module.resource_group.id
}

output "location" {
  description = "Location of the application resource group."
  value       = module.resource_group.location
}

output "tfstate_storage_account_name" {
  description = "Name of the storage account used for Terraform state."
  value       = azurerm_storage_account.tfstate.name
}

output "tfstate_container_name" {
  description = "Name of the blob container used for Terraform state."
  value       = azurerm_storage_container.tfstate.name
}

output "key_vault_name" {
  description = "Name of the Key Vault for application secrets."
  value       = azurerm_key_vault.application.name
}

output "container_app_environment_id" {
  description = "ID for the frontend Terraform to reuse this Container Apps environment."
  value       = azurerm_container_app_environment.application.id
}

output "backend_identity_principal_id" {
  description = "Principal ID to grant AcrPull and Key Vault Secrets User before deploying the backend Container App."
  value       = azurerm_user_assigned_identity.backend.principal_id
}
