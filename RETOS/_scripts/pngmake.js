const fs=require('fs'),zlib=require('zlib');
function parsePNG(p){const b=fs.readFileSync(p);let o=8,w,h,ct,idat=[];
  while(o<b.length){const len=b.readUInt32BE(o);const type=b.toString('ascii',o+4,o+8);const data=b.slice(o+8,o+8+len);
    if(type==='IHDR'){w=data.readUInt32BE(0);h=data.readUInt32BE(4);ct=data[9];}else if(type==='IDAT')idat.push(data);else if(type==='IEND')break;o+=12+len;}
  const raw=zlib.inflateSync(Buffer.concat(idat));const ch=ct===6?4:ct===2?3:1;const stride=w*ch;const out=Buffer.alloc(h*stride);let pos=0;
  for(let y=0;y<h;y++){const f=raw[pos++];const row=out.slice(y*stride,(y+1)*stride);const prev=y>0?out.slice((y-1)*stride,y*stride):null;
    for(let x=0;x<stride;x++){const rb=raw[pos++];const a=x>=ch?row[x-ch]:0;const bb=prev?prev[x]:0;const c=(prev&&x>=ch)?prev[x-ch]:0;let v;
      switch(f){case 0:v=rb;break;case 1:v=rb+a;break;case 2:v=rb+bb;break;case 3:v=rb+((a+bb)>>1);break;case 4:{const pp=a+bb-c,pa=Math.abs(pp-a),pb=Math.abs(pp-bb),pc=Math.abs(pp-c);v=rb+(pa<=pb&&pa<=pc?a:pb<=pc?bb:c);break;}default:v=rb;}row[x]=v&0xff;}}
  return{w,h,ch,out};}
function writePNG(path,w,h,gray){ // gray: Buffer w*h (0/255)
  const stride=w+1;const raw=Buffer.alloc(h*stride);
  for(let y=0;y<h;y++){raw[y*stride]=0;for(let x=0;x<w;x++)raw[y*stride+1+x]=gray[y*w+x];}
  const comp=zlib.deflateSync(raw);
  function chunk(type,data){const len=Buffer.alloc(4);len.writeUInt32BE(data.length);const t=Buffer.from(type);const crcBuf=Buffer.concat([t,data]);
    let crc=~0;for(let i=0;i<crcBuf.length;i++){crc^=crcBuf[i];for(let k=0;k<8;k++)crc=(crc>>>1)^(0xEDB88320&-(crc&1));}crc=~crc>>>0;
    const c=Buffer.alloc(4);c.writeUInt32BE(crc>>>0);return Buffer.concat([len,t,data,c]);}
  const ihdr=Buffer.alloc(13);ihdr.writeUInt32BE(w,0);ihdr.writeUInt32BE(h,4);ihdr[8]=8;ihdr[9]=0;
  const png=Buffer.concat([Buffer.from([137,80,78,71,13,10,26,10]),chunk('IHDR',ihdr),chunk('IDAT',comp),chunk('IEND',Buffer.alloc(0))]);
  fs.writeFileSync(path,png);}
const A=parsePNG(process.argv[2]),B=parsePNG(process.argv[3]);
const w=A.w,h=A.h;const g=Buffer.alloc(w*h,255);
for(let y=0;y<h;y++)for(let x=0;x<w;x++){let d=false;for(let k=0;k<A.ch;k++){const i=(y*w+x)*A.ch+k;if(A.out[i]!==B.out[i]){d=true;break;}}if(d)g[y*w+x]=0;}
// recortar a la franja con diffs
let minY=1e9,maxY=-1;for(let y=0;y<h;y++)for(let x=0;x<w;x++)if(g[y*w+x]===0){if(y<minY)minY=y;if(y>maxY)maxY=y;}
const ph=maxY-minY+5;const crop=Buffer.alloc(w*ph,255);for(let y=minY;y<=maxY;y++)for(let x=0;x<w;x++)crop[(y-minY+2)*w+x]=g[y*w+x];
writePNG(process.argv[4],w,ph,crop);console.log('escrito',process.argv[4],w,'x',ph);
