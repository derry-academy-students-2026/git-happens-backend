output "resource_group_name" {
  description = "Name of the created resource group."
  value       = module.resource_group.name
}

output "resource_group_id" {
  description = "ID of the created resource group."
  value       = module.resource_group.id
}

output "location" {
  description = "Location of the created resource group."
  value       = module.resource_group.location
}

output "tfstate_storage_account_name" {
  description = "Name of the storage account created for Terraform state."
  value       = azurerm_storage_account.tfstate.name
}

output "tfstate_container_name" {
  description = "Name of the blob container used for Terraform state."
  value       = azurerm_storage_container.tfstate.name
}
