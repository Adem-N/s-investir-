# SCOPE — Test technique S'investir (Dév IA)

> Document de cadrage conservé dans le repo. Deadline : **mercredi 1er juillet 2026, 23h59**. Dépôt : https://tally.so/r/81E2lA

## Mission
Transposer le **simulateur crypto** de S'investir (modèle fonctionnel : https://sinvestir.fr/simulateur-crypto-monnaie/) au **design & standards** de la suite **simulateurs.sinvestir.fr**, et livrer une **démo en ligne fonctionnelle** (Vercel).

## Attendus & critères d'évaluation
1. **Démo fonctionnelle** manipulable (cœur du test).
2. **Fidélité au design** S'investir (couleurs, typo, composants, esprit).
3. **Qualité & intégrabilité du code** (compat stack annoncée *ou* choix justifié) — autonome & embarquable.
4. **Responsive** desktop + mobile.
5. **README** (lancement, partis pris) + **suggestions d'amélioration** (regard de partenaire).
6. Bonus : aperçu intégré (embedding) ; vidéo Loom 5 min.

## Livrables à déposer (formulaire Tally)
- Lien démo en ligne (Vercel) cliquable.
- Lien repo Git (public/lecture).
- Partis pris techniques & suggestions d'amélioration.
- (Bonus) Loom 5 min.

## Modèle fonctionnel à reproduire
Backtester historique : inputs `Cryptomonnaie` / `Montant` / `Fréquence` (une fois | quotidien | hebdo | mensuel = DCA) / `Date début`–`Date fin` → outputs `Montant total investi`, `Valeur` (graphe), `Plus-value ou moins-value`. 4 stratégies : lump-sum, DCA, comparaison de scénarios, backtesting. Mentions : volatilité, perf. passées ≠ futures, pas un conseil en investissement.

## Design cible (constaté)
Suite live = **Nuxt 3 + Nuxt UI + Tailwind v4**. Thème **dark navy** (`#080c16`/`#0f172a`/`#00173f`), police **Lexend**, primaire **bleu `#1098f7`**, accent **or `#f8d047`**, vert `#11d05a` (gains) / rouge `#ff0500` (pertes), cards glassmorphism, radius 8px.

## Décisions actées
- **Stack : Next.js 15 + React + Tailwind v4** (= stack annoncée Next/Supabase/Vercel ; justifié au README malgré la suite en Nuxt).
- **Périmètre complet** : backtest core + mode embed + comparaison de scénarios + simulations Supabase.
- **Données : live CoinGecko (catalogue/prix) + dataset historique embarqué (Binance, EUR)** — l'API gratuite CoinGecko plafonne l'historique à 365 j, d'où l'embarqué pour le long terme. Repli systématique → démo incassable.

## Statut de réalisation
✅ Stack & design system · ✅ Moteur de backtest (12 tests) · ✅ Data layer (live + fallback réel) · ✅ UI simulateur · ✅ Bonus (embed, comparaison, Supabase/localStorage) · ✅ Responsive · ✅ Build OK — Reste : déploiement Vercel + (option) Loom.
