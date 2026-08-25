terraform {
  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "~> 3.0"
    }
    random = {
      source  = "hashicorp/random"
      version = "~> 3.0"
    }
  }

  # Backend values are supplied at init time via -backend-config=backend.hcl
  # (Terraform backend blocks cannot reference variables).
  backend "azurerm" {}
}

provider "azurerm" {
  features {}
}

module "resource_group" {
  source = "./modules/resource-group"

  resource_group_name = var.resource_group_name
  location             = var.location

  tags = merge(var.tags, {
    environment = var.environment
  })
}
