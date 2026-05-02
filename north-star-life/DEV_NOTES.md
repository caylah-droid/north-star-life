MOBILE APP (Structure)
app/
components/
hooks/
assets/

npx expo start --tunnel

# 🚀 OPEN DEV APP
npm run dev

# 🚀 OPEN DATBASE UI
npx prisma studio

# 🚀 DEV WORKFLOW CHEAT SHEET

## 🧠 Core Flow

1. Edit code
2. See changes live (auto reload)
3. Test
4. Commit + push
5. Vercel updates production

---

## 💻 Terminal Basics

pwd → where am I
ls → what’s here
cd folder → move into folder

---

## ⚙️ Run App

npm install
npm run dev

---

## 🔁 Git Commands

git status
git add .
git commit -m "message"
git push

---

## 🧪 Database (Neon)

.env → DATABASE_URL
npx prisma db pull → sync structure
npx prisma generate → update client
npx prisma studio → view data

---

## 🔌 Architecture

Frontend → API → Database (Neon)


---

## 🧠 Mental Model

Codespaces = dev machine
GitHub = storage
Vercel = live app
Neon = database

---

## 🔥 Goal

Build → Test → Ship (not perfect setup)