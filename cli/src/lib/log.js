import { green, red, yellow, dim, cyan, bold } from 'kolorist';

export const ok    = (msg) => console.log(`  ${green('✓')}  ${msg}`);
export const warn  = (msg) => console.log(`  ${yellow('⚠')}  ${msg}`);
export const fail  = (msg) => console.log(`  ${red('✗')}  ${msg}`);
export const info  = (msg) => console.log(`  ${cyan('·')}  ${msg}`);
export const muted = (msg) => console.log(`  ${dim(msg)}`);
export const heading = (msg) => console.log(`\n${bold(msg)}\n`);
export const blank = () => console.log('');
