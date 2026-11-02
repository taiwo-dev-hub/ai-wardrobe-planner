# Wardrobe AI — Digital Twin Wardrobe & Contextual Styling Engine

> An end-to-end full-stack SaaS that digitizes physical wardrobes, solves morning decision paralysis, and provides personalized virtual styling using multi-modal AI—all constrained to the clothes users already own.

---

## 💡 Executive Summary & Problem Space

Most wardrobe applications fail because they try to sell users *more* clothes rather than unlocking the utility of the clothes they already own. Physical wardrobe coordination is inefficient:
1. **Decision Fatigue:** The average person wastes 15–20 minutes daily choosing outfits, leading to friction and repetitive style habits.
2. **Underutilized Inventory:** Users often wear only 20% of their closet because they cannot visualize new combinations without the physical friction of trying on clothes.
3. **The Try-On Friction:** Experimenting with unconventional or elevated looks requires physical trial, error, and wasted time.

**The Solution:** Wardrobe AI replicates the user's physical wardrobe into an isolated digital inventory. Users can experiment with aesthetics (from everyday minimalist to bold and avant-garde), emulate specific style inspirations, and preview complete, coordinated looks with precise wearing notes—without touching a physical hanger.

---

## ⚡ Key Value Propositions

- **True Wardrobe Utility:** Combines, layers, and styles items *strictly* from the user’s authenticated inventory—no phantom recommendations or unsolicited e-commerce push.
- **Zero-Cost Client-Side Segmentation:** Removes backgrounds and isolates garment cutouts directly inside the browser using WebAssembly/WebGPU, eliminating recurring vision infrastructure costs.
- **Multimodal AI Tagging:** Automatically parses and structures uploaded clothing metadata (color harmony, silhouette, category, formality rating, occasion tags) via Google Gemini Vision.
- **Algorithmic Vibe Customization:** Matches user aesthetic intent (e.g., *Streetwear, Smart Casual, Old Money, Bold/Outlandish*) with outfit generation algorithms that respect proportion balancing and color theory.
- **Multi-Day Rotation Planning:** Generates 5-day workweek and 7-day scheduled plans with built-in deduplication logic to prevent consecutive garment repeats.
- **Credit-Gated Architecture:** Built-in atomic credit tracking and ledger enforcement ensuring sustainable API usage per account.

---

## 🛠 System Architecture & Technical Flow

