# joplin.views.panels

Allows creating and managing view panels. View panels allow displaying any HTML content (within a webview) and updating it in real-time. For example it could be used to display a table of content for the active note, or display various metadata or graph.

On desktop, view panels currently are displayed at the right of the sidebar, though can be moved with "View" > "Change application layout".

On mobile, view panels are shown in a tabbed dialog that can be opened using a toolbar button.

[View the demo plugin](https://github.com/laurent22/joplin/tree/dev/packages/app-cli/tests/support/plugins/toc)

## Index

### Methods

- [addScript](https://joplinapp.org/api/references/plugin_api/classes/joplinviewspanels.html#addscript)
- [create](https://joplinapp.org/api/references/plugin_api/classes/joplinviewspanels.html#create)
- [hide](https://joplinapp.org/api/references/plugin_api/classes/joplinviewspanels.html#hide)
- [isActive](https://joplinapp.org/api/references/plugin_api/classes/joplinviewspanels.html#isactive)
- [onMessage](https://joplinapp.org/api/references/plugin_api/classes/joplinviewspanels.html#onmessage)
- [postMessage](https://joplinapp.org/api/references/plugin_api/classes/joplinviewspanels.html#postmessage)
- [setHtml](https://joplinapp.org/api/references/plugin_api/classes/joplinviewspanels.html#sethtml)
- [show](https://joplinapp.org/api/references/plugin_api/classes/joplinviewspanels.html#show)
- [visible](https://joplinapp.org/api/references/plugin_api/classes/joplinviewspanels.html#visible)

## Methods

<a id="addscript"></a>

### addScript

- addScript(handle: [ViewHandle](https://joplinapp.org/api/references/plugin_api/classes/../globals.html#viewhandle), scriptPath: string): Promise<void\>

- Adds and loads a new JS or CSS files into the panel.
    
    #### Parameters
    
    - ##### handle: [ViewHandle](https://joplinapp.org/api/references/plugin_api/classes/../globals.html#viewhandle)
        
    - ##### scriptPath: string
        

<a id="create"></a>

### create

- create(id: string): Promise<[ViewHandle](https://joplinapp.org/api/references/plugin_api/classes/../globals.html#viewhandle)\>

- Creates a new panel
    
    #### Parameters
    
    - ##### id: string
        

<a id="hide"></a>

### hide

- hide(handle: [ViewHandle](https://joplinapp.org/api/references/plugin_api/classes/../globals.html#viewhandle)): Promise<void\>

- Hides the panel
    
    #### Parameters
    
    - ##### handle: [ViewHandle](https://joplinapp.org/api/references/plugin_api/classes/../globals.html#viewhandle)
        

<a id="isactive"></a>

### isActive

- isActive(handle: [ViewHandle](https://joplinapp.org/api/references/plugin_api/classes/../globals.html#viewhandle)): Promise<boolean\>

- Assuming that the current panel is an editor plugin view, returns whether the editor plugin view supports editing the current note.
    
    #### Parameters
    
    - ##### handle: [ViewHandle](https://joplinapp.org/api/references/plugin_api/classes/../globals.html#viewhandle)
        

<a id="onmessage"></a>

### onMessage

- onMessage(handle: [ViewHandle](https://joplinapp.org/api/references/plugin_api/classes/../globals.html#viewhandle), callback: Function): Promise<void\>

- Called when a message is sent from the webview (using postMessage).
    
    To post a message from the webview to the plugin use:
    
    ```
    const response = await webviewApi.postMessage(message);
    ```
    
    - `message` can be any JavaScript object, string or number
    - `response` is whatever was returned by the `onMessage` handler
    
    Using this mechanism, you can have two-way communication between the plugin and webview.
    
    See the [postMessage demo](https://github.com/laurent22/joplin/tree/dev/packages/app-cli/tests/support/plugins/post_messages) for more details.
    
    #### Parameters
    
    - ##### handle: [ViewHandle](https://joplinapp.org/api/references/plugin_api/classes/../globals.html#viewhandle)
        
    - ##### callback: Function
        

<a id="postmessage"></a>

### postMessage

- postMessage(handle: [ViewHandle](https://joplinapp.org/api/references/plugin_api/classes/../globals.html#viewhandle), message: any): void

- Sends a message to the webview.
    
    The webview must have registered a message handler prior, otherwise the message is ignored. Use;
    
    ```
    webviewApi.onMessage((message) => { ... });
    ```
    
    - `message` can be any JavaScript object, string or number
    
    The view API may have only one onMessage handler defined. This method is fire and forget so no response is returned.
    
    It is particularly useful when the webview needs to react to events emitted by the plugin or the joplin api.
    
    #### Parameters
    
    - ##### handle: [ViewHandle](https://joplinapp.org/api/references/plugin_api/classes/../globals.html#viewhandle)
        
    - ##### message: any
        

<a id="sethtml"></a>

### setHtml

- setHtml(handle: [ViewHandle](https://joplinapp.org/api/references/plugin_api/classes/../globals.html#viewhandle), html: string): Promise<string\>

- Sets the panel webview HTML
    
    #### Parameters
    
    - ##### handle: [ViewHandle](https://joplinapp.org/api/references/plugin_api/classes/../globals.html#viewhandle)
        
    - ##### html: string
        

<a id="show"></a>

### show

- show(handle: [ViewHandle](https://joplinapp.org/api/references/plugin_api/classes/../globals.html#viewhandle), show?: boolean): Promise<void\>

- Shows the panel
    
    #### Parameters
    
    - ##### handle: [ViewHandle](https://joplinapp.org/api/references/plugin_api/classes/../globals.html#viewhandle)
        
    - ##### Default value show: boolean = true
        

<a id="visible"></a>

### visible

- visible(handle: [ViewHandle](https://joplinapp.org/api/references/plugin_api/classes/../globals.html#viewhandle)): Promise<boolean\>

- Tells whether the panel is visible or not
    
    #### Parameters
    
    - ##### handle: [ViewHandle](https://joplinapp.org/api/references/plugin_api/classes/../globals.html#viewhandle)
        

- [joplin.views.panels](https://joplinapp.org/api/references/plugin_api/classes/joplinviewspanels.html)
    - [addScript](https://joplinapp.org/api/references/plugin_api/classes/joplinviewspanels.html#addscript)
    - [create](https://joplinapp.org/api/references/plugin_api/classes/joplinviewspanels.html#create)
    - [hide](https://joplinapp.org/api/references/plugin_api/classes/joplinviewspanels.html#hide)
    - [isActive](https://joplinapp.org/api/references/plugin_api/classes/joplinviewspanels.html#isactive)
    - [onMessage](https://joplinapp.org/api/references/plugin_api/classes/joplinviewspanels.html#onmessage)
    - [postMessage](https://joplinapp.org/api/references/plugin_api/classes/joplinviewspanels.html#postmessage)
    - [setHtml](https://joplinapp.org/api/references/plugin_api/classes/joplinviewspanels.html#sethtml)
    - [show](https://joplinapp.org/api/references/plugin_api/classes/joplinviewspanels.html#show)
    - [visible](https://joplinapp.org/api/references/plugin_api/classes/joplinviewspanels.html#visible)