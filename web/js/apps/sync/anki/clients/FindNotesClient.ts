import {AnkiConnectFetch} from '../AnkiConnectFetch';
import {DeckNamesAndIds, IDeckNamesAndIdsClient} from './DeckNamesAndIdsClient';
import * as TypeMoq from "typemoq";

/**
findNotes

Returns an array of note IDs for a given query. Same query syntax as guiBrowse.

Sample request:

{
    "action": "findNotes",
    "version": 6,
    "params": {
    "query": "deck:current"
}
}
 Sample result:

 {
    "result": [1483959289817, 1483959291695],
    "error": null
}

 */
export class FindNotesClient implements IFindNotesClient {

    public async execute(query: string): Promise<number[]> {

        let body = {
            action: "findNotes",
            version: 6,
            params: {
                query
            }
        };

        let init = { method: 'POST', body: JSON.stringify(body) };

        return <number[]> await AnkiConnectFetch.fetch(init);

    }

    /**
     * Create a mock that returns the given result.
     */
    static createMock(result: number[]) {
        let client = TypeMoq.Mock.ofType<IFindNotesClient>();
        client.setup(x => x.execute(TypeMoq.It.isAny())).returns(() => Promise.resolve(result));
        return client.object;
    }

}

export interface IFindNotesClient {

    execute(query: string): Promise<number[]>;

}
