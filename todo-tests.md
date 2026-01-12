## Operations

### Audit Logs
- [x] listAuditLogs

### Backups
- [x] createBackup
- [x] deleteBackup
- [x] getBackup
- [x] listBackups
- [x] updateBackup

### Bouncers
- [x] cancelBouncerResizeRequest
- [x] createBouncer
- [x] deleteBouncer
- [x] getBouncer
- [x] listBouncerResizeRequests
- [x] listBouncers
- [x] listBranchBouncerResizeRequests
- [x] updateBouncerResizeRequest

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

### Branch Change Requests
- [x] cancelBranchChangeRequest
- [x] getBranchChangeRequest
- [x] listBranchChangeRequests
- [x] updateBranchChangeRequest

### Cluster
- [x] listClusterSizeSkus

### Databases
- [x] getDatabase
- [x] listDatabases
- [x] createDatabase
- [x] deleteDatabase
- [x] getDatabaseThrottler
- [x] listDatabaseRegions
- [x] updateDatabaseSettings
- [x] updateDatabaseThrottler

### Database Postgres CIDRs
- [x] createDatabasePostgresCidr
- [x] deleteDatabasePostgresCidr
- [x] getDatabasePostgresCidr
- [x] listDatabasePostgresCidrs
- [x] updateDatabasePostgresCidr

### Deploy Requests
- [x] cancelDeployRequest
- [x] closeDeployRequest
- [x] completeErroredDeploy
- [x] completeGatedDeployRequest
- [x] completeRevert
- [x] createDeployRequest
- [x] getDeployment
- [x] getDeployQueue
- [x] getDeployRequest
- [x] getDeployRequestThrottler
- [x] listDeployOperations
- [x] listDeployRequestReviews
- [x] listDeployRequests
- [x] queueDeployRequest
- [x] reviewDeployRequest
- [x] skipRevertPeriod
- [x] updateAutoApply
- [x] updateAutoDeleteBranch
- [x] updateDeployRequestThrottler

### Extensions
- [x] listExtensions

### Invoices
- [x] getInvoice
- [x] getInvoiceLineItems
- [x] listInvoices

### Keyspaces
- [x] createKeyspace
- [x] deleteKeyspace
- [x] getKeyspace
- [x] getKeyspaceRolloutStatus
- [x] getKeyspaceVschema
- [x] listKeyspaces
- [x] updateKeyspace
- [x] updateKeyspaceVschema

### OAuth
- [x] createOauthToken
- [x] deleteOauthToken
- [x] getOauthApplication
- [x] getOauthToken
- [x] listOauthApplications
- [x] listOauthTokens

### Organizations
- [x] getOrganization
- [x] listOrganizations
- [x] updateOrganization

### Organization Members
- [x] getOrganizationMembership
- [x] listOrganizationMembers
- [x] removeOrganizationMember
- [x] updateOrganizationMembership

### Organization Teams
- [x] createOrganizationTeam
- [x] deleteOrganizationTeam
- [x] getOrganizationTeam
- [x] listOrganizationTeams
- [x] updateOrganizationTeam

### Parameters
- [x] listParameters

### Passwords
- [x] createPassword
- [x] deletePassword
- [x] getPassword
- [x] listPasswords
- [x] renewPassword
- [x] updatePassword

### Query Patterns Reports
- [x] createQueryPatternsReport
- [x] deleteQueryPatternsReport
- [x] getQueryPatternsReport
- [x] getQueryPatternsReportStatus
- [x] listGeneratedQueryPatternsReports

### Regions
- [x] listPublicRegions
- [x] listReadOnlyRegions
- [x] listRegionsForOrganization

### Roles
- [x] createRole
- [x] deleteRole
- [x] getDefaultRole
- [x] getRole
- [x] listRoles
- [x] reassignRoleObjects
- [x] renewRole
- [x] resetDefaultRole
- [x] resetRole
- [x] updateRole

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
- [ ] createWebhook
- [ ] deleteWebhook
- [ ] getWebhook
- [ ] listWebhooks
- [ ] testWebhook
- [ ] updateWebhook

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
