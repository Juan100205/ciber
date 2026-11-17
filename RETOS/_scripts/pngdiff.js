const fs=require('fs'),zlib=require('zlib');
function parsePNG(p){
  const b=fs.readFileSync(p); let o=8; let w,h,bd,ct,idat=[];
  while(o<b.length){const len=b.readUInt32BE(o);const type=b.toString('ascii',o+4,o+8);const data=b.slice(o+8,o+8+len);
    if(type==='IHDR'){w=data.readUInt32BE(0);h=data.readUInt32BE(4);bd=data[8];ct=data[9];}
    else if(type==='IDAT'){idat.push(data);}
    else if(type==='IEND')break;
    o+=12+len;}
  const raw=zlib.inflateSync(Buffer.concat(idat));
  const ch=ct===6?4:ct===2?3:ct===0?1:ct===4?2:0;
  const stride=w*ch; const out=Buffer.alloc(h*stride);
  // unfilter
  let pos=0;
  for(let y=0;y<h;y++){const f=raw[pos++];const row=out.slice(y*stride,(y+1)*stride);const prev=y>0?out.slice((y-1)*stride,y*stride):null;
    for(let x=0;x<stride;x++){const rawb=raw[pos++];const a=x>=ch?row[x-ch]:0;const bb=prev?prev[x]:0;const c=(prev&&x>=ch)?prev[x-ch]:0;let v;
      switch(f){case 0:v=rawb;break;case 1:v=rawb+a;break;case 2:v=rawb+bb;break;case 3:v=rawb+((a+bb)>>1);break;
        case 4:{const pp=a+bb-c,pa=Math.abs(pp-a),pb=Math.abs(pp-bb),pc=Math.abs(pp-c);v=rawb+(pa<=pb&&pa<=pc?a:pb<=pc?bb:c);break;}default:v=rawb;}
      row[x]=v&0xff;}}
  return {w,h,ch,out};
}
const A=parsePNG(process.argv[2]),B=parsePNG(process.argv[3]);
console.log('A',A.w,'x',A.h,'ch',A.ch,'| B',B.w,'x',B.h,'ch',B.ch);
let diffs=0, minX=1e9,maxX=-1,minY=1e9,maxY=-1;
const n=Math.min(A.out.length,B.out.length);
// crear mapa de diferencias por pixel
const dw=A.w,dh=A.h;
const diffMap=Buffer.alloc(dw*dh);
for(let y=0;y<dh;y++)for(let x=0;x<dw;x++){
  let d=false;for(let k=0;k<A.ch;k++){const i=(y*dw+x)*A.ch+k;if(A.out[i]!==B.out[i]){d=true;break;}}
  if(d){diffs++;diffMap[y*dw+x]=1;if(x<minX)minX=x;if(x>maxX)maxX=x;if(y<minY)minY=y;if(y>maxY)maxY=y;}
}
console.log('pixeles distintos:',diffs);
if(diffs>0){console.log('bbox: x',minX,'-',maxX,' y',minY,'-',maxY,' (',maxX-minX+1,'x',maxY-minY+1,')');
  // render ASCII del area de diferencia (submuestreado)
  const bw=maxX-minX+1,bh=maxY-minY+1;const sx=Math.ceil(bw/120),sy=Math.ceil(bh/50);
  console.log('--- mapa de diferencias (cada char = bloque) ---');
  for(let y=minY;y<=maxY;y+=sy){let line='';for(let x=minX;x<=maxX;x+=sx){let any=false;
    for(let yy=y;yy<Math.min(y+sy,maxY+1)&&!any;yy++)for(let xx=x;xx<Math.min(x+sx,maxX+1);xx++)if(diffMap[yy*dw+xx]){any=true;break;}
    line+=any?'#':' ';}console.log(line);}
}
