import { initCommand } from './init.js';
import { doctorCommand } from './doctor.js';
import { heading, info, blank } from '../lib/log.js';
import { cyan, dim, green } from 'kolorist';

export async function onboardCommand(target = '.', opts = {}) {
  heading('sfcs onboard');
  console.log(dim('  Interactive first-run wizard. Combines `init` + a final `doctor` pass.'));
  blank();

  await initCommand(target, { ...opts, yes: false });

  blank();
  info('Running `sfcs doctor` to verify the install...');
  blank();

  // doctor exits the process; in onboard we still want it to terminate naturally,
  // so just delegate. If doctor exits non-zero, the user sees the failures and
  // can fix them then re-run.
  await doctorCommand({ quiet: false });
}
