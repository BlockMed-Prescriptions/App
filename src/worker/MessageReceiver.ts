// 
import { Entry } from '@quarkid/dwn-client/dist/types/message';
import { Subject, Observable } from 'rxjs';
import DwnFactory from '../service/DwnFactory';
import { DWNClient } from '@quarkid/dwn-client';
import RecetaBcData from '../service/RecetaBcData';
import MessageService from '../service/MessageService';
import { VerifiableCredential } from '@quarkid/vc-core';
import { Unpack } from '../quarkid/Unpaker';
import Profile from '../model/Profile';
import { s } from 'vite/dist/node/types.d-aGj9QkWt';

const storage: MessageService = MessageService.getInstance()
const entries: Subject<VerifiableCredential> = new Subject<VerifiableCredential>()

let workerStarted = false
let interval: any
let dwnClient: DWNClient|null
let currentProfile: Profile|null

const processProfile = async () => {
    if (null === currentProfile) {
        dwnClient = null
    } else {
        try {
            dwnClient = await DwnFactory(currentProfile.didId)
        } catch (e) {
            console.error("Error creating DWN Client", e)
            dwnClient = null
        }
    }
}

const Worker = () => {
    if (workerStarted) {
        return
    } else {
        workerStarted = true
    }

    const data = RecetaBcData.getInstance()
    currentProfile = data.getCurrentProfile()
    processProfile().then(() => {})
    data.observeProfile().subscribe(async (profile) => {
        currentProfile = profile
        processProfile()
    })

    interval = setInterval(() => {
        if (storage && dwnClient && currentProfile) {
            dwnClient.pullNewMessageWait()
            // tomo el primer mensaje y lo proceso
            storage.getMessages().then((messages) => {
                const entry = messages[0]
                if (entry && entry.data) {
                    console.log(entry)
                    Unpack(currentProfile!, entry.data.packedMessage).then((unpackedMessage) => {
                        entries.next(unpackedMessage.message.body as VerifiableCredential)
                    })
                }
                storage.removeMessage(entry)
            })
        }
    }, 2000)
}

export const MessageReceiver = () : Observable<VerifiableCredential> => {
    Worker()
    return entries.asObservable()
}

export const stopWorker = () => {
    console.log("Stopping worker", interval)
    if (interval) clearInterval(interval)
    workerStarted = false
}