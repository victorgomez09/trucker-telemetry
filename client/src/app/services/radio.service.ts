import { Injectable, signal } from '@angular/core';

export interface RadioStation {
  id: number;
  url: string;
  name: string;
  genre: string;
  lang: string;
  bitrate: string;
}

@Injectable({ providedIn: 'root' })
export class RadioService {
  public audio = new Audio();
  private audioContext?: AudioContext;
  private analyser?: AnalyserNode;
  private source?: MediaElementAudioSourceNode;

  public isPlaying = signal(false);
  public currentStation = signal<any>(null);
  public frequencyData = signal<number[]>(new Array(16).fill(0));
  public volume = signal(0.5);

  private rawData: string[] = [
    'http://playerservices.streamtheworld.com/api/livestream-redirect/LOS40.mp3|Los 40 Principales|Éxitos|ESP|128|1',
    'https://playerservices.streamtheworld.com/api/livestream-redirect/LOS40_CLASSIC.mp3|Los 40 Classic|Exitos de siempre|ESP|128|1',
    'https://playerservices.streamtheworld.com/api/livestream-redirect/LOS40_DANCE.mp3|Los 40 Dance|Dance|ESP|128|1',
    'https://playerservices.streamtheworld.com/api/livestream-redirect/LOS40_URBAN.mp3|Los 40 Urban|Reguetón|ESP|128|1',
    'http://eu1.lhdserver.es:9056/stream|Cadena 100|Pop|ESP|320|1',
    'https://one.cloudstreaming.eu/proxy/europa/stream|Europa FM|Exitos|ESP|128|1',
    'https://stream.serviciospararadios.es/listen/bikini_fm/bikinifm-castellon.mp3|Bikini FM|Dance Remember|ESP|128|1',
    'https://s47.myradiostream.com/13914/listen.mp3|Loca FM|Dance|ESP|128|1',
    'http://ibizaglobalradio.streaming-pro.com:8024/;|Ibiza Global Radio|Dance, House|ESP|128|1',
    'https://playerservices.streamtheworld.com/api/livestream-redirect/DIAL_ASO_ESTEPA.mp3|Cadena Dial|Música Española|ESP|128|1',
    'https://playerservices.streamtheworld.com/api/livestream-redirect/RADIOLE.mp3|Radiolé|Flamenco|ESP|128|1',
    'https://rockfm-cope-rrcast.flumotion.com/cope/rockfm-low.mp3|Rock-FM|Rock|ESP|128|1',
    'https://playerservices.streamtheworld.com/api/livestream-redirect/CADENASER_ALT1.mp3|Cadena SER|Generalista, Noticias|ESP|128|1',
    'https://dispatcher.rndfnk.com/crtve/rne1/mel/mp3/high|RNE 1 Radio Nacional de españa|Generalista, Noticias|ESP|128|1',
    'https://dispatcher.rndfnk.com/crtve/rne5/mad/mp3/high|RNE Radio 5|Generalista, Noticias|ESP|128|1',
    'https://dispatcher.rndfnk.com/crtve/rnerc/main/mp3/high|RNE Radio Clásica|Música Clásica|ESP|128|1',
    'http://atlantic2689.serverprofi24.de:8110/stream|COPE|Generalista, Noticias|ESP|176|1',
    'https://stream.zeno.fm/dzqaazsn3p8uv|Onda Cero|Generalista, Noticias|ESP|128|1',
    'https://playerservices.streamtheworld.com/api/livestream-redirect/RAC105.mp3|RAC 105|Éxitos|CAT|128|1',
    'http://rtva-live-radio.flumotion.com/rtva/csrcor.mp3|Canal Sur Radio|Generalista, Noticias|ESP|128|1',
    'https://streamer97.server.aranova.cloud/mp3/live/aragonradio_teruel_96.mp3?vv=2&h=YKyQaEkABX1qOBXz85lpVQ&e=31373635383330323737&r=1642|Aragón Radio|Generalista, Noticias|ESP|96|1',
    'https://stream.radionervion.com/listen/radio-nervion/radionervion.mp3|Radio Nervión|Éxitos de siempre|ESP|64|1',
    'http://streaming.capsulaimposible.com:8000/stream/2/canalebro.mp3|Canal Ebro Radio|Generalista, Noticias|ESP|128|1',
    'http://s2.voscast.com:11284/;|Radio Castilla-La Mancha|Generalista, Noticias|ESP|96|1',
    'http://mp3-eitb.stream.flumotion.com/eitb/radioeuskadi.mp3|Radio Euskadi|Generalista, Noticias|ESP|128|1',
    'https://live.radiovoz.es/mp3/stream_cadena.mp3|Radio Voz|Generalista, Noticias|ESP|64|1',
  ];

