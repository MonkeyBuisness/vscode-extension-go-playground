import type { ActivationFunction } from 'vscode-notebook-renderer';
import * as style from './style.css';

export const activate: ActivationFunction = context => ({
    renderOutputItem(data, element) {
        const err = data.json() as Error;
        element.innerText = `${err.name}:\n\n${err.message}\nStack:\n\n${err.stack}`;
        element.classList.add(style.error);
    }
});
