import { MessageStorage } from "@quarkid/dwn-client";
import { Entry } from "@quarkid/dwn-client/dist/types/message";
import RecetaBcData from "./RecetaBcData";



export default class MessageStorageService implements MessageStorage {
    static instance: MessageStorageService;
    static getInstance(): MessageStorageService {
        if (!MessageStorageService.instance) {
            MessageStorageService.instance = new MessageStorageService(RecetaBcData.getInstance());
        }
        return MessageStorageService.instance;
    }

    private messagesStorage : Entry[] = [];
    private data: RecetaBcData;
    
    constructor(data: RecetaBcData) {
        this.messagesStorage = []
        this.data = data;
    }

    async getMessages(): Promise<Entry[]> {
        let m = this.messagesStorage;
        return m;
    }
    async getLastPullDate(): Promise<Date> {
        return this.data.getLastMessageDate()
    }
    async saveMessages(messages: Entry[]): Promise<void> {
        this.messagesStorage.push(...messages)
    }
    async updateLastPullDate(date: Date): Promise<void> {
        await this.data.saveLastMessageDate(date)
    }

    async clearMessages(): Promise<void> {
        this.messagesStorage = []
    }

    async removeMessage(entry: Entry): Promise<void> {
        this.messagesStorage = this.messagesStorage.filter((e) => e !== entry)
    }
}

