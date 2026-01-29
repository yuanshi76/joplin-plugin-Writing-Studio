# joplin

This is the main entry point to the Joplin API. You can access various services using the provided accessors.

The API is now relatively stable and in general maintaining backward compatibility is a top priority, so you shouldn't except much breakages.

If a breaking change ever becomes needed, best effort will be done to:

- Deprecate features instead of removing them, so as to give you time to fix the issue;
- Document breaking changes in the changelog;

So if you are developing a plugin, please keep an eye on the changelog as everything will be in there with information about how to update your code.

## Index

### Accessors

- [clipboard](https://joplinapp.org/api/references/plugin_api/classes/joplin.html#clipboard)
- [commands](https://joplinapp.org/api/references/plugin_api/classes/joplin.html#commands)
- [contentScripts](https://joplinapp.org/api/references/plugin_api/classes/joplin.html#contentscripts)
- [data](https://joplinapp.org/api/references/plugin_api/classes/joplin.html#data)
- [imaging](https://joplinapp.org/api/references/plugin_api/classes/joplin.html#imaging)
- [interop](https://joplinapp.org/api/references/plugin_api/classes/joplin.html#interop)
- [plugins](https://joplinapp.org/api/references/plugin_api/classes/joplin.html#plugins)
- [settings](https://joplinapp.org/api/references/plugin_api/classes/joplin.html#settings)
- [views](https://joplinapp.org/api/references/plugin_api/classes/joplin.html#views)
- [window](https://joplinapp.org/api/references/plugin_api/classes/joplin.html#window)
- [workspace](https://joplinapp.org/api/references/plugin_api/classes/joplin.html#workspace)

### Methods

- [require](https://joplinapp.org/api/references/plugin_api/classes/joplin.html#require)
- [shouldUseDarkColors](https://joplinapp.org/api/references/plugin_api/classes/joplin.html#shouldusedarkcolors)
- [versionInfo](https://joplinapp.org/api/references/plugin_api/classes/joplin.html#versioninfo)

## Accessors

<a id="clipboard"></a>

### clipboard

- get clipboard(): [joplin.clipboard](https://joplinapp.org/api/references/plugin_api/classes/joplinclipboard.html)

<a id="commands"></a>

### commands

- get commands(): [joplin.commands](https://joplinapp.org/api/references/plugin_api/classes/joplincommands.html)

<a id="contentscripts"></a>

### contentScripts

- get contentScripts(): [joplin.contentScripts](https://joplinapp.org/api/references/plugin_api/classes/joplincontentscripts.html)

<a id="data"></a>

### data

- get data(): [joplin.data](https://joplinapp.org/api/references/plugin_api/classes/joplindata.html)

<a id="imaging"></a>

### imaging

- get imaging(): [joplin.imaging](https://joplinapp.org/api/references/plugin_api/classes/joplinimaging.html)

<a id="interop"></a>

### interop

- get interop(): [joplin.interop](https://joplinapp.org/api/references/plugin_api/classes/joplininterop.html)

<a id="plugins"></a>

### plugins

- get plugins(): [joplin.plugins](https://joplinapp.org/api/references/plugin_api/classes/joplinplugins.html)

<a id="settings"></a>

### settings

- get settings(): [joplin.settings](https://joplinapp.org/api/references/plugin_api/classes/joplinsettings.html)

<a id="views"></a>

### views

- get views(): [joplin.views](https://joplinapp.org/api/references/plugin_api/classes/joplinviews.html)

<a id="window"></a>

### window

- get window(): [joplin.window](https://joplinapp.org/api/references/plugin_api/classes/joplinwindow.html)

<a id="workspace"></a>

### workspace

- get workspace(): [joplin.workspace](https://joplinapp.org/api/references/plugin_api/classes/joplinworkspace.html)

## Methods

<a id="require"></a>

### require

- require(\_path: string): any

- It is not possible to bundle native packages with a plugin, because they need to work cross-platforms. Instead access to certain useful native packages is provided using this function.
    
    Currently these packages are available:
    
    - [sqlite3](https://www.npmjs.com/package/sqlite3)
    - [fs-extra](https://www.npmjs.com/package/fs-extra)
    
    [View the demo plugin](https://github.com/laurent22/joplin/tree/dev/packages/app-cli/tests/support/plugins/nativeModule)
    
    desktop
    
    #### Parameters
    
    - ##### \_path: string
        

<a id="shouldusedarkcolors"></a>

### shouldUseDarkColors

- shouldUseDarkColors(): Promise<boolean\>

- Tells whether the current theme is a dark one or not.
    

<a id="versioninfo"></a>

### versionInfo

- versionInfo(): Promise<[VersionInfo](https://joplinapp.org/api/references/plugin_api/classes/../interfaces/versioninfo.html)\>

- [joplin](https://joplinapp.org/api/references/plugin_api/classes/joplin.html)
    - [clipboard](https://joplinapp.org/api/references/plugin_api/classes/joplin.html#clipboard)
    - [commands](https://joplinapp.org/api/references/plugin_api/classes/joplin.html#commands)
    - [contentScripts](https://joplinapp.org/api/references/plugin_api/classes/joplin.html#contentscripts)
    - [data](https://joplinapp.org/api/references/plugin_api/classes/joplin.html#data)
    - [imaging](https://joplinapp.org/api/references/plugin_api/classes/joplin.html#imaging)
    - [interop](https://joplinapp.org/api/references/plugin_api/classes/joplin.html#interop)
    - [plugins](https://joplinapp.org/api/references/plugin_api/classes/joplin.html#plugins)
    - [settings](https://joplinapp.org/api/references/plugin_api/classes/joplin.html#settings)
    - [views](https://joplinapp.org/api/references/plugin_api/classes/joplin.html#views)
    - [window](https://joplinapp.org/api/references/plugin_api/classes/joplin.html#window)
    - [workspace](https://joplinapp.org/api/references/plugin_api/classes/joplin.html#workspace)
    - [require](https://joplinapp.org/api/references/plugin_api/classes/joplin.html#require)
    - [shouldUseDarkColors](https://joplinapp.org/api/references/plugin_api/classes/joplin.html#shouldusedarkcolors)
    - [versionInfo](https://joplinapp.org/api/references/plugin_api/classes/joplin.html#versioninfo)