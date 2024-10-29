type TimeDisplayProps = {
    time: {minutes: number, seconds: number};
}

export default function TimeDisplay({ time }: TimeDisplayProps) {
    return (
        <div
            className="time-display">
                {time.minutes}
                :
                {time.seconds.toString().padStart(2, '0')}
        </div>
    )
}
