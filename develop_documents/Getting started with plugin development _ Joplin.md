## Getting started with plugin development  
Joplin 插件开发入门

In this article you will learn the basic steps to build and test a plugin in Joplin.  
在本文中，您将学习在 Joplin 中构建和测试插件的基本步骤。

## Setting up your environment  
设置您的环境[​](#setting-up-your-environment "Direct link to Setting up your environment")

First you need to setup your environment:  
首先，您需要设置您的环境：

- Make sure you have [Node.js](https://nodejs.org/) and [git](https://git-scm.com/) installed.  
    确保你已安装 Node.js 和 git。
- Install [Joplin](https://joplinapp.org/)  安装 Joplin

But first install [Yeoman](https://yeoman.io/) and the [Joplin Plugin Generator](https://github.com/laurent22/joplin/tree/dev/packages/generator-joplin):  
但首先安装 Yeoman 和 Joplin 插件生成器：

```
npm install -g yo generator-joplin
```

Then, in the directory where you plan to develop the plugin, run:  
然后，在您计划开发插件的目录中运行：

This will generate the basic scaffolding of the plugin. At the root of it, there are a number of configuration files which you normally won't need to change. Then the `src/` directory will contain your code. By default, the project uses TypeScript, but you are free to use plain JavaScript too - eventually the project is compiled to plain JS in any case.  
这将生成插件的基本结构。在根目录下，有一些通常不需要更改的配置文件。然后 `src/` 目录将包含您的代码。默认情况下，项目使用 TypeScript，但您也可以自由使用普通的 JavaScript - 无论如何，该项目最终都会被编译为普通的 JS。

The `src/` directory also contains a [manifest.json](https://joplinapp.org/help/api/references/plugin_manifest) file, which contains the various information about the plugin that was set in the initial generation of the scaffolding, such as its name, homepage URL, etc. You can edit this at any time, but editing it after it has been published may cause users to have to download it again.  
`src/` 目录还包含一个 manifest.json 文件，其中包含在生成结构时设置的插件的各种信息，例如其名称、主页 URL 等。您可以随时编辑此文件，但在发布后进行编辑可能需要用户重新下载该插件。

## Setup Source Control  设置源代码控制[​](#setup-source-control "Direct link to Setup Source Control")

In your plugin directory, run:  
在你的插件目录中，运行：

This will setup source control.  
这将设置源代码控制。

## Run Joplin in Development Mode  
以开发模式运行 Joplin[​](#run-joplin-in-development-mode "Direct link to Run Joplin in Development Mode")

You should test your plugin in [Development Mode](https://joplinapp.org/help/api/references/development_mode). Doing so means that Joplin will run using a different profile, so you can experiment with the plugin without risking to accidentally change or delete your data.  
您应该在开发模式下测试您的插件。这样做的意思是，Joplin 将使用不同的配置文件运行，因此您可以尝试该插件而不会意外更改或删除您的数据。

## Building the plugin  构建插件[​](#building-the-plugin "Direct link to Building the plugin")

From the scaffolding, `src/index.ts` now contains the basic code for a Hello World plugin.  
从模板中， `src/index.ts` 现在包含了 Hello World 插件的基本代码。

Two things to note:  需要注意两件事：

1.  It contains a call to [joplin.plugins.register](https://joplinapp.org/api/references/plugin_api/classes/joplinplugins.html#register). All plugins call this to register the plugin in the app.  
    它包含对 joplin.plugins.register 的调用。所有插件都会调用此方法以在应用中注册插件。
2.  An `onStart()` event handler method, which is called when the plugin starts.  
    一个 `onStart()` 事件处理方法，该方法在插件启动时被调用。

To try this basic plugin, compile the app by running the following from the root of the project:  
要尝试这个基本插件，请从项目的根目录运行以下命令来编译应用程序：

Doing so should compile all the files into the `dist/` directory. This is where Joplin will load the plugin.  
这样应该会将所有文件编译到 `dist/` 目录中。这就是 Joplin 加载插件的位置。

## Install the plugin  安装插件[​](#install-the-plugin "Direct link to Install the plugin")

Open Joplin **Configuration > Plugins** section. Under Advanced Settings, add the plugin path in the **Development plugins** text field.This should be the path to your main plugin directory, i.e. `path/to/your/root/plugin/directory`.  
打开 Joplin 配置 > 插件部分。在高级设置中，将插件路径添加到开发插件文本字段中。这应该是你主插件目录的路径，即 `path/to/your/root/plugin/directory` 。

## Test the Plugin, Hello World![​](#test-the-plugin-hello-world "Direct link to Test the Plugin, Hello World!")

Restart the Development app from the command line/terminal, and Joplin should load the plugin and execute its `onStart` handler. If all went well you should see the test message in the plugin console: "Hello world. Test plugin started!". You will also be able to see the information from the manifest in the **Settings > Plugins**

## Next steps[​](#next-steps "Direct link to Next steps")

Great, you now have the basics of a working plugin!

- Start the [plugin tutorial](https://joplinapp.org/help/api/tutorials/toc_plugin) to learn how to use the plugin API.
- See what the plugin API supports, [Plugin API reference](https://joplinapp.org/api/references/plugin_api/classes/joplin.html).
- For plugin feature ideas, see this thread: https://discourse.joplinapp.org/t/any-suggestions-on-what-plugins-could-be-created/9479