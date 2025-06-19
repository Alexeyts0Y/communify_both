const ShareIcon = ({ onClick }) => {
    return (
        <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#808080"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            onClick={onClick}
            style={{ cursor: 'pointer' }}
        >
            <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
            <polyline points="16 6 12 2 8 6" />
            <line x1="12" y1="2" x2="12" y2="15" />
        </svg>
    );
};

export default ShareIcon;