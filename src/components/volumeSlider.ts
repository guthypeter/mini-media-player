import { LitElement, html, css, CSSResult, property, customElement, TemplateResult } from 'lit-element';
import MediaPlayerObject from '../model';
import throttle from '../utils/throttle';

@customElement('mmp-volume-slider')
export class MiniMediaPlayerVolumeSlider extends LitElement {
    @property({ attribute: false }) public player!: MediaPlayerObject;

    static get properties() {
        return {
            value: { type: Number }
        };
    }

    private _value = 0;

    @property()
    private min;

    @property()
    private max;

    @property()
    private valuex;

    @property()
    private display = 0;

    @property()
    public volumehandlerleft=0;

    @property()
    public volumehandlerbgsize = 0;

    get value() {
        return this._value;
    }

    throttledUpdate = throttle(() => {
        console.log('requestUpdate');
        this.requestUpdate('value', this._value);
    }, 500, null);

    set value(val) {
        this._value = val;
        this.throttledUpdate();
        if (!this.touchActive) {
            this.volumehandlerleft = this._value;
        }

    }

    touchStartPos = 0;
    touchStartDatain = 0;
    touchActive = false;

    updateValue(pct) {
        if (pct >= 0) {
            const n: number = Math.round((this.max * pct / 100) / 5) * 5;
            this.value = pct;
            this.dispatchEvent(new Event('change', {
                composed: true
            }));
        }
    }


    private get ticks() {
        return [10, 20, 30, 40, 50, 60, 70, 80, 90];
    }


    constructor() {
        super();
        this.volumehandlerleft = this.value;
    }

    clicked(e:MouseEvent): void {
        // @ts-ignore
        const prnt: number = e.currentTarget.offsetWidth;
        const pos = e.offsetX;
        const pct = pos / prnt * 100;
        this.volumehandlerleft = pct;
        this.updateValue(pct);
        e.stopPropagation();
    }

    getVolumePosPct(e:TouchEvent): number {
        // @ts-ignore
        return (e.changedTouches[0].clientX - e.target.offsetLeft) / e.target.offsetWidth * 100;
    }

    volumeTouchStart(e:TouchEvent): void {
        this.touchActive = true;
        this.touchStartPos = this.getVolumePosPct(e);
        this.touchStartDatain = this.value;
    }

    updateHandler(pct:number): void {
        this.volumehandlerleft = pct;
    }

    volumeTouchMove(e:TouchEvent): void {
        if(! e.cancelable) return; // Scroll, ...

        const pct = this.getVolumePosPct(e);
        const dataOutPct = this.touchStartDatain / this.max * 100;
        let outPct = dataOutPct - (this.touchStartPos - pct) / 3;
        if (outPct < 0) {
            outPct = 0;
        }
        if (outPct > 100) {
            outPct = 100;
        }
        this.updateHandler(outPct);
        this.updateValue(outPct);
    }

    volumeTouchEnd(e:TouchEvent): void {
        if(! e.cancelable) return; // Scroll, ...

        e.preventDefault();
        this.touchActive = false;
        const pct = this.getVolumePosPct(e);
        if (Math.abs(pct - this.touchStartPos) < 5) {
            this.updateHandler(pct);
            this.updateValue(pct);
        }


    }
    render(): TemplateResult {
        return html`
            <div class="volume-slider" 
                 @click="${this.clicked}"
                 @touchstart="${this.volumeTouchStart}"
                 @touchmove="${this.volumeTouchMove}"
                 @touchend="${this.volumeTouchEnd}"
                 style="background-size: ${this.value}%">
                <div class="db center-align">${this.display} dB</div>
                ${this.ticks.map(tick => html`
                    <div class="volumetick" style="left: ${tick}%"></div>
                `)}
                <div class="volumehandler" style="left: ${this.volumehandlerleft}%"></div>
            </div>
        `;
    }

    static get styles(): CSSResult {
        return css`
          :host {
            width: 100%;

            position: relative;
            height: 2em;
            cursor: pointer;
            border-radius: var(--ha-card-border-radius, 12px);
            border-width: var(--ha-card-border-width, 1px);
            border-style: solid;
            border-color: var(--ha-card-border-color, var(--divider-color, #e0e0e0) );
          }
          
          .volume-slider {
            background-color: var(--primary-background-color);
            background-repeat: repeat-y;
            background-size: 100%;
            height: 100%;
            background-image: linear-gradient(280deg, rgba(0, 0, 0, 0.3), rgba(0, 0, 0, 0.3));

            border-radius: var(--ha-card-border-radius, 12px);
            border-width: var(--ha-card-border-width, 1px);
            border-style: solid;
            border-color: var(--ha-card-border-color, var(--divider-color, #e0e0e0) );

          }

          .volumetick {
            width: 0;
            height: 0;
            border-style: solid;
            border-width: 6px 2px 0 2px;
            border-color: var(--primary-color) transparent transparent transparent;

            top: 0;
            position: absolute;
            margin-left: -2px;

            pointer-events: none;
          }

          .volumehandler {
            width: 0;
            height: 0;
            border-style: solid;
            border-width: 15px 5px 0 5px;
            border-color: var(--dark-primary-color) transparent transparent transparent;

            position: absolute;
            top: 0;
            margin-left: -5px;

            pointer-events: none;
          }
          
          .db {
            text-align: center;
            margin-top: 4pt;
          }
        `;
    }
}
