import { useStore } from '../stores/store';

function FooterMenu() {
    const togglePowerUpModal = useStore(state => state.togglePowerUpModal);

    return (
        <footer className="footer-menu">
            <button onClick={togglePowerUpModal}>
                Power Ups
            </button>
            <div className="footer-info">
                <span>Profit Pilgrim v1.0</span>
            </div>
        </footer>
    );
}

export default FooterMenu; 