  public stations = signal<any[]>(this.parseStations());

  private MI_PROXY = 'https://stunning-garbanzo-x9qj59gwg54c9654-3000.app.github.dev';

  constructor() {
    this.audio.crossOrigin = 'anonymous';
    this.audio.onplaying = () => {
      console.log('✅ SONANDO: Conexión establecida');
      this.isPlaying.set(true);
    };
    this.audio.addEventListener('stalled', () => {
      console.warn('🚒 ¡Rescate de audio! Intentando reconexión suave...');
      this.recuperarAudio();
    });

    // También es útil monitorizar si hay un "error" de red en el cliente
    this.audio.onerror = () => {
      const error = this.audio.error;
      if (error?.code === 4 || error?.code === 2) {
        // Errores de red o formato
        console.log('🔄 Reintentando sintonización...');
        setTimeout(() => this.playStation(this.currentStation()!), 2000);
      }
    };
  }

  private parseStations() {
    return this.rawData.map((line, i) => {
      const [url, name, genre, lang, bitrate] = line.split('|');
      return { id: i, url, name, genre, lang, bitrate };
    });
  }

  async playStation(station: any) {
    try {
      this.audio.preload = 'none';
      this.audio.pause();
      this.isPlaying.set(false);
      let url = station.url;

      // Detectar si estamos en un entorno web (Codespaces)
      const isWeb = window.location.hostname.includes('github.dev');

      if (isWeb && url.startsWith('https://')) {
        console.log('setting proxy for https');
        // Solo usamos proxy en el navegador, no en la App de escritorio
        const separator = station.url.includes('?') ? '&' : '?';
        url = `${this.MI_PROXY}/${station.url}${separator}nocache=${Date.now()}`;
      }

      // Limpiamos la URL por si acaso
      let targetUrl = url.trim();
      console.log(`🌐 URL objetivo: ${targetUrl}`);

      this.audio.src = targetUrl;
      this.audio.setAttribute('crossorigin', 'anonymous');
      this.currentStation.set(station);

      // El AudioContext solo se inicia si el usuario interactúa
      await this.initAudioContext();

      console.log(`📡 Intentando conectar a: ${station.name}`);
      await this.audio.play();
    } catch (err) {
      console.error('Fallo en playStation:', err);
    }
  }

  private async initAudioContext() {
    if (!this.audioContext) {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      this.source = this.audioContext.createMediaElementSource(this.audio);
      this.analyser = this.audioContext.createAnalyser();
      this.analyser.fftSize = 64;

      this.source.connect(this.analyser);
      this.analyser.connect(this.audioContext.destination);
      this.animate();
    }

    if (this.audioContext.state === 'suspended') {
      await this.audioContext.resume();
    }
  }

  private animate() {
    if (this.analyser && this.isPlaying()) {
      const dataArray = new Uint8Array(this.analyser.frequencyBinCount);
      this.analyser.getByteFrequencyData(dataArray);
      const values = Array.from(dataArray.slice(0, 16)).map((v) => (v / 255) * 100);
      this.frequencyData.set(values);
    }
    requestAnimationFrame(() => this.animate());
  }

  private recuperarAudio() {
    const station = this.currentStation();
    if (station && this.isPlaying()) {
      // Guardamos el volumen actual
      const vol = this.audio.volume;

      // Creamos una URL ligeramente distinta para romper la caché del túnel de Codespaces
      const separator = station.url.includes('?') ? '&' : '?';
      this.audio.src = `${this.MI_PROXY}/${station.url}${separator}retry=${Date.now()}`;

      this.audio.load();
      this.audio.volume = vol;
      this.audio.play().catch(() => console.log('Reintento fallido, esperando al siguiente...'));
    }
  }

  pause() {
    this.audio.pause();
    this.isPlaying.set(false);
  }

  updateVolume(v: number) {
    this.volume.set(v);
    this.audio.volume = v;
  }
}
