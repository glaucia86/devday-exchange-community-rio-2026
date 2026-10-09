import { createLiveHandler, liveConfigured } from '../../../server/live-handler';
import { openSessionGuard } from '../../../server/live-guard';
export const runtime='nodejs';
export const dynamic='force-dynamic';
const handle=createLiveHandler(process.env,fetch,openSessionGuard);
export const POST=handle;
export async function GET(){
 return Response.json({enabled:liveConfigured(process.env),scope:'local-only',maxSeconds:600},{headers:{'Cache-Control':'no-store'}});
}
