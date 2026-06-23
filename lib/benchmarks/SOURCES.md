# Sources & méthodologie — benchmarks

Comparaison du même plan d'investissement (montants, fréquence, période
identiques) entre la crypto et trois supports classiques. Chaque support est
modélisé par un **indice de prix mensuel** (base 100) capitalisant au rythme
constaté, puis évalué avec le **même moteur `runBacktest`** que la crypto.

> Récupération : 23 juin 2026. Les sources d'historique boursier scriptables
> (stooq, Yahoo Finance) étant désormais protégées (anti-bot / rate-limit),
> l'indice MSCI World est **reconstitué à partir des performances annuelles
> officielles** plutôt que d'une série de cotations. C'est exact à l'échelle
> annuelle — suffisant pour un benchmark pluriannuel — au prix d'un lissage de
> la volatilité intra-annuelle.

## MSCI World — NET total return, EUR

Performances annuelles (factsheets MSCI, indice « MSCI World Net EUR ») :

| Année | Perf. | Année | Perf. |
|------|-------|------|-------|
| 2015 | +10,42 % | 2021 | +31,07 % |
| 2016 | +10,73 % | 2022 | −12,78 % |
| 2017 | +7,51 %  | 2023 | +19,60 % |
| 2018 | −4,11 %  | 2024 | +26,60 % |
| 2019 | +30,02 % | 2025 | +6,77 % |
| 2020 | +6,33 %  | 2026 | +4 % (partiel, estimation) |

Source : MSCI Index Factsheets — MSCI World Index (EUR), net.

## Livret A — taux réglementé

Calendrier officiel des taux (Banque de France / service-public.fr) :

`0,75 % (08/2015) → 0,50 % (02/2020) → 1 % (02/2022) → 2 % (08/2022) →
3 % (02/2023) → 2,40 % (02/2025) → 1,70 % (08/2025) → 1,50 % (02/2026)`

Intérêts exonérés d'impôt et de prélèvements sociaux.

## Inflation — IPC France (INSEE)

Moyenne annuelle, ensemble des ménages :

| Année | Inflation | Année | Inflation |
|------|-----------|------|-----------|
| 2015 | 0,0 % | 2021 | 1,6 % |
| 2016 | 0,2 % | 2022 | 5,2 % |
| 2017 | 1,0 % | 2023 | 4,9 % |
| 2018 | 1,8 % | 2024 | 2,0 % |
| 2019 | 1,1 % | 2025 | 0,9 % |
| 2020 | 0,5 % | 2026 | 1,2 % (partiel) |

Source : INSEE, indice des prix à la consommation.

## Fiscalité

Plus-value nette = après **prélèvement forfaitaire unique (flat tax 30 %)** pour
la crypto et l'ETF en compte-titres. Le **Livret A est exonéré**. Simplification :
la flat tax est appliquée sur la plus-value totale (et non versement par versement).
