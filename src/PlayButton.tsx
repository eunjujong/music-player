import IconButton from "./IconButton";

type PlayButtonProps = {
    playing: boolean,
    onClick: () => void,
}

export default function PlayButton({ onClick, playing }: PlayButtonProps) {
    return (
        <IconButton
            onClick={onClick}
            src={playing ? 'icons/pause.svg' : 'icons/play.svg'}
        />
    )
}
