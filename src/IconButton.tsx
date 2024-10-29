type IconButtonProps = {
    src: string,
    onClick: () => void,
}

export default function IconButton({ onClick, src }: IconButtonProps) {
    return (
        <div
            onClick={onClick}
        >
            <img className="icon" src={src} />
        </div>
    )
}
