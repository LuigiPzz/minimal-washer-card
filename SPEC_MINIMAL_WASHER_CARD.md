# Specifica Tecnica Completa: Lovelace Custom Card "Minimal Washer Card"

## 1. Obiettivo del Progetto
Creare una scheda personalizzata (Custom Card) per Home Assistant (Lovelace), installabile tramite HACS o risorsa locale, con un'estetica scura ultra-minimale ispirata agli elettrodomestici di design.
La card include un'interfaccia di configurazione nativa (getConfigElement con ha-form) per mappare i sensori senza toccare il codice YAML.

---

## 2. Architettura & Stack Tecnologico
- Framework UI: LitElement / Web Components (Vanilla JS o TypeScript compilato ad ES Module).
- Target: Home Assistant Lovelace Dashboard.
- Registrazione Componente:
  - Card: minimal-washer-card
  - Editor: minimal-washer-card-editor
  - Registro window: Registrazione in window.customCards con type minimal-washer-card.

---

## 3. Parametri di Configurazione (Data Schema)

| Chiave | Tipo | Descrizione | Obbligatorio | Dominio Consigliato |
| :--- | :--- | :--- | :--- | :--- |
| cycle_entity | Entity ID | Sensore dello stato/fase corrente del ciclo (es. Lavaggio, Risciacquo, Centrifuga, Asciugatura, Spento) | Sì | sensor, input_select |
| time_entity | Entity ID | Sensore del tempo rimanente (es. 00:30, 1h 15m) | Sì | sensor |
| progress_entity | Entity ID | Sensore con valore numerico percentuale (0-100) per la barra di avanzamento | No | sensor, input_number |
| power_entity | Entity ID | Entità binaria o switch che indica se l'elettrodomestico è acceso o spento | No | binary_sensor, switch |
| smart_control_entity | Entity ID | Entità binaria o switch per la modalità Smart Control / Wi-Fi | No | binary_sensor, switch |

---

## 4. Dettagli Specifici dei Componenti

### 4.1. Top Bar & Display
- Dimensioni Display: Entrambi i box (display-box) hanno dimensioni identiche (width: 115px, height: 60px), padding 10px 12px, raggio bordo 14px, sfondo scuro #1b1f27 e bordo 1px solid rgba(255, 255, 255, 0.05).
- Display Sinistro (Ciclo):
  - Riga superiore: etichetta CICLO (grigio #6c7689, maiuscolo, font-size 0.58rem, peso 600).
  - Riga inferiore: valore dinamico estratto da cycle_entity (bianco #f0f4f8, font-size 0.85rem, peso 700).
- Display Destro (Tempo):
  - Riga superiore: layout a due colonne (a sinistra etichetta TEMPO, a destra valore orario time_entity).
  - Riga inferiore: barra di avanzamento lineare orizzontale (altezza 3px, fondo #252c38, fill azzurro #00b0ff proporzionale al valore progress_entity, senza percentuale numerica).

### 4.2. Manopola Centrale (Knob)
- Diametro esterno: 50px, circolare, scocca #1c212a e ombra 0 4px 12px rgba(0,0,0,0.35).
- Incavo centrale: diametro 32px, colore #252b37.
- Tacca indicatrice: linea verticale centrata in alto (spessore 2px, #8b97a8).
- LED di stato a ore 2:
  - Diametro 8px, ancorato sulla corona a ore 2.
  - Spento: grigio #373e4b.
  - Acceso standard: verde #00e676 con bagliore (power_entity = on).
  - Smart Control: azzurro #00b0ff con bagliore (smart_control_entity = on).

### 4.3. Oblò (Drum)
- Cornice esterna: centrata, 82% dell'area, circolare con bordo 10px #1a2029, fondo #111419.
- Vetro interno: gradiente radiale #161a22 verso #0b0d11.

---

## 5. Logica Animazioni (Oblò)
- Lavaggio (lavaggio / wash): Livello d'acqua al 52% con due onde sinusoidali sovrapposte (#00aaff, opacità 0.45 e 0.8) che scorrono a velocità alternate.
- Asciugatura (asciugatura / dry): Alone termico radiale ambrato con 3 linee morbide d'aria calda ruotate di 90° in orizzontale (colore #ff9800, fluttuazione continua).
- Centrifuga (centrifuga / spin): 5 anelli concentrici periferici (raggi 47, 43, 38, 32, 26) con segmenti ad arco monocromatici (bianco/grigio semitrasparente), ultrasottili (0.8-1.0px), asimmetrici e con rotazione ad altissima velocità.
