

import RecetaReceiver  from './RecetaReceiver';
import DispensaReceiver from './DispensaReceiver';
import RecepcionReceiver from './RecepcionReceiver';

const StartReceivers = async () => {
    RecetaReceiver();
    DispensaReceiver();
    RecepcionReceiver()
}

export default StartReceivers;