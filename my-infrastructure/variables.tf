variable "resource-group-name" {
  description = "The name of the resource group"
  type        = string
  default     = "rg-git-happens-practice-anna"
}

variable "location" {
  description = "The location of the resource group"
  type        = string
  default     = "UK West"
}

variable "environment" {
  description = "The environment of the resource group"
  type        = string
  default     = "practice"
}
