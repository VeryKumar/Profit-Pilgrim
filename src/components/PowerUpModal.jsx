import { useStore } from '../stores/store';

function PowerUpModal() {
    const togglePowerUpModal = useStore(state => state.togglePowerUpModal);

    return (
        <div className="power-up-modal">
            <div className="modal-content">
                <h2>Power Ups</h2>
                <p>Special power ups coming soon!</p>
                <button onClick={togglePowerUpModal}>Close</button>
            </div>
        </div>
    );
}

export default PowerUpModal; 