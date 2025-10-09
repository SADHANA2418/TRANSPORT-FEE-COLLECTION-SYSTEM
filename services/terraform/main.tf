terraform {
  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "~> 3.100"
    }
  }
  required_version = ">= 1.4.0"
}

provider "azurerm" {
  features {}
}

# Resource Group
resource "azurerm_resource_group" "rg" {
  name     = "backend-rg"
  location = "Central India"
}

# Log Analytics Workspace
resource "azurerm_log_analytics_workspace" "law" {
  name                = "backend-law"
  location            = azurerm_resource_group.rg.location
  resource_group_name = azurerm_resource_group.rg.name
  sku                 = "PerGB2018"
  retention_in_days   = 30
}

# Container Registry
resource "azurerm_container_registry" "acr" {
  name                = "transportfeeacr2025"
  resource_group_name = azurerm_resource_group.rg.name
  location            = azurerm_resource_group.rg.location
  sku                 = "Basic"
  admin_enabled       = false
}

# Container App Environment
resource "azurerm_container_app_environment" "env" {
  name                       = "backend-env"
  location                   = azurerm_resource_group.rg.location
  resource_group_name        = azurerm_resource_group.rg.name
  log_analytics_workspace_id = azurerm_log_analytics_workspace.law.id
}

# Container App with System Assigned Identity
resource "azurerm_container_app" "backend" {
  name                         = "backend-app"
  resource_group_name          = azurerm_resource_group.rg.name
  container_app_environment_id = azurerm_container_app_environment.env.id
  revision_mode                = "Single"

  identity {
    type = "SystemAssigned"
  }

  ingress {
    external_enabled = true
    target_port      = 3000

    traffic_weight {
      percentage      = 100
      latest_revision = true
    }
  }

 template {
  container {
    name   = "backend-container"
    image  = "${azurerm_container_registry.acr.login_server}/mybackend:latest"
    cpu    = 0.5
    memory = "1.0Gi"

    env {
  name  = "AZURE_STORAGE_CONNECTION_STRING"
  value = var.storage_connection_string
}

  }
}
}

# Assign AcrPull role to the System Assigned Identity
resource "azurerm_role_assignment" "acr_pull_system" {
  scope                = azurerm_container_registry.acr.id
  role_definition_name = "AcrPull"
  principal_id         = azurerm_container_app.backend.identity[0].principal_id

  depends_on = [
    azurerm_container_app.backend
  ]
}