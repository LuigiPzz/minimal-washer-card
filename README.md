# Minimal Washer Card

[![hacs_badge](https://img.shields.io/badge/HACS-Custom-41BDF5.svg)](https://github.com/hacs/default)
[![GitHub Release](https://img.shields.io/github/v/release/LuigiPzz/minimal-washer-card?color=00b0ff)](https://github.com/LuigiPzz/minimal-washer-card/releases)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Una custom card per **Home Assistant (Lovelace)** dal design ultra-minimale ed elegante ispirato agli elettrodomestici contemporanei di alta gamma.

Include un configuratore visuale (GUI), animazioni realistiche e fluide per tutte le fasi del ciclo (lavaggio, centrifuga, asciugatura, avvio ritardato), palette monocromatica senza dominanti bluastre e supporto nativo per le Sezioni (Grid View) di Home Assistant.

---

## ✨ Caratteristiche Principali

- 🎨 **Design Monocromatico Pulito & Neutro**:
  - **Tema Scuro**: Tonalità grafite/antracite profondo e nero puro, privo di riflessi blu-grigiastri.
  - **Tema Chiaro**: Grigio satinato raffinato in alluminio/metallo chiaro (addio al bianco piatto).
  - Passaggio automatico tra tema chiaro e tema scuro basato sulle impostazioni di Home Assistant.
- 📐 **Supporto Nativo Sezioni Lovelace (Grid View)**:
  - Blocco intelligente della larghezza minima a **6 colonne** (50% di larghezza sezione) con altezza automatica.
  - Layout adattivo con **Container Queries** per scaling fluido su qualsiasi display o smartphone.
- 🌊 **Animazioni Dinamiche nell'Oblò (Drum)**:
  - 🌊 **Lavaggio / Risciacquo**: Onde d'acqua fluide a doppia frequenza.
  - 🌪️ **Centrifuga**: Anelli rotanti ultra-sottili ad altissima velocità.
  - ♨️ **Asciugatura**: Alone termico pulsante e linee di calore dinamiche.
  - 🕒 **Lavaggio Programmato / Partenza Ritardata**: Quadrante timer orbitante vettoriale con indicazione in grande del countdown.
- 🇮🇹 **Traduzione Automatica degli Stati del Ciclo**:
  - Converte automaticamente gli stati in inglese dei sensori (es. `idle`, `delaywash`, `laundrysensing`, `wash`, `spinning`, ecc.) in descrizioni in italiano chiare e leggibili su display multilinea.
- ⏱️ **Gestione Ore di Ritardo & Conversione `HH:MM`**:
  - Converte automaticamente valori numerici in ore decimali (`1.5` ➔ `01:30`) in ore e minuti formattati.
- 💡 **Manopola Centrale con Indicatori LED**:
  - 🟢 **LED Verde**: Elettrodomestico acceso.
  - 🔵 **LED Blu**: Connessione / Smart Control Wi-Fi attivo.
  - ⚫ **LED Spento**: Elettrodomestico spento.
- 🛠️ **Configuratore Visuale Integrato**:
  - Mappatura completa delle entità tramite editor UI standard (`ha-form`), senza necessità di modificare file YAML.

---

## 📦 Installazione

### Metodo 1: Tramite HACS (Consigliato)

1. Assicurati di avere [HACS](https://hacs.xyz/) installato in Home Assistant.
2. Vai su **HACS** > **Frontend** (o *Interfaccia*).
3. Clicca sui **3 puntini in alto a destra** e seleziona **Repository personalizzati** (*Custom repositories*).
4. Inserisci l'URL:
   ```text
   https://github.com/LuigiPzz/minimal-washer-card
   ```
5. Categoria: **Dashboard** (oppure *Lovelace*).
6. Clicca su **Aggiungi**, cerca **Minimal Washer Card** e premi **Scarica**.
7. Ricarica la dashboard di Home Assistant quando richiesto.

### Metodo 2: Installazione Manuale

1. Scarica il file `minimal-washer-card.js` dalla [pagina Release](https://github.com/LuigiPzz/minimal-washer-card/releases).
2. Copia il file nella cartella `config/www/` di Home Assistant (es. `/config/www/minimal-washer-card.js`).
3. Vai in **Impostazioni** > **Dashboard** > **3 puntini in alto a destra** > **Risorse**.
4. Aggiungi una risorsa:
   - **URL**: `/local/minimal-washer-card.js`
   - **Tipo**: `Modulo JavaScript` (`module`)
5. Ricarica la pagina del browser.

---

## ⚙️ Configurazione

### Configurazione Visuale (GUI)
1. Nella tua dashboard Lovelace, clicca su **Modifica Dashboard** > **Aggiungi Scheda**.
2. Cerca e seleziona **Minimal Washer Card**.
3. Seleziona le entità desiderate dai menu a tendina.

### Esempio YAML Completo

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

## 📋 Tabella dei Parametri

| Parametro | Tipo | Obbligatorio | Descrizione |
| :--- | :--- | :--- | :--- |
| `cycle_entity` | `entity_id` | **Sì** | Sensore con lo stato o fase corrente del ciclo della lavatrice. |
| `time_entity` | `entity_id` | **Sì** | Sensore del tempo rimanente o durata residua (es. `00:30`, `1h 15m`). |
| `progress_entity` | `entity_id` | No | Sensore numerico percentuale (0-100) per la barra di avanzamento. |
| `power_entity` | `entity_id` | No | Entità (`binary_sensor`, `switch`, `sensor`) per lo stato di accensione (LED verde). |
| `smart_control_entity` | `entity_id` | No | Entità (`binary_sensor`, `switch`, `sensor`) per lo stato Smart Control / Wi-Fi (LED blu). |
| `delay_entity` | `entity_id` | No | Sensore o `number` con le ore di ritardo (es. `number.lavatrice_ritardo_di_avvio` in formato decimale `x.xxxx` o orario), convertito automaticamente in formato `HH:MM`. |

---

## 🔄 Traduzione Automatica degli Stati del Ciclo

La card traduce e mappa automaticamente i seguenti stati:

| Valore Grezzo del Sensore | Testo Visualizzato sulla Card | Animazione Oblò Attiva |
| :--- | :--- | :--- |
| `idle` / `off` / `standby` | **Off** | *Nessuna* |
| `delaywash` / `delay_wash` / `delay` | **Lavaggio programmato** | 🕒 Timer Vettoriale Orbitante con Countdown |
| `laundrysensing` | **Rilevamento carico** | *Nessuna* |
| `weight_sensing` / `weightsensing` | **Rilevamento peso** | *Nessuna* |
| `wash` / `washing` | **Lavaggio** | 🌊 Onde d'Acqua Fluide |
| `rinse` / `rinsing` | **Risciacquo** | 🌊 Onde d'Acqua Fluide |
| `spin` / `spinning` | **Centrifuga** | 🌪️ Anelli Rotanti Alta Velocità |
| `drying` / `dry` | **Asciugatura** | ♨️ Alone Termico e Linee di Calore |
| `finish` / `finished` / `complete` / `end` | **Completato** | *Nessuna* |
| `drumcleaning` / `drum_cleaning` | **Pulizia cestello** | ✨ Vortice Sanificazione & Scintille |

---

## 📄 Licenza

Rilasciato sotto licenza [MIT](LICENSE).
