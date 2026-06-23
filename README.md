# Simulateur de plus-value crypto — S'investir

> Test technique — transposition du [simulateur crypto S'investir](https://sinvestir.fr/simulateur-crypto-monnaie/) au design et aux standards de la suite [simulateurs.sinvestir.fr](https://simulateurs.sinvestir.fr/).

Un simulateur qui calcule, sur **données historiques réelles**, ce qu'aurait rapporté un investissement crypto — **en une seule fois** ou **progressif (DCA)** — avec graphe d'évolution, plus-value / moins-value, et **comparaison de scénarios**.

- 🔗 **Démo en ligne** : _<URL Vercel à compléter après déploiement>_
- 📦 **Repo** : _<URL Git>_

---

## ✨ Fonctionnalités

- **Backtest historique** : lump-sum ou DCA (quotidien / hebdo / mensuel) sur les prix réels passés.
- **Indicateurs** : montant investi, valeur finale, plus/moins-value (€ et %), performance annualisée, quantité accumulée, prix de revient moyen.
- **Graphe** custom (SVG, zéro dépendance) : valeur du portefeuille vs capital investi, avec survol interactif.
- **Comparaison de scénarios** : deux stratégies côte à côte (ex. BTC vs ETH, ou lump-sum vs DCA).
- **Comparaison vs placement classique** : le même plan en **MSCI World** (ETF), **Livret A** et face à l'**inflation**, **net de flat tax 30 %** — message pédagogique on-brand.
- **Résultat partageable + image OG dynamique** : chaque simulation a une **URL dédiée** et une **carte Open Graph générée à la volée** (`next/og`) → partage viral sur les réseaux.
- **Capture de leads** : email au pic d'émotion → Supabase (repli `localStorage`), prêt à brancher au CRM / tunnel formation.
- **Mode embed** : route `/embed/crypto` sans habillage, prête à intégrer en `<iframe>` (auto-resize).
- **Simulations sauvegardées** : via Supabase (auth + RLS) ou repli `localStorage` — la démo marche sans backend.
- **Responsive** desktop / mobile, **fidèle au design** S'investir (dark navy, Lexend, bleu `#1098f7`, or `#f8d047`, **logo + favicon officiels**).

---

## 🧱 Stack & choix techniques

**Next.js 15 (App Router) · React 19 · TypeScript · Tailwind CSS v4** — déploiement **Vercel**.

### Pourquoi Next.js (et pas Nuxt) ?

En inspectant les bundles de `simulateurs.sinvestir.fr`, j'ai constaté que **la suite live tourne en Nuxt 3 + Nuxt UI + Tailwind v4** (chemins `/_nuxt/…`). Or la **stack interne annoncée** dans le test est **Next.js, Supabase, Vercel, Claude Code**. J'ai tranché pour **Next.js** parce que :

1. **Cohérence avec votre infra** annoncée (Next + Supabase + Vercel) et l'écosystème ciblé.
2. **Server Components + Route Handlers** = proxy CoinGecko propre (clé API **côté serveur**, cache, pas de CORS).
3. **Intégrabilité réelle** : le composant `<CryptoSimulator/>` est autonome et le widget `/embed` s'embarque en **iframe sur n'importe quel site** (dont le WordPress `sinvestir.fr`) — donc **indépendant du framework hôte**.

Le **design system a été reproduit fidèlement** depuis Nuxt UI en Tailwind v4 (mêmes tokens : navy, Lexend, `#1098f7`, `#f8d047`, vert gains / rouge pertes, cards glassmorphism). Si l'objectif était un _drop-in_ littéral dans le repo Nuxt existant, **les tokens se reportent 1:1** et le cœur métier (`lib/backtest.ts`, **fonctions pures**) est portable tel quel.

> Peu de dépendances : pas de librairie de graphes ni d'UI kit — uniquement Next, React, Tailwind et le client Supabase.

---

## 🚀 Démarrage

```bash
# 1. Dépendances
npm install

# 2. Variables d'environnement (toutes optionnelles pour la démo)
cp .env.example .env.local

# 3. (optionnel) régénérer le dataset historique embarqué
npm run fetch:data

# 4. Lancer
npm run dev          # http://localhost:3000
npm run build        # build de production
npm run test         # tests unitaires du moteur de backtest (Vitest)
```

Aucune clé n'est requise pour faire tourner la démo : le simulateur s'appuie sur le **dataset embarqué**. Les variables ci-dessous **enrichissent** l'expérience :

| Variable | Rôle | Sans la variable |
| --- | --- | --- |
| `COINGECKO_API_KEY` | Catalogue élargi + prix actuels (clé **demo gratuite**) | Catalogue = 12 cryptos embarquées |
| `NEXT_PUBLIC_SUPABASE_URL` / `_ANON_KEY` | Sauvegarde synchronisée + auth | Sauvegarde en `localStorage` |

---

## 🗂️ Architecture

```
app/
  page.tsx                          # accueil = simulateur (avec habillage)
  les-simulateurs/crypto/page.tsx   # même écran, route à la convention de la suite
  embed/crypto/page.tsx             # widget NU pour iframe (+ auto-resize)
  mes-simulations/page.tsx          # simulations sauvegardées
  api/coins/route.ts                # catalogue : CoinGecko live + repli bundle
  api/history/route.ts              # historique : bundle (long terme) | CoinGecko live
  api/og/route.tsx                  # image Open Graph dynamique par simulation
components/
  simulator/   CryptoSimulator · CryptoPicker · ScenarioForm · ValueChart · ResultSummary · ScenarioCompare
               BenchmarkCompare · ShareButton · LeadCapture · SaveSimulation · SavedList
  ui/          Card · Button · Stat · Segmented · Field · Spinner
  site/        Header · Footer · Logo
lib/
  backtest.ts                       # cœur métier PUR (lump-sum + DCA) — testé
  backtest.test.ts                  # 13 tests Vitest
  benchmarks/                       # MSCI World / Livret A / inflation + 5 tests (cf. SOURCES.md)
  share.ts                          # encode/décode le scénario dans l'URL
  coingecko.ts                      # client CoinGecko (serveur)
  fallback/                         # dataset historique embarqué (réel)
  simulations-store.ts              # Supabase | localStorage (transparent)
  leads-store.ts                    # capture email → Supabase | localStorage
  format.ts · cn.ts · types.ts
scripts/fetch-fallback.mjs          # (re)génère le dataset embarqué
supabase/schema.sql                 # tables (simulations, leads) + RLS
```

### Logique de backtest (`lib/backtest.ts`)

- **Lump-sum** : `unités = montant / prix(début)` ; `valeur = unités · prix(fin)`.
- **DCA** : à chaque versement `unités_i = montant / prix(dateᵢ)` ; on cumule unités & capital, `valeur = Σunités · prix(fin)`.
- Sortie : tous les indicateurs + la **série temporelle** pour le graphe. Couvert par **13 tests unitaires** (+ 5 sur les benchmarks).

> Le même moteur `runBacktest` sert aux **benchmarks** : chaque support classique (MSCI World, Livret A, inflation) est modélisé par un **indice de prix synthétique** capitalisant au rythme réel, puis backtesté à l'identique → comparaison _apples-to-apples_ sur le même plan.

### Données : `live + fallback`

L'API **gratuite de CoinGecko plafonne l'historique à 365 jours** — insuffisant pour des backtests pluriannuels (le cœur de l'outil). D'où la stratégie :

- **Source principale = dataset embarqué** : historique **hebdomadaire réel en EUR** (via Binance, depuis ~2019-2021) pour 12 cryptos majeures → backtests longue durée **fiables et hors-ligne**.
- **CoinGecko live** : catalogue élargi, logos et prix actuels ; historique ≤ 365 j pour les cryptos hors bundle.
- **Repli systématique** sur l'embarqué si l'API est indisponible → **la démo ne casse jamais**.

---

## 🔌 Intégration en iframe (embed)

Le widget vit à `/embed/crypto` (sans header/footer) et publie sa hauteur au parent pour un redimensionnement automatique :

```html
<iframe id="sim-crypto"
        src="https://VOTRE-DEPLOIEMENT.vercel.app/embed/crypto"
        style="width:100%;border:0" height="900" loading="lazy"></iframe>
<script>
  addEventListener("message", (e) => {
    if (e.data?.type === "sinvestir-simulator:height")
      document.getElementById("sim-crypto").style.height = e.data.height + "px";
  });
</script>
```

Les en-têtes `Content-Security-Policy: frame-ancestors` (cf. `next.config.ts`) autorisent l'intégration depuis `sinvestir.fr`.

---

## 💾 Supabase (optionnel)

Créez la table + RLS avec `supabase/schema.sql`, puis renseignez `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY`. Sans configuration, les simulations sont stockées en `localStorage` (la démo reste pleinement fonctionnelle).

---

## ☁️ Déploiement (Vercel)

1. Pousser le repo sur GitHub.
2. Importer le projet sur [vercel.com/new](https://vercel.com/new) (Next.js auto-détecté).
3. (Optionnel) ajouter les variables d'env. → **Deploy**.

---

## 💡 Suggestions d'amélioration (regard de partenaire)

Après avoir exploré vos outils, j'ai non seulement listé des pistes mais **déjà implémenté les plus rentables** dans cette démo.

### ✅ Déjà livré dans cette démo

- **Croissance virale.** URLs de résultat partageables (paramètres encodés) + **image OG dynamique** par simulation → fort taux de clic au partage.
- **Lead-gen.** Capture email au pic d'émotion → table `leads` (RLS, insertion anonyme, lecture back-office) → prêt à brancher au tunnel formation. _En prod : ajouter l'email transactionnel (Resend/Brevo) + la synchro CRM (HubSpot)._
- **Pédagogie « investir intelligemment ».** Comparaison crypto vs **MSCI World / Livret A / inflation**, **nette de flat tax 30 %** — colle à votre discours long terme.

### 🔜 Pistes supplémentaires

1. **Unifier la stack & l'embarquabilité.** Suite en Nuxt, stack annoncée en Next → **package de design-tokens partagé** + **widgets embarquables** (iframe / web components) framework-agnostiques, réutilisables jusque sur le WordPress `sinvestir.fr`.
2. **SEO.** Pousser le **SSR/ISR** sur toutes les pages simulateurs (gain sur des mots-clés finance à forte intention) ; le simulateur crypto est déjà rendu serveur ici.
3. **Automatisation & coûts.** Orchestration **n8n** (lead → CRM → séquence email) ; cache des séries historiques (Supabase/edge) pour réduire les appels CoinGecko.
4. **Crypto+.** Valeurs ajustées de l'inflation dans le graphe, **bougies OHLC**, et plans d'investissement programmés.

---

## ⚠️ Avertissement

Outil **pédagogique**. Les crypto-actifs sont très volatils ; **les performances passées ne préjugent pas des performances futures**. Ceci n'est **pas un conseil en investissement** et ne tient compte ni de votre situation personnelle ni de la fiscalité.
