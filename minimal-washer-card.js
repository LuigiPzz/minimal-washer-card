import {
  LitElement,
  html,
  css
} from "https://unpkg.com/lit-element@3.3.3/lit-element.js?module";

class MinimalWasherCardEditor extends LitElement {
  static get properties() {
    return {
      hass: { attribute: false },
      _config: { state: true }
    };
  }

  setConfig(config) {
    this._config = config;
  }

  get _schema() {
    return [
      {
        name: "cycle_entity",
        label: "Sensore Stato / Ciclo (Lavaggio, Centrifuga, ecc.)",
        required: true,
        selector: { entity: {} }
      },
      {
        name: "time_entity",
        label: "Sensore Tempo Residuo (es. 00:30)",
        required: true,
        selector: { entity: {} }
      },
      {
        name: "progress_entity",
        label: "Sensore Avanzamento % (Barra Orizzontale)",
        selector: { entity: {} }
      },
      {
        name: "power_entity",
        label: "Sensore Stato Accensione (LED Verde)",
        selector: { entity: { domain: ["binary_sensor", "switch", "sensor"] } }
      },
      {
        name: "smart_control_entity",
        label: "Sensore Controllo Smart (LED Blu)",
        selector: { entity: { domain: ["binary_sensor", "switch", "sensor"] } }
      },
      {
        name: "delay_entity",
        label: "Sensore/Number Ritardo Avvio (es. number.lavatrice_ritardo_di_avvio)",
        selector: { entity: { domain: ["number", "sensor", "input_number"] } }
      }
    ];
  }

  render() {
    if (!this.hass || !this._config) return html``;

    const currentTestMode = this._config.test_mode || "";

    return html`
      <ha-form
        .hass=${this.hass}
        .data=${this._config}
        .schema=${this._schema}
        .computeLabel=${s => s.label || s.name}
        @value-changed=${this._valueChanged}
      ></ha-form>

      <div class="test-panel">
        <div class="test-header">
          <div class="test-title">🧪 Modalità Test / Anteprima Stati</div>
          <div class="test-desc">Seleziona uno stato per visualizzare e testare subito le animazioni nell'anteprima:</div>
        </div>
        <div class="test-grid">
          <button type="button" class="test-btn ${currentTestMode === '' ? 'active' : ''}" @click=${() => this._setTestMode("")}>
            📡 Reale (Sensori)
          </button>
          <button type="button" class="test-btn ${currentTestMode === 'load_sensing' ? 'active' : ''}" @click=${() => this._setTestMode("load_sensing")}>
            🔍 Rilevamento Carico
          </button>
          <button type="button" class="test-btn ${currentTestMode === 'weight_sensing' ? 'active' : ''}" @click=${() => this._setTestMode("weight_sensing")}>
            ⚖️ Rilevamento Peso
          </button>
          <button type="button" class="test-btn ${currentTestMode === 'wash' ? 'active' : ''}" @click=${() => this._setTestMode("wash")}>
            🌊 Lavaggio
          </button>
          <button type="button" class="test-btn ${currentTestMode === 'rinse' ? 'active' : ''}" @click=${() => this._setTestMode("rinse")}>
            🌧️ Risciacquo
          </button>
          <button type="button" class="test-btn ${currentTestMode === 'spin' ? 'active' : ''}" @click=${() => this._setTestMode("spin")}>
            🌪️ Centrifuga
          </button>
          <button type="button" class="test-btn ${currentTestMode === 'drying' ? 'active' : ''}" @click=${() => this._setTestMode("drying")}>
            ♨️ Asciugatura
          </button>
          <button type="button" class="test-btn ${currentTestMode === 'finish' ? 'active' : ''}" @click=${() => this._setTestMode("finish")}>
            👕 Completato
          </button>
          <button type="button" class="test-btn ${currentTestMode === 'delay' ? 'active' : ''}" @click=${() => this._setTestMode("delay")}>
            🕒 Programmato
          </button>
          <button type="button" class="test-btn ${currentTestMode === 'clean' ? 'active' : ''}" @click=${() => this._setTestMode("clean")}>
            ✨ Pulizia Cestello
          </button>
        </div>
      </div>
    `;
  }

  _setTestMode(val) {
    const newConfig = { ...this._config };
    if (val) {
      newConfig.test_mode = val;
    } else {
      delete newConfig.test_mode;
    }
    const event = new CustomEvent("config-changed", {
      detail: { config: newConfig },
      bubbles: true,
      composed: true
    });
    this.dispatchEvent(event);
  }

  _valueChanged(ev) {
    const event = new CustomEvent("config-changed", {
      detail: { config: ev.detail.value },
      bubbles: true,
      composed: true
    });
    this.dispatchEvent(event);
  }

  static styles = css`
    ha-form {
      display: block;
      margin-bottom: 20px;
    }
    .test-panel {
      background: var(--secondary-background-color, rgba(255, 255, 255, 0.04));
      border: 1px solid var(--divider-color, rgba(255, 255, 255, 0.08));
      border-radius: 12px;
      padding: 14px;
      margin-bottom: 24px;
    }
    .test-header {
      margin-bottom: 12px;
      display: flex;
      flex-direction: column;
      gap: 3px;
    }
    .test-title {
      font-size: 0.9rem;
      font-weight: 700;
      color: var(--primary-text-color, #ffffff);
    }
    .test-desc {
      font-size: 0.76rem;
      color: var(--secondary-text-color, #8a919e);
    }
    .test-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(130px, 1fr));
      gap: 8px;
    }
    .test-btn {
      background: var(--card-background-color, rgba(255, 255, 255, 0.05));
      border: 1px solid var(--divider-color, rgba(255, 255, 255, 0.1));
      color: var(--primary-text-color, #f1f3f7);
      border-radius: 8px;
      padding: 8px 10px;
      font-size: 0.78rem;
      font-weight: 600;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      text-align: center;
      gap: 5px;
      transition: all 0.2s ease;
      box-sizing: border-box;
    }
    .test-btn:hover {
      border-color: #00b0ff;
      background: rgba(0, 176, 255, 0.08);
    }
    .test-btn.active {
      border-color: #00b0ff;
      background: rgba(0, 176, 255, 0.22);
      color: #00b0ff;
      font-weight: 700;
      box-shadow: 0 0 8px rgba(0, 176, 255, 0.25);
    }
  `;
}
customElements.define("minimal-washer-card-editor", MinimalWasherCardEditor);

class MinimalWasherCard extends LitElement {
  static get properties() {
    return {
      hass: { attribute: false },
      _config: { state: true }
    };
  }

