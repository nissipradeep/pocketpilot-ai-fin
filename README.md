# 🦅 PocketPilot AI: The Future of Personal Finance

**PocketPilot AI** is a professional-grade, Full-Stack Financial Assistant designed for the modern global citizen. Built for the **Fintech AI Hackathon**, it leverages Generative AI and Secure Cloud Infrastructure to automate expense management for students, NRIs, and travelers.

---

## 🌟 Key Features

### 1. 🧠 PocketPilot Pro AI (Gemini 1.5 Flash)
- **Natural Language Interaction:** Ask complex questions via **Voice Command**.
- **Contextual Memory:** AI remembers your history to provide personalized coaching.
- **Rich Reporting:** AI generates Markdown-based tables and spending breakdowns.

### 2. 👁️ Secure AI-Vision (Next-Gen OCR)
- **Automatic Entry:** Snap a photo of any receipt (SMS, Paper, or Digital).
- **Privacy-Locked Proofs:** Actual images are stored in **Private Supabase Buckets**.
- **Smart Detection:** Automatically extracts Currency, Amount, and Category while discarding sensitive bank account numbers.

### 3. 🌍 Global NRI & Student Mode
- **Nationality-Based Setup:** Choose your native currency (INR, USD, AED, etc.) during onboarding.
- **Auto-Conversion:** Spend in any currency; the AI automatically converts the cost to your home currency.

---

## 🛡️ 100% Security & Privacy Architecture

To ensure your sensitive bank information is **never** accessible to unauthorized parties or scammers, we use a "Zero-Leak" security model:

### **1. Row Level Security (RLS) - The Ultimate Wall**
Our PostgreSQL database uses **RLS Policies**. This means the database itself blocks any request that doesn't come from the owner. 
- **Scammer Protection:** Even if a malicious user gains access to our API, they **cannot** fetch your transactions or images because their Auth Token will not match your Data Silo.

### **2. Ephemeral AI Analysis**
When you scan a receipt:
- We generate a **60-second Signed URL**.
- The AI "looks" at the image via this expiring link.
- After 60 seconds, the link self-destructs. There is no permanent public URL for your receipts.

### **3. Mandatory Privacy Agreement**
New users must explicitly agree to the Security Terms. This initializes their private encryption silo and confirms their understanding of our data-masking protocols.

### **4. AI Data Masking**
The Gemini Vision engine is programmatically instructed to **ignore and discard** full account numbers, CVVs, or UTR strings. It only stores the "Financial Fact" (Merchant & Amount).

---

## 🏗️ Technical Architecture

### **Frontend**
- React 18 / Vite / TypeScript
- Framer Motion (Animations)
- Tailwind CSS (Fintech Noir Theme)

### **Backend (Supabase)**
- **Auth:** Secure Email/Password with Recovery.
- **DB:** PostgreSQL with RLS enabled on all tables.
- **Storage:** Private Buckets for high-sensitivity documents.

---

## 🚀 Usage Guide
1. **Privacy Agreement:** Accept the security terms to activate your vault.
2. **Onboarding:** Set your Nationality and Goal.
3. **Track:** Use **Scan Receipt**. AI handles the extraction.
4. **Chat:** Ask: *"What's my 7-day spending trend?"*

---

## 🛠️ Installation & Setup
1. `npm install`
2. Configure `.env` with `SUPABASE_URL`, `SUPABASE_ANON_KEY`, and `GEMINI_API_KEY`.
3. Run `npm run dev`.
