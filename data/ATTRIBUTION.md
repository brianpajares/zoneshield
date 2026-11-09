# Data and model attribution

- **Risk scoring rules:** adapted from the ZoneShield v1 product kit supplied for this project (`zoneshield-kit/docs/02-ALGORITMO.md` and `zoneshield-kit/reference/engine.py` in the supplied ZIP). The weights are a documented heuristic, not a model trained or validated on a representative real-world dataset.
- **Reference cases:** the 12 synthetic cases in `zoneshield-kit/tests/casos-de-prueba.json`. The example bank and wallet names in those cases are fictional test fixtures.
- **Protected brand list:** only the fictional brands included in the reference test material. No real-world brand list is connected.
- **Shorteners and risky domain endings:** the initial configurable sample lists in the supplied reference engine. They are not proof that a domain is fraudulent.
- **External reputation sources:** none are connected in this preview. RDAP and Google Web Risk are described in the product kit, but this app does not call them.
- **Generative AI or model weights:** none are used.
- **Software dependencies:** each dependency's declared license is checked against `data/license-allowlist.json` by `npm run licenses`.

The interface presents an estimate and practical caution steps. It does not guarantee that a message or site is safe or fraudulent.
