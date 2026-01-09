import { Injectable, signal, computed } from '@angular/core';

export interface RadioStation {
  url: string;
  name: string;
  genre: string;
  lang: string;
  bitrate: string;
}

@Injectable({ providedIn: 'root' })
export class RadioService {
  private audio = new Audio();
  private audioContext?: AudioContext;
  private analyser?: AnalyserNode;
  private dataArray = new Uint8Array(0);

  // Signals para estado global
  public isPlaying = signal(false);
  public currentStation = signal<RadioStation | null>(null);
  public volume = signal(0.5);
  public frequencyData = signal<number[]>(new Array(16).fill(0));

  private rawData: string[] = [
    "https://cadena100-cope-rrcast.flumotion.com/cope/cadena100-low.mp3|Cadena 100|Pop|ES|128",
    "https://19993.live.streamtheworld.com/CADENADIAL.mp3|Cadena Dial|Pop|ES|128",
    "http://playerservices.streamtheworld.com/api/livestream-redirect/CADENASER_SC|Cadena SER|Pop|ES|128",
    "https://rtva-live-radio.flumotion.com/rtva/cfr.mp3|Canal Fiesta|radio|ES|128",
    "https://rtva-live-radio.flumotion.com/rtva/csr.mp3|Canal Sur|radio|ES|128",
    "http://livestreaming.esradio.fm/stream64.mp3|EsRadio|radio|ES|128",
    "https://str1.mediatelekom.net:9950/stream|EuropaFM|Éxitos|ES|128",
    "https://streaming12.elitecomunicacion.es/proxy/hitfmgranada/stream|Hit FM|Éxitos|ES|128",
    "http://stm1.emiteonline.com:8003/hitradio|Hit Radio FM|Pop|ES|112",
    "http://ibizaglobalradio.streaming-pro.com:8024|Ibiza Global Radio|radio|ES|128",
    "http://kissfm.kissfmradio.cires21.com/kissfm.mp3|KissFM|80s|ES|128",
    "https://s47.myradiostream.com:13914/;|Loca FM|Musica|ES|128",
    "https://s2.we4stream.com/listen/loca_dance/live|Loca FM - Dance|Musica|ES|128",
    "http://playerservices.streamtheworld.com/api/livestream-redirect/M80RADIO_SC|M80 Radio|80s|ES|128",
    "https://megastar-cope-rrcast.flumotion.com/cope/megastar.mp3|MEGASTAR FM|Éxitos|ES|128",
    "http://stream.zeno.fm/nrwv1923czzuv|Maxima FM|Electronica|ES|128",
    "https://laradiossl.online:10307/;|Melodia FM|radio|ES|128",
    "https://stream.zeno.fm/dzqaazsn3p8uv|OndaCero|Variedad|ES|96",
    "https://granada-copesedes-rrcast.flumotion.com/copesedes/granada-low.mp3|Radio Cope|radio|ES|128",
    "https://rockfm-cope-rrcast.flumotion.com/cope/rockfm-low.mp3|Rock FM|Rock|ES|96",
    "http://playerservices.streamtheworld.com/api/livestream-redirect/LOS40_SC|Los 40 Principales|Éxitos|ES|128",
    "https://playerservices.streamtheworld.com/api/livestream-redirect/LOS40_CLASSIC.mp3|LOS 40 CLASSIC|80s|ES|128",
    "https://us-b4-p-e-cg11-audio.cdn.mdstrm.com/live-audio-aw/65afe4a0357cec56667ac739|Flaix FM|Musica|CAT|128",
    "https://azura.abcorp.es/radio/8030/live|Gozadera FM|Reggaeton|ES|128",
    "https://rockfm-cope-rrcast.flumotion.com/cope/rockfm-low.mp3|RockFM Link2|Rock|ES|96",
    "http://streams1.mdtradio.com:8020/mdtweb|MDT Radio|Techno|ESP|128"
  ];

  public stations = signal<RadioStation[]>(this.parseStations());

  constructor() {
    this.audio.crossOrigin = "anonymous";
    this.audio.volume = this.volume();
  }

  private parseStations(): RadioStation[] {
    return this.rawData.map(line => {
      const [url, name, genre, lang, bitrate] = line.split('|');
      return { url, name, genre, lang, bitrate };
    });
  }

  playStation(station: RadioStation) {
    if (this.currentStation()?.url === station.url && this.isPlaying()) {
      this.pause();
      return;
    }
    this.audio.src = station.url;
    this.audio.play().then(() => {
      this.setupAnalyzer();
      this.isPlaying.set(true);
      this.currentStation.set(station);
    }).catch(err => console.error("Error stream:", err));
  }

  pause() {
    this.audio.pause();
    this.isPlaying.set(false);
  }

  updateVolume(v: number) {
    this.volume.set(v);
    this.audio.volume = v;
  }

  private setupAnalyzer() {
    if (this.audioContext) return;
    this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const source = this.audioContext.createMediaElementSource(this.audio);
    this.analyser = this.audioContext.createAnalyser();
    source.connect(this.analyser);
    this.analyser.connect(this.audioContext.destination);
    this.analyser.fftSize = 64;
    this.dataArray = new Uint8Array(this.analyser.frequencyBinCount);
    this.animate();
  }

  private animate() {
    if (this.analyser && this.isPlaying()) {
      this.analyser.getByteFrequencyData(this.dataArray);
      const values = Array.from(this.dataArray.slice(0, 16)).map(v => (v / 255) * 100);
      this.frequencyData.set(values);
    }
    requestAnimationFrame(() => this.animate());
  }
}