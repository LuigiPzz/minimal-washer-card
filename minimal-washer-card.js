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
      smart_control_entity: ""
    };
  }

  static getGridOptions() {
    return {
      columns: 12,
      min_columns: 6,
      rows: "auto",
      min_rows: 3
    };
  }

  getGridOptions() {
    return {
      columns: 12,
      min_columns: 6,
      rows: "auto",
      min_rows: 3
    };
  }

  getCardSize() {
    return 4;
  }

  setConfig(config) {
    if (!config.cycle_entity || !config.time_entity) {
      throw new Error("Specificare sia cycle_entity che time_entity.");
    }
    this._config = config;
  }

  render() {
    if (!this.hass || !this._config) return html``;

    const cycleState = this.hass.states[this._config.cycle_entity]?.state ?? "Spento";
    const timeState = this.hass.states[this._config.time_entity]?.state ?? "--:--";

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

    let ledClass = "knob-led led-off";
    if (isPowerOn) {
      ledClass = isSmartOn ? "knob-led led-blue" : "knob-led led-green";
    }

    const cycleLower = cycleState.toLowerCase();
    const isWashing = cycleLower.includes("lavaggio") || cycleLower.includes("wash");
    const isDrying = cycleLower.includes("asciugatura") || cycleLower.includes("dry");
    const isSpinning = cycleLower.includes("centrifuga") || cycleLower.includes("spin");

    const isDarkMode = this.hass?.themes?.darkMode ?? (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches);
    const themeClass = isDarkMode ? "theme-dark" : "theme-light";

    return html`
      <div class="washer-card ${themeClass}">
        <div class="dashboard-top">
          <div class="display-box">
            <div class="display-header-row">
              <span class="display-label">Ciclo</span>
            </div>
            <span class="display-value">${cycleState}</span>
          </div>

          <div class="knob-container">
            <div class="${ledClass}"></div>
            <div class="knob-body">
              <div class="knob-inner">
                <div class="knob-indicator"></div>
              </div>
            </div>
          </div>

          <div class="display-box">
            <div class="display-header-row">
              <span class="display-label">Tempo</span>
              <span class="display-value">${timeState}</span>
            </div>
            <div class="progress-bar-track">
              <div class="progress-bar-fill" style="width: ${progress}%;"></div>
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
            </div>
          </div>
        </div>
      </div>
    `;
  }

  static styles = css`
    :host {
      display: block;
      height: 100%;
    }

    .washer-card {
      container-type: inline-size;
      border-radius: var(--ha-card-border-radius, 24px);
      padding: 20px 18px;
      display: flex;
      flex-direction: column;
      gap: 20px;
      box-sizing: border-box;
      user-select: none;
      position: relative;
      background: var(--mwc-card-bg);
      border: 1px solid var(--mwc-card-border);
      box-shadow: var(--mwc-card-shadow);
      transition: background 0.3s ease, border-color 0.3s ease;
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

    .display-box {
      background: var(--mwc-display-bg);
      border: 1px solid var(--mwc-display-border);
      border-radius: 14px;
      padding: 8px 10px;
      flex: 1 1 0;
      min-width: 0;
      height: 56px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      box-sizing: border-box;
    }

    @container (max-width: 290px) {
      .washer-card {
        padding: 14px 12px;
        gap: 14px;
      }
      .dashboard-top {
        gap: 8px;
      }
      .display-box {
        padding: 6px 8px;
        height: 50px;
        border-radius: 10px;
      }
      .display-label {
        font-size: 0.50rem;
      }
      .display-value {
        font-size: 0.74rem;
      }
      .knob-container {
        width: 44px;
        height: 44px;
      }
      .knob-body {
        width: 42px;
        height: 42px;
      }
      .knob-inner {
        width: 26px;
        height: 26px;
      }
      .knob-led {
        width: 7px;
        height: 7px;
      }
      .drum-outer-frame {
        width: 90%;
        height: 90%;
        border-width: 7px;
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
      letter-spacing: 0.4px;
      line-height: 1.2;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
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

    .knob-body {
      width: 50px;
      height: 50px;
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
      width: 32px;
      height: 32px;
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
      top: 0px;
      right: 0px;
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
      width: 82%;
      height: 82%;
      border-radius: 50%;
      background: var(--mwc-drum-frame-bg);
      border: 10px solid var(--mwc-drum-frame-border);
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
  `;
}

customElements.define("minimal-washer-card", MinimalWasherCard);

window.customCards = window.customCards || [];
window.customCards.push({
  type: "minimal-washer-card",
  name: "Minimal Washer Card",
  description: "Card minimalista per lavatrice con manopola, display e animazioni dinamiche"
});
