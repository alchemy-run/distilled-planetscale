## Operations

### Audit Logs
- [ ] listAuditLogs

### Backups
- [ ] createBackup
- [ ] deleteBackup
- [ ] getBackup
- [ ] listBackups
- [ ] updateBackup

### Bouncers
- [ ] cancelBouncerResizeRequest
- [ ] createBouncer
- [ ] deleteBouncer
- [ ] getBouncer
- [ ] listBouncerResizeRequests
- [ ] listBouncers
- [ ] listBranchBouncerResizeRequests
- [ ] updateBouncerResizeRequest

### Branches
- [ ] createBranch
- [ ] deleteBranch
- [ ] demoteBranch
- [ ] getBranch
- [ ] getBranchSchema
- [ ] listBranches
- [ ] lintBranchSchema
- [ ] promoteBranch
- [ ] updateBranchClusterConfig

### Branch Change Requests
- [ ] cancelBranchChangeRequest
- [ ] getBranchChangeRequest
- [ ] listBranchChangeRequests
- [ ] updateBranchChangeRequest

### Cluster
- [ ] listClusterSizeSkus

### Databases
- [x] getDatabase
  - [x] should fetch a database successfully
  - [x] should return GetDatabaseNotfound for non-existent database
- [x] listDatabases
  - [x] should list databases successfully
  - [x] should support pagination parameters
  - [x] should return ListDatabasesNotfound for non-existent organization
- [ ] createDatabase
- [ ] deleteDatabase
- [ ] getDatabaseThrottler
- [ ] listDatabaseRegions
- [ ] updateDatabaseSettings
- [ ] updateDatabaseThrottler

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
