type SpeechState = {
  session:number; revision:number; status:string;
  messages:ReadonlyArray<{id:number;role:string;text:string;revision:number}>;
};
/** Returns only speech grounded in the current report, never a superseded reply. */
export function getSpokenReply(state:SpeechState,previous:string):{key:string;text:string}|null {
  if(!['review','created','clarify'].includes(state.status))return null;
  const last=state.messages.at(-1);
  if(!last||last.role!=='assistant'||last.revision!==state.revision)return null;
  const key=`${state.session}:${state.revision}:${last.id}`;
  return key===previous?null:{key,text:last.text};
}
