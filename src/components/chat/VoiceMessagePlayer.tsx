import React, { useState, useRef, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Play, Pause } from 'lucide-react';
import { format } from 'date-fns';
import type { ChatMessageResponseDTO } from '@/types/chat.types';
import { cn } from '@/lib/utils';

interface VoiceMessagePlayerProps {
	message: ChatMessageResponseDTO;
	isOwn: boolean;
}

const VoiceMessagePlayer: React.FC<VoiceMessagePlayerProps> = ({ message, isOwn }) => {
	const [isPlaying, setIsPlaying] = useState(false);
	const [currentTime, setCurrentTime] = useState(0);
	const [duration, setDuration] = useState(message.voiceDuration || 0);
	const audioRef = useRef<HTMLAudioElement | null>(null);

	useEffect(() => {
		if (!message.voiceFileUrl) return;

		const audio = new Audio(message.voiceFileUrl);
		audioRef.current = audio;

		audio.addEventListener('loadedmetadata', () => {
			setDuration(audio.duration);
		});

		audio.addEventListener('timeupdate', () => {
			setCurrentTime(audio.currentTime);
		});

		audio.addEventListener('ended', () => {
			setIsPlaying(false);
			setCurrentTime(0);
		});

		return () => {
			audio.pause();
			audio.removeEventListener('loadedmetadata', () => {});
			audio.removeEventListener('timeupdate', () => {});
			audio.removeEventListener('ended', () => {});
		};
	}, [message.voiceFileUrl]);

	const togglePlay = () => {
		if (!audioRef.current) return;

		if (isPlaying) {
			audioRef.current.pause();
			setIsPlaying(false);
		} else {
			audioRef.current.play();
			setIsPlaying(true);
		}
	};

	const formatTime = (seconds: number) => {
		const mins = Math.floor(seconds / 60);
		const secs = Math.floor(seconds % 60);
		return `${mins}:${secs.toString().padStart(2, '0')}`;
	};

	const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

	return (
		<div className={cn('flex flex-col max-w-[70%]', isOwn ? 'items-end' : 'items-start')}>
			<Card
				className={cn(
					'px-4 py-3 flex items-center gap-3 min-w-[200px]',
					isOwn
						? 'bg-primary text-primary-foreground'
						: 'bg-muted text-muted-foreground'
				)}
			>
				<Button
					variant="ghost"
					size="icon"
					onClick={togglePlay}
					className={cn('h-10 w-10', isOwn ? 'text-primary-foreground hover:bg-primary/80' : '')}
				>
					{isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
				</Button>
				<div className="flex-1">
					<div className="w-full bg-background/20 rounded-full h-2 mb-1">
						<div
							className="bg-background/40 h-2 rounded-full transition-all"
							style={{ width: `${progress}%` }}
						/>
					</div>
					<div className="flex justify-between text-xs">
						<span>{formatTime(currentTime)}</span>
						<span>{formatTime(duration)}</span>
					</div>
				</div>
			</Card>
			<div className="mt-1 text-xs text-muted-foreground">
				{format(new Date(message.createdAt), 'HH:mm')}
			</div>
		</div>
	);
};

export default VoiceMessagePlayer;

