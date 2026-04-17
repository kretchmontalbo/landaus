# 🏡 LandAus v2

**Find home, not rejection.** Australia's rental portal for immigrants and newcomers.

This is **v2** — now with auth, landlord dashboard, image uploads, suburb guides, and an admin panel.

---

## ✨ What's New in v2

- 🔐 **Supabase Auth** — email/password signup & login
- 🏠 **Landlord Dashboard** — manage listings, view inquiries
- 📸 **Image Upload** — proper file uploads to Supabase Storage (no more URL-paste nonsense)
- 🧭 **Suburb Guides** — dedicated pages for newcomer-friendly suburbs
- 👑 **Admin Panel** — full oversight at `/admin` (admin users only)
- 🌱 **35 Seed Properties** across NSW/VIC/QLD/WA/SA/ACT
- 🗺 **10 Suburb Guides** covering the most diverse Australian suburbs

---

## 🚀 Run Locally

```bash
npm install
npm run dev
# → http://localhost:5173
```

---

## 🌍 Deploy to Vercel

```bash
npx vercel
```

Or import the GitHub repo at [vercel.com/new](https://vercel.com/new). Vite is auto-detected.

---

## 👑 Making Yourself an Admin

After signing up, run this SQL in Supabase SQL editor (replace with YOUR email):

```sql
UPDATE profiles
SET user_type = 'admin'
WHERE email = 'your@email.com';
```

Then refresh the app and you'll see the **Admin** link in the nav, plus access to `/admin`.

---

## 📁 Project Structure

```
landaus/
├── index.html
├── package.json
├── vite.config.js
├── public/
│   └── favicon.svg
└── src/
    ├── main.jsx
    ├── App.jsx                    # Routes + auth guard
    ├── lib/
    │   ├── supabase.js            # Supabase client
    │   └── auth.jsx               # Auth context provider
    ├── components/
    │   ├── Layout.jsx             # Nav + Footer (auth-aware)
    │   └── PropertyCard.jsx
    ├── pages/
    │   ├── HomePage.jsx
    │   ├── SearchPage.jsx
    │   ├── PropertyDetailPage.jsx
    │   ├── ListPropertyPage.jsx   # 🔒 Requires login
    │   ├── LoginPage.jsx
    │   ├── SignupPage.jsx
    │   ├── DashboardPage.jsx      # 🔒 Landlord dashboard
    │   ├── AdminPage.jsx          # 🔒 Admin only
    │   ├── SuburbGuidesPage.jsx
    │   └── SuburbDetailPage.jsx
    └── styles/
        └── globals.css
```

---

## 🗄 Database

Live at: `https://uwyocrzcbqqaznoehuuz.supabase.co`

### Tables
- `profiles` — auto-created on signup via trigger
- `properties` — listings with newcomer-friendly flags
- `property_images` — listing photos (stored in `property-images` bucket)
- `inquiries` — tenant inquiries
- `saved_properties` — user favorites
- `suburb_guides` — newcomer suburb info

### Storage Buckets
- `property-images` — public, 5MB limit, images only

### RLS Policies
- Profiles: viewable by all, editable by owner or admin
- Properties: active ones viewable by all, managed by owner or admin
- Inquiries: viewable by property owner or admin
- Admins can see/manage everything

---

## 🎯 Routes

| Route | Public? | Description |
|-------|---------|-------------|
| `/` | ✅ | Homepage with featured listings |
| `/search` | ✅ | Filtered property search |
| `/property/:id` | ✅ | Property detail + inquiry form |
| `/suburbs` | ✅ | All suburb guides |
| `/suburbs/:slug` | ✅ | Suburb detail (e.g. `wentworth-point-nsw`) |
| `/login` | ✅ | Login page |
| `/signup` | ✅ | Signup (choose landlord or tenant) |
| `/list-property` | 🔒 | Create new listing |
| `/dashboard` | 🔒 | Landlord's listings + inquiries |
| `/admin` | 👑 | Admin command center |

---

## 💚 Brand

- **Name:** LandAus
- **Domain:** landaus.com.au
- **Tagline:** Find home, not rejection.
- **Colors:** Afterpay mint `#B2FCE4` + deep ink `#0A2540`
- **Fonts:** Fraunces (display) + Inter Tight (body)

Made with 💚 in Sydney. 2026.
