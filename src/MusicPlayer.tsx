import { ChangeEvent, useEffect, useState } from "react";
import useMusicPlayer from "./useMusicPlayer";
import { usePersistState } from "@printy/react-persist-state";
import { useTabStateControl } from "@printy/react-tab-state";
import SongMetadata from "./SongMetadata";
import { numberToPercent, percentOf, secondsToMinutesAndSeconds } from "./utils";
import IconButton from "./IconButton";
import PlayButton from "./PlayButton";
import TimeDisplay from "./TimeDisplay";

export default function MusicPlayer() {
    const musicPlayer = useMusicPlayer();

    const [sliderValue, setSliderValue] = useState(0);
    const [isSliderActive, setIsSliderActive] = useState(false);
    
    const [currentTime, setCurrentTime] = useState({minutes: 0, seconds: 0});
    const [maxTime, setMaxTime] = useState({minutes: 0, seconds: 0});

    const [currentSong, setCurrentSongLocal] = usePersistState<number>(0, 'current_song_index');
    const setCurrentSong: (new_state: number) => void = useTabStateControl(currentSong, setCurrentSongLocal, 0, 'current_song_index');
    const [songsMetadata, setSongsMetadata] = useState<SongMetadata[]>([]);

    const onPlayButtonClick = () => {
        musicPlayer.setIsPlaying(!musicPlayer.isPlaying)
    }

    const onPrevButtonClick = () => {
        if(currentSong == 0) {
            setCurrentSong(0)
        } else {
            setCurrentSong(currentSong - 1)
        }
    }

    const onNextButtonClick = () => {
        if(currentSong == songsMetadata.length - 1) {
            setCurrentSong(0)
        } else {
            setCurrentSong(currentSong + 1)
        }
    }

    const fetchSongMetadata = () => {
        fetch('songs_metadata.json')
        .then(res => res.json())
        .then(setSongsMetadata)
        .catch(error => console.error("Failed to load song metadata", error));
    }

    const onSliderChange = (e: ChangeEvent<HTMLInputElement>) => {
        setSliderValue(parseInt(e.currentTarget.value));
        setIsSliderActive(true);
    }

    const onSliderMouseUp = () => {
        const new_time = percentOf(musicPlayer.maxTime, sliderValue);
        musicPlayer.updateTime(new_time)
        setIsSliderActive(false);
    }

    const loadSong = (index: number) => {
        if(songsMetadata.length) {
            musicPlayer.setSrc(`songs/${songsMetadata[index].id}.mp3`)
        }
    }

    useEffect(() => {
        fetchSongMetadata()
    }, [])

    useEffect(() => {
        loadSong(currentSong);
    }, [songsMetadata])

    useEffect(() => {
        if(!isSliderActive) {
            if(!musicPlayer.currentTime || !musicPlayer.maxTime) {
                setSliderValue(0)
            } else {
                setSliderValue(numberToPercent(musicPlayer.currentTime, musicPlayer.maxTime));
            }
        }
        setCurrentTime(secondsToMinutesAndSeconds(musicPlayer.currentTime));

    }, [musicPlayer.currentTime, musicPlayer.maxTime])

    useEffect(() => {
        setMaxTime(secondsToMinutesAndSeconds(musicPlayer.maxTime));
    }, [musicPlayer.maxTime])

    return (
        <div className="music-player">
            {songsMetadata.length > 0 ? (
                <><div className="music-player-info">
                    <img
                        src={`cover_art/${songsMetadata[currentSong].id}.jpg`}
                        width='100%' />
                    <h5>{songsMetadata[currentSong].title}</h5>
                    <h6>{songsMetadata[currentSong].author}</h6>
                </div><div className="music-player-control">
                        <IconButton
                            onClick={onPrevButtonClick}
                            src={`icons/prev.svg`} />
                        <PlayButton
                            onClick={onPlayButtonClick}
                            playing={musicPlayer.isPlaying} />
                        <TimeDisplay time={currentTime} />
                        <input
                            type="range"
                            min="0"
                            max="100"
                            value={sliderValue}
                            className="slider"
                            onMouseUp={onSliderMouseUp}
                            onChange={onSliderChange} />
                        <TimeDisplay time={maxTime} />
                        <IconButton
                            onClick={onNextButtonClick}
                            src={`icons/next.svg`} />
                    </div></>
            ) : (
                <p>Loading songs...</p>
            )}
        </div>
    )
}
