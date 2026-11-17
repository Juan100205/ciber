const fs=require('fs'),zlib=require('zlib');
function parsePNG(p){const b=fs.readFileSync(p);let o=8,w,h,ct,idat=[];
  while(o<b.length){const len=b.readUInt32BE(o);const type=b.toString('ascii',o+4,o+8);const data=b.slice(o+8,o+8+len);
    if(type==='IHDR'){w=data.readUInt32BE(0);h=data.readUInt32BE(4);ct=data[9];}else if(type==='IDAT')idat.push(data);else if(type==='IEND')break;o+=12+len;}
  const raw=zlib.inflateSync(Buffer.concat(idat));const ch=ct===6?4:ct===2?3:ct===0?1:2;const stride=w*ch;const out=Buffer.alloc(h*stride);let pos=0;
  for(let y=0;y<h;y++){const f=raw[pos++];const row=out.slice(y*stride,(y+1)*stride);const prev=y>0?out.slice((y-1)*stride,y*stride):null;
    for(let x=0;x<stride;x++){const rb=raw[pos++];const a=x>=ch?row[x-ch]:0;const bb=prev?prev[x]:0;const c=(prev&&x>=ch)?prev[x-ch]:0;let v;
      switch(f){case 0:v=rb;break;case 1:v=rb+a;break;case 2:v=rb+bb;break;case 3:v=rb+((a+bb)>>1);break;case 4:{const pp=a+bb-c,pa=Math.abs(pp-a),pb=Math.abs(pp-bb),pc=Math.abs(pp-c);v=rb+(pa<=pb&&pa<=pc?a:pb<=pc?bb:c);break;}default:v=rb;}row[x]=v&0xff;}}
  return{w,h,ch,out};}
function writeGray(path,w,h,gray){const stride=w+1;const raw=Buffer.alloc(h*stride);for(let y=0;y<h;y++){raw[y*stride]=0;for(let x=0;x<w;x++)raw[y*stride+1+x]=gray[y*w+x];}
  const comp=zlib.deflateSync(raw);function chunk(t,d){const len=Buffer.alloc(4);len.writeUInt32BE(d.length);const tb=Buffer.from(t);const cb=Buffer.concat([tb,d]);let crc=~0;for(let i=0;i<cb.length;i++){crc^=cb[i];for(let k=0;k<8;k++)crc=(crc>>>1)^(0xEDB88320&-(crc&1));}crc=~crc>>>0;const c=Buffer.alloc(4);c.writeUInt32BE(crc>>>0);return Buffer.concat([len,tb,d,c]);}
  const ih=Buffer.alloc(13);ih.writeUInt32BE(w,0);ih.writeUInt32BE(h,4);ih[8]=8;ih[9]=0;fs.writeFileSync(path,Buffer.concat([Buffer.from([137,80,78,71,13,10,26,10]),chunk('IHDR',ih),chunk('IDAT',comp),chunk('IEND',Buffer.alloc(0))]));}
const A=parsePNG(process.argv[2]);const sc=parseInt(process.argv[4]||'3');
// a gris
const gray=Buffer.alloc(A.w*A.h);for(let i=0;i<A.w*A.h;i++){if(A.ch>=3)gray[i]=Math.round((A.out[i*A.ch]+A.out[i*A.ch+1]+A.out[i*A.ch+2])/3);else gray[i]=A.out[i*A.ch];}
const W=A.w*sc,H=A.h*sc;const up=Buffer.alloc(W*H);for(let y=0;y<H;y++)for(let x=0;x<W;x++)up[y*W+x]=gray[((y/sc)|0)*A.w+((x/sc)|0)];
writeGray(process.argv[3],W,H,up);console.log('up',W,'x',H,'from',A.w,'x',A.h);
