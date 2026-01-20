## Operations

### Organizations

- [x] getOrganization
- [x] listOrganizations
- [ ] updateOrganization

### Databases

- [x] getDatabase
- [x] listDatabases
- [x] createDatabase
- [x] deleteDatabase
- [x] getDatabaseThrottler
- [x] listDatabaseRegions
- [x] updateDatabaseSettings
- [x] updateDatabaseThrottler

### Branches

- [x] createBranch
- [x] deleteBranch
- [x] demoteBranch
- [x] getBranch
- [x] getBranchSchema
- [x] listBranches
- [x] lintBranchSchema
- [x] promoteBranch
- [x] updateBranchClusterConfig

### Passwords

- [x] createPassword
- [x] deletePassword
- [x] getPassword
- [x] listPasswords
- [x] renewPassword
- [x] updatePassword

### Audit Logs

- [ ] listAuditLogs

### Backups

- [x] createBackup
- [x] deleteBackup
- [x] getBackup
- [x] listBackups
- [x] updateBackup

### Bouncers

- [ ] cancelBouncerResizeRequest
- [ ] createBouncer
- [ ] deleteBouncer
- [ ] getBouncer
- [ ] listBouncerResizeRequests
- [ ] listBouncers
- [ ] listBranchBouncerResizeRequests
- [ ] updateBouncerResizeRequest

### Branch Change Requests

- [ ] cancelBranchChangeRequest
- [ ] getBranchChangeRequest
- [ ] listBranchChangeRequests
- [ ] updateBranchChangeRequest

### Cluster

- [ ] listClusterSizeSkus

### Database Postgres CIDRs

- [ ] createDatabasePostgresCidr
- [ ] deleteDatabasePostgresCidr
- [ ] getDatabasePostgresCidr
- [ ] listDatabasePostgresCidrs
- [ ] updateDatabasePostgresCidr

### Deploy Requests

- [ ] cancelDeployRequest
- [ ] closeDeployRequest
- [ ] completeErroredDeploy
- [ ] completeGatedDeployRequest
- [ ] completeRevert
- [ ] createDeployRequest
- [ ] getDeployment
- [ ] getDeployQueue
- [ ] getDeployRequest
- [ ] getDeployRequestThrottler
- [ ] listDeployOperations
- [ ] listDeployRequestReviews
- [ ] listDeployRequests
- [ ] queueDeployRequest
- [ ] reviewDeployRequest
- [ ] skipRevertPeriod
- [ ] updateAutoApply
- [ ] updateAutoDeleteBranch
- [ ] updateDeployRequestThrottler

### Extensions

- [ ] listExtensions

### Invoices

- [ ] getInvoice
- [ ] getInvoiceLineItems
- [ ] listInvoices

### Keyspaces

- [ ] createKeyspace
- [ ] deleteKeyspace
- [ ] getKeyspace
- [ ] getKeyspaceRolloutStatus
- [ ] getKeyspaceVschema
- [ ] listKeyspaces
- [ ] updateKeyspace
- [ ] updateKeyspaceVschema

### OAuth

- [x] createOauthToken
- [x] deleteOauthToken
- [x] getOauthApplication
- [x] getOauthToken
- [x] listOauthApplications
- [x] listOauthTokens

### Organization Members

- [x] getOrganizationMembership
- [x] listOrganizationMembers
- [ ] removeOrganizationMember
- [ ] updateOrganizationMembership

### Organization Teams

- [ ] createOrganizationTeam
- [ ] deleteOrganizationTeam
- [x] getOrganizationTeam
- [x] listOrganizationTeams
- [ ] updateOrganizationTeam

### Parameters

- [ ] listParameters

### Query Patterns Reports

- [ ] createQueryPatternsReport
- [ ] deleteQueryPatternsReport
- [ ] getQueryPatternsReport
- [ ] getQueryPatternsReportStatus
- [ ] listGeneratedQueryPatternsReports

### Regions

- [x] listPublicRegions
- [x] listReadOnlyRegions
- [x] listRegionsForOrganization

### Roles

- [ ] createRole
- [ ] deleteRole
- [ ] getDefaultRole
- [ ] getRole
- [ ] listRoles
- [ ] reassignRoleObjects
- [ ] renewRole
- [ ] resetDefaultRole
- [ ] resetRole
- [ ] updateRole

### Safe Migrations

- [x] disableSafeMigrations
- [x] enableSafeMigrations

### Service Tokens

- [x] createServiceToken
- [x] deleteServiceToken
- [x] getServiceToken
- [x] listServiceTokens

### Users

- [x] getCurrentUser

### Webhooks

- [x] createWebhook
- [x] deleteWebhook
- [x] getWebhook
- [x] listWebhooks
- [x] testWebhook
- [x] updateWebhook

### Workflows

- [ ] createWorkflow
- [ ] getWorkflow
- [ ] listWorkflows
- [ ] verifyWorkflow
- [ ] workflowCancel
- [ ] workflowComplete
- [ ] workflowCutover
- [ ] workflowRetry
- [ ] workflowReverseCutover
- [ ] workflowReverseTraffic
- [ ] workflowSwitchPrimaries
- [ ] workflowSwitchReplicas
