# Database Schema Changes: auth_user_id Removal

## Before Migration

```
┌─────────────────────────────────────────────────────────────────┐
│                     Supabase Auth (auth.users)                   │
│                          id: UUID                                │
└──────────────────────────────┬──────────────────────────────────┘
                               │
                               ▼
┌──────────────────────────────────────────────────────────────────┐
│                        users table                                │
│  • user_id (PK, INT)                                             │
│  • auth_user_id (UUID) ← Links to Supabase Auth                 │
│  • email, full_name, etc.                                        │
└────┬─────────────────────────────────────────────────────────────┘
     │
     │ Referenced by user_id AND auth_user_id (REDUNDANT)
     │
     ├─────────────────┬─────────────────┬─────────────────┐
     ▼                 ▼                 ▼                 ▼
┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐
│project_     │  │user_        │  │comments     │  │model_logs   │
│clients      │  │favourites   │  │             │  │             │
│─────────────│  │─────────────│  │─────────────│  │─────────────│
│user_id ✓    │  │user_id ✓    │  │user_id ✓    │  │user_id ✓    │
│auth_user_id ✗│ │auth_user_id ✗│ │auth_user_id ✗│ │auth_user_id ✗│
└─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘

┌─────────────┐  ┌─────────────┐
│projects     │  │portfolio_   │
│             │  │pages        │
│─────────────│  │─────────────│
│creator_id ✓ │  │creator_id ✓ │
│auth_user_id ✗│ │auth_user_id ✗│
└─────────────┘  └─────────────┘

✓ = Used for queries
✗ = Redundant, wastes space
```

## After Migration

```
┌─────────────────────────────────────────────────────────────────┐
│                     Supabase Auth (auth.users)                   │
│                          id: UUID                                │
└──────────────────────────────┬──────────────────────────────────┘
                               │
                               ▼ ONLY LINK
┌──────────────────────────────────────────────────────────────────┐
│                        users table                                │
│  • user_id (PK, INT)                                             │
│  • auth_user_id (UUID) ← ONLY place auth_user_id exists         │
│  • email, full_name, etc.                                        │
└────┬─────────────────────────────────────────────────────────────┘
     │
     │ Referenced ONLY by user_id (EFFICIENT)
     │
     ├─────────────────┬─────────────────┬─────────────────┐
     ▼                 ▼                 ▼                 ▼
┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐
│project_     │  │user_        │  │comments     │  │model_logs   │
│clients      │  │favourites   │  │             │  │             │
│─────────────│  │─────────────│  │─────────────│  │─────────────│
│user_id (FK) │  │user_id (FK) │  │user_id (FK) │  │user_id (FK) │
└─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘

┌─────────────┐  ┌─────────────┐
│projects     │  │portfolio_   │
│             │  │pages        │
│─────────────│  │─────────────│
│creator_id(FK)│ │creator_id(FK)│
└─────────────┘  └─────────────┘

FK = Foreign Key to users.user_id (INTEGER - FAST & COMPACT)
```

## Key Differences

### Storage Comparison
| Data Type | Size | Example |
|-----------|------|---------|
| UUID | 36 chars | `550e8400-e29b-41d4-a716-446655440000` |
| INTEGER | 4 bytes | `1234` |

**Savings per record**: ~28 bytes per auth_user_id field removed

### Query Performance
**Before:**
```sql
-- UUID string comparison
SELECT * FROM user_favourites 
WHERE auth_user_id = '550e8400-e29b-41d4-a716-446655440000';
```

**After:**
```sql
-- Integer comparison (FASTER)
SELECT * FROM user_favourites 
WHERE user_id = 1234;
```

## Column Removal Summary

| Table | auth_user_id Status | Reason |
|-------|-------------------|--------|
| `users` | **KEPT** ✅ | Links to Supabase auth.users |
| `project_clients` | **REMOVED** ❌ | Use user_id FK instead |
| `projects` | **REMOVED** ❌ | Use creator_id (FK to user_id) |
| `user_favourites` | **REMOVED** ❌ | Use user_id FK instead |
| `comments` | **REMOVED** ❌ | Use user_id FK instead |
| `model_logs` | **REMOVED** ❌ | Use user_id FK instead |
| `portfolio_pages` | **REMOVED** ❌ | Use creator_id (FK to user_id) |

## Authentication Flow

### Before Migration
```
1. User logs in via Supabase Auth
2. Get auth_user_id (UUID) from auth.users
3. Query users table: WHERE auth_user_id = UUID
4. Get user_id from result
5. Query other tables using EITHER user_id OR auth_user_id (redundant)
```

### After Migration
```
1. User logs in via Supabase Auth
2. Get auth_user_id (UUID) from auth.users
3. Query users table: WHERE auth_user_id = UUID
4. Get user_id from result
5. Query all other tables using ONLY user_id (efficient)
```

## Benefits

1. **Space Efficiency**
   - Removed 6 UUID columns across the database
   - ~28 bytes saved per record in each table
   - For 10,000 users: ~1.68 MB saved

2. **Performance**
   - Integer joins are faster than UUID joins
   - Integer indexes are more compact
   - Better query optimization

3. **Maintainability**
   - Clear data flow: auth_user_id only in users table
   - Less confusion about which ID to use
   - Simpler foreign key relationships

4. **Database Size**
   - Smaller table sizes
   - Faster backups
   - Lower storage costs