  static async getConfigElement() {
    return document.createElement("minimal-washer-card-editor");
  }

  static getStubConfig() {
    return {
      cycle_entity: "",
      time_entity: "",
      progress_entity: "",
      power_entity: "",
      smart_control_entity: "",
      delay_entity: ""
    };
  }

  static getGridOptions() {
    return {
      columns: 6,
      min_columns: 6,
      max_columns: 12,
      rows: 5,
      min_rows: 5
    };
  }

  getGridOptions() {
    return {
      columns: 6,
      min_columns: 6,
      max_columns: 12,
      rows: 5,
      min_rows: 5
    };
  }

  getCardSize() {
    return 3;
  }

  _formatTime(rawVal) {
    if (rawVal === undefined || rawVal === null || rawVal === "" || rawVal === "unavailable" || rawVal === "unknown") {
      return "--:--";
    }
    const str = String(rawVal).trim().replace(",", ".");
    if (str.includes(":")) {
      const parts = str.split(":");
      if (parts.length >= 2) {
        return `${parts[0].padStart(2, "0")}:${parts[1].padStart(2, "0")}`;
      }
    }
    const num = parseFloat(str);
    if (!isNaN(num) && isFinite(num)) {
      let totalMinutes = 0;
      if (num > 24) {
        totalMinutes = Math.round(num);
      } else {
        totalMinutes = Math.round(num * 60);
      }
      const hours = Math.floor(totalMinutes / 60);
      const mins = totalMinutes % 60;
      return `${String(hours).padStart(2, "0")}:${String(mins).padStart(2, "0")}`;
    }
    return str;
  }

  _getCycleLabel(state) {
    if (!state) return "Off";
    const raw = String(state).trim();
    const key = raw.toLowerCase().replace(/[\s_-]+/g, "");
    const map = {
      idle: "Off",
      off: "Off",
      standby: "Standby",
      delay: "Programmato",
      delaywash: "Programmato",
      delay_wash: "Programmato",
      programmato: "Programmato",
      laundrysensing: "Rilevamento carico",
      laundry_sensing: "Rilevamento carico",
      weightsensing: "Rilevamento peso",
      weight_sensing: "Rilevamento peso",
      wash: "Lavaggio",
      washing: "Lavaggio",
      rinse: "Risciacquo",
      rinsing: "Risciacquo",
      spin: "Centrifuga",
      spinning: "Centrifuga",
      drying: "Asciugatura",
      dry: "Asciugatura",
      finish: "Completato",
      finished: "Completato",
      complete: "Completato",
      end: "Completato",
      drumclean: "Pulizia Cestello",
      drumcleaning: "Pulizia Cestello",
      drum_cleaning: "Pulizia Cestello",
      pulizia: "Pulizia Cestello",
      puliziacestello: "Pulizia Cestello",
      pulizia_cestello: "Pulizia Cestello"
    };
    return map[key] || map[raw.toLowerCase()] || raw;
  }

  setConfig(config) {
    if (!config.test_mode && (!config.cycle_entity || !config.time_entity)) {
      throw new Error("Specificare sia cycle_entity che time_entity.");
    }
    this._config = config;
  }

