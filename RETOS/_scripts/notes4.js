const fs=require('fs'),zlib=require('zlib');
function parsePNG(p){const b=fs.readFileSync(p);let o=8,w,h,ct,idat=[];
  while(o<b.length){const len=b.readUInt32BE(o);const type=b.toString('ascii',o+4,o+8);const data=b.slice(o+8,o+8+len);
    if(type==='IHDR'){w=data.readUInt32BE(0);h=data.readUInt32BE(4);ct=data[9];}else if(type==='IDAT')idat.push(data);else if(type==='IEND')break;o+=12+len;}
  const raw=zlib.inflateSync(Buffer.concat(idat));const ch=ct===6?4:ct===2?3:ct===0?1:2;const stride=w*ch;const out=Buffer.alloc(h*stride);let pos=0;
  for(let y=0;y<h;y++){const f=raw[pos++];const row=out.slice(y*stride,(y+1)*stride);const prev=y>0?out.slice((y-1)*stride,y*stride):null;for(let x=0;x<stride;x++){const rb=raw[pos++];const a=x>=ch?row[x-ch]:0;const bb=prev?prev[x]:0;const c=(prev&&x>=ch)?prev[x-ch]:0;let v;switch(f){case 0:v=rb;break;case 1:v=rb+a;break;case 2:v=rb+bb;break;case 3:v=rb+((a+bb)>>1);break;case 4:{const pp=a+bb-c,pa=Math.abs(pp-a),pb=Math.abs(pp-bb),pc=Math.abs(pp-c);v=rb+(pa<=pb&&pa<=pc?a:pb<=pc?bb:c);break;}default:v=rb;}row[x]=v&0xff;}}
  return{w,h,ch,out};}
const A=parsePNG(process.argv[2]);const w=A.w,h=A.h;
function val(x,y){const i=(y*w+x)*A.ch;return A.ch>=3?(A.out[i]+A.out[i+1]+A.out[i+2])/3:A.out[i];}
function dark(x,y){return x>=0&&x<w&&y>=0&&y<h&&val(x,y)<140;}
const bot=106,gap=7;
// Rango de nota plausible: C4(y~113) a C6; excluir tempo (y<72) y texto. x a partir de 180 (tras clave+compas)
const yLo=72,yHi=118,x0=180,x1=w-15;
// Detectar cabeza: ventana 11x7, pero para OPEN notehead la densidad del borde cuenta: usar anillo. 
// Estrategia: para cada x,y calcular "fill" = dark en 9x5 centro. Cabeza llena: fill alto. Cabeza abierta: borde dark, centro claro -> usar perimetro.
function headScore(xc,y){let fill=0,per=0,n=0,np=0;
  for(let dy=-2;dy<=2;dy++)for(let dx=-4;dx<=4;dx++){n++;if(dark(xc+dx,y+dy))fill++;}
  // perimetro elipse ~ dx=±5,dy=±3
  for(let dx=-5;dx<=5;dx++){np+=2;if(dark(xc+dx,y-3))per++;if(dark(xc+dx,y+3))per++;}
  for(let dy=-3;dy<=3;dy++){np+=2;if(dark(xc-5,y+dy))per++;if(dark(xc+5,y+dy))per++;}
  return Math.max(fill/n, per/np*0.9);
}
let best=[];
for(let x=x0;x<x1;x++){let bs=0,by=null;for(let y=yLo;y<=yHi;y++){const s=headScore(x,y);if(s>bs){bs=s;by=y;}}best.push({x,s:bs,y:by});}
// picos
const TH=0.62;let notes=[],run=[];
for(const b of best){if(b.s>=TH)run.push(b);else{if(run.length>=3){notes.push(run.reduce((p,c)=>c.s>p.s?c:p));}run=[];}}
if(run.length>=3)notes.push(run.reduce((p,c)=>c.s>p.s?c:p));
// fusionar notas muy cercanas (<12px) quedando la de mayor score
let merged=[];for(const n of notes){if(merged.length&&n.x-merged[merged.length-1].x<14){if(n.s>merged[merged.length-1].s)merged[merged.length-1]=n;}else merged.push(n);}
const L=s=>['E','F','G','A','B','C','D'][((s%7)+7)%7];
let seq=[];for(const n of merged){const step=Math.round((bot-n.y)/(gap/2));seq.push(L(step));console.log('x',n.x,'y',n.y,'s',n.s.toFixed(2),'step',step,'=>',L(step));}
console.log('NOTAS:',seq.join(''),' (',merged.length,'notas )');
