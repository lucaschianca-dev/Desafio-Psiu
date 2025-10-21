
import React from 'react';
import { createRoot } from 'react-dom/client';
import { Meteor } from 'meteor/meteor';
import { App } from '/imports/ui/App';

// Importar todos os estilos CSS da pasta imports
import '/imports/ui/styles/variables.css';
import '/imports/ui/styles/global.css';
import '/imports/ui/styles/components.css';

Meteor.startup(() => {
    const container = document.getElementById('react-target');
    const root = createRoot(container);
    root.render(<App />);
});