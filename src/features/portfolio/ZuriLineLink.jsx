import { ArrowUpRight, MessageCircle } from 'lucide-react';
import { useLanguage } from '../../LanguageContext';
import './zuri-line.css';

// Owner-approved OA. The HTTPS profile link opens the chat for existing friends
// on mobile and provides a profile/QR handoff in desktop browsers.
const zuriLineUrl = 'https://line.me/R/ti/p/%40949xcfau';

export default function ZuriLineLink({ className = 'pk-button' }) {
  const { language } = useLanguage();
  const label = language === 'th' ? 'คุยกับ Zuri ผ่าน LINE' : 'Chat with Zuri on LINE';
  return <a className={`zuri-line-link ${className}`} href={zuriLineUrl} target="_blank" rel="noopener noreferrer" aria-label={label}>
    <MessageCircle size={18} aria-hidden="true" />
    <span>{label}</span>
    <ArrowUpRight size={17} aria-hidden="true" />
  </a>;
}
