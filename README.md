# Minimal Washer Card

[![hacs_badge](https://img.shields.io/badge/HACS-Custom-41BDF5.svg)](https://github.com/hacs/default)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Una custom card per Home Assistant (Lovelace) dal design scuro ultra-minimale ed elegante ispirato agli elettrodomestici di design contemporanei. Include animazioni dinamiche per le fasi di lavaggio, centrifuga e asciugatura, oltre a un editor visuale integrato nell'interfaccia di Home Assistant.

---

## ✨ Funzionalità

- **UI Minimalista & Dark**: Stile premium con display gemelli, manopola centrale e oblò interattivo.
- **Animazioni Realistiche nello Drum/Oblò**:
  - 🌊 **Lavaggio**: Onde d'acqua fluide e dinamiche.
  - 🌪️ **Centrifuga**: Anelli rotanti ad alta velocità.
  - ♨️ **Asciugatura**: Alone termico pulsante e linee di calore fluttuanti.
- **Indicatori LED Intelligenti**:
  - 🟢 **Verde**: Elettrodomestico acceso.
  - 🔵 **Blu**: Modalità Smart Control / Wi-Fi attiva.
  - ⚫ **Spento**: Elettrodomestico spento.
- **Barra di Avanzamento Dinamica**: Integrata direttamente sotto il tempo rimanente.
- **Configuratore Visuale UI (GUI)**: Configura tutte le entità tramite il configuratore standard di Home Assistant (`ha-form`), senza bisogno di scrivere YAML.

---

## 📦 Installazione

### Metodo 1: Tramite HACS (Consigliato)

1. Assicurati che [HACS](https://hacs.xyz/) sia installato in Home Assistant.
2. Vai su **HACS** > **Frontend** (o Interfaccia).
3. Clicca sui 3 puntini in alto a destra e seleziona **Repository personalizzati** (Custom repositories).
4. Incolla l'URL della repository GitHub: `https://github.com/LuigiPzz/minimal-washer-card`.
5. Seleziona la categoria **Dashboard** / **Lovelace**.
6. Clicca su **Aggiungi**, trova la card e clicca su **Scarica**.
7. Ricarica la dashboard di Lovelace quando richiesto.

### Metodo 2: Installazione Manuale

1. Scarica il file `minimal-washer-card.js` dalla release o dalla repository.
2. Copialo nella cartella `config/www/` della tua installazione di Home Assistant (es. `config/www/minimal-washer-card.js`).
3. Vai in **Impostazioni** > **Dashboard** > **Risorse** (in alto a destra nei tre puntini).
4. Aggiungi una nuova risorsa:
   - **URL**: `/local/minimal-washer-card.js`
   - **Tipo**: `Modulo JavaScript`
5. Ricarica la pagina del browser.

---

## ⚙️ Configurazione

### Tramite Editor Visuale (GUI)
1. Nella tua dashboard Lovelace, clicca su **Modifica Dashboard** > **Aggiungi Scheda**.
2. Cerca **Minimal Washer Card**.
3. Seleziona i sensori nei rispettivi campi.

### Esempio YAML

```yaml
type: custom:minimal-washer-card
cycle_entity: sensor.lavatrice_fase_ciclo
time_entity: sensor.lavatrice_tempo_rimanente
progress_entity: sensor.lavatrice_avanzamento_percentuale
power_entity: binary_sensor.lavatrice_alimentazione
smart_control_entity: binary_sensor.lavatrice_smart_control
delay_entity: number.lavatrice_ritardo_di_avvio
```

---

## 📋 Parametri di Configurazione

| Parametro | Tipo | Obbligatorio | Descrizione |
| :--- | :--- | :--- | :--- |
| `cycle_entity` | `entity_id` | **Sì** | Sensore con lo stato/fase del ciclo (es. *Lavaggio*, *Risciacquo*, *Centrifuga*, *Asciugatura*, *Delay Wash / Ritardo*, *Spento*). |
| `time_entity` | `entity_id` | **Sì** | Sensore che riporta il tempo residuo (es. `00:30`, `1h 15m`). |
| `progress_entity` | `entity_id` | No | Sensore numerico percentuale (0-100) per la barra di progresso. |
| `power_entity` | `entity_id` | No | Entità (`binary_sensor`, `switch`, `sensor`) per lo stato di accensione (LED verde). |
| `smart_control_entity` | `entity_id` | No | Entità (`binary_sensor`, `switch`, `sensor`) per il controllo Smart (LED blu). |
| `delay_entity` | `entity_id` | No | Sensore o `number` con le ore di ritardo (es. `number.lavatrice_ritardo_di_avvio` in formato decimale `x.xxxx` o orario), convertito automaticamente in formato `HH:MM`. |

---

## 🎨 Riconoscimento Fasi Ciclo
Le animazioni dell'oblò si attivano automaticamente leggendo lo stato di `cycle_entity`:
- **Lavaggio**: Se il valore contiene `lavaggio` o `wash`.
- **Centrifuga**: Se il valore contiene `centrifuga` o `spin`.
- **Asciugatura**: Se il valore contiene `asciugatura` o `dry`.
- **Avvio Ritardato**: Se il valore contiene `delay`, `ritardo`, `partenza` o `posticipat` (attiva l'animazione timer orbitante con countdown in formato `HH:MM`).

---

## 📄 Licenza
Rilasciato sotto licenza [MIT](LICENSE).
