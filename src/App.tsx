import { useState } from 'react';
import { SnakeGame } from './components/SnakeGame';
import { MusicPlayer } from './components/MusicPlayer';
import { useAudio, Track } from './hooks/useAudio';
import { Terminal, Cpu } from 'lucide-react';

const DUMMY_TRACKS: Track[] = [
  {
    id: '1',
    title: 'DATA_STREAM_01',
    artist: 'SYS.OP',
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
  },
  {
    id: '2',
    title: 'MEMORY_LEAK',
    artist: 'NULL_PTR',
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
  },
  {
    id: '3',
    title: 'KERNEL_PANIC',
    artist: 'ROOT',
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
  },
];

export default function App() {
  const [score, setScore] = useState(0);
  const audioState = useAudio(DUMMY_TRACKS);

  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-[#ff00ff] selection:text-black flex flex-col static-bg overflow-hidden relative">
      <div className="crt-overlay"></div>
      <div className="scanline"></div>
      
      {/* Header */}
      <header className="w-full p-6 flex justify-between items-center border-b-4 border-[#00ffff] bg-black z-10 relative tear-effect">
        <div className="flex items-center gap-4">
          <Terminal className="text-[#ff00ff]" size={40} />
          <h1 className="text-3xl sm:text-4xl font-mono tracking-tighter text-white glitch-text" data-text="SYS.SNAKE_PROTOCOL">
            SYS.SNAKE_PROTOCOL
          </h1>
        </div>
        
        <div className="flex items-center gap-6">
          <div className="flex flex-col items-end">
            <span className="text-2xl text-[#00ffff] uppercase tracking-widest font-mono">SYS.CYCLES</span>
            <span className="text-4xl font-mono font-bold text-[#ff00ff] glitch-text" data-text={score.toString().padStart(4, '0')}>
              {score.toString().padStart(4, '0')}
            </span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col lg:flex-row items-center justify-center gap-8 p-6 relative z-10">
        
        {/* Game Area */}
        <div className="flex-1 flex justify-center items-center w-full max-w-2xl border-l-4 border-r-4 border-[#ff00ff] p-4 bg-[#0a0a0a] tear-effect">
          <SnakeGame 
            onScoreChange={setScore} 
            isMusicPlaying={audioState.isPlaying} 
          />
        </div>

        {/* Music Player Area */}
        <div className="w-full lg:w-96 flex flex-col gap-6 border-4 border-[#00ffff] bg-black p-6 relative tear-effect">
          <div className="absolute top-0 left-0 w-full h-1 bg-[#ff00ff] animate-pulse"></div>
          <div className="flex items-center gap-3 mb-2">
            <Cpu className="text-[#ff00ff] animate-[spin_3s_linear_infinite]" size={28} />
            <h3 className="text-2xl font-mono text-[#00ffff] uppercase tracking-widest glitch-text" data-text="AUDIO_STREAM_UPLINK">AUDIO_STREAM_UPLINK</h3>
          </div>
          <MusicPlayer {...audioState} />
          
          {/* Track List */}
          <div className="border-t-4 border-dashed border-[#ff00ff] pt-6 mt-2 hidden sm:block">
            <h4 className="text-xl text-[#00ffff] uppercase tracking-widest font-mono mb-4">MEM_SECTORS</h4>
            <div className="space-y-3 font-mono">
              {DUMMY_TRACKS.map((track, idx) => (
                <div 
                  key={track.id} 
                  className={`flex items-center justify-between p-3 text-xl border-2 ${
                    audioState.currentTrack.id === track.id 
                      ? 'bg-[#ff00ff] text-black border-[#ff00ff]' 
                      : 'text-[#00ffff] border-transparent hover:border-[#00ffff] cursor-pointer glitch-hover'
                  }`}
                >
                  <span className="truncate pr-4">0x0{idx + 1} {track.title}</span>
                  {audioState.currentTrack.id === track.id && audioState.isPlaying && (
                    <span className="animate-pulse font-bold">ACTIVE</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

      </main>
    </div>
  );
}
