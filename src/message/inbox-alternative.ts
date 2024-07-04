import axios, { AxiosResponse } from 'axios';

import { createUUID } from '@quarkid/dwn-client/dist/utils';
import { Entry, MessageDescriptor } from '@quarkid/dwn-client/dist/types/message';
import { ThreadMethod } from '@quarkid/dwn-client';

export class AlternativeInboxConsumer {
  private readonly inboxURL : string;
  private readonly did : string;

  constructor(url : string, did : string) {
    this.inboxURL = url;
    this.did = did;
  }

  async getMessages(
    filters : Omit<MessageDescriptor, 'cid' | 'method'>
  ) : Promise<Entry[]> {
    try {
      const request : any = {
        id: createUUID(),
        target: this.did,
        messages: [
          {
            descriptor: {
              method: ThreadMethod.Query,
              ...filters,
            },
          },
        ],
      };

      const { data } = await axios.post<
        any,
        AxiosResponse<any>
      >(this.inboxURL, request);

      return this.mapResponse(data);
    } catch (error:any) {
      console.error(error);
      throw new Error(error.message);
    }
  }

  private mapResponse(response : any) : Entry[] {
    return response.replies[0].entries.map((e: any) => {
        const entry : Entry = {
            data: e.messages[0].data,
            descriptor: e.messages[0].descriptor,
        };

        return entry;
    })
  }
}