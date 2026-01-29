# joplin.workspace

The workspace service provides access to all the parts of Joplin that are being worked on - i.e. the currently selected notes or notebooks as well as various related events, such as when a new note is selected, or when the note content changes.

[View the demo plugin](https://github.com/laurent22/joplin/tree/dev/packages/app-cli/tests/support/plugins)

## Index

### Methods

- [filterEditorContextMenu](https://joplinapp.org/api/references/plugin_api/classes/joplinworkspace.html#filtereditorcontextmenu)
- [onNoteAlarmTrigger](https://joplinapp.org/api/references/plugin_api/classes/joplinworkspace.html#onnotealarmtrigger)
- [onNoteChange](https://joplinapp.org/api/references/plugin_api/classes/joplinworkspace.html#onnotechange)
- [onNoteContentChange](https://joplinapp.org/api/references/plugin_api/classes/joplinworkspace.html#onnotecontentchange)
- [onNoteSelectionChange](https://joplinapp.org/api/references/plugin_api/classes/joplinworkspace.html#onnoteselectionchange)
- [onResourceChange](https://joplinapp.org/api/references/plugin_api/classes/joplinworkspace.html#onresourcechange)
- [onSyncComplete](https://joplinapp.org/api/references/plugin_api/classes/joplinworkspace.html#onsynccomplete)
- [onSyncStart](https://joplinapp.org/api/references/plugin_api/classes/joplinworkspace.html#onsyncstart)
- [selectedFolder](https://joplinapp.org/api/references/plugin_api/classes/joplinworkspace.html#selectedfolder)
- [selectedNote](https://joplinapp.org/api/references/plugin_api/classes/joplinworkspace.html#selectednote)
- [selectedNoteHash](https://joplinapp.org/api/references/plugin_api/classes/joplinworkspace.html#selectednotehash)
- [selectedNoteIds](https://joplinapp.org/api/references/plugin_api/classes/joplinworkspace.html#selectednoteids)

## Methods

<a id="filtereditorcontextmenu"></a>

### filterEditorContextMenu

- filterEditorContextMenu(handler: [FilterHandler](https://joplinapp.org/api/references/plugin_api/classes/../globals.html#filterhandler)<[EditContextMenuFilterObject](https://joplinapp.org/api/references/plugin_api/classes/../interfaces/editcontextmenufilterobject.html)\>): void

- Called just before the editor context menu is about to open. Allows adding items to it.
    
    desktop
    
    #### Parameters
    
    - ##### handler: [FilterHandler](https://joplinapp.org/api/references/plugin_api/classes/../globals.html#filterhandler)<[EditContextMenuFilterObject](https://joplinapp.org/api/references/plugin_api/classes/../interfaces/editcontextmenufilterobject.html)\>
        

<a id="onnotealarmtrigger"></a>

### onNoteAlarmTrigger

- onNoteAlarmTrigger(handler: [WorkspaceEventHandler](https://joplinapp.org/api/references/plugin_api/classes/../globals.html#workspaceeventhandler)<[NoteAlarmTriggerEvent](https://joplinapp.org/api/references/plugin_api/classes/../interfaces/notealarmtriggerevent.html)\>): Promise<[Disposable](https://joplinapp.org/api/references/plugin_api/classes/../interfaces/disposable.html)\>

- Called when an alarm associated with a to-do is triggered.
    
    #### Parameters
    
    - ##### handler: [WorkspaceEventHandler](https://joplinapp.org/api/references/plugin_api/classes/../globals.html#workspaceeventhandler)<[NoteAlarmTriggerEvent](https://joplinapp.org/api/references/plugin_api/classes/../interfaces/notealarmtriggerevent.html)\>
        

<a id="onnotechange"></a>

### onNoteChange

- onNoteChange(handler: [ItemChangeHandler](https://joplinapp.org/api/references/plugin_api/classes/../globals.html#itemchangehandler)): Promise<[Disposable](https://joplinapp.org/api/references/plugin_api/classes/../interfaces/disposable.html)\>

- Called when the content of the current note changes.
    
    #### Parameters
    
    - ##### handler: [ItemChangeHandler](https://joplinapp.org/api/references/plugin_api/classes/../globals.html#itemchangehandler)
        

<a id="onnotecontentchange"></a>

### onNoteContentChange

- onNoteContentChange(callback: [WorkspaceEventHandler](https://joplinapp.org/api/references/plugin_api/classes/../globals.html#workspaceeventhandler)<[NoteContentChangeEvent](https://joplinapp.org/api/references/plugin_api/classes/../interfaces/notecontentchangeevent.html)\>): Promise<void\>

- Called when the content of a note changes.
    
    deprecated
    
    Use `onNoteChange()` instead, which is reliably triggered whenever the note content, or any note property changes.
    
    #### Parameters
    
    - ##### callback: [WorkspaceEventHandler](https://joplinapp.org/api/references/plugin_api/classes/../globals.html#workspaceeventhandler)<[NoteContentChangeEvent](https://joplinapp.org/api/references/plugin_api/classes/../interfaces/notecontentchangeevent.html)\>
        

<a id="onnoteselectionchange"></a>

### onNoteSelectionChange

- onNoteSelectionChange(callback: [WorkspaceEventHandler](https://joplinapp.org/api/references/plugin_api/classes/../globals.html#workspaceeventhandler)<[NoteSelectionChangeEvent](https://joplinapp.org/api/references/plugin_api/classes/../interfaces/noteselectionchangeevent.html)\>): Promise<[Disposable](https://joplinapp.org/api/references/plugin_api/classes/../interfaces/disposable.html)\>

- Called when a new note or notes are selected.
    
    #### Parameters
    
    - ##### callback: [WorkspaceEventHandler](https://joplinapp.org/api/references/plugin_api/classes/../globals.html#workspaceeventhandler)<[NoteSelectionChangeEvent](https://joplinapp.org/api/references/plugin_api/classes/../interfaces/noteselectionchangeevent.html)\>
        

<a id="onresourcechange"></a>

### onResourceChange

- onResourceChange(handler: [ResourceChangeHandler](https://joplinapp.org/api/references/plugin_api/classes/../globals.html#resourcechangehandler)): Promise<void\>

- Called when a resource is changed. Currently this handled will not be called when a resource is added or deleted.
    
    #### Parameters
    
    - ##### handler: [ResourceChangeHandler](https://joplinapp.org/api/references/plugin_api/classes/../globals.html#resourcechangehandler)
        

<a id="onsynccomplete"></a>

### onSyncComplete

- onSyncComplete(callback: [WorkspaceEventHandler](https://joplinapp.org/api/references/plugin_api/classes/../globals.html#workspaceeventhandler)<[SyncCompleteEvent](https://joplinapp.org/api/references/plugin_api/classes/../interfaces/synccompleteevent.html)\>): Promise<[Disposable](https://joplinapp.org/api/references/plugin_api/classes/../interfaces/disposable.html)\>

- Called when the synchronisation process has finished.
    
    #### Parameters
    
    - ##### callback: [WorkspaceEventHandler](https://joplinapp.org/api/references/plugin_api/classes/../globals.html#workspaceeventhandler)<[SyncCompleteEvent](https://joplinapp.org/api/references/plugin_api/classes/../interfaces/synccompleteevent.html)\>
        

<a id="onsyncstart"></a>

### onSyncStart

- onSyncStart(handler: [SyncStartHandler](https://joplinapp.org/api/references/plugin_api/classes/../globals.html#syncstarthandler)): Promise<[Disposable](https://joplinapp.org/api/references/plugin_api/classes/../interfaces/disposable.html)\>

- Called when the synchronisation process is starting.
    
    #### Parameters
    
    - ##### handler: [SyncStartHandler](https://joplinapp.org/api/references/plugin_api/classes/../globals.html#syncstarthandler)
        

<a id="selectedfolder"></a>

### selectedFolder

- selectedFolder(): Promise<FolderEntity\>

- Gets the currently selected folder. In some cases, for example during search or when viewing a tag, no folder is actually selected in the user interface. In that case, that function would return the last selected folder.
    

<a id="selectednote"></a>

### selectedNote

- selectedNote(): Promise<any\>

- Gets the currently selected note. Will be `null` if no note is selected.
    
    On desktop, this returns the selected note in the focused window.
    

<a id="selectednotehash"></a>

### selectedNoteHash

- selectedNoteHash(): Promise<string\>

- Gets the last hash (note section ID) from cross-note link targeting specific section. New hash is available after `onNoteSelectionChange()` is triggered. Example of cross-note link where `hello-world` is a hash: [Other Note Title](https://joplinapp.org/api/references/plugin_api/classes/:/9bc9a5cb83f04554bf3fd3e41b4bb415#hello-world). Method returns empty value when a note was navigated with method other than cross-note link containing valid hash.
    

<a id="selectednoteids"></a>

### selectedNoteIds

- selectedNoteIds(): Promise<string\[\]\>

- Gets the IDs of the selected notes (can be zero, one, or many). Use the data API to retrieve information about these notes.
    

- [joplin.workspace](https://joplinapp.org/api/references/plugin_api/classes/joplinworkspace.html)
    - [filterEditorContextMenu](https://joplinapp.org/api/references/plugin_api/classes/joplinworkspace.html#filtereditorcontextmenu)
    - [onNoteAlarmTrigger](https://joplinapp.org/api/references/plugin_api/classes/joplinworkspace.html#onnotealarmtrigger)
    - [onNoteChange](https://joplinapp.org/api/references/plugin_api/classes/joplinworkspace.html#onnotechange)
    - [onNoteContentChange](https://joplinapp.org/api/references/plugin_api/classes/joplinworkspace.html#onnotecontentchange)
    - [onNoteSelectionChange](https://joplinapp.org/api/references/plugin_api/classes/joplinworkspace.html#onnoteselectionchange)
    - [onResourceChange](https://joplinapp.org/api/references/plugin_api/classes/joplinworkspace.html#onresourcechange)
    - [onSyncComplete](https://joplinapp.org/api/references/plugin_api/classes/joplinworkspace.html#onsynccomplete)
    - [onSyncStart](https://joplinapp.org/api/references/plugin_api/classes/joplinworkspace.html#onsyncstart)
    - [selectedFolder](https://joplinapp.org/api/references/plugin_api/classes/joplinworkspace.html#selectedfolder)
    - [selectedNote](https://joplinapp.org/api/references/plugin_api/classes/joplinworkspace.html#selectednote)
    - [selectedNoteHash](https://joplinapp.org/api/references/plugin_api/classes/joplinworkspace.html#selectednotehash)
    - [selectedNoteIds](https://joplinapp.org/api/references/plugin_api/classes/joplinworkspace.html#selectednoteids)