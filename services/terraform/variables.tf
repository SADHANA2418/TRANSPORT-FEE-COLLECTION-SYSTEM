variable "location" {
  default = "East US"
}

variable "resource_group_name" {
  default = "backend-rg"
}

variable "acr_name" {
  default = "transportfeeacr2025"
}

variable "container_app_name" {
  default = "backend-app"
}

variable "acr_image" {
  default = "transport1.azurecr.io/mybackend:latest"
}
variable "storage_connection_string" {
  type      = string
  sensitive = true
}
