import DispensaReceiver from "./DispensaReceiver";
import RecepcionReceiver from "./RecepcionReceiver";
import { startWorker } from "./MessageReceiver";
import TransaccionReceiver from "./TransaccionReceiver";
import RecetaReceiver from "./RecetaReceiver";

const StartReceivers = async () => {
  DispensaReceiver();
  RecepcionReceiver();
  TransaccionReceiver();
  startWorker();
  RecetaReceiver();
};

export default StartReceivers;
