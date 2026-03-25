import { Play, Pause, SkipBack, SkipForward, Volume2 } from 'lucide-react';
import { Track } from '../hooks/useAudio';

interface MusicPlayerProps {
  currentTrack: Track;
  isPlaying: boolean;
  togglePlayPause: () => void;
  handleNext: () => void;
  handlePrev: () => void;
  volume: number;
  setVolume: (vol: number) => void;
}

export function MusicPlayer({
  currentTrack,
  isPlaying,
  togglePlayPause,
  handleNext,
  handlePrev,
  volume,
  setVolume,
}: MusicPlayerProps) {
  return (
    <div className="w-full font-mono">
      <div className="flex flex-col space-y-8">
        {/* Track Info */}
        <div className="border-l-8 border-[#ff00ff] pl-4 tear-effect">
          <h2 className="text-3xl font-bold text-[#00ffff] uppercase glitch-text" data-text={currentTrack.title}>
            {currentTrack.title}
          </h2>
          <p className="text-[#ff00ff] text-xl uppercase mt-2 font-bold">
            SRC_NODE: {currentTrack.artist}
          </p>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-between border-y-4 border-[#00ffff] py-6">
          <button
            onClick={handlePrev}
            className="text-[#00ffff] hover:text-[#ff00ff] hover:bg-[#00ffff] p-2 transition-none glitch-hover"
          >
            <SkipBack size={36} />
          </button>
          
          <button
            onClick={togglePlayPause}
            className="flex items-center justify-center bg-[#ff00ff] text-black p-4 hover:bg-[#00ffff] transition-none border-2 border-transparent hover:border-white glitch-hover"
          >
            {isPlaying ? <Pause size={40} className="fill-current" /> : <Play size={40} className="fill-current ml-2" />}
          </button>
          
          <button
            onClick={handleNext}
            className="text-[#00ffff] hover:text-[#ff00ff] hover:bg-[#00ffff] p-2 transition-none glitch-hover"
          >
            <SkipForward size={36} />
          </button>
        </div>

        {/* Volume Control */}
        <div className="flex items-center space-x-4 bg-[#111] p-4 border-2 border-[#ff00ff]">
          <Volume2 size={28} className="text-[#00ffff]" />
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={volume}
            onChange={(e) => setVolume(parseFloat(e.target.value))}
            className="w-full h-3 bg-black border-2 border-[#00ffff] appearance-none cursor-pointer accent-[#ff00ff]"
          />
        </div>
      </div>
    </div>
  );
}
