/** Playback watch. GPT-Live does not emit an event when assistant audio ends. */

export function watchAssistantAudio(audio: HTMLAudioElement, context: AudioContext, onAudible: (audible: boolean) => void): () => void {
  let stopped = false;
  let source: MediaStreamAudioSourceNode | null = null;
  let analyser: AnalyserNode | null = null;
  let mute: GainNode | null = null;
  let timer: ReturnType<typeof setInterval> | null = null;
  let bound: MediaStream | null = null;
  let audible = false;
  const samples = new Uint8Array(512);

  function releaseGraph() {
    source?.disconnect();
    analyser?.disconnect();
    mute?.disconnect();
    source = null;
    analyser = null;
    mute = null;
  }

  function setAudible(next: boolean) {
    if (audible === next) return;
    audible = next;
    onAudible(next);
  }

  function bind() {
    if (stopped) return;
    const stream = audio.srcObject instanceof MediaStream ? audio.srcObject : null;
    if (stream === bound) return;
    if (timer) clearInterval(timer);
    timer = null;
    releaseGraph();
    bound = stream;
    if (!stream || stream.getAudioTracks().length === 0) {
      setAudible(false);
      return;
    }
    void context.resume();
    const node = context.createAnalyser();
    analyser = node;
    node.fftSize = 512;
    source = context.createMediaStreamSource(stream);
    source.connect(node);
    mute = context.createGain();
    mute.gain.value = 0;
    node.connect(mute);
    mute.connect(context.destination);
    timer = setInterval(() => {
      if (stopped) return;
      if (context.state !== 'running') { void context.resume(); return; }
      node.getByteTimeDomainData(samples);
      let energy = 0;
      for (let i = 0; i < samples.length; i++) {
        const centered = (samples[i] - 128) / 128;
        energy += centered * centered;
      }
      setAudible(Math.sqrt(energy / samples.length) > 0.02);
    }, 80);
  }

  const poll = setInterval(bind, 80);
  bind();
  return () => {
    stopped = true;
    clearInterval(poll);
    if (timer) clearInterval(timer);
    releaseGraph();
  };
}
