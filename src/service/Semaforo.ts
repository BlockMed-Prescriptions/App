class Semaforo {
    private lock: Promise<void> | null = null;

    async acquireLock(): Promise<() => void> {
        while (this.lock) {
            await this.lock;
        }
        let resolveLock: () => void;
        this.lock = new Promise<void>(resolve => {
            resolveLock = resolve;
        });
        return () => {
            this.lock = null;
            resolveLock();
        };
    }
}

export default Semaforo;