

import RecetaReceiver  from './RecetaReceiver';
import DispensaReceiver from './DispensaReceiver';
import RecepcionReceiver from './RecepcionReceiver';
import { startWorker } from './MessageReceiver';
import TransaccionReceiver from './TransaccionReceiver';

const StartReceivers = async () => {
    RecetaReceiver()
    DispensaReceiver()
    RecepcionReceiver()
    TransaccionReceiver()
    startWorker()
}

export default StartReceivers;