import {BrowserWindow} from 'electron';
import {Logger} from '../../logger/Logger';
import {BrowserWindowPromises} from '../../electron/framework/BrowserWindowPromises';
import {WebContentsPromises} from '../../electron/framework/WebContentsPromises';
import {DialogWindowReference} from './DialogWindowReference';
import {DialogWindowMenu} from './DialogWindowMenu';

const log = Logger.create();

const BROWSER_WINDOW_OPTIONS = {
    backgroundColor: '#FFF',
    width: 800,
    height: 600,
    show: false,
    webPreferences: {
        webSecurity: false,
        nodeIntegration: true,
        defaultEncoding: 'UTF-8'
    }
};

/**
 * @MainContext
 */
export class DialogWindow {

    public readonly window: BrowserWindow;

    public readonly dialogWindowReference: DialogWindowReference;

    constructor(window: BrowserWindow, dialogWindowReference: DialogWindowReference) {
        this.window = window;
        this.dialogWindowReference = dialogWindowReference;
    }

    show(): void {
        this.window.show();
    }

    hide(): void {
        this.window.hide();
    }

    destroy(): void {
        this.hide();
        this.window.destroy();
    }

    static async create(options: DialogWindowOptions): Promise<DialogWindow> {

        let browserWindowOptions = Object.assign({}, BROWSER_WINDOW_OPTIONS);

        // Create the browser window.
        let window = new BrowserWindow(browserWindowOptions);
        window.setMenu(DialogWindowMenu.create());

        window.webContents.on('new-window', (e) => {
            e.preventDefault();
        });

        window.webContents.on('will-navigate', (e) => {
            e.preventDefault();
        });

        window.on('close', (e) => {
            e.preventDefault();
            window.hide();
        });

        let readyToShowPromise = BrowserWindowPromises.once(window).readyToShow();

        let loadPromise = WebContentsPromises.once(window.webContents).load();

        switch (options.resource.type) {
            case ResourceType.FILE:
                window.loadFile(options.resource.value);
                break;
            case ResourceType.URL:
                window.loadURL(options.resource.value, {});
                break;
        }

        await Promise.all([readyToShowPromise, loadPromise]);

        log.info("Window is now ready to show.");
        let dialogWindow = new DialogWindow(window, new DialogWindowReference(window.id));

        if(options.show) {
            dialogWindow.show();
        }

        return dialogWindow;

    }

}

export enum ResourceType {
    FILE,
    URL
}

export class Resource {

    public readonly type: ResourceType;
    public readonly value: string;

    constructor(type: ResourceType, value: string) {
        this.type = type;
        this.value = value;
    }

}

export class DialogWindowOptions {

    public readonly resource: Resource;

    public width: number = 800;

    public height: number = 600;

    public show: boolean = true;

    constructor(resource: Resource, width?: number, height?: number, show?: boolean) {

        this.resource = resource;

        if(width !== undefined)
            this.width = width;

        if(height !== undefined)
            this.height = height;

        if(show !== undefined)
            this.show = show;

    }

    public static create(obj: any) {
        let result: DialogWindowOptions = Object.create(DialogWindowOptions.prototype);
        Object.assign(result, obj);
        return result;
    }

}

