/* /programs is retired — the site's information architecture now uses /rooms for
   the seven purpose-named rooms. Permanently redirect any old links there. */

import { redirect } from 'next/navigation';

export default function ProgramsPage() {
    redirect('/rooms');
}
