import { usePersistState } from "@printy/react-persist-state";
import useTabState from "@printy/react-tab-state";
import { useEffect, useRef, useState } from "react";

const worker = new SharedWorker("/worker.js");

export default function useMusicPlayer() {
    const audio = useRef(document.createElement('audio'));

    const [isPlaying, setIsPlaying] = useTabState(false, 'is_playing');
    const [src, setSrc] = useState<string>("");
    const [currentTime, setCurrrentTime] = useTabState<number>(0, 'current_time');
    const [updatedTime, updateTime] = useTabState(0, 'updated_time');
    
    const [isMainTab, setIsMainTab] = useState<boolean>(false);

    const [storedTime, setStoredTime] = usePersistState(0, 'stored_time');

    const [maxTime, setMaxTime] = useState(0);

    useEffect(() => {
        worker.port.start();

        setInterval(() => {
            worker.port.postMessage({
                type: "ping"
            });
        }, 1000)

        worker.port.onmessage = (e) => {
            const data = e.data;
            switch(data.type) {
                case 'set_main_port': {
                    setIsMainTab(true);
                    break;
                }

                case 'unset_main_port': {
                    setIsMainTab(false);
                    break;
                }
            }
        }

        audio.current.preload = 'metadata';

        audio.current.ondurationchange = () => {
            setMaxTime(audio.current.duration)
        }

        audio.current.onended = () => {
            setIsPlaying(false);
        }

        audio.current.ontimeupdate = () => {
            setCurrrentTime(audio.current.currentTime)
        }
    }, [])

    useEffect(() => {
        if(currentTime != 0 && currentTime != null) {
            setStoredTime(currentTime);
        }
    }, [currentTime])

    useEffect(() => {
        if(!audio.current.src || audio.current.src == '' && storedTime != 0) {
            updateTime(storedTime)
        } else {
            setStoredTime(0);
            updateTime(0);
        }

        if(src != "") {
            audio.current.src = src;
        }

        if(isPlaying && isMainTab) {
            audio.current.play();
        }
    }, [src])

    useEffect(() => {
        audio.current.currentTime = updatedTime;
        setCurrrentTime(updatedTime);
    }, [updatedTime])

    useEffect(() => {
        if(isPlaying && isMainTab) {
            audio.current.play();
        } else {
            audio.current.pause();
        }
    }, [isPlaying])

    return {
        isPlaying,
        setIsPlaying,
        currentTime,
        setCurrrentTime,
        updateTime,
        maxTime,
        setSrc
    }
}
