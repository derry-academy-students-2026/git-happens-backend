variable "resource_group_name" {
  description = "Name of the Azure resource group."
  type        = string
  default     = null
}

variable "location" {
  description = "Azure region in which to deploy resources."
  type        = string
  default     = "UK South"
}

variable "environment" {
  description = "Deployment environment (dev, test, or prod)."
  type        = string
  default     = "dev"

  validation {
    condition     = contains(["dev", "test", "prod"], var.environment)
    error_message = "environment must be one of: dev, test, prod."
  }
}

variable "project_name" {
  description = "Short name of the project, used for tagging and naming resources."
  type        = string
  default     = "git-happens"
}

variable "tags" {
  description = "Common tags applied to all resources."
  type        = map(string)
  default = {
    project    = "git-happens"
    managed_by = "terraform"
  }
}

variable "tfstate_storage_account_prefix" {
  description = "Prefix for the Terraform state storage account name (an 8-character random hex suffix is appended for global uniqueness, so the total stays within Azure's 24-character limit)."
  type        = string
  default     = "tfstategh"

  validation {
    condition     = can(regex("^[a-z0-9]{3,16}$", var.tfstate_storage_account_prefix))
    error_message = "tfstate_storage_account_prefix must be 3-16 lowercase letters/numbers (storage account names must be <=24 chars total, including the 8-char random suffix)."
  }
}

variable "tfstate_container_name" {
  description = "Name of the blob container used to store the Terraform state file."
  type        = string
  default     = "tfstate"
}
