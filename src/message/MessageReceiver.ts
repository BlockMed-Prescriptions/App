// 
import { Subject, Observable } from 'rxjs';
import DwnFactory from '../service/DwnFactory';
import { DWNClient } from '@quarkid/dwn-client';
import RecetaBcData from '../service/RecetaBcData';
import MessageStorageService from '../service/MessageStorageService';
import { VerifiableCredential } from '@quarkid/vc-core';
import { Unpack } from '../quarkid/Unpaker';
import Profile from '../model/Profile';
import Message, { checkIfIsMessageType } from '../model/Message';
import { Entry } from '@quarkid/dwn-client/dist/types/message';

const storage: MessageStorageService = MessageStorageService.getInstance()
const entries: Subject<Message> = new Subject<Message>()

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

const processEntry = (entry: Entry) : boolean => {
    console.log(entry)
    let recipents:string[] = entry.data.packedMessage.recipients.map((r:any) => r.header.kid)
    // busco si en los recipientes está mi didId, teniendo en cuenta que el recipiente
    // es de la forma did:method:id#key y el didId es de la forma did:method:id
    let found = recipents.find((r) => r.startsWith(currentProfile!.didId))
    if (!found) {
        console.log("No es para mi", recipents, currentProfile!.didId)
        return false
    }

    Unpack(currentProfile!, entry.data.packedMessage).then((unpackedMessage) => {
        // trato de determinar si es un VC
        console.log("Unpacked message", unpackedMessage)
        if (!unpackedMessage.message.body?.type) {
            console.log("Version anterior de mensaje", unpackedMessage)
            if (unpackedMessage.message.body?.credentialSubject) {
                entries.next({type: "emision-receta", credential: unpackedMessage.message.body as VerifiableCredential, class: "receta"})
                return;
            }
        }
        if (checkIfIsMessageType(unpackedMessage.message.body)) {
            entries.next(unpackedMessage.message.body as Message)
        } else {
            console.error("No es un mensaje válido", unpackedMessage)
        }
    }).catch((e) => {
        console.error("Error unpacking message", e)
    })
    return true
}

const Worker = () => {
    if (workerStarted) {
        return
    } else {
        workerStarted = true
    }

    console.log("Starting worker MessageReceiver")

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
                if (entry) {
                    let ret = processEntry(entry)
                    storage.removeMessage(entry)
                    if (ret) return;
                }
            })
        }
    }, 2000)
}

export const MessageReceiver = () : Observable<Message> => {
    return entries.asObservable()
}

export const stopWorker = () => {
    console.log("Stopping worker", interval)
    if (interval) clearInterval(interval)
    workerStarted = false
}

export const startWorker = () => {
    Worker()
}