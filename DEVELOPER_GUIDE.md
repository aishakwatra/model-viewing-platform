# Developer Guide: Working with User IDs

## Quick Reference

### ✅ DO Use `user_id` (integer)
When querying or storing user relationships in:
- `project_clients`
- `projects` (via `creator_id`)
- `user_favourites`
- `comments`
- `model_logs`
- `portfolio_pages` (via `creator_id`)

### ✅ DO Use `auth_user_id` (UUID)
ONLY when:
- Authenticating users (linking to Supabase Auth)
- Querying the `users` table by auth session
- In the `users` table schema

## Common Patterns

### 1. After User Login

```typescript
// ✅ CORRECT: Get both IDs from users table
const { data: user } = await supabase
  .from("users")
  .select("user_id, auth_user_id, email, full_name, ...")
  .eq("auth_user_id", authUserId)  // Use auth_user_id to find user
  .single();

// Now use user.user_id for all subsequent queries
```

### 2. Querying User's Projects

```typescript
// ✅ CORRECT: Use user_id
async function fetchUserProjects(userId: number) {
  const { data } = await supabase
    .from("project_clients")
    .select("project_id")
    .eq("user_id", userId);  // Integer comparison
  // ...
}

// ❌ WRONG: Don't use auth_user_id anymore
async function fetchUserProjects(authUserId: string) {
  const { data } = await supabase
    .from("project_clients")
    .select("project_id")
    .eq("auth_user_id", authUserId);  // This column doesn't exist!
  // ...
}
```

### 3. Creating User Favourites

```typescript
// ✅ CORRECT: Use user_id
async function addFavourite(userId: number, modelVersionId: number) {
  await supabase
    .from("user_favourites")
    .insert({
      user_id: userId,           // Integer FK
      model_version_id: modelVersionId
    });
}

// ❌ WRONG: Don't use auth_user_id
async function addFavourite(authUserId: string, modelVersionId: number) {
  await supabase
    .from("user_favourites")
    .insert({
      auth_user_id: authUserId,  // This column doesn't exist!
      model_version_id: modelVersionId
    });
}
```

### 4. Component State Management

```typescript
// ✅ CORRECT: Store user_id in state
export default function Dashboard() {
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  
  useEffect(() => {
    const user = getCurrentUser();
    if (user) {
      setCurrentUserId(user.user_id);  // Use integer user_id
    }
  }, []);
  
  // Use currentUserId for queries
  const projects = await fetchUserProjects(currentUserId);
}

// ❌ WRONG: Don't store auth_user_id for queries
export default function Dashboard() {
  const [currentAuthUserId, setCurrentAuthUserId] = useState<string | null>(null);
  // ...
}
```

### 5. User Interface

```typescript
// ✅ CORRECT: User type includes both IDs
interface User {
  user_id: number;         // For queries
  auth_user_id: string;    // For auth linking only
  email: string;
  full_name: string | null;
  // ...
}

// Access pattern
const user = getCurrentUser();
console.log(user.user_id);      // Use for queries: 1234
console.log(user.auth_user_id);  // Only for auth: "550e8400-..."
```

## Function Signatures

### Before Migration (Old - Don't Use)
```typescript
❌ fetchUserProjects(authUserId: string)
❌ fetchUserFavourites(authUserId: string)
❌ toggleFavourite(authUserId: string, modelVersionId: number)
❌ getUserStatistics(authUserId: string)
```

### After Migration (New - Use These)
```typescript
✅ fetchUserProjects(userId: number)
✅ fetchUserFavourites(userId: number)
✅ toggleFavourite(userId: number, modelVersionId: number)
✅ getUserStatistics(userId: number)
```

## Authentication Flow

```typescript
// Step 1: User logs in with Supabase Auth
const { data: authData } = await supabase.auth.signInWithPassword({
  email,
  password
});
const authUserId = authData.user.id;  // UUID

// Step 2: Get user profile (includes user_id)
const { data: user } = await supabase
  .from("users")
  .select("user_id, auth_user_id, email, full_name, ...")
  .eq("auth_user_id", authUserId)  // Use UUID to find in users table
  .single();

// Step 3: Store user object (has both IDs)
saveCurrentUser(user);

// Step 4: Use user_id for ALL subsequent queries
const projects = await fetchUserProjects(user.user_id);
const favourites = await fetchUserFavourites(user.user_id);
```

## Troubleshooting

### Error: Column "auth_user_id" does not exist
**Cause**: Trying to query auth_user_id in a table where it's been removed

**Solution**: Use `user_id` instead
```typescript
// ❌ Error
.eq("auth_user_id", someUuid)

// ✅ Fix
.eq("user_id", someInteger)
```

### Error: Cannot read property 'user_id' of undefined
**Cause**: User object doesn't have user_id field

**Solution**: Make sure you're selecting user_id in your query
```typescript
// ❌ Missing user_id
.select("auth_user_id, email, full_name")

// ✅ Include user_id
.select("user_id, auth_user_id, email, full_name")
```

## Database Query Examples

### Fetch user's projects
```sql
-- Old (no longer works)
SELECT p.* FROM projects p
JOIN project_clients pc ON p.id = pc.project_id
WHERE pc.auth_user_id = '550e8400-e29b-41d4-a716-446655440000';

-- New (correct)
SELECT p.* FROM projects p
JOIN project_clients pc ON p.id = pc.project_id
WHERE pc.user_id = 1234;
```

### Fetch user's favourites
```sql
-- Old (no longer works)
SELECT * FROM user_favourites
WHERE auth_user_id = '550e8400-e29b-41d4-a716-446655440000';

-- New (correct)
SELECT * FROM user_favourites
WHERE user_id = 1234;
```

### Create a comment
```sql
-- Old (no longer works)
INSERT INTO comments (model_version_id, comment_text, user_id, auth_user_id)
VALUES (1, 'Great model!', 1234, '550e8400-e29b-41d4-a716-446655440000');

-- New (correct)
INSERT INTO comments (model_version_id, comment_text, user_id)
VALUES (1, 'Great model!', 1234);
```

## Migration Checklist for New Features

When adding new features that involve users:

- [ ] Use `user_id` (integer) for all foreign keys
- [ ] Do NOT add `auth_user_id` columns to new tables
- [ ] Only reference `auth_user_id` when linking to Supabase Auth
- [ ] Use integer comparisons in WHERE clauses
- [ ] Test with actual user_id values, not UUIDs

## Key Takeaways

1. **One Source of Truth**: `auth_user_id` lives ONLY in the `users` table
2. **Use Integers**: All other tables use `user_id` (integer) for relationships
3. **Performance**: Integer joins are faster than UUID joins
4. **Storage**: Integers take less space than UUIDs
5. **Simplicity**: Clear separation of concerns
