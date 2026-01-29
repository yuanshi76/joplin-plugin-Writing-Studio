/**
 * Writing Studio Plugin - Main Entry Point
 * Simplified toolbar with only 2 buttons
 */

import joplin from 'api';
import { registerSettings } from './settings/pluginSettings';
import { registerTemplateCommands } from './commands/templateCommands';
import { registerAICommands } from './commands/aiCommands';
import { registerUtilityCommands } from './commands/utilityCommands';
import { registerProjectPanel, togglePanel } from './panels/ProjectPanel';
import { MenuItemLocation, ToolbarButtonLocation } from 'api/types';

joplin.plugins.register({
	onStart: async function () {
		console.info('Writing Studio: Plugin starting...');

		// Register settings
		await registerSettings();

		// Register commands
		await registerTemplateCommands();
		await registerAICommands();
		await registerUtilityCommands();

		// Register panel
		await registerProjectPanel();

		// Toggle panel command
		await joplin.commands.register({
			name: 'writingStudio.togglePanel',
			label: 'Writing Studio: 项目面板',
			iconName: 'fas fa-book',
			execute: togglePanel
		});

		// Toolbar - only 2 buttons
		await joplin.views.toolbarButtons.create(
			'writingStudioToolbarToggle',
			'writingStudio.togglePanel',
			ToolbarButtonLocation.NoteToolbar
		);

		await joplin.views.toolbarButtons.create(
			'writingStudioToolbarNewProject',
			'writingStudio.newProject',
			ToolbarButtonLocation.NoteToolbar
		);

		// Menu items - only essential ones
		await joplin.views.menuItems.create(
			'writingStudioMenuTogglePanel',
			'writingStudio.togglePanel',
			MenuItemLocation.Tools,
			{ accelerator: 'CmdOrCtrl+Shift+W' }
		);

		await joplin.views.menuItems.create(
			'writingStudioMenuNewProject',
			'writingStudio.newProject',
			MenuItemLocation.Tools,
			{ accelerator: 'CmdOrCtrl+Shift+P' }
		);

		console.info('Writing Studio: Plugin started!');
	},
});
