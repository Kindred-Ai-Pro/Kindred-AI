'use client';

import { useEffect, useRef, useState } from 'react';
import { Mic, Square } from 'lucide-react';

type VoiceInputProps = {
  onTextUpdate: (text: string) => void;
};

function getSpeechRecognitionConstructor() {
  if (typeof window === 'undefined') {
    return null;
  }

  return window.SpeechRecognition ?? window.webkitSpeechRecognition ?? null;
}

export function VoiceInput({ onTextUpdate }: VoiceInputProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const onTextUpdateRef = useRef(onTextUpdate);

  useEffect(() => {
    onTextUpdateRef.current = onTextUpdate;
  }, [onTextUpdate]);

  useEffect(() => {
    const SpeechRecognitionCtor = getSpeechRecognitionConstructor();

    if (!SpeechRecognitionCtor) {
      return;
    }

    const recognition = new SpeechRecognitionCtor();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let currentTranscript = '';
      for (let i = 0; i < event.results.length; i++) {
        currentTranscript += event.results[i][0].transcript;
      }
      onTextUpdateRef.current(currentTranscript);
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      console.error('Speech recognition error', event.error);
      setIsRecording(false);
    };

    recognition.onend = () => {
      setIsRecording(false);
    };

    recognitionRef.current = recognition;
    setIsSupported(true);

    return () => {
      recognition.stop();
      recognitionRef.current = null;
    };
  }, []);

  const toggleRecording = () => {
    if (!recognitionRef.current) {
      return;
    }

    if (isRecording) {
      recognitionRef.current.stop();
      setIsRecording(false);
    } else {
      recognitionRef.current.start();
      setIsRecording(true);
    }
  };

  if (!isSupported) {
    return null;
  }

  return (
    <button
      onClick={toggleRecording}
      type="button"
      className={`flex shrink-0 items-center justify-center rounded-full border p-3 transition-all duration-300 ${
        isRecording
          ? 'animate-pulse border-red-500/50 bg-red-500/20 text-red-500 shadow-[0_0_15px_rgba(239,68,68,0.5)]'
          : 'border-zinc-700 bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-white'
      }`}
      title={isRecording ? 'Stop recording' : 'Start voice dictation'}
      aria-label={isRecording ? 'Stop voice dictation' : 'Start voice dictation'}
    >
      {isRecording ? (
        <Square className="h-5 w-5 fill-current" aria-hidden="true" />
      ) : (
        <Mic className="h-5 w-5" aria-hidden="true" />
      )}
    </button>
  );
}
