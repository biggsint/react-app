@description('Environment to deploy to')
param env string

@description('Storage account name')
param storageAccountName string

@description('Azure Asset tags')
param tags object

@description('Resource name suffix. e.g -biggsint-keycloak-pt')
param resourceNameSuffix string

@description('UAI App Name')
param uaiAppName string

var containerPort = 8080
var location = 'northeurope'
var locationShortCode = 'eun'
var imageName = 'keycloak/keycloak:latest'

var environments = {
  ft: {
    landingZone: 'Test'
    region: 'eun'
  }
  pt: {
    landingZone: 'Test'
    region: 'eun'
  }
  pr: {
    landingZone: 'Prod'
    region: 'eun'
  }
}

var environment = environments[env]

resource acrIdentity 'Microsoft.ManagedIdentity/userAssignedIdentities@2023-01-31' existing = {
  name: 'uai-multi-shared-acrpull-${toLower(environment.landingZone)}-${toLower(environment.region)}'
  scope: resourceGroup('rg-multi-uai-${toLower(environment.landingZone)}')
}

resource appIdentity 'Microsoft.ManagedIdentity/userAssignedIdentities@2023-01-31' existing = {
  name: uaiAppName
}

resource managedEnvironment 'Microsoft.App/managedEnvironments@2023-05-01' existing = {
  name: 'cae-platform-external-${toLower(environment.landingZone)}-${locationShortCode}'
  scope: resourceGroup('rg-platform-container-${toLower(environment.landingZone)}')
}

var ipAddressRestrictions = [
    {
      action:'Allow'
      ipAddressRange: 'x.x.x.x'
      name:'vpn'
    }
    {
      action:'Allow'
      ipAddressRange: 'x.x.x.x'
      name: 'buildservers'
    }
]


resource containerApp 'Microsoft.App/containerApps@2025-01-01' = {
  name: 'ca${resourceNameSuffix}'
  location: location
  tags: tags
  identity: {
    type: 'UserAssigned'
    userAssignedIdentities: {
      '${appIdentity.id}': {}
    }
  }
  properties: {
    configuration: {
      secrets: []
      activeRevisionsMode: 'Single'
      ingress: {
        allowInsecure: false
        external: true
        targetPort: containerPort
        transport: 'auto'
        ipSecurityRestrictions: ipAddressRestrictions
      }
      registries: [
          { server: 'docker.io' }
      ]
    }
    environmentId: managedEnvironment.id
    template: {
      containers: [
        {
          image: imageName
          name: 'ca${resourceNameSuffix}'
          resources: {
            cpu: json('0.5')
            memory: '1.0Gi'
          }
          env: [
            {
              name: 'KEYCLOAK_USER'
              value: 'admin'
            }
            {
              name: 'KEYCLOAK_PASSWORD'
              value: 'admin'
            }
          ]
        }
      ]
    }
  }
}

output containerAppUrl string = 'https://${containerApp.properties.configuration.ingress.fqdn}'
output revisionUrl string = 'https://${containerApp.properties.latestRevisionFqdn}'

