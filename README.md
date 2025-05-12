

# SaveIt

**SaveIt** – *Save, Organize & Share Your Resources*
A modern web app to manage, share, and collaborate on curated online content.

---

## 🌟 Overview

**SaveIt** helps you:

* 🗂 Save and categorize useful links
* 🤝 Create groups and collaborate
* 📤 Share curated collections via social media
* 🔐 Authenticate users securely using **BetterAuth**
* ☁️ Store and fetch data in real time via **Supabase**

Perfect for teams, researchers, or individuals who need to organize and share resources efficiently.

---

## 🚀 Features

* 🔗 **Bookmark Management** – Save, edit, delete, and organize links
* 🏷 **Tags & Categories** – Organize content flexibly
* 👥 **Group Collaboration** – Create or join groups to manage resources together
* 🌐 **Social Sharing** – Share collections with others via public links
* 🔐 **Authentication** – Secure user login with [BetterAuth](https://betterauth.dev)
* 🧠 **Realtime & Storage** – Supabase provides storage, APIs, and database
* 💅 **Modern UI** – Responsive and clean interface using TailwindCSS and Next.js App Router

---

## 🛠 Tech Stack

* **Frontend**: [Next.js](https://nextjs.org/), [TypeScript](https://www.typescriptlang.org/), [TailwindCSS](https://tailwindcss.com/)
* **Auth**: [BetterAuth](https://betterauth.dev)
* **Backend/DB**: [Supabase](https://supabase.com/) (PostgreSQL + Realtime APIs)
* **Fonts**: [Vercel Fonts](https://vercel.com/font) with [Geist](https://vercel.com/font/geist)

---

## 📦 Getting Started

1. **Clone the repo**:

```bash
git clone https://github.com/duresaguye/saveit
cd saveit
```

2. **Install dependencies**:

```bash
npm install
```

3. **Set up environment variables**:
   Create a `.env.local` file:

```env
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
BETTERAUTH_CLIENT_ID=your-client-id
BETTERAUTH_SECRET=your-secret
```

4. **Run the development server**:

```bash
npm run dev
```

5. Visit [http://localhost:3000](http://localhost:3000)

---

## 📤 Deployment

Easily deploy via [Vercel](https://vercel.com) with your environment variables configured.

See [Next.js Deployment Docs](https://nextjs.org/docs/app/building-your-application/deploying) for more help.

---

## 📚 Learn More

* [BetterAuth Documentation](https://betterauth.dev/docs)
* [Supabase Docs](https://supabase.com/docs)
* [Next.js Docs](https://nextjs.org/docs)
* [TailwindCSS Docs](https://tailwindcss.com/docs)

---

## 🤝 Contributing

Contributions, suggestions, and issues are welcome!
Open a pull request or file an issue to get started.