  render() {
    if (!this.hass || !this._config) return html``;

    let rawCycle = this._config.cycle_entity ? (this.hass.states[this._config.cycle_entity]?.state ?? "idle") : "idle";
    let rawTime = this._config.time_entity ? (this.hass.states[this._config.time_entity]?.state ?? "--:--") : "--:--";

    let progress = 0;
    if (this._config.progress_entity) {
      const p = parseFloat(this.hass.states[this._config.progress_entity]?.state);
      progress = isNaN(p) ? 0 : Math.max(0, Math.min(100, p));
    }

    let isPowerOn = true;
    if (this._config.power_entity) {
      const pState = this.hass.states[this._config.power_entity]?.state;
      isPowerOn = pState === "on" || pState === "true";
    }

    let isSmartOn = false;
    if (this._config.smart_control_entity) {
      const sState = this.hass.states[this._config.smart_control_entity]?.state;
      isSmartOn = sState === "on" || sState === "true";
    }

    // Modalità Test / Anteprima Rapida
    if (this._config.test_mode) {
      const tm = this._config.test_mode;
      isPowerOn = true;
      if (tm === "load_sensing" || tm === "sensing") {
        rawCycle = "laundrysensing";
        rawTime = "--:--";
        progress = 5;
      } else if (tm === "weight_sensing") {
        rawCycle = "weight_sensing";
        rawTime = "--:--";
        progress = 12;
      } else if (tm === "wash") {
        rawCycle = "wash";
        rawTime = "01:01";
        progress = 35;
      } else if (tm === "rinse") {
        rawCycle = "rinse";
        rawTime = "00:38";
        progress = 65;
      } else if (tm === "spin") {
        rawCycle = "spin";
        rawTime = "14:00";
        progress = 85;
      } else if (tm === "drying") {
        rawCycle = "drying";
        rawTime = "02:00";
        progress = 92;
        isSmartOn = true;
      } else if (tm === "finish") {
        rawCycle = "finish";
        rawTime = "00:00";
        progress = 100;
      } else if (tm === "delay") {
        rawCycle = "delay";
        rawTime = "03:30";
        progress = 0;
      } else if (tm === "clean") {
        rawCycle = "drumclean";
        rawTime = "01:15";
        progress = 50;
      }
    }

    const cycleLabel = this._getCycleLabel(rawCycle);

    let ledClass = "knob-led led-red";
    if (isPowerOn) {
      ledClass = isSmartOn ? "knob-led led-blue" : "knob-led led-green";
    }

    const cycleLower = String(rawCycle).toLowerCase();
    const isWeightSensing = cycleLower.includes("weight") || cycleLower.includes("peso");
    const isLoadSensing = !isWeightSensing && (cycleLower.includes("sensing") || cycleLower.includes("carico") || cycleLower.includes("laundry"));
    const isSensing = isLoadSensing || isWeightSensing;
    const isDelayWash = cycleLower.includes("delay") || cycleLower.includes("ritardo") || cycleLower.includes("programmato") || cycleLower.includes("posticipat") || cycleLower.includes("partenza");
    const isDrumCleaning = cycleLower.includes("drumclean") || cycleLower.includes("pulizia") || cycleLower.includes("clean");
    const isRinsing = !isDelayWash && !isDrumCleaning && !isSensing && (cycleLower.includes("rinse") || cycleLower.includes("risciacquo"));
    const isWashing = !isDelayWash && !isDrumCleaning && !isSensing && !isRinsing && (cycleLower.includes("wash") || cycleLower.includes("lavaggio"));
    const isDrying = !isDelayWash && !isDrumCleaning && !isSensing && (cycleLower.includes("drying") || cycleLower.includes("asciugatura") || (cycleLower.includes("dry") && !cycleLower.includes("laundry")));
    const isSpinning = !isDelayWash && !isDrumCleaning && !isSensing && (cycleLower.includes("spin") || cycleLower.includes("centrifuga"));
    const isFinished = isPowerOn && !isDelayWash && !isDrumCleaning && !isSensing && (cycleLower.includes("finish") || cycleLower.includes("complet") || cycleLower.includes("end"));

    // Colore dinamico anello di avanzamento basato sulla fase attiva
    let progressColor = "#00b0ff";
    if (isFinished) {
      progressColor = "#4ade80";
    } else if (isDrying) {
      progressColor = "#ff9800";
    } else if (isRinsing) {
      progressColor = "#079392";
    } else if (isSpinning) {
      progressColor = "#ffffff";
    } else if (isDrumCleaning) {
      progressColor = "#00b0ff";
    } else if (isDelayWash) {
      progressColor = "#9ca3af";
    } else if (isLoadSensing || isWeightSensing) {
      progressColor = "#38bdf8";
    }

    let delayFormatted = null;
    if (this._config.delay_entity) {
      const dState = this.hass.states[this._config.delay_entity]?.state;
      delayFormatted = this._formatTime(dState);
    }
    if (!delayFormatted || delayFormatted === "--:--") {
      delayFormatted = this._formatTime(rawTime);
    }

    const isOffOrIdle = !isPowerOn || cycleLower === "idle" || cycleLower === "off" || cycleLower === "standby" || cycleLower === "none" || cycleLower === "unavailable" || cycleLower === "unknown";
    const displayTime = isOffOrIdle ? "--:--" : (isDelayWash ? delayFormatted : this._formatTime(rawTime));
    const timeLabel = isDelayWash ? "Ritardo" : "Tempo";

    const isDarkMode = this.hass?.themes?.darkMode ?? (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches);
    const themeClass = isDarkMode ? "theme-dark" : "theme-light";

    return html`
      <div class="washer-card ${themeClass}">
        <div class="dashboard-top">
          <div class="display-panel">
            <div class="panel-section panel-left">
              <span class="display-label">Ciclo</span>
              <span class="display-value cycle-value">${cycleLabel}</span>
            </div>

            <div class="knob-container">
              <svg class="knob-progress-ring" viewBox="0 0 52 52">
                <circle class="knob-progress-bg" cx="26" cy="26" r="23" />
                <circle class="knob-progress-arc" cx="26" cy="26" r="23"
                  style="stroke: ${progressColor};"
                  stroke-dasharray="${144.51}"
                  stroke-dashoffset="${144.51 - (144.51 * progress / 100)}" />
              </svg>
              <div class="knob-body">
                <div class="${ledClass}"></div>
              </div>
            </div>

            <div class="panel-section panel-right">
              <span class="display-label">${timeLabel}</span>
              <span class="display-value time-value">${displayTime}</span>
            </div>
          </div>
        </div>

        <div class="drum-area">
          <div class="drum-outer-frame">
            <div class="drum-glass">
              <div class="liquid-wrapper" style="display: ${isWashing ? "block" : "none"};">
                <div class="wave-container">
                  <svg class="wave-svg wave-back" viewBox="0 0 800 120" preserveAspectRatio="none">
                    <path d="M 0 35 Q 100 65 200 35 T 400 35 T 600 35 T 800 35 L 800 120 L 0 120 Z"></path>
                  </svg>
                  <svg class="wave-svg wave-front" viewBox="0 0 800 120" preserveAspectRatio="none">
                    <path d="M 0 45 Q 100 15 200 45 T 400 45 T 600 45 T 800 45 L 800 120 L 0 120 Z"></path>
                  </svg>
                </div>
              </div>

              <div class="liquid-wrapper" style="display: ${isRinsing ? "block" : "none"};">
                <svg class="rinse-rain-svg" viewBox="0 0 100 100">
                  <line class="rinse-drop drop-c1-1" x1="28" y1="0" x2="28" y2="9"></line>
                  <line class="rinse-drop drop-c1-2" x1="28" y1="0" x2="28" y2="7"></line>
                  <line class="rinse-drop drop-c2-1" x1="42" y1="0" x2="42" y2="11"></line>
                  <line class="rinse-drop drop-c2-2" x1="42" y1="0" x2="42" y2="8"></line>
                  <line class="rinse-drop drop-c3-1" x1="58" y1="0" x2="58" y2="12"></line>
                  <line class="rinse-drop drop-c3-2" x1="58" y1="0" x2="58" y2="7"></line>
                  <line class="rinse-drop drop-c4-1" x1="72" y1="0" x2="72" y2="8"></line>
                  <line class="rinse-drop drop-c4-2" x1="72" y1="0" x2="72" y2="6"></line>
                </svg>
                <div class="wave-container rinse-wave-container">
                  <svg class="wave-svg rinse-wave-1" viewBox="0 0 800 120" preserveAspectRatio="none">
                    <path d="M 0 35 Q 100 65 200 35 T 400 35 T 600 35 T 800 35 L 800 120 L 0 120 Z"></path>
                  </svg>
                  <svg class="wave-svg rinse-wave-2" viewBox="0 0 800 120" preserveAspectRatio="none">
                    <path d="M 0 45 Q 100 15 200 45 T 400 45 T 600 45 T 800 45 L 800 120 L 0 120 Z"></path>
                  </svg>
                </div>
              </div>

              <div class="dry-fx-wrapper" style="display: ${isDrying ? "flex" : "none"};">
                <div class="dry-glow"></div>
                <svg class="heat-waves-svg" viewBox="0 0 60 70">
                  <path class="heat-line hl-1" d="M 16 60 C 10 46, 22 34, 16 20 C 12 10, 15 4, 16 2" />
                  <path class="heat-line hl-2" d="M 30 64 C 22 48, 38 36, 30 20 C 25 10, 29 4, 30 2" />
                  <path class="heat-line hl-3" d="M 44 60 C 38 46, 50 34, 44 20 C 40 10, 43 4, 44 2" />
                </svg>
              </div>

              <div class="spin-lines-wrapper" style="display: ${isSpinning ? "flex" : "none"};">
                <svg class="spin-svg" viewBox="0 0 100 100">
                  <circle class="spin-line spin-l0" cx="50" cy="50" r="47"></circle>
                  <circle class="spin-line spin-l1" cx="50" cy="50" r="43"></circle>
                  <circle class="spin-line spin-l2" cx="50" cy="50" r="38"></circle>
                  <circle class="spin-line spin-l3" cx="50" cy="50" r="26"></circle>
                  <circle class="spin-line spin-l4" cx="50" cy="50" r="20"></circle>
                </svg>
              </div>

              <div class="delay-fx-wrapper" style="display: ${isDelayWash ? "flex" : "none"};">
                <div class="delay-dial">
                  <svg class="delay-svg" viewBox="0 0 100 100">
                    <line class="delay-tick" x1="50" y1="14" x2="50" y2="18"></line>
                    <line class="delay-tick" x1="86" y1="50" x2="82" y2="50"></line>
                    <line class="delay-tick" x1="50" y1="86" x2="50" y2="82"></line>
                    <line class="delay-tick" x1="14" y1="50" x2="18" y2="50"></line>

                    <circle class="delay-track" cx="50" cy="50" r="36"></circle>
                    <circle class="delay-pulse-ring" cx="50" cy="50" r="36"></circle>
                    <line class="delay-hand" x1="50" y1="50" x2="50" y2="24"></line>
                    <circle class="delay-center-dot" cx="50" cy="50" r="3.2"></circle>
                  </svg>
                </div>
              </div>

              <div class="drumclean-fx-wrapper" style="display: ${isDrumCleaning ? "flex" : "none"};">
                <div class="clean-glow"></div>
                <svg class="drumclean-svg" viewBox="0 0 100 100">
                  <path class="clean-spray spray-1" d="M 50 14 A 36 36 0 0 1 86 50" />
                  <path class="clean-spray spray-2" d="M 86 50 A 36 36 0 0 1 50 86" />
                  <path class="clean-spray spray-3" d="M 50 86 A 36 36 0 0 1 14 50" />
                  <path class="clean-spray spray-4" d="M 14 50 A 36 36 0 0 1 50 14" />

                  <circle class="clean-sparkle sp-1" cx="35" cy="38" r="2.5"></circle>
                  <circle class="clean-sparkle sp-2" cx="65" cy="34" r="3"></circle>
                  <circle class="clean-sparkle sp-3" cx="68" cy="64" r="2.2"></circle>
                  <circle class="clean-sparkle sp-4" cx="36" cy="66" r="2.8"></circle>

                  <path class="clean-star" d="M 50 40 L 52.5 47.5 L 60 50 L 52.5 52.5 L 50 60 L 47.5 52.5 L 40 50 L 47.5 47.5 Z" />
                </svg>
              </div>

              <div class="sensing-load-wrapper" style="display: ${isLoadSensing ? "flex" : "none"};">
                <svg class="load-scanner-svg" viewBox="0 0 100 100">
                  <circle class="scan-grid-circle" cx="50" cy="50" r="38"></circle>
                  <circle class="scan-grid-circle" cx="50" cy="50" r="24"></circle>
                  <circle class="scan-grid-circle" cx="50" cy="50" r="12"></circle>
                  <g class="scan-beam">
                    <path d="M 50 50 L 50 12 A 38 38 0 0 1 78 24 Z" fill="url(#loadBeamGrad)" opacity="0.35" />
                  </g>
                  <circle class="laundry-node node-1" cx="38" cy="42" r="3.5" />
                  <circle class="laundry-node node-2" cx="62" cy="46" r="4.2" />
                  <circle class="laundry-node node-3" cx="48" cy="65" r="3.0" />
                  <g class="load-glass-group" transform-origin="50 50">
                    <line class="mag-target-cross" x1="42" y1="46" x2="54" y2="46" />
                    <line class="mag-target-cross" x1="48" y1="40" x2="48" y2="52" />
                    <circle class="mag-lens-rim" cx="48" cy="46" r="16" />
                    <path class="mag-glare" d="M 38 38 A 12 12 0 0 1 54 36" />
                    <line class="mag-handle" x1="60" y1="58" x2="74" y2="72" />
                    <circle cx="74" cy="72" r="2.2" fill="#94a3b8" />
                  </g>
                  <defs>
                    <linearGradient id="loadBeamGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stop-color="#38bdf8" stop-opacity="0.8"/>
                      <stop offset="100%" stop-color="#38bdf8" stop-opacity="0"/>
                    </linearGradient>
                  </defs>
                </svg>
              </div>

              <div class="sensing-weight-wrapper" style="display: ${isWeightSensing ? "flex" : "none"};">
                <svg class="weight-svg" viewBox="0 0 100 100">
                  <line class="scale-base-glow" x1="24" y1="78" x2="76" y2="78" />
                  <line class="scale-base" x1="22" y1="78" x2="78" y2="78" />
                  <g transform-origin="50 78">
                    <line class="pressure-line pl-1" x1="32" y1="84" x2="68" y2="84" />
                    <line class="pressure-line pl-2" x1="38" y1="88" x2="62" y2="88" />
                    <line class="pressure-line pl-3" x1="44" y1="92" x2="56" y2="92" />
                  </g>
                  <g class="kettlebell-group">
                    <path class="weight-handle" d="M 38 40 C 38 29, 62 29, 62 40" />
                    <line x1="42" y1="40" x2="58" y2="40" stroke="#64748b" stroke-width="1.8" />
                    <path class="weight-body" d="M 35 41 L 65 41 L 70 73 C 70 76, 30 76, 30 73 Z" />
                    <line x1="33" y1="47" x2="67" y2="47" stroke="rgba(255,255,255,0.18)" stroke-width="1" />
                    <line x1="32" y1="70" x2="68" y2="70" stroke="rgba(255,255,255,0.18)" stroke-width="1" />
                    <text class="weight-text" x="50" y="58">KG</text>
                  </g>
                </svg>
              </div>

              <div class="finish-fx-wrapper" style="display: ${isFinished ? "flex" : "none"};">
                <svg class="finish-svg" viewBox="0 0 100 100">
                  <g class="finish-shirt-group">
                    <path class="finish-shirt-body" d="M 36 30 L 20 38 L 26 50 L 32 46 L 32 75 L 68 75 L 68 46 L 74 50 L 80 38 L 64 30 C 60 36, 40 36, 36 30 Z" />
                    <path class="finish-shirt-collar" d="M 38 31 C 42 37, 58 37, 62 31" />
                    <path class="finish-shirt-pocket" d="M 39 46 L 47 46 L 47 54 C 47 56, 39 56, 39 54 Z" />
                  </g>
                  <g class="finish-sparkle sparkle-1">
                    <path d="M 75 16 C 75 22, 75 22, 83 24 C 75 24, 75 24, 75 32 C 75 24, 75 24, 67 24 C 75 24, 75 22, 75 16 Z" fill="#00b0ff" />
                    <circle cx="75" cy="24" r="1.5" fill="#ffffff" />
                  </g>
                  <g class="finish-sparkle sparkle-2">
                    <path d="M 20 56 C 20 60, 20 60, 26 62 C 20 62, 20 62, 20 68 C 20 62, 20 62, 14 62 C 20 62, 20 60, 20 56 Z" fill="#00e5ff" />
                    <circle cx="20" cy="62" r="1.2" fill="#ffffff" />
                  </g>
                  <g class="finish-sparkle sparkle-3">
                    <path d="M 68 62 C 68 65, 68 65, 72 66 C 68 66, 68 66, 68 70 C 68 66, 68 66, 64 66 C 68 66, 68 65, 68 62 Z" fill="#38bdf8" />
                    <circle cx="68" cy="66" r="1.0" fill="#ffffff" />
                  </g>
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  static styles = css`
    :host {
      display: flex;
      justify-content: center;
      box-sizing: border-box;
      width: 100%;
      height: 100%;
    }

    .washer-card {
      container-type: inline-size;
      border-radius: var(--ha-card-border-radius, 12px);
      padding: 8px 10px 10px 10px;
      display: flex;
      flex-direction: column;
      gap: 8px;
      box-sizing: border-box;
      user-select: none;
      position: relative;
      background: var(--mwc-card-bg);
      border: 1px solid var(--mwc-card-border);
      box-shadow: var(--mwc-card-shadow);
      transition: background 0.3s ease, border-color 0.3s ease;
      width: 100%;
      height: 100%;
      margin: 0;
      justify-content: space-between;
    }

    .theme-dark {
      --mwc-card-bg: var(--ha-card-background, var(--card-background-color, #181818));
      --mwc-card-border: var(--ha-card-border-color, var(--divider-color, rgba(255, 255, 255, 0.07)));
      --mwc-card-shadow: var(--ha-card-box-shadow, none);
      --mwc-display-bg: #222222;
      --mwc-display-border: rgba(255, 255, 255, 0.07);
      --mwc-label-color: #888888;
      --mwc-value-color: #f5f5f5;
      --mwc-track-bg: #2c2c2c;
      --mwc-progress-fill: var(--primary-color, #ffffff);
      --mwc-knob-bg: #202020;
      --mwc-knob-inner-bg: #292929;
      --mwc-knob-border: rgba(255, 255, 255, 0.08);
      --mwc-knob-indicator: #aaaaaa;
      --mwc-knob-led-off: #3a3a3a;
      --mwc-drum-frame-bg: #141414;
      --mwc-drum-frame-border: #202020;
      --mwc-drum-glass-start: #242424;
      --mwc-drum-glass-end: #0c0c0c;
    }

    .theme-light {
      --mwc-card-bg: #e2e2e2;
      --mwc-card-border: rgba(0, 0, 0, 0.08);
      --mwc-card-shadow: var(--ha-card-box-shadow, none);
      --mwc-display-bg: #d0d0d0;
      --mwc-display-border: rgba(0, 0, 0, 0.08);
      --mwc-label-color: #666666;
      --mwc-value-color: #111111;
      --mwc-track-bg: #b8b8b8;
      --mwc-progress-fill: var(--primary-color, #222222);
      --mwc-knob-bg: #c8c8c8;
      --mwc-knob-inner-bg: #bcbcbc;
      --mwc-knob-border: rgba(0, 0, 0, 0.1);
      --mwc-knob-indicator: #444444;
      --mwc-knob-led-off: #8e8e8e;
      --mwc-drum-frame-bg: #bfbfbf;
      --mwc-drum-frame-border: #ababab;
      --mwc-drum-glass-start: #242424;
      --mwc-drum-glass-end: #0e0e0e;
    }

    .dashboard-top {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 8px;
      position: relative;
      z-index: 5;
      width: 100%;
      flex-shrink: 0;
    }

    .display-panel {
      background: var(--mwc-display-bg);
      border: 1px solid var(--mwc-display-border);
      border-radius: 12px;
      padding: 6px 10px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 8px;
      width: 100%;
      box-sizing: border-box;
    }

    .panel-section {
      display: flex;
      flex-direction: column;
      gap: 2px;
      min-width: 0;
      flex: 1 1 0;
    }

    .panel-right {
      align-items: flex-end;
      text-align: right;
    }

    @container (max-width: 290px) {
      .washer-card {
        padding: 6px 8px 8px 8px;
        gap: 6px;
      }
      .dashboard-top {
        gap: 4px;
      }
      .display-panel {
        padding: 4px 6px;
        border-radius: 9px;
      }
      .display-label {
        font-size: 0.54rem;
      }
      .display-value {
        font-size: 0.80rem;
      }
      .knob-container {
        width: 44px;
        height: 44px;
      }
      .knob-body {
        width: 36px;
        height: 36px;
      }
      .knob-led {
        width: 3px;
        height: 3px;
        top: 3px;
      }
      .drum-outer-frame {
        border-width: 5px;
      }
    }

    .display-header-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 6px;
      width: 100%;
    }

    .display-label {
      font-size: 0.64rem;
      font-weight: 600;
      letter-spacing: 0.6px;
      color: var(--mwc-label-color);
      text-transform: uppercase;
      line-height: 1.2;
      flex-shrink: 0;
    }

    .display-value {
      font-size: 0.94rem;
      font-weight: 700;
      color: var(--mwc-value-color);
      letter-spacing: 0.3px;
      line-height: 1.15;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .time-value {
      font-size: clamp(0.78rem, 2.9cqi, 0.94rem);
      font-variant-numeric: tabular-nums;
      letter-spacing: 0.4px;
    }

    .cycle-value {
      font-size: clamp(0.72rem, 2.5cqi, 0.86rem);
      line-height: 1.15;
      white-space: normal;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    .progress-bar-track {
      width: 100%;
      height: 3px;
      background: var(--mwc-track-bg);
      border-radius: 2px;
      overflow: hidden;
    }

    .progress-bar-fill {
      height: 100%;
      background: var(--mwc-progress-fill);
      border-radius: 2px;
      transition: width 0.4s ease;
    }

    .knob-container {
      position: relative;
      width: 52px;
      height: 52px;
      flex-shrink: 0;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .knob-progress-ring {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      transform: rotate(-90deg);
      z-index: 1;
    }

    .knob-progress-bg {
      fill: none;
      stroke: rgba(255, 255, 255, 0.04);
      stroke-width: 2.5;
    }

    .knob-progress-arc {
      fill: none;
      stroke: #00b0ff;
      stroke-width: 2.5;
      stroke-linecap: round;
      transition: stroke-dashoffset 0.6s ease, stroke 0.4s ease;
    }

    .knob-body {
      width: 43px;
      height: 43px;
      border-radius: 50%;
      background: radial-gradient(circle at 50% 50%, var(--mwc-knob-inner-bg) 0%, var(--mwc-knob-bg) 100%);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.35), inset 0 1px 1px rgba(255, 255, 255, 0.1);
      border: 1px solid var(--mwc-knob-border);
      display: flex;
      align-items: center;
      justify-content: center;
      position: relative;
    }

    .knob-led {
      position: absolute;
      top: 4px;
      left: 50%;
      transform: translateX(-50%);
      width: 4px;
      height: 4px;
      border-radius: 50%;
      z-index: 10;
      transition: all 0.3s ease;
    }

    .led-off {
      background: var(--mwc-knob-led-off);
      box-shadow: none;
    }

    .led-red {
      background: #ff334b;
      box-shadow: 0 0 4px #ff334b, 0 0 8px rgba(255, 51, 75, 0.6);
    }

    .led-green {
      background: #00e676;
      box-shadow: 0 0 4px #00e676, 0 0 8px #00e676;
    }

    .led-blue {
      background: #00b0ff;
      box-shadow: 0 0 4px #00b0ff, 0 0 8px #00b0ff;
    }

    .drum-area {
      position: relative;
      width: 100%;
      aspect-ratio: 1 / 1;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: auto 0;
    }

    .drum-outer-frame {
      position: absolute;
      width: 88%;
      height: 88%;
      border-radius: 50%;
      background: var(--mwc-drum-frame-bg);
      border: 6px solid var(--mwc-drum-frame-border);
      box-shadow: 0 6px 18px rgba(0,0,0,0.35), inset 0 2px 8px rgba(0,0,0,0.5);
      box-sizing: border-box;
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;
    }

    .drum-glass {
      position: absolute;
      inset: 0;
      border-radius: 50%;
      background: radial-gradient(circle at 50% 50%, var(--mwc-drum-glass-start) 0%, var(--mwc-drum-glass-end) 100%);
      overflow: hidden;
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1;
    }

    .liquid-wrapper {
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
      border-radius: 50%;
      overflow: hidden;
      display: none;
      z-index: 2;
    }

    .wave-container {
      position: absolute;
      bottom: 0;
      left: 0;
      width: 100%;
      height: 52%;
      overflow: visible;
    }

    .wave-svg {
      position: absolute;
      top: -24px;
      left: 0;
      width: 200%;
      height: calc(100% + 24px);
      fill: #00aaff;
    }

    .wave-back {
      opacity: 0.45;
      animation: waveFlow 4.5s linear infinite reverse;
    }

    .wave-front {
      opacity: 0.8;
      animation: waveFlow 2.8s linear infinite;
    }

    @keyframes waveFlow {
      0% { transform: translateX(0); }
      100% { transform: translateX(-50%); }
    }

    .rinse-rain-svg {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      z-index: 3;
      pointer-events: none;
    }

    .rinse-drop {
      stroke-linecap: round;
    }

    .drop-c1-1 {
      stroke: #079392;
      stroke-width: 1.6;
      opacity: 0.65;
      animation: dropFallDense 1.3s infinite linear;
    }
    .drop-c1-2 {
      stroke: #2dd4bf;
      stroke-width: 1.4;
      opacity: 0.8;
      animation: dropFallDense 1.3s infinite linear 0.65s;
    }

    .drop-c2-1 {
      stroke: #2dd4bf;
      stroke-width: 1.8;
      opacity: 0.85;
      animation: dropFallDense 1.05s infinite linear 0.2s;
    }
    .drop-c2-2 {
      stroke: #079392;
      stroke-width: 1.5;
      opacity: 0.6;
      animation: dropFallDense 1.05s infinite linear 0.72s;
    }

    .drop-c3-1 {
      stroke: #2dd4bf;
      stroke-width: 1.8;
      opacity: 0.85;
      animation: dropFallDense 1.15s infinite linear 0.45s;
    }
    .drop-c3-2 {
      stroke: #079392;
      stroke-width: 1.4;
      opacity: 0.6;
      animation: dropFallDense 1.15s infinite linear 0.98s;
    }

    .drop-c4-1 {
      stroke: #079392;
      stroke-width: 1.6;
      opacity: 0.65;
      animation: dropFallDense 1.4s infinite linear 0.1s;
    }
    .drop-c4-2 {
      stroke: #2dd4bf;
      stroke-width: 1.3;
      opacity: 0.8;
      animation: dropFallDense 1.4s infinite linear 0.8s;
    }

    @keyframes dropFallDense {
      0% { transform: translateY(-40px); opacity: 0; }
      15% { opacity: 0.9; }
      80% { opacity: 0.9; }
      100% { transform: translateY(125px); opacity: 0; }
    }

    .rinse-wave-container {
      height: 45%;
    }

    .rinse-wave-1 {
      fill: #079392;
      opacity: 0.4;
      animation: waveFlow 4.5s linear infinite reverse;
    }

    .rinse-wave-2 {
      fill: #079392;
      opacity: 0.75;
      animation: waveFlow 2.8s linear infinite;
    }

    .dry-fx-wrapper {
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
      display: none;
      align-items: center;
      justify-content: center;
      z-index: 2;
    }

    .dry-glow {
      position: absolute;
      width: 65%;
      height: 65%;
      border-radius: 50%;
      background: radial-gradient(circle, rgba(255, 140, 40, 0.22) 0%, transparent 70%);
      animation: heatGlow 3s infinite ease-in-out;
    }

    @keyframes heatGlow {
      0%, 100% { transform: scale(0.92); opacity: 0.5; }
      50% { transform: scale(1.12); opacity: 0.85; }
    }

    .heat-waves-svg {
      width: 60%;
      height: 60%;
      overflow: visible;
      transform: rotate(90deg);
    }

    .heat-line {
      fill: none;
      stroke: #ff9800;
      stroke-linecap: round;
      opacity: 0.55;
    }

    .hl-1 {
      stroke-width: 1.8;
      animation: floatHeatHorizontal 2.4s infinite ease-in-out;
    }

    .hl-2 {
      stroke-width: 2.2;
      animation: floatHeatHorizontal 2.8s infinite ease-in-out 0.4s;
    }

    .hl-3 {
      stroke-width: 1.8;
      animation: floatHeatHorizontal 2.6s infinite ease-in-out 0.8s;
    }

    @keyframes floatHeatHorizontal {
      0%, 100% { transform: translateY(2px) scaleY(0.97); opacity: 0.35; }
      50% { transform: translateY(-4px) scaleY(1.03); opacity: 0.8; }
    }

    .spin-lines-wrapper {
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
      display: none;
      align-items: center;
      justify-content: center;
      z-index: 2;
    }

    .spin-svg {
      width: 94%;
      height: 94%;
    }

    .spin-line {
      fill: none;
      stroke-linecap: round;
      transform-origin: 50% 50%;
    }

    .spin-l0 {
      stroke: rgba(255, 255, 255, 0.65);
      stroke-width: 0.9;
      stroke-dasharray: 40 80 25 70;
      animation: spinRun 0.38s infinite linear;
    }

    .spin-l1 {
      stroke: rgba(255, 255, 255, 0.5);
      stroke-width: 0.85;
      stroke-dasharray: 60 70 20 80;
      animation: spinRun 0.44s infinite linear;
    }

    .spin-l2 {
      stroke: rgba(255, 255, 255, 0.35);
      stroke-width: 0.8;
      stroke-dasharray: 35 90 45 40;
      animation: spinRun 0.56s infinite linear;
    }

    .spin-l3 {
      stroke: rgba(255, 255, 255, 0.25);
      stroke-width: 1.0;
      stroke-dasharray: 85 110;
      animation: spinRun 0.48s infinite linear;
    }

    .spin-l4 {
      stroke: rgba(255, 255, 255, 0.16);
      stroke-width: 0.8;
      stroke-dasharray: 20 60 15 70;
      animation: spinRun 0.7s infinite linear;
    }

    @keyframes spinRun {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    .delay-fx-wrapper {
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
      display: none;
      align-items: center;
      justify-content: center;
      z-index: 2;
    }

    .delay-dial {
      position: relative;
      width: 82%;
      height: 82%;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .delay-svg {
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
    }

    .delay-tick {
      stroke: rgba(255, 255, 255, 0.22);
      stroke-width: 1.6;
      stroke-linecap: round;
    }

    .delay-track {
      fill: none;
      stroke: rgba(255, 255, 255, 0.08);
      stroke-width: 1.8;
    }

    .delay-pulse-ring {
      fill: none;
      stroke: #9ca3af;
      stroke-width: 2.2;
      stroke-dasharray: 45 140;
      stroke-linecap: round;
      transform-origin: 50% 50%;
      animation: spinRun 4s infinite linear;
      opacity: 0.85;
    }

    .delay-hand {
      stroke: #d1d5db;
      stroke-width: 2;
      stroke-linecap: round;
      transform-origin: 50% 50%;
      animation: spinRun 12s infinite linear;
      opacity: 0.85;
    }

    .delay-center-dot {
      fill: #9ca3af;
      opacity: 0.95;
    }

    .drumclean-fx-wrapper {
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
      display: none;
      align-items: center;
      justify-content: center;
      z-index: 2;
    }

    .clean-glow {
      position: absolute;
      width: 70%;
      height: 70%;
      border-radius: 50%;
      background: radial-gradient(circle, rgba(0, 176, 255, 0.24) 0%, transparent 70%);
      animation: cleanGlow 2.8s infinite ease-in-out;
    }

    @keyframes cleanGlow {
      0%, 100% { transform: scale(0.9); opacity: 0.4; }
      50% { transform: scale(1.15); opacity: 0.9; }
    }

    .drumclean-svg {
      width: 86%;
      height: 86%;
    }

    .clean-spray {
      fill: none;
      stroke: #00b0ff;
      stroke-width: 2.2;
      stroke-linecap: round;
      stroke-dasharray: 22 38;
      transform-origin: 50% 50%;
      animation: spinRun 2.2s infinite linear;
      opacity: 0.85;
    }

    .spray-2 { animation-delay: -0.55s; opacity: 0.7; stroke-width: 1.8; stroke: #00e5ff; }
    .spray-3 { animation-delay: -1.1s; opacity: 0.85; stroke-width: 2.2; stroke: #00b0ff; }
    .spray-4 { animation-delay: -1.65s; opacity: 0.7; stroke-width: 1.8; stroke: #00e5ff; }

    .clean-sparkle {
      fill: #00e5ff;
      opacity: 0.9;
      animation: sparklePulse 2s infinite ease-in-out;
      transform-origin: 50% 50%;
    }

    .sp-1 { animation-delay: 0.2s; }
    .sp-2 { animation-delay: 0.7s; }
    .sp-3 { animation-delay: 1.2s; }
    .sp-4 { animation-delay: 1.7s; }

    @keyframes sparklePulse {
      0%, 100% { transform: scale(0.7); opacity: 0.3; }
      50% { transform: scale(1.3); opacity: 1; }
    }

    .clean-star {
      fill: #00b0ff;
      opacity: 0.95;
      transform-origin: 50% 50%;
      animation: starRotate 4.5s infinite ease-in-out;
    }

    @keyframes starRotate {
      0% { transform: rotate(0deg) scale(0.85); opacity: 0.55; }
      50% { transform: rotate(180deg) scale(1.18); opacity: 1; }
      100% { transform: rotate(360deg) scale(0.85); opacity: 0.55; }
    }

    /* Rilevamento Carico (Scanner / Lente) */
    .sensing-load-wrapper {
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
      display: none;
      align-items: center;
      justify-content: center;
      z-index: 2;
    }

    .load-scanner-svg {
      width: 78%;
      height: 78%;
      overflow: visible;
    }

    .scan-grid-circle {
      fill: none;
      stroke: rgba(0, 176, 255, 0.12);
      stroke-width: 1;
      stroke-dasharray: 2 4;
    }

    .scan-beam {
      transform-origin: 50px 50px;
      animation: scanBeamSweep 3s infinite linear;
    }

    @keyframes scanBeamSweep {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    .load-glass-group {
      animation: magLensFloat 3.2s infinite ease-in-out;
    }

    @keyframes magLensFloat {
      0% { transform: translate(0px, 0px) rotate(0deg); }
      25% { transform: translate(-5px, -3px) rotate(-6deg); }
      50% { transform: translate(4px, 2px) rotate(4deg); }
      75% { transform: translate(-3px, 4px) rotate(-3deg); }
      100% { transform: translate(0px, 0px) rotate(0deg); }
    }

    .mag-lens-rim {
      fill: rgba(0, 176, 255, 0.08);
      stroke: #38bdf8;
      stroke-width: 2.2;
      filter: drop-shadow(0 0 4px rgba(56, 189, 248, 0.5));
    }

    .mag-handle {
      stroke: #94a3b8;
      stroke-width: 3.2;
      stroke-linecap: round;
    }

    .mag-glare {
      fill: none;
      stroke: rgba(255, 255, 255, 0.65);
      stroke-width: 1.6;
      stroke-linecap: round;
    }

    .mag-target-cross {
      stroke: rgba(56, 189, 248, 0.6);
      stroke-width: 1.2;
      stroke-dasharray: 2 2;
      animation: targetPulse 1.6s infinite ease-in-out;
    }

    @keyframes targetPulse {
      0%, 100% { opacity: 0.3; }
      50% { opacity: 0.9; }
    }

    .laundry-node {
      fill: #38bdf8;
      animation: laundryNodePulse 2.4s infinite ease-in-out;
      transform-origin: 50% 50%;
    }
    .node-1 { animation-delay: 0.2s; }
    .node-2 { animation-delay: 0.9s; }
    .node-3 { animation-delay: 1.6s; }

    @keyframes laundryNodePulse {
      0%, 100% { transform: scale(0.6); opacity: 0.2; }
      50% { transform: scale(1.3); opacity: 0.9; filter: drop-shadow(0 0 3px #38bdf8); }
    }

    /* Rilevamento Peso (Peso KG con molleggio e pressione) */
    .sensing-weight-wrapper {
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
      display: none;
      align-items: center;
      justify-content: center;
      z-index: 2;
    }

    .weight-svg {
      width: 76%;
      height: 76%;
      overflow: visible;
    }

    .scale-base {
      stroke: rgba(255, 255, 255, 0.15);
      stroke-width: 2;
      stroke-linecap: round;
    }

    .scale-base-glow {
      stroke: rgba(0, 229, 255, 0.2);
      stroke-width: 4;
      stroke-linecap: round;
    }

    .kettlebell-group {
      transform-origin: 50px 70px;
      animation: weightWeighingBounce 2.8s infinite cubic-bezier(0.4, 0, 0.2, 1);
    }

    @keyframes weightWeighingBounce {
      0% { transform: translateY(0px) scale(1, 1); }
      20% { transform: translateY(7px) scale(1.06, 0.94); }
      35% { transform: translateY(-4px) scale(0.97, 1.03); }
      50% { transform: translateY(3px) scale(1.02, 0.98); }
      65% { transform: translateY(-1px) scale(0.99, 1.01); }
      80%, 100% { transform: translateY(0px) scale(1, 1); }
    }

    .weight-handle {
      fill: none;
      stroke: #cbd5e1;
      stroke-width: 2.8;
      stroke-linecap: round;
    }

    .weight-body {
      fill: rgba(0, 176, 255, 0.12);
      stroke: #38bdf8;
      stroke-width: 2.2;
      stroke-linejoin: round;
      filter: drop-shadow(0 0 6px rgba(56, 189, 248, 0.4));
    }

    .weight-text {
      font-size: 11px;
      font-weight: 800;
      font-family: -apple-system, sans-serif;
      fill: #ffffff;
      text-anchor: middle;
      dominant-baseline: central;
      letter-spacing: 0.05em;
    }

    .pressure-line {
      stroke: #38bdf8;
      stroke-linecap: round;
      animation: pressurePulse 2.8s infinite ease-out;
    }
    .pl-1 { stroke-width: 2; animation-delay: 0.1s; }
    .pl-2 { stroke-width: 1.5; animation-delay: 0.25s; }
    .pl-3 { stroke-width: 1; animation-delay: 0.4s; }

    @keyframes pressurePulse {
      0%, 10% { opacity: 0; transform: scaleX(0.4); }
      25% { opacity: 0.9; transform: scaleX(1.1); }
      45% { opacity: 0.4; transform: scaleX(0.9); }
      70%, 100% { opacity: 0; transform: scaleX(0.5); }
    }

    .finish-fx-wrapper {
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
      display: none;
      align-items: center;
      justify-content: center;
      z-index: 2;
    }

    .finish-svg {
      width: 62%;
      height: 62%;
      overflow: visible;
    }

    .finish-shirt-group {
      transform-origin: 50px 52px;
      animation: finishShirtBreathe 4s infinite ease-in-out;
    }

    .finish-shirt-body {
      fill: rgba(255, 255, 255, 0.08);
      stroke: #f0f4f8;
      stroke-width: 2.0;
      stroke-linejoin: round;
      stroke-linecap: round;
    }

    .finish-shirt-collar {
      fill: none;
      stroke: #f0f4f8;
      stroke-width: 1.8;
      stroke-linecap: round;
    }

    .finish-shirt-pocket {
      fill: none;
      stroke: rgba(255, 255, 255, 0.3);
      stroke-width: 1.2;
      stroke-linejoin: round;
    }

    .sparkle-1 {
      transform-origin: 75px 24px;
      animation: finishSparkleTwinkle 2.2s infinite ease-in-out;
    }

    .sparkle-2 {
      transform-origin: 20px 62px;
      animation: finishSparkleTwinkle 2.2s infinite ease-in-out 0.75s;
    }

    .sparkle-3 {
      transform-origin: 68px 66px;
      animation: finishSparkleTwinkle 2.2s infinite ease-in-out 1.5s;
    }

    @keyframes finishSparkleTwinkle {
      0%, 100% {
        transform: scale(0.15) rotate(0deg);
        opacity: 0;
      }
      45%, 55% {
        transform: scale(1.15) rotate(45deg);
        opacity: 1;
        filter: drop-shadow(0 0 3px #00b0ff) drop-shadow(0 0 7px rgba(0, 176, 255, 0.8));
      }
      85% {
        transform: scale(0.2) rotate(90deg);
        opacity: 0;
      }
    }

    @keyframes finishShirtBreathe {
      0%, 100% { transform: scale(1); }
      50% { transform: scale(1.02); }
    }
  `;
}

customElements.define("minimal-washer-card", MinimalWasherCard);

window.customCards = window.customCards || [];
window.customCards.push({
  type: "minimal-washer-card",
  name: "Minimal Washer Card",
  description: "Card minimalista per lavatrice con manopola, display e animazioni dinamiche"
});
