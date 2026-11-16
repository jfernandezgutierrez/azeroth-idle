export const esc=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export const sprite=(n,extra='')=>`<span class="sprite ${extra}" style="--x:${n%4};--y:${Math.floor(n/4)}" aria-hidden="true"></span>`;
export const portrait=h=>h.faction==='horde'?(h.job==='mage'?4:h.job==='ranger'?2:0):(h.job==='mage'?3:h.job==='ranger'?5:1);
export function duration(seconds){const s=Math.max(0,Math.ceil(seconds));return `${Math.floor(s/60)}:${String(s%60).padStart(2,'0')}`;}
