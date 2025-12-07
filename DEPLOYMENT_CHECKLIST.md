# 🚀 Deployment Checklist: auth_user_id to user_id Migration

## Pre-Deployment

### ✅ Code Review
- [x] All TypeScript files compile without errors
- [x] No linter warnings or errors
- [x] All function signatures updated
- [x] All component props updated
- [x] Type definitions updated

### ⏳ Testing (Local/Staging)
- [ ] Test user login flow
- [ ] Test user registration
- [ ] Test project listing for clients
- [ ] Test favourites add/remove
- [ ] Test profile page display
- [ ] Test profile updates
- [ ] Test user statistics display
- [ ] Test password change
- [ ] Test profile picture upload/delete
- [ ] Test admin user approval
- [ ] Test comments functionality
- [ ] Test model logs

### 📝 Documentation Review
- [x] MIGRATION_SUMMARY.md created
- [x] DEVELOPER_GUIDE.md created
- [x] SCHEMA_CHANGES.md created
- [x] SQL migration script created
- [x] Updated schema documented

---

## Deployment Steps

### Step 1: Backup Database ⚠️ CRITICAL
```bash
# Create a full database backup
# Method depends on your hosting platform (Supabase, AWS, etc.)

# For Supabase:
# 1. Go to Database → Backups in Supabase Dashboard
# 2. Create a manual backup
# 3. Download backup file for safety

# Record backup details:
Backup Date: _______________
Backup Time: _______________
Backup File: _______________
```
- [ ] Database backup created
- [ ] Backup file downloaded
- [ ] Backup verified

### Step 2: Deploy Code Changes
```bash
# Commit and push changes
git add .
git commit -m "Migrate from auth_user_id to user_id for data queries"
git push origin SUPABASE

# Deploy to production (method depends on your setup)
# - Vercel: Auto-deploy from GitHub
# - Manual: npm run build && deploy
```
- [ ] Code committed to repository
- [ ] Code deployed to production
- [ ] Deployment successful

### Step 3: Verify Application Works
Test these features in production **BEFORE** running database migration:

#### Authentication
- [ ] User can log in
- [ ] User can register
- [ ] User data loads correctly
- [ ] Both `user_id` and `auth_user_id` are present in user object

#### Data Access
- [ ] Projects list loads
- [ ] Favourites list loads  
- [ ] Profile page displays
- [ ] Statistics show correct counts

#### Console Check
- [ ] No JavaScript errors in browser console
- [ ] No failed API calls
- [ ] User object has `user_id` field

### Step 4: Run Database Migration ⚠️ CRITICAL

**Important**: Only proceed if Step 3 verification passed!

```sql
-- Open your database SQL editor (Supabase SQL Editor)
-- Copy and paste from: SQL_info/migration_remove_auth_user_id.sql

-- Step 1: Verify current columns exist
SELECT column_name, table_name 
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND column_name = 'auth_user_id'
ORDER BY table_name;
-- Expected: 7 rows (users + 6 other tables)

-- Step 2: Run migration script
-- [Paste entire migration script here]

-- Step 3: Verify columns removed
SELECT column_name, table_name 
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND column_name = 'auth_user_id'
ORDER BY table_name;
-- Expected: 1 row (only users table)
```

- [ ] Current schema verified (7 tables with auth_user_id)
- [ ] Migration script executed successfully
- [ ] Post-migration verification passed (1 table with auth_user_id)
- [ ] No errors during migration

### Step 5: Post-Migration Testing

#### Smoke Tests (Quick)
- [ ] User can log in
- [ ] Projects load
- [ ] Favourites load
- [ ] Profile displays
- [ ] No console errors

#### Full Feature Tests
- [ ] Add project to favourites
- [ ] Remove project from favourites
- [ ] Update user profile
- [ ] Change password
- [ ] Upload profile picture
- [ ] View project details
- [ ] Add comment (if implemented)
- [ ] View statistics

### Step 6: Monitor for Issues

Watch for these in the first 24 hours:
- [ ] Error logs (check Supabase logs)
- [ ] User reports
- [ ] Failed queries
- [ ] Performance issues

---

## Rollback Plan (If Issues Occur)

### Option 1: Quick Rollback (Code Only)
If application errors but database is fine:
```bash
# Revert to previous code version
git revert HEAD
git push origin SUPABASE
# Or use your platform's rollback feature
```

### Option 2: Full Rollback (Database + Code)
If database migration causes issues:

1. **Stop Application** (prevent new writes)
2. **Restore Database Backup**
   ```bash
   # Use your backup restoration method
   # For Supabase: Database → Backups → Restore
   ```
3. **Revert Code**
   ```bash
   git revert HEAD
   git push origin SUPABASE
   ```
4. **Verify Restoration**
   - Check auth_user_id columns exist in all tables
   - Test login and data access
5. **Investigate Issues** before retrying

---

## Verification Queries

### After Deployment (Before Migration)
```sql
-- All tables should have auth_user_id
SELECT table_name, column_name
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND column_name = 'auth_user_id'
ORDER BY table_name;
-- Expected: 7 rows
```

### After Migration
```sql
-- Only users table should have auth_user_id
SELECT table_name, column_name
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND column_name = 'auth_user_id'
ORDER BY table_name;
-- Expected: 1 row (users)

-- Verify user_id columns exist
SELECT table_name, column_name
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND column_name = 'user_id'
ORDER BY table_name;
-- Expected: Multiple rows
```

### Data Integrity Check
```sql
-- Verify all foreign keys are valid
SELECT COUNT(*) FROM project_clients pc
LEFT JOIN users u ON pc.user_id = u.user_id
WHERE u.user_id IS NULL;
-- Expected: 0 (no orphaned records)

SELECT COUNT(*) FROM user_favourites uf
LEFT JOIN users u ON uf.user_id = u.user_id
WHERE u.user_id IS NULL;
-- Expected: 0

SELECT COUNT(*) FROM comments c
LEFT JOIN users u ON c.user_id = u.user_id
WHERE u.user_id IS NULL;
-- Expected: 0
```

---

## Success Criteria

✅ Migration is successful when:
1. All code deployed without errors
2. Users can log in and access data
3. auth_user_id removed from 6 tables
4. auth_user_id kept only in users table
5. All features working as expected
6. No console errors
7. No database integrity issues

---

## Timeline Estimate

| Phase | Duration |
|-------|----------|
| Pre-deployment testing | 1-2 hours |
| Database backup | 5-10 minutes |
| Code deployment | 5-10 minutes |
| Code verification | 15-30 minutes |
| Database migration | 2-5 minutes |
| Post-migration testing | 30-60 minutes |
| Monitoring period | 24 hours |
| **Total** | **~3 hours + 24h monitoring** |

---

## Emergency Contacts

Document who to contact if issues arise:
- Database Admin: _______________
- DevOps Lead: _______________
- Team Lead: _______________
- On-Call: _______________

---

## Notes / Issues Encountered

Use this space to document any issues during deployment:

```
Date/Time: _______________
Issue: _______________________________________________
Resolution: __________________________________________
___________________________________________________
___________________________________________________
```

---

## Final Sign-Off

- [ ] All pre-deployment tests passed
- [ ] Database backup created and verified
- [ ] Code deployed successfully
- [ ] Migration executed successfully
- [ ] Post-migration tests passed
- [ ] Documentation updated
- [ ] Team notified

**Deployed By**: _______________  
**Date**: _______________  
**Time**: _______________  
**Status**: ☐ Success  ☐ Partial  ☐ Rollback Required
