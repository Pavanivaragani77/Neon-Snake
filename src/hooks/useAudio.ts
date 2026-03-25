import { useState, useEffect, useRef } from 'react';

export interface Track {
  id: string;
  title: string;
  artist: string;
  url: string;
}

export function useAudio(tracks: Track[]) {
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.5);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio(tracks[currentTrackIndex].url);
      audioRef.current.volume = volume;
      
      audioRef.current.addEventListener('ended', handleNext);
    }

    return () => {
      if (audioRef.current) {
        audioRef.current.removeEventListener('ended', handleNext);
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []); // Empty dependency array to initialize once

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.src = tracks[currentTrackIndex].url;
      audioRef.current.load();
      if (isPlaying) {
        audioRef.current.play().catch(e => console.error("Audio play failed:", e));
      }
    }
  }, [currentTrackIndex, tracks]);

  useEffect(() => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.play().catch(e => console.error("Audio play failed:", e));
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  const togglePlayPause = () => {
    setIsPlaying((prev) => !prev);
  };

  const handleNext = () => {
    setCurrentTrackIndex((prev) => (prev + 1) % tracks.length);
    setIsPlaying(true);
  };

  const handlePrev = () => {
    setCurrentTrackIndex((prev) => (prev - 1 + tracks.length) % tracks.length);
    setIsPlaying(true);
  };

  return {
    currentTrack: tracks[currentTrackIndex],
    isPlaying,
    togglePlayPause,
    handleNext,
    handlePrev,
    volume,
    setVolume,
  };
}
