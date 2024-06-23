

import RecetaReceiver  from './RecetaReceiver';
import DispensaReceiver from './DispensaReceiver';
import RecepcionReceiver from './RecepcionReceiver';
import { startWorker } from './MessageReceiver';

const StartReceivers = async () => {
    RecetaReceiver(),
    DispensaReceiver(),
    RecepcionReceiver()
    startWorker();
}

export default StartReceivers;