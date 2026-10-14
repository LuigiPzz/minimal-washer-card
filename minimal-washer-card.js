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

    return html`
      <ha-form
        .hass=${this.hass}
        .data=${this._config}
        .schema=${this._schema}
        .computeLabel=${s => s.label || s.name}
        @value-changed=${this._valueChanged}
      ></ha-form>
    `;
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
      margin-bottom: 24px;
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
      rows: "auto",
      min_rows: 2
    };
  }

  getGridOptions() {
    return {
      columns: 6,
      min_columns: 6,
      max_columns: 12,
      rows: "auto",
      min_rows: 2
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
      delaywash: "Lavaggio programmato",
      delay_wash: "Lavaggio programmato",
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
      drumcleaning: "Pulizia cestello",
      drum_cleaning: "Pulizia cestello",
      puliziacestello: "Pulizia cestello"
    };
    return map[key] || map[raw.toLowerCase()] || raw;
  }

  setConfig(config) {
    if (!config.cycle_entity || !config.time_entity) {
      throw new Error("Specificare sia cycle_entity che time_entity.");
    }
    this._config = config;
  }

  render() {
    if (!this.hass || !this._config) return html``;

    const rawCycle = this.hass.states[this._config.cycle_entity]?.state ?? "idle";
    const cycleLabel = this._getCycleLabel(rawCycle);
    const rawTime = this.hass.states[this._config.time_entity]?.state ?? "--:--";

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

    let ledClass = "knob-led led-red";
    if (isPowerOn) {
      ledClass = isSmartOn ? "knob-led led-blue" : "knob-led led-green";
    }

    const cycleLower = String(rawCycle).toLowerCase();
    const isSensing = cycleLower.includes("sensing") || cycleLower.includes("peso") || cycleLower.includes("carico") || cycleLower.includes("weight") || cycleLower.includes("laundry");
    const isDelayWash = cycleLower.includes("delay") || cycleLower.includes("ritardo") || cycleLower.includes("programmato") || cycleLower.includes("posticipat") || cycleLower.includes("partenza");
    const isDrumCleaning = cycleLower.includes("drumclean") || cycleLower.includes("pulizia") || cycleLower.includes("clean");
    const isWashing = !isDelayWash && !isDrumCleaning && !isSensing && (cycleLower.includes("wash") || cycleLower.includes("lavaggio") || cycleLower.includes("rinse") || cycleLower.includes("risciacquo"));
    const isDrying = !isDelayWash && !isDrumCleaning && !isSensing && (cycleLower.includes("drying") || cycleLower.includes("asciugatura") || (cycleLower.includes("dry") && !cycleLower.includes("laundry")));
    const isSpinning = !isDelayWash && !isDrumCleaning && !isSensing && (cycleLower.includes("spin") || cycleLower.includes("centrifuga"));

    let delayFormatted = null;
    if (this._config.delay_entity) {
      const dState = this.hass.states[this._config.delay_entity]?.state;
      delayFormatted = this._formatTime(dState);
    }
    if (!delayFormatted || delayFormatted === "--:--") {
      delayFormatted = this._formatTime(rawTime);
    }

    const displayTime = isDelayWash ? delayFormatted : this._formatTime(rawTime);
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
              <svg class="knob-progress-ring" viewBox="0 0 58 58">
                <circle class="knob-progress-bg" cx="29" cy="29" r="27" />
                <circle class="knob-progress-arc" cx="29" cy="29" r="27"
                  stroke-dasharray="${169.646}"
                  stroke-dashoffset="${169.646 - (169.646 * progress / 100)}"
                  style="--progress-glow: ${progress > 0 ? '1' : '0'};" />
              </svg>
              <div class="${ledClass}"></div>
              <div class="knob-body">
                <div class="knob-inner">
                  <div class="knob-indicator"></div>
                </div>
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

              <div class="sensing-fx-wrapper" style="display: ${isSensing ? "flex" : "none"};">
                <div class="sensing-radar">
                  <svg class="sensing-svg" viewBox="0 0 100 100">
                    <circle class="sensing-ring ring-1" cx="50" cy="50" r="38"></circle>
                    <circle class="sensing-ring ring-2" cx="50" cy="50" r="26"></circle>
                    <circle class="sensing-ring ring-3" cx="50" cy="50" r="14"></circle>
                    <line class="sensing-needle" x1="50" y1="50" x2="50" y2="18"></line>
                    <circle class="sensing-hub" cx="50" cy="50" r="3.2"></circle>
                  </svg>
                </div>
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
    }

    .washer-card {
      container-type: inline-size;
      border-radius: var(--ha-card-border-radius, 12px);
      padding: 16px 14px;
      display: flex;
      flex-direction: column;
      gap: 14px;
      box-sizing: border-box;
      user-select: none;
      position: relative;
      background: var(--mwc-card-bg);
      border: 1px solid var(--mwc-card-border);
      box-shadow: var(--mwc-card-shadow);
      transition: background 0.3s ease, border-color 0.3s ease;
      width: 100%;
      max-width: 320px;
      margin: 0 auto;
    }

    .theme-dark {
      --mwc-card-bg: var(--ha-card-background, var(--card-background-color, #181818));
      --mwc-card-border: var(--ha-card-border-color, var(--divider-color, rgba(255, 255, 255, 0.07)));
      --mwc-card-shadow: var(--ha-card-box-shadow, 0 16px 36px rgba(0, 0, 0, 0.5));
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
      --mwc-card-shadow: 0 12px 28px rgba(0, 0, 0, 0.08);
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
      gap: 10px;
      position: relative;
      z-index: 5;
      width: 100%;
    }

    .display-panel {
      background: var(--mwc-display-bg);
      border: 1px solid var(--mwc-display-border);
      border-radius: 14px;
      padding: 8px 12px;
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
        padding: 12px 10px;
        gap: 10px;
      }
      .dashboard-top {
        gap: 6px;
      }
      .display-panel {
        padding: 5px 8px;
        border-radius: 10px;
      }
      .display-label {
        font-size: 0.48rem;
      }
      .display-value {
        font-size: 0.72rem;
      }
      .knob-container {
        width: 48px;
        height: 48px;
      }
      .knob-body {
        width: 40px;
        height: 40px;
      }
      .knob-inner {
        width: 30px;
        height: 30px;
      }
      .knob-led {
        width: 6px;
        height: 6px;
      }
      .drum-outer-frame {
        width: 96%;
        height: 96%;
        border-width: 6px;
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
      font-size: 0.58rem;
      font-weight: 600;
      letter-spacing: 0.6px;
      color: var(--mwc-label-color);
      text-transform: uppercase;
      line-height: 1.2;
      flex-shrink: 0;
    }

    .display-value {
      font-size: 0.85rem;
      font-weight: 700;
      color: var(--mwc-value-color);
      letter-spacing: 0.3px;
      line-height: 1.15;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .time-value {
      font-size: clamp(0.72rem, 2.6cqi, 0.85rem);
      font-variant-numeric: tabular-nums;
      letter-spacing: 0.4px;
    }

    .cycle-value {
      font-size: clamp(0.66rem, 2.2cqi, 0.78rem);
      line-height: 1.1;
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
      width: 58px;
      height: 58px;
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
      stroke: rgba(255, 255, 255, 0.06);
      stroke-width: 3;
    }

    .knob-progress-arc {
      fill: none;
      stroke: #00b0ff;
      stroke-width: 3;
      stroke-linecap: round;
      transition: stroke-dashoffset 0.6s ease;
      filter: drop-shadow(0 0 4px rgba(0, 176, 255, var(--progress-glow, 0)));
    }

    .knob-body {
      width: 48px;
      height: 48px;
      border-radius: 50%;
      background: var(--mwc-knob-bg);
      box-shadow: 0 4px 12px rgba(0,0,0,0.2);
      border: 1px solid var(--mwc-knob-border);
      display: flex;
      align-items: center;
      justify-content: center;
      position: relative;
    }

    .knob-inner {
      width: 36px;
      height: 36px;
      border-radius: 50%;
      background: var(--mwc-knob-inner-bg);
      box-shadow: inset 0 2px 5px rgba(0,0,0,0.15);
      border: 1px solid var(--mwc-knob-border);
      position: relative;
    }

    .knob-indicator {
      position: absolute;
      top: 3px;
      left: 50%;
      transform: translateX(-50%);
      width: 2px;
      height: 7px;
      background: var(--mwc-knob-indicator);
      border-radius: 1px;
    }

    .knob-led {
      position: absolute;
      top: -2px;
      left: 50%;
      transform: translateX(-50%);
      width: 8px;
      height: 8px;
      border-radius: 50%;
      z-index: 10;
      transition: all 0.3s ease;
    }

    .led-off {
      background: var(--mwc-knob-led-off);
      box-shadow: none;
    }

    .led-red {
      background: #ff1744;
      box-shadow: 0 0 8px #ff1744, 0 0 16px #ff1744;
    }

    .led-green {
      background: #00e676;
      box-shadow: 0 0 8px #00e676, 0 0 16px #00e676;
    }

    .led-blue {
      background: #00b0ff;
      box-shadow: 0 0 8px #00b0ff, 0 0 16px #00b0ff;
    }

    .drum-area {
      position: relative;
      width: 100%;
      aspect-ratio: 1 / 1;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .drum-outer-frame {
      position: absolute;
      width: 94%;
      height: 94%;
      border-radius: 50%;
      background: var(--mwc-drum-frame-bg);
      border: 8px solid var(--mwc-drum-frame-border);
      box-shadow: 0 8px 24px rgba(0,0,0,0.35), inset 0 2px 10px rgba(0,0,0,0.5);
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
      overflow: hidden;
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
      stroke: var(--mwc-progress-fill, #ffffff);
      stroke-width: 2.2;
      stroke-dasharray: 45 140;
      stroke-linecap: round;
      transform-origin: 50% 50%;
      animation: spinRun 4s infinite linear;
      opacity: 0.85;
    }

    .delay-hand {
      stroke: var(--mwc-progress-fill, #ffffff);
      stroke-width: 2;
      stroke-linecap: round;
      transform-origin: 50% 50%;
      animation: spinRun 12s infinite linear;
      opacity: 0.6;
    }

    .delay-center-dot {
      fill: var(--mwc-progress-fill, #ffffff);
      opacity: 0.85;
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
      background: radial-gradient(circle, rgba(0, 210, 180, 0.22) 0%, transparent 70%);
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
      stroke: var(--mwc-progress-fill, #00d2b4);
      stroke-width: 2.2;
      stroke-linecap: round;
      stroke-dasharray: 22 38;
      transform-origin: 50% 50%;
      animation: spinRun 2.2s infinite linear;
      opacity: 0.8;
    }

    .spray-2 { animation-delay: -0.55s; opacity: 0.65; stroke-width: 1.8; }
    .spray-3 { animation-delay: -1.1s; opacity: 0.8; stroke-width: 2.2; }
    .spray-4 { animation-delay: -1.65s; opacity: 0.65; stroke-width: 1.8; }

    .clean-sparkle {
      fill: var(--mwc-progress-fill, #ffffff);
      opacity: 0.85;
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
      fill: var(--mwc-progress-fill, #ffffff);
      opacity: 0.9;
      transform-origin: 50% 50%;
      animation: starRotate 4.5s infinite ease-in-out;
    }

    @keyframes starRotate {
      0% { transform: rotate(0deg) scale(0.85); opacity: 0.55; }
      50% { transform: rotate(180deg) scale(1.18); opacity: 1; }
      100% { transform: rotate(360deg) scale(0.85); opacity: 0.55; }
    }

    .sensing-fx-wrapper {
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
      display: none;
      align-items: center;
      justify-content: center;
      z-index: 2;
    }

    .sensing-radar {
      width: 80%;
      height: 80%;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .sensing-svg {
      width: 100%;
      height: 100%;
    }

    .sensing-ring {
      fill: none;
      stroke: var(--mwc-progress-fill, #ffffff);
      stroke-width: 1.5;
      opacity: 0.25;
      transform-origin: 50% 50%;
    }

    .ring-1 {
      animation: sensingPulse 2.4s infinite ease-in-out;
      stroke-dasharray: 60 40;
    }

    .ring-2 {
      animation: sensingPulse 2.4s infinite ease-in-out 0.6s;
      stroke-dasharray: 40 30;
    }

    .ring-3 {
      animation: sensingPulse 2.4s infinite ease-in-out 1.2s;
    }

    @keyframes sensingPulse {
      0%, 100% { transform: scale(0.92); opacity: 0.2; }
      50% { transform: scale(1.06); opacity: 0.75; }
    }

    .sensing-needle {
      stroke: var(--mwc-progress-fill, #ffffff);
      stroke-width: 2.2;
      stroke-linecap: round;
      transform-origin: 50% 50%;
      animation: sensingTumble 2.6s infinite ease-in-out;
    }

    .sensing-hub {
      fill: var(--mwc-progress-fill, #ffffff);
      opacity: 0.9;
    }

    @keyframes sensingTumble {
      0% { transform: rotate(0deg); }
      25% { transform: rotate(40deg); }
      45% { transform: rotate(40deg); }
      70% { transform: rotate(-40deg); }
      85% { transform: rotate(-40deg); }
      100% { transform: rotate(0deg); }
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
