import type { Metadata } from 'next';
import TriageBoard from '../../components/triage-board';
export const metadata: Metadata = {title:'Triagem ao vivo · DevDay Exchange Rio',description:'GPT-Live escuta, Decisions classifica e a pessoa decide. Dados fictícios.'};
export default function Page(){ return <TriageBoard />; }
