output "resource_group_name" {
  value = azurerm_resource_group.practiceDev.name
}

output "resource_group_location" {
  value = azurerm_resource_group.practiceDev.location
}

output "resource_group_environment" {
  value = var.environment
}

output "resource_group_id" {
  value = azurerm_resource_group.practiceDev.id
}