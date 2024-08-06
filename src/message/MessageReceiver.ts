// 
import { Subject, Observable } from 'rxjs';
import DwnFactory, { DIDServiceUrl } from '../service/DwnFactory';
import { DWNClient, parseDateToUnixTimestamp } from '@quarkid/dwn-client';
import RecetaBcData from '../service/RecetaBcData';
import MessageStorageService from '../service/MessageStorageService';
import { VerifiableCredential } from '@quarkid/vc-core';
import { Unpack } from '../quarkid/Unpaker';
import Profile from '../model/Profile';
import Message, { checkIfIsMessageType } from '../model/Message';
import { Entry } from '@quarkid/dwn-client/dist/types/message';
import { AlternativeInboxConsumer } from './inbox-alternative';

const storage: MessageStorageService = MessageStorageService.getInstance()
const entries: Subject<Message> = new Subject<Message>()
const status: Subject<number> = new Subject<number>()

let workerStarted = false
let interval: any
let dwnClient: DWNClient|null
let currentProfile: Profile|null
let serviceUrl: string|null
let useAlternative = false

const processProfile = async () => {
    if (null === currentProfile) {
        dwnClient = null
    } else {
        try {
            dwnClient = await DwnFactory(currentProfile.didId)
            serviceUrl = await DIDServiceUrl(currentProfile.didId)
            useAlternative = false
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

const alternativeProcessEntry = async () : Promise<boolean> => {
    if (!serviceUrl) {
        return false;
    }
    if (!serviceUrl.includes("proxy.recetasbc")) {
        return false
    }

    const consumer = new AlternativeInboxConsumer(serviceUrl, currentProfile!.didId);
    const dateFilter = parseDateToUnixTimestamp(
        await storage.getLastPullDate()
      );
    consumer.getMessages({dateCreated: dateFilter}).then((entries) => {
        entries.forEach((entry) => {
            processEntry(entry);
        });
    })
    await storage.updateLastPullDate(new Date());

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
    let lastStatus = -1
    const emitStatus = (code: number) => {
        if (code !== lastStatus) {
            status.next(lastStatus = code)
        }
    }

    interval = setInterval(() => {
        if (storage && dwnClient && currentProfile) {
            if (useAlternative) {
                alternativeProcessEntry().then((x) => {
                    if (x) {
                        emitStatus(200)
                        return
                    } else {
                        console.log("no hay llamado alternativo")
                        emitStatus(500)
                        useAlternative = false
                        let quinceMinutosAtras = new Date()
                        quinceMinutosAtras.setMinutes(quinceMinutosAtras.getMinutes() - 15)
                        storage.updateLastPullDate(quinceMinutosAtras)
                    }
                })
            } else {
                dwnClient!.pullNewMessageWait().then(() => {
                    if (200 !== lastStatus) {
                        emitStatus(200)
                    }
                }).catch((e) => {
                    let captureError = /reply.entries is undefined/
                    let captureError2 = /.map is not a function/
                    if (e.message.match(captureError)) {
                        emitStatus(501)
                    } else if (e.message.match(captureError2)) {
                        alternativeProcessEntry().then((x) => {
                            if (x) {
                                emitStatus(200)
                                useAlternative = true
                            } else {
                                console.log("no hay llamado alternativo", e)
                                emitStatus(500)
                            }
                        })
                    } else {
                        console.error("Error pulling message", e)
                        emitStatus(500)
                    }
                    let quinceMinutosAtras = new Date()
                    quinceMinutosAtras.setMinutes(quinceMinutosAtras.getMinutes() - 15)
                    storage.updateLastPullDate(quinceMinutosAtras)
                })
            }
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

export const MessageStatus = () : Observable<number> => {
    return status.asObservable()
}


export const stopWorker = () => {
    console.log("Stopping worker", interval)
    if (interval) clearInterval(interval)
    workerStarted = false
}

export const startWorker = () => {
    Worker()
}