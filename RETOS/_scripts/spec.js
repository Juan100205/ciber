const fs=require('fs'),zlib=require('zlib');
const b=fs.readFileSync(process.argv[2]);
// localizar data chunk
let o=12,dataOff,dataLen;
while(o<b.length){const id=b.toString('ascii',o,o+4),sz=b.readUInt32LE(o+4);if(id==='data'){dataOff=o+8;dataLen=sz;break;}o+=8+sz;}
const N=dataLen/2;const s=new Float32Array(N);
for(let i=0;i<N;i++)s[i]=b.readInt16LE(dataOff+i*2)/32768;
// FFT iterativa radix-2
function fft(re,im){const n=re.length;for(let i=1,j=0;i<n;i++){let bit=n>>1;for(;j&bit;bit>>=1)j^=bit;j^=bit;if(i<j){[re[i],re[j]]=[re[j],re[i]];[im[i],im[j]]=[im[j],im[i]];}}
  for(let len=2;len<=n;len<<=1){const ang=-2*Math.PI/len;const wr=Math.cos(ang),wi=Math.sin(ang);
    for(let i=0;i<n;i+=len){let cr=1,ci=0;for(let k=0;k<len/2;k++){const ur=re[i+k],ui=im[i+k];const vr=re[i+k+len/2]*cr-im[i+k+len/2]*ci,vi=re[i+k+len/2]*ci+im[i+k+len/2]*cr;
      re[i+k]=ur+vr;im[i+k]=ui+vi;re[i+k+len/2]=ur-vr;im[i+k+len/2]=ui-vi;const ncr=cr*wr-ci*wi;ci=cr*wi+ci*wr;cr=ncr;}}}}
const W=1024,HOP=256,H=W/2;
const frames=Math.floor((N-W)/HOP);
const han=new Float32Array(W);for(let i=0;i<W;i++)han[i]=0.5-0.5*Math.cos(2*Math.PI*i/(W-1));
const mag=[];let mx=-1e9,mn=1e9;
for(let f=0;f<frames;f++){const re=new Float32Array(W),im=new Float32Array(W);
  for(let i=0;i<W;i++)re[i]=s[f*HOP+i]*han[i];fft(re,im);
  const col=new Float32Array(H);for(let k=0;k<H;k++){const m=Math.log10(Math.hypot(re[k],im[k])+1e-9);col[k]=m;if(m>mx)mx=m;if(m<mn)mn=m;}mag.push(col);}
// render PNG grayscale: x=frames, y=freq (low abajo)
const w=frames,h=H;const g=Buffer.alloc(w*h);
for(let x=0;x<w;x++)for(let y=0;y<h;y++){const v=(mag[x][y]-mn)/(mx-mn);const yy=h-1-y;g[yy*w+x]=Math.max(0,Math.min(255,Math.round(v*255)));}
function writePNG(path,w,h,gray){const stride=w+1;const raw=Buffer.alloc(h*stride);for(let y=0;y<h;y++){raw[y*stride]=0;for(let x=0;x<w;x++)raw[y*stride+1+x]=gray[y*w+x];}
  const comp=zlib.deflateSync(raw);function chunk(t,d){const len=Buffer.alloc(4);len.writeUInt32BE(d.length);const tb=Buffer.from(t);const cb=Buffer.concat([tb,d]);let crc=~0;for(let i=0;i<cb.length;i++){crc^=cb[i];for(let k=0;k<8;k++)crc=(crc>>>1)^(0xEDB88320&-(crc&1));}crc=~crc>>>0;const c=Buffer.alloc(4);c.writeUInt32BE(crc>>>0);return Buffer.concat([len,tb,d,c]);}
  const ih=Buffer.alloc(13);ih.writeUInt32BE(w,0);ih.writeUInt32BE(h,4);ih[8]=8;ih[9]=0;fs.writeFileSync(path,Buffer.concat([Buffer.from([137,80,78,71,13,10,26,10]),chunk('IHDR',ih),chunk('IDAT',comp),chunk('IEND',Buffer.alloc(0))]));}
// recortar banda de frecuencia con energia de texto: usar toda la mitad inferior
writePNG(process.argv[3],w,h,g);console.log('spec',w,'x',h,'frames',frames);
