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
- [ ] createOauthToken
- [ ] deleteOauthToken
- [ ] getOauthApplication
- [ ] getOauthToken
- [ ] listOauthApplications
- [ ] listOauthTokens

### Organizations
- [ ] getOrganization
- [ ] listOrganizations
- [ ] updateOrganization

### Organization Members
- [ ] getOrganizationMembership
- [ ] listOrganizationMembers
- [ ] removeOrganizationMember
- [ ] updateOrganizationMembership

### Organization Teams
- [ ] createOrganizationTeam
- [ ] deleteOrganizationTeam
- [ ] getOrganizationTeam
- [ ] listOrganizationTeams
- [ ] updateOrganizationTeam

### Parameters
- [ ] listParameters

### Passwords
- [ ] createPassword
- [ ] deletePassword
- [ ] getPassword
- [ ] listPasswords
- [ ] renewPassword
- [ ] updatePassword

### Query Patterns Reports
- [ ] createQueryPatternsReport
- [ ] deleteQueryPatternsReport
- [ ] getQueryPatternsReport
- [ ] getQueryPatternsReportStatus
- [ ] listGeneratedQueryPatternsReports

### Regions
- [ ] listPublicRegions
- [ ] listReadOnlyRegions
- [ ] listRegionsForOrganization

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
- [ ] disableSafeMigrations
- [ ] enableSafeMigrations

### Service Tokens
- [ ] createServiceToken
- [ ] deleteServiceToken
- [ ] getServiceToken
- [ ] listServiceTokens

### Users
- [ ] getCurrentUser

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
