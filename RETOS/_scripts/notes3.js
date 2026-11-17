const fs=require('fs'),zlib=require('zlib');
function parsePNG(p){const b=fs.readFileSync(p);let o=8,w,h,ct,idat=[];
  while(o<b.length){const len=b.readUInt32BE(o);const type=b.toString('ascii',o+4,o+8);const data=b.slice(o+8,o+8+len);
    if(type==='IHDR'){w=data.readUInt32BE(0);h=data.readUInt32BE(4);ct=data[9];}else if(type==='IDAT')idat.push(data);else if(type==='IEND')break;o+=12+len;}
  const raw=zlib.inflateSync(Buffer.concat(idat));const ch=ct===6?4:ct===2?3:ct===0?1:2;const stride=w*ch;const out=Buffer.alloc(h*stride);let pos=0;
  for(let y=0;y<h;y++){const f=raw[pos++];const row=out.slice(y*stride,(y+1)*stride);const prev=y>0?out.slice((y-1)*stride,y*stride):null;
    for(let x=0;x<stride;x++){const rb=raw[pos++];const a=x>=ch?row[x-ch]:0;const bb=prev?prev[x]:0;const c=(prev&&x>=ch)?prev[x-ch]:0;let v;switch(f){case 0:v=rb;break;case 1:v=rb+a;break;case 2:v=rb+bb;break;case 3:v=rb+((a+bb)>>1);break;case 4:{const pp=a+bb-c,pa=Math.abs(pp-a),pb=Math.abs(pp-bb),pc=Math.abs(pp-c);v=rb+(pa<=pb&&pa<=pc?a:pb<=pc?bb:c);break;}default:v=rb;}row[x]=v&0xff;}}
  return{w,h,ch,out};}
const A=parsePNG(process.argv[2]);const w=A.w,h=A.h;
function val(x,y){const i=(y*w+x)*A.ch;return A.ch>=3?(A.out[i]+A.out[i+1]+A.out[i+2])/3:A.out[i];}
function dark(x,y){return x>=0&&x<w&&y>=0&&y<h&&val(x,y)<140;}
const lines=[78,85,92,99,106];const bot=106,gap=7;
const x0=150,x1=w-15;const yTop=bot-7*gap,yBot=bot+4*gap;
// notehead: run vertical oscuro de alto ~ 1 gap (cabeza ~6-8px), pero stems son finos. Cabeza es ANCHA.
// Para cada x, mide ancho horizontal oscuro a cada y. Cabeza => ancho>=5 en una banda de alto ~gap.
function headCenter(xc){
  // en ventana de x alrededor, para cada y contar ancho oscuro
  let bestY=null,bestScore=0;
  for(let y=yTop;y<=yBot;y++){let wdt=0;for(let x=xc-5;x<=xc+5;x++)if(dark(x,y))wdt++;
    // acumular verticalmente: cabeza ocupa ~gap filas anchas
  }
  // mejor: buscar centro donde densidad 2D (11x8) es alta
  for(let y=yTop;y<=yBot;y++){let s=0;for(let dy=-3;dy<=3;dy++)for(let dx=-5;dx<=5;dx++)if(dark(xc+dx,y+dy))s++;if(s>bestScore){bestScore=s;bestY=y;}}
  return {y:bestY,score:bestScore};
}
// barrido: score por columna = densidad de la mejor cabeza; detectar picos separados
let prof=[];for(let x=x0;x<x1;x++){prof.push(headCenter(x));}
// agrupar columnas con score alto (cabeza) en notas
const SC=40; // umbral densidad (max ~77)
let notes=[],run=[];
for(let i=0;i<prof.length;i++){const x=x0+i;if(prof[i].score>=SC){run.push({x,y:prof[i].y,s:prof[i].score});}else{if(run.length>=3){let b=run.reduce((p,c)=>c.s>p.s?c:p);notes.push(b);}run=[];}}
if(run.length>=3){let b=run.reduce((p,c)=>c.s>p.s?c:p);notes.push(b);}
const letterOf=s=>['E','F','G','A','B','C','D'][((s%7)+7)%7];
let seq=[];
console.log('maxscore sample:',Math.max(...prof.map(p=>p.score)));
for(const n of notes){const step=Math.round((bot-n.y)/(gap/2));seq.push(letterOf(step));console.log('x',n.x,'y',n.y,'score',n.s,'step',step,'=>',letterOf(step));}
console.log('SECUENCIA:',seq.join(''));
