# Scripts Directory

This directory contains utility scripts for The Ribbon Club app.

---

## 📄 Available Scripts

### `seed-mock-data.ts`

Seeds mock data into your Supabase database.

---

## 🌱 Seeding Mock Data to Supabase

### ⚠️ Important Notes

1. **You DON'T need to run this** - Mock data works without Supabase
2. **Only run this if** you want mock data as real database entries
3. **This will create real records** in your Supabase database
4. **Use a development database** - don't run on production!

---

## 📋 Prerequisites

Before running the seed script, ensure you have:

1. **Supabase project set up** with all tables created
2. **Environment variables** configured:
   - `EXPO_PUBLIC_SUPABASE_URL` - Your Supabase project URL
   - `SUPABASE_SERVICE_ROLE_KEY` - Your service role key (NOT anon key!)

3. **Required tables** in Supabase:
   - `profiles`
   - `groups`
   - `group_members`
   - `events`
   - `rsvps`

4. **tsx installed** (for running TypeScript directly):
   ```bash
   npm install -g tsx
   # or
   npx tsx scripts/seed-mock-data.ts
   ```

---

## 🚀 How to Run

### Step 1: Get Service Role Key

1. Go to your Supabase dashboard
2. Navigate to **Settings** → **API**
3. Copy the **service_role** key (NOT the anon key!)
4. Add it to your `.env` file:

```env
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

### Step 2: Run the Seed Script

```bash
# Using npx (recommended)
npx tsx scripts/seed-mock-data.ts

# OR if you installed tsx globally
tsx scripts/seed-mock-data.ts
```

### Step 3: Wait for Completion

The script will:
- ✅ Insert 6 profiles
- ✅ Insert 8 groups with members
- ✅ Insert 6 events with RSVPs

Expected output:
```
🌱 Starting mock data seed...

📊 Summary:
  - 6 profiles
  - 8 groups
  - 6 events

⚠️  WARNING: This will insert data into your Supabase database!

📝 Seeding profiles...
  ✅ Inserted profile: Alex Rivera (uuid)
  ✅ Inserted profile: Jordan Lee (uuid)
  ...

👥 Seeding groups...
  ✅ Inserted group: Neurodivergent Coffee Lovers (uuid)
    ➕ Added 3 members
  ...

📅 Seeding events...
  ✅ Inserted event: Quiet Coffee Meetup (uuid)
    ➕ Added 3 RSVPs
  ...

✅ Seed completed successfully!
```

---

## 🔍 What Gets Inserted

### Profiles (6)
- Alex Rivera (they/them) - Autistic artist
- Jordan Lee (he/him) - ADHD developer
- Sam Chen (she/her) - Dyslexic writer
- Taylor Morgan (they/she) - Musician with synesthesia
- Riley Park (he/they) - Autistic engineer
- Casey Williams (she/they) - BPD activist

### Groups (8)
- Neurodivergent Coffee Lovers
- ADHD Creative Collective
- Outdoor Friends
- ND Gamers Unite
- Neurodivergent Writers Circle
- Autistic Adults Social Club
- Mental Health & Wellness
- Music & Sound Explorers

### Events (6)
- Quiet Coffee Meetup
- ADHD Crafting Circle
- Nature Walk & Photography
- Board Game Night - Low Sensory
- Poetry & Writing Workshop
- Movie Night: Cozy Edition

---

## 🛠️ Troubleshooting

### Error: "Missing Supabase credentials"
- Make sure `.env` file has both `EXPO_PUBLIC_SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`
- Load environment variables: `source .env` (on Mac/Linux) or restart terminal

### Error: "relation does not exist"
- Your database tables aren't set up yet
- Run migrations first: `npm run supabase:migrate`
- Or set up tables via Supabase dashboard

### Error: "permission denied"
- You're using the anon key instead of service_role key
- Service role key is needed for admin operations

### Duplicate key errors
- Data already exists in database
- Delete existing data or modify script to check first

### Photos not loading
- Mock data uses Unsplash URLs which require internet
- Photos are external URLs, not uploaded files

---

## 🔄 Re-running the Script

If you need to re-seed:

1. **Clean the database first:**
   ```sql
   -- In Supabase SQL editor
   DELETE FROM rsvps;
   DELETE FROM events;
   DELETE FROM group_members;
   DELETE FROM groups;
   DELETE FROM profiles WHERE display_name IN (
     'Alex Rivera', 'Jordan Lee', 'Sam Chen', 
     'Taylor Morgan', 'Riley Park', 'Casey Williams'
   );
   ```

2. **Then run seed script again**

---

## 🎯 When to Use This

**Use seed script if:**
- ✅ You want to test with "real" database data
- ✅ You want to demo without mock- prefixes
- ✅ You want to test Supabase queries
- ✅ You want persistent data across sessions

**Don't use seed script if:**
- ❌ You just want to develop locally (mock data works fine)
- ❌ You're on production database
- ❌ You want offline-first development

---

## 📝 Notes

- **Mock data vs Seeded data:** Mock data is client-side only, seeded data is in Supabase
- **IDs will be different:** Seeded data gets real UUIDs, not `mock-profile-1` etc.
- **Photos are URLs:** Photos link to Unsplash, not stored in Supabase storage
- **Service role key:** Keep this secret! Never commit to git
- **One-time operation:** You only need to run this once per environment

---

## 🔐 Security

**NEVER:**
- ❌ Commit service role key to git
- ❌ Use service role key in client code
- ❌ Run this on production database
- ❌ Share service role key publicly

**ALWAYS:**
- ✅ Use service role key only in server-side scripts
- ✅ Keep it in `.env` file (gitignored)
- ✅ Test on development database first
- ✅ Rotate keys if exposed

---

## ✅ Alternative: Keep Using Mock Data

**You can skip this entirely and just use mock data!**

Mock data works perfectly for development:
- No database setup needed
- Works offline
- Fast and predictable
- Easy to modify

The app automatically uses mock data when IDs start with `mock-`.

---

## 📞 Support

If you have issues:
1. Check Supabase logs in dashboard
2. Verify all tables exist
3. Check service role key is correct
4. Try manually inserting one record to test
5. Check the script output for specific errors

---

**Last Updated:** 2024  
**Version:** 1.0.